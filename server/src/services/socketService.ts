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
      origin: config.cors.origin, // Use the configured origin from config
      methods: ['GET', 'POST', 'OPTIONS'],
      credentials: true
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 30000,
    pingInterval: 25000,
    connectTimeout: 20000,
    allowEIO3: true // Allow Engine.IO v3 clients
  });

  io.engine.on('connection_error', (err) => {
    console.error('Socket.IO connection error:', err);
  });

  io.use((socket, next) => {

    const token = socket.handshake.auth.token;

    if (!token) {
      console.log('Socket auth failed: No token provided');
      return next(new Error('Authentication error: Token required'));
    }

    try {
      const decoded = jwt.verify(token, Buffer.from(config.jwt.secret)) as { id: string; email: string };

      socket.data.user = {
        id: decoded.id,
        email: decoded.email
      };

      console.log(`Socket authenticated: ${socket.id} for user ${decoded.email}`);
      next();
    } catch (error) {
      console.error('Socket auth error:', error instanceof Error ? error.message : 'Unknown error');
      if (error instanceof jwt.JsonWebTokenError) {
        return next(new Error('Authentication error: Invalid token format'));
      } else if (error instanceof jwt.TokenExpiredError) {
        return next(new Error('Authentication error: Token expired'));
      } else {
        return next(new Error('Authentication error: Token verification failed'));
      }
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.data.user?.email || 'unknown'}`);

    if (socket.data.user) {
      socket.join(`user-${socket.data.user.id}`);
    }

    socket.on('disconnect', (reason) => {
      console.log(`User disconnected: ${socket.data.user?.email || 'unknown'}. Reason: ${reason}`);
    });

    socket.on('error', (error) => {
      console.error(`Socket error for user ${socket.data.user?.email || 'unknown'}:`, error);
    });
  });

  console.log('Socket.IO initialized successfully');

  // Debug: Log when server emits events
  const originalEmit = io.emit;
  io.emit = function (event, ...args) {
    return originalEmit.apply(this, [event, ...args]);
  };
};

/**
 * Emit log created event to specific user with summary data
 * @param userId User ID
 * @param logData Log data
 */
export const emitLogCreated = async (userId: string, logData: any): Promise<void> => {
  if (io) {
    try {
      // Import prisma client and format functions here to avoid circular dependencies
      const { PrismaClient } = require('@prisma/client');
      const dayjs = require('dayjs');
      const utc = require('dayjs/plugin/utc');
      const timezone = require('dayjs/plugin/timezone');
      const weekOfYear = require('dayjs/plugin/weekOfYear');
      const weekday = require('dayjs/plugin/weekday');

      dayjs.extend(utc);
      dayjs.extend(timezone);
      dayjs.extend(weekOfYear);
      dayjs.extend(weekday);
      const prisma = new PrismaClient();

      // Get current date ranges for both weekly and monthly views
      const weeklyStartDate = dayjs().startOf('week').format('YYYY-MM-DD');
      const weeklyEndDate = dayjs().endOf('week').format('YYYY-MM-DD');
      const monthlyStartDate = dayjs().startOf('month').format('YYYY-MM-DD');
      const monthlyEndDate = dayjs().endOf('month').format('YYYY-MM-DD');

      const weeklyLogs = await prisma.log.findMany({
        where: {
          userId,
          date: {
            gte: new Date(weeklyStartDate),
            lte: new Date(weeklyEndDate)
          }
        },
        orderBy: { date: 'asc' },
        select: {
          id: true,
          date: true,
          mood: true,
          anxiety: true,
          sleepHours: true,
          sleepQuality: true,
          sleepDisturbances: true,
          physicalActivity: true,
          activityDuration: true,
          socialInteractions: true,
          stressLevel: true,
          depressionSymptoms: true,
          anxietySymptoms: true,
          notes: true
        }
      });

      const monthlyLogs = await prisma.log.findMany({
        where: {
          userId,
          date: {
            gte: new Date(monthlyStartDate),
            lte: new Date(monthlyEndDate)
          }
        },
        orderBy: { date: 'asc' },
        select: {
          id: true,
          date: true,
          mood: true,
          anxiety: true,
          sleepHours: true,
          sleepQuality: true,
          sleepDisturbances: true,
          physicalActivity: true,
          activityDuration: true,
          socialInteractions: true,
          stressLevel: true,
          depressionSymptoms: true,
          anxietySymptoms: true,
          notes: true
        }
      });

      const formatLogs = (logs: any[]) => logs.map(log => ({
        date: log.date.toISOString(),
        formattedDate: dayjs(log.date).format('MMM DD'),
        id: log.id,
        mood: log.mood || 0,
        anxiety: log.anxiety || 0,
        sleepHours: log.sleepHours || 0,
        sleepQuality: log.sleepQuality,
        sleepDisturbances: log.sleepDisturbances,
        physicalActivity: log.physicalActivity,
        activityDuration: log.activityDuration,
        socialInteractions: log.socialInteractions,
        stressLevel: log.stressLevel || 0,
        depressionSymptoms: log.depressionSymptoms,
        anxietySymptoms: log.anxietySymptoms,
        notes: log.notes
      }));

      io.to(`user-${userId}`).emit('log:created', {
        newLog: logData,
        summaryData: {
          weekly: formatLogs(weeklyLogs),
          monthly: formatLogs(monthlyLogs)
        }
      });

      await prisma.$disconnect();
    } catch (error) {
      console.error('Error preparing summary data for socket emission:', error);
      io.to(`user-${userId}`).emit('log:created', { newLog: logData });
    }
  }
};

/**
 * Emit log updated event to specific user with summary data
 * @param userId User ID
 * @param logData Log data
 */
export const emitLogUpdated = async (userId: string, logData: any): Promise<void> => {
  if (io) {
    try {
      const { PrismaClient } = require('@prisma/client');
      const dayjs = require('dayjs');
      const utc = require('dayjs/plugin/utc');
      const timezone = require('dayjs/plugin/timezone');
      const weekOfYear = require('dayjs/plugin/weekOfYear');
      const weekday = require('dayjs/plugin/weekday');

      dayjs.extend(utc);
      dayjs.extend(timezone);
      dayjs.extend(weekOfYear);
      dayjs.extend(weekday);
      const prisma = new PrismaClient();

      const weeklyStartDate = dayjs().startOf('week').format('YYYY-MM-DD');
      const weeklyEndDate = dayjs().endOf('week').format('YYYY-MM-DD');
      const monthlyStartDate = dayjs().startOf('month').format('YYYY-MM-DD');
      const monthlyEndDate = dayjs().endOf('month').format('YYYY-MM-DD');

      const weeklyLogs = await prisma.log.findMany({
        where: {
          userId,
          date: {
            gte: new Date(weeklyStartDate),
            lte: new Date(weeklyEndDate)
          }
        },
        orderBy: { date: 'asc' },
        select: {
          id: true,
          date: true,
          mood: true,
          anxiety: true,
          sleepHours: true,
          sleepQuality: true,
          sleepDisturbances: true,
          physicalActivity: true,
          activityDuration: true,
          socialInteractions: true,
          stressLevel: true,
          depressionSymptoms: true,
          anxietySymptoms: true,
          notes: true
        }
      });

      const monthlyLogs = await prisma.log.findMany({
        where: {
          userId,
          date: {
            gte: new Date(monthlyStartDate),
            lte: new Date(monthlyEndDate)
          }
        },
        orderBy: { date: 'asc' },
        select: {
          id: true,
          date: true,
          mood: true,
          anxiety: true,
          sleepHours: true,
          sleepQuality: true,
          sleepDisturbances: true,
          physicalActivity: true,
          activityDuration: true,
          socialInteractions: true,
          stressLevel: true,
          depressionSymptoms: true,
          anxietySymptoms: true,
          notes: true
        }
      });

      const formatLogs = (logs: any[]) => logs.map(log => ({
        date: log.date.toISOString(),
        formattedDate: dayjs(log.date).format('MMM DD'),
        id: log.id,
        mood: log.mood || 0,
        anxiety: log.anxiety || 0,
        sleepHours: log.sleepHours || 0,
        sleepQuality: log.sleepQuality,
        sleepDisturbances: log.sleepDisturbances,
        physicalActivity: log.physicalActivity,
        activityDuration: log.activityDuration,
        socialInteractions: log.socialInteractions,
        stressLevel: log.stressLevel || 0,
        depressionSymptoms: log.depressionSymptoms,
        anxietySymptoms: log.anxietySymptoms,
        notes: log.notes
      }));

      io.to(`user-${userId}`).emit('log:updated', {
        updatedLog: logData,
        summaryData: {
          weekly: formatLogs(weeklyLogs),
          monthly: formatLogs(monthlyLogs)
        }
      });

      await prisma.$disconnect();
    } catch (error) {
      console.error('Error preparing summary data for socket emission:', error);
      io.to(`user-${userId}`).emit('log:updated', { updatedLog: logData });
    }
  }
};

/**
 * Emit log deleted event to specific user with summary data
 * @param userId User ID
 * @param logId Log ID
 */
export const emitLogDeleted = async (userId: string, logId: string): Promise<void> => {
  if (io) {
    try {
      const { PrismaClient } = require('@prisma/client');
      const dayjs = require('dayjs');
      const utc = require('dayjs/plugin/utc');
      const timezone = require('dayjs/plugin/timezone');
      const weekOfYear = require('dayjs/plugin/weekOfYear');
      const weekday = require('dayjs/plugin/weekday');

      dayjs.extend(utc);
      dayjs.extend(timezone);
      dayjs.extend(weekOfYear);
      dayjs.extend(weekday);
      const prisma = new PrismaClient();

      const weeklyStartDate = dayjs().startOf('week').format('YYYY-MM-DD');
      const weeklyEndDate = dayjs().endOf('week').format('YYYY-MM-DD');
      const monthlyStartDate = dayjs().startOf('month').format('YYYY-MM-DD');
      const monthlyEndDate = dayjs().endOf('month').format('YYYY-MM-DD');

      const weeklyLogs = await prisma.log.findMany({
        where: {
          userId,
          date: {
            gte: new Date(weeklyStartDate),
            lte: new Date(weeklyEndDate)
          }
        },
        orderBy: { date: 'asc' },
        select: {
          id: true,
          date: true,
          mood: true,
          anxiety: true,
          sleepHours: true,
          sleepQuality: true,
          sleepDisturbances: true,
          physicalActivity: true,
          activityDuration: true,
          socialInteractions: true,
          stressLevel: true,
          depressionSymptoms: true,
          anxietySymptoms: true,
          notes: true
        }
      });

      // Fetch monthly summary
      const monthlyLogs = await prisma.log.findMany({
        where: {
          userId,
          date: {
            gte: new Date(monthlyStartDate),
            lte: new Date(monthlyEndDate)
          }
        },
        orderBy: { date: 'asc' },
        select: {
          id: true,
          date: true,
          mood: true,
          anxiety: true,
          sleepHours: true,
          sleepQuality: true,
          sleepDisturbances: true,
          physicalActivity: true,
          activityDuration: true,
          socialInteractions: true,
          stressLevel: true,
          depressionSymptoms: true,
          anxietySymptoms: true,
          notes: true
        }
      });

      // Format logs for the client
      const formatLogs = (logs: any[]) => logs.map(log => ({
        date: log.date.toISOString(),
        formattedDate: dayjs(log.date).format('MMM DD'),
        id: log.id,
        mood: log.mood || 0,
        anxiety: log.anxiety || 0,
        sleepHours: log.sleepHours || 0,
        sleepQuality: log.sleepQuality,
        sleepDisturbances: log.sleepDisturbances,
        physicalActivity: log.physicalActivity,
        activityDuration: log.activityDuration,
        socialInteractions: log.socialInteractions,
        stressLevel: log.stressLevel || 0,
        depressionSymptoms: log.depressionSymptoms,
        anxietySymptoms: log.anxietySymptoms,
        notes: log.notes
      }));

      // Emit the event with the deleted log ID and summary data
      io.to(`user-${userId}`).emit('log:deleted', {
        deletedLogId: logId,
        summaryData: {
          weekly: formatLogs(weeklyLogs),
          monthly: formatLogs(monthlyLogs)
        }
      });

      await prisma.$disconnect();
    } catch (error) {
      console.error('Error preparing summary data for socket emission:', error);
      // Fall back to just sending the log ID if there's an error
      io.to(`user-${userId}`).emit('log:deleted', { deletedLogId: logId });
    }
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
