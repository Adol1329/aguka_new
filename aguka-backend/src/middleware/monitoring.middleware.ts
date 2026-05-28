import { Request, Response, NextFunction } from "express";
import { performance } from "perf_hooks";

interface RequestMetrics {
  method: string;
  url: string;
  statusCode: number;
  responseTime: number;
  timestamp: Date;
  userAgent?: string;
  ip?: string;
  userId?: string;
  error?: string;
}

class MonitoringService {
  private metrics: RequestMetrics[] = [];
  private maxMetrics = 10000; // Keep last 10k requests

  addMetric(metric: RequestMetrics) {
    this.metrics.push(metric);

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }

  getMetrics(filters?: {
    method?: string;
    url?: string;
    statusCode?: number;
    since?: Date;
  }) {
    let filtered = this.metrics;

    if (filters?.method) {
      filtered = filtered.filter((m) => m.method === filters.method);
    }
    if (filters?.url) {
      filtered = filtered.filter((m) => m.url.includes(filters.url!));
    }
    if (filters?.statusCode) {
      filtered = filtered.filter((m) => m.statusCode === filters.statusCode);
    }
    if (filters?.since) {
      filtered = filtered.filter((m) => m.timestamp >= filters.since!);
    }

    return filtered;
  }

  getPerformanceStats() {
    const recent = this.getMetrics({
      since: new Date(Date.now() - 60 * 60 * 1000),
    }); // Last hour

    if (recent.length === 0) {
      return {
        totalRequests: 0,
        averageResponseTime: 0,
        errorRate: 0,
        requestsPerMinute: 0,
        slowestRequest: null,
        fastestRequest: null,
      };
    }

    const responseTimes = recent.map((m) => m.responseTime);
    const errors = recent.filter((m) => m.statusCode >= 400);
    const slowest = recent.reduce((prev, current) =>
      prev.responseTime > current.responseTime ? prev : current,
    );
    const fastest = recent.reduce((prev, current) =>
      prev.responseTime < current.responseTime ? prev : current,
    );

    return {
      totalRequests: recent.length,
      averageResponseTime:
        responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length,
      errorRate: (errors.length / recent.length) * 100,
      requestsPerMinute: recent.length / 60,
      slowestRequest: {
        url: slowest.url,
        method: slowest.method,
        responseTime: slowest.responseTime,
        timestamp: slowest.timestamp,
      },
      fastestRequest: {
        url: fastest.url,
        method: fastest.method,
        responseTime: fastest.responseTime,
        timestamp: fastest.timestamp,
      },
    };
  }

  getHealthStatus() {
    const stats = this.getPerformanceStats();
    const isHealthy = stats.errorRate < 5 && stats.averageResponseTime < 1000; // <5% errors, <1s avg response

    return {
      status: isHealthy ? "healthy" : "unhealthy",
      timestamp: new Date(),
      metrics: stats,
      checks: {
        errorRate: {
          status: stats.errorRate < 5 ? "pass" : "fail",
          value: stats.errorRate,
          threshold: 5,
        },
        responseTime: {
          status: stats.averageResponseTime < 1000 ? "pass" : "fail",
          value: stats.averageResponseTime,
          threshold: 1000,
        },
      },
    };
  }
}

const monitoringService = new MonitoringService();

export const performanceMonitoring = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const startTime = performance.now();

  // Store original end function
  const originalEnd = res.end;

  // Override end function to capture metrics
  res.end = function (chunk?: any, encoding?: any, cb?: any): any {
    const endTime = performance.now();
    const responseTime = endTime - startTime;

    const metric: RequestMetrics = {
      method: req.method,
      url: req.originalUrl || req.url,
      statusCode: res.statusCode,
      responseTime,
      timestamp: new Date(),
      userAgent: req.get("User-Agent"),
      ip: req.ip || req.connection.remoteAddress,
      userId: (req as any).user?.sub,
    };

    // Add error if status indicates error
    if (res.statusCode >= 400) {
      metric.error = res.statusMessage || "Request failed";
    }

    monitoringService.addMetric(metric);

    // Call original end and return its result
    return originalEnd.call(this, chunk, encoding, cb);
  };

  next();
};

export const getMonitoringData = (req: Request, res: Response) => {
  const { method, url, statusCode, since } = req.query;

  const filters: any = {};
  if (method) filters.method = method as string;
  if (url) filters.url = url as string;
  if (statusCode) filters.statusCode = parseInt(statusCode as string);
  if (since) filters.since = new Date(since as string);

  const metrics = monitoringService.getMetrics(filters);

  res.json({
    success: true,
    data: metrics,
    summary: monitoringService.getPerformanceStats(),
  });
};

export const getHealthStatus = (_req: Request, res: Response) => {
  // #region agent log
  fetch("http://127.0.0.1:7646/ingest/8e7223a1-1e67-4704-b579-50d84bc12fc1", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "8574fc",
    },
    body: JSON.stringify({
      sessionId: "8574fc",
      runId: "pre-fix",
      hypothesisId: "H4",
      location: "monitoring.middleware.ts:getHealthStatus",
      message: "monitoring health handler executed",
      data: {},
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
  const health = monitoringService.getHealthStatus();

  res.status(health.status === "healthy" ? 200 : 503).json({
    success: health.status === "healthy",
    data: health,
  });
};

export { monitoringService };
