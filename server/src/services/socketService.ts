import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import config from '../config';

let io: SocketIOServer;

/**
 * Initialize Socket.IO server
 * @param httpServer HTTP server instance
 */
export const initializeSocketIO = (httpServer: HttpServer): void => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: config.cors.origin,
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication error: Token required'));
    }

    try {
      const decoded = jwt.verify(token, Buffer.from(config.jwt.secret)) as { id: string; email: string };

      socket.data.user = {
        id: decoded.id,
        email: decoded.email
      };

      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.data.user.email}`);

    socket.join(`user-${socket.data.user.id}`);

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.data.user.email}`);
    });
  });

  console.log('Socket.IO initialized');
};

/**
 * Emit log created event to specific user
 * @param userId User ID
 * @param logData Log data
 */
export const emitLogCreated = (userId: string, logData: any): void => {
  if (io) {
    io.to(`user-${userId}`).emit('log:created', logData);
  }
};

/**
 * Emit log updated event to specific user
 * @param userId User ID
 * @param logData Log data
 */
export const emitLogUpdated = (userId: string, logData: any): void => {
  if (io) {
    io.to(`user-${userId}`).emit('log:updated', logData);
  }
};

/**
 * Emit log deleted event to specific user
 * @param userId User ID
 * @param logId Log ID
 */
export const emitLogDeleted = (userId: string, logId: string): void => {
  if (io) {
    io.to(`user-${userId}`).emit('log:deleted', { id: logId });
  }
};

/**
 * Get Socket.IO server instance
 * @returns Socket.IO server instance
 */
export const getIO = (): SocketIOServer => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};
