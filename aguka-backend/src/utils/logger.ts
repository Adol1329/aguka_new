export type LogLevel = "info" | "warn" | "error" | "debug";

interface LogEntry {
  level: LogLevel;
  message: string;
  args: any[];
  timestamp: string;
}

export const logger = {
  info: (message: string, ...args: any[]) => {
    const entry: LogEntry = { level: "info", message, args, timestamp: new Date().toISOString() };
    console.log(`[INFO] ${entry.timestamp} ${message}`, ...args);
    return entry;
  },
  error: (message: string, ...args: any[]) => {
    const entry: LogEntry = { level: "error", message, args, timestamp: new Date().toISOString() };
    console.error(`[ERROR] ${entry.timestamp} ${message}`, ...args);
    return entry;
  },
  warn: (message: string, ...args: any[]) => {
    const entry: LogEntry = { level: "warn", message, args, timestamp: new Date().toISOString() };
    console.warn(`[WARN] ${entry.timestamp} ${message}`, ...args);
    return entry;
  },
  debug: (message: string, ...args: any[]) => {
    const entry: LogEntry = { level: "debug", message, args, timestamp: new Date().toISOString() };
    console.debug(`[DEBUG] ${entry.timestamp} ${message}`, ...args);
    return entry;
  },
};
