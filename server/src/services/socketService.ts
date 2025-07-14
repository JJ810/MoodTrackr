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
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 30000,
    pingInterval: 25000,
    connectTimeout: 20000
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    console.log('Socket auth attempt:', socket.id);

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
    console.log(`User connected: ${socket.data.user.email}`);

    socket.join(`user-${socket.data.user.id}`);

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.data.user.email}`);
    });
  });

  console.log('Socket.IO initialized');
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
      const { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } = require('date-fns');
      const prisma = new PrismaClient();

      // Get current date ranges for both weekly and monthly views
      const weeklyStartDate = format(startOfWeek(new Date()), 'yyyy-MM-dd');
      const weeklyEndDate = format(endOfWeek(new Date()), 'yyyy-MM-dd');
      const monthlyStartDate = format(startOfMonth(new Date()), 'yyyy-MM-dd');
      const monthlyEndDate = format(endOfMonth(new Date()), 'yyyy-MM-dd');

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
        formattedDate: format(new Date(log.date), 'MMM dd'),
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
      const { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } = require('date-fns');
      const prisma = new PrismaClient();

      const weeklyStartDate = format(startOfWeek(new Date()), 'yyyy-MM-dd');
      const weeklyEndDate = format(endOfWeek(new Date()), 'yyyy-MM-dd');
      const monthlyStartDate = format(startOfMonth(new Date()), 'yyyy-MM-dd');
      const monthlyEndDate = format(endOfMonth(new Date()), 'yyyy-MM-dd');

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
        formattedDate: format(new Date(log.date), 'MMM dd'),
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
      const { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } = require('date-fns');
      const prisma = new PrismaClient();

      const weeklyStartDate = format(startOfWeek(new Date()), 'yyyy-MM-dd');
      const weeklyEndDate = format(endOfWeek(new Date()), 'yyyy-MM-dd');
      const monthlyStartDate = format(startOfMonth(new Date()), 'yyyy-MM-dd');
      const monthlyEndDate = format(endOfMonth(new Date()), 'yyyy-MM-dd');

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
        formattedDate: format(new Date(log.date), 'MMM dd'),
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
