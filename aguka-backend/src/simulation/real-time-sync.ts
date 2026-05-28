import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { JwtPayload } from '../types/index.js';
import { logger } from '../utils/logger.js';
import { SensorEngine } from './sensor-engine.js';
import { IrrigationLogic } from './irrigation-logic.js';

interface ClientConnection {
  id: string;
  userId: string;
  role: string;
  farmId?: string;
  connectedAt: Date;
  lastActivity: Date;
}

interface RealtimeEvent {
  type: 'sensor_data' | 'irrigation_action' | 'alert' | 'system_status';
  farmId?: string;
  userId?: string;
  data: any;
  timestamp: Date;
}

export class RealTimeSync {
  private io: SocketIOServer;
  private clients: Map<string, ClientConnection> = new Map();
  private sensorEngine: SensorEngine;
  private irrigationLogic: IrrigationLogic;

  constructor(server: HTTPServer, sensorEngine: SensorEngine, irrigationLogic: IrrigationLogic) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true,
      },
      transports: ['websocket', 'polling'],
    });

    this.sensorEngine = sensorEngine;
    this.irrigationLogic = irrigationLogic;
    
    this.setupSocketHandlers();
    this.setupEventListeners();
    
    logger.info('Real-time sync initialized');
  }

  /**
   * Setup Socket.IO event handlers
   */
  private setupSocketHandlers(): void {
    this.io.on('connection', (socket) => {
      logger.info(`Client connected: ${socket.id}`);

      // Handle authentication
      socket.on('authenticate', async (data) => {
        try {
          const { token, farmId } = data;
          
          // Verify token and get user info
          const decoded = await this.authenticateToken(token);
          
          if (decoded) {
            // Store client connection info
            this.clients.set(socket.id, {
              id: socket.id,
              userId: decoded.sub,
              role: decoded.role,
              farmId: farmId || (decoded as any).farmId, // Try to get farmId from token or param
              connectedAt: new Date(),
              lastActivity: new Date(),
            });

            // Join user-specific room
            socket.join(`user_${decoded.sub}`);
            
            // Join farm-specific room if provided
            if (farmId) {
              socket.join(`farm_${farmId}`);
            }

            // Join role-based room
            socket.join(`role_${decoded.role}`);

            // Send success response
            socket.emit('authenticated', {
              success: true,
              userId: decoded.sub,
              role: decoded.role,
            });

            // Send initial data
            await this.sendInitialData(socket, decoded.sub, farmId);

            logger.info(`Client authenticated: ${socket.id} (${decoded.role})`);
          } else {
            socket.emit('authenticated', { success: false, error: 'Invalid token' });
            socket.disconnect();
          }
        } catch (error) {
          logger.error('Authentication error:', error);
          socket.emit('authenticated', { success: false, error: 'Authentication failed' });
          socket.disconnect();
        }
      });

      // Handle subscription to farm data
      socket.on('subscribe_farm', (farmId) => {
        const client = this.clients.get(socket.id);
        if (client) {
          socket.join(`farm_${farmId}`);
          client.farmId = farmId;
          client.lastActivity = new Date();
          
          logger.info(`Client ${socket.id} subscribed to farm ${farmId}`);
        }
      });

      // Handle manual irrigation control
      socket.on('irrigation_control', async (data) => {
        try {
          const client = this.clients.get(socket.id);
          if (!client || client.role !== 'farmer') {
            socket.emit('error', { message: 'Unauthorized' });
            return;
          }

          const { zoneId, action, reason } = data;
          await this.irrigationLogic.manualControl(zoneId, action, reason);
          
          socket.emit('irrigation_control_success', { zoneId, action });
        } catch (error: any) {
          socket.emit('irrigation_control_error', { message: error.message });
        }
      });

      // Handle simulation control
      socket.on('simulation_control', async (data) => {
        try {
          const client = this.clients.get(socket.id);
          if (!client || client.role !== 'admin') {
            socket.emit('error', { message: 'Unauthorized' });
            return;
          }

          const { farmId, action, config } = data;
          
          switch (action) {
            case 'start':
              await this.sensorEngine.startSimulation(config);
              break;
            case 'stop':
              await this.sensorEngine.stopSimulation(farmId);
              break;
            case 'status':
              const status = this.sensorEngine.getSimulationStatus();
              socket.emit('simulation_status', status);
              break;
          }
        } catch (error: any) {
          socket.emit('simulation_control_error', { message: error.message });
        }
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        const client = this.clients.get(socket.id);
        if (client) {
          logger.info(`Client disconnected: ${socket.id} (${client.role})`);
          this.clients.delete(socket.id);
        }
      });

      // Handle ping for connection health
      socket.on('ping', () => {
        const client = this.clients.get(socket.id);
        if (client) {
          client.lastActivity = new Date();
          socket.emit('pong');
        }
      });
    });
  }

  /**
   * Setup event listeners for sensor and irrigation events
   */
  private setupEventListeners(): void {
    // Listen to sensor data updates
    this.sensorEngine.on('sensorData', (data) => {
      this.broadcastToFarm(data.farmId, {
        type: 'sensor_data',
        farmId: data.farmId,
        data: data.data,
        timestamp: new Date(),
      });
    });

    // Listen to irrigation actions
    this.irrigationLogic.on('irrigationAction', (data) => {
      this.broadcastToAll('farmer', {
        type: 'irrigation_action',
        data,
        timestamp: new Date(),
      });
    });

    // Listen to simulation status changes
    this.sensorEngine.on('simulationStopped', (data) => {
      this.broadcastToAll('admin', {
        type: 'system_status',
        data: { simulation: 'stopped', farmId: data.farmId },
        timestamp: new Date(),
      });
    });
  }

  /**
   * Send initial data to newly connected client
   */
  private async sendInitialData(socket: any, _userId: string, farmId?: string): Promise<void> {
    try {
      // Send current sensor data
      if (farmId) {
        const latestSensorData = await this.getLatestSensorData(farmId);
        socket.emit('sensor_data', latestSensorData);

        // Send irrigation status
        const irrigationStatus = await this.getIrrigationStatus(farmId);
        socket.emit('irrigation_status', irrigationStatus);
      }

      // Send system status for admins
      const client = this.clients.get(socket.id);
      if (client && (client.role === 'admin' || client.role === 'super_admin')) {
        const systemStatus = await this.getSystemStatus();
        socket.emit('system_status', systemStatus);
      }
    } catch (error) {
      logger.error('Error sending initial data:', error);
    }
  }

  /**
   * Get latest sensor data for a farm
   */
  private async getLatestSensorData(farmId: string): Promise<any> {
    const soilService = (await import('../services/soil.service.js')).soilService;
    const status = await soilService.getCurrentStatus(farmId);
    return status;
  }

  private async getIrrigationStatus(farmId: string): Promise<any> {
    const irrigationService = (await import('../services/irrigation.service.js')).irrigationService;
    const status = await irrigationService.getStatus(farmId);
    return status;
  }

  /**
   * Get system status for admins
   */
  private async getSystemStatus(): Promise<any> {
    const simulationStatus = this.sensorEngine.getSimulationStatus();
    const irrigationStatus = this.irrigationLogic.getStatus();
    
    return {
      connectedClients: this.clients.size,
      simulation: simulationStatus,
      irrigation: irrigationStatus,
      uptime: process.uptime(),
    };
  }

  /**
   * Broadcast event to all clients in a farm
   */
  private broadcastToFarm(farmId: string, event: RealtimeEvent): void {
    this.io.to(`farm_${farmId}`).emit('realtime_update', event);
  }

  /**
   * Broadcast event to all clients with a specific role
   */
  private broadcastToAll(role: string, event: RealtimeEvent): void {
    this.io.to(`role_${role}`).emit('realtime_update', event);
  }

  /**
   * Send alert to specific user
   */
  sendAlertToUser(userId: string, alert: any): void {
    this.io.to(`user_${userId}`).emit('alert', {
      ...alert,
      timestamp: new Date(),
    });
  }

  /**
   * Send alert to all farmers
   */
  sendAlertToFarmers(alert: any): void {
    this.io.to('role_farmer').emit('alert', {
      ...alert,
      timestamp: new Date(),
    });
  }

  /**
   * Send notification to specific client
   */
  sendNotificationToClient(socketId: string, notification: any): void {
    this.io.to(socketId).emit('notification', {
      ...notification,
      timestamp: new Date(),
    });
  }

  /**
   * Get connection statistics
   */
  getConnectionStats(): {
    totalConnections: number;
    connectionsByRole: Record<string, number>;
    activeConnections: number;
  } {
    const connectionsByRole: Record<string, number> = {};
    
    this.clients.forEach(client => {
      connectionsByRole[client.role] = (connectionsByRole[client.role] || 0) + 1;
    });

    // Count active connections (last activity within 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const activeConnections = Array.from(this.clients.values())
      .filter(client => client.lastActivity > fiveMinutesAgo).length;

    return {
      totalConnections: this.clients.size,
      connectionsByRole,
      activeConnections,
    };
  }

  /**
   * Clean up inactive connections
   */
  cleanupInactiveConnections(): void {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    let cleanedCount = 0;

    this.clients.forEach((client, socketId) => {
      if (client.lastActivity < tenMinutesAgo) {
        this.io.sockets.sockets.get(socketId)?.disconnect();
        this.clients.delete(socketId);
        cleanedCount++;
      }
    });

    if (cleanedCount > 0) {
      logger.info(`Cleaned up ${cleanedCount} inactive connections`);
    }
  }

  /**
   * Authenticate token using system JWT secret
   */
  private async authenticateToken(token: string): Promise<JwtPayload | null> {
    try {
      if (!token) return null;
      
      const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
      return decoded;
    } catch (error) {
      logger.error('Socket authentication error:', error);
      return null;
    }
  }

  /**
   * Graceful shutdown
   */
  destroy(): void {
    this.io.close();
    logger.info('Real-time sync destroyed');
  }
}
