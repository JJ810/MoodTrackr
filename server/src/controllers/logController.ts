import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { emitLogCreated, emitLogUpdated, emitLogDeleted } from '../services/socketService';

const prisma = new PrismaClient();

/**
 * Create a new mood log entry
 * @param req Express request with user data from auth middleware
 * @param res Express response
 */
export const createLog = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const {
      date,
      mood,
      anxiety,
      sleepHours,
      sleepQuality,
      sleepDisturbances,
      physicalActivity,
      activityDuration,
      socialInteractions,
      stressLevel,
      depressionSymptoms,
      anxietySymptoms,
      notes
    } = req.body;

    // Validate required fields
    if (mood === undefined || anxiety === undefined) {
      res.status(400).json({ message: 'Mood and anxiety levels are required' });
      return;
    }

    // Check if a log already exists for this date and user
    const existingLog = await prisma.log.findUnique({
      where: {
        userId_date: {
          userId,
          date: new Date(date || new Date())
        }
      }
    });

    if (existingLog) {
      res.status(409).json({ message: 'A log already exists for this date' });
      return;
    }

    // Map form values to database schema
    // Convert sleepQuality from string to number
    let sleepQualityValue: number | null = null;
    if (sleepQuality === 'poor') sleepQualityValue = 1;
    else if (sleepQuality === 'fair') sleepQualityValue = 2;
    else if (sleepQuality === 'good') sleepQualityValue = 3;
    else if (sleepQuality === 'excellent') sleepQualityValue = 4;

    // Convert socialInteractions from string to number
    let socialInteractionsValue: number | null = null;
    if (socialInteractions === 'none') socialInteractionsValue = 1;
    else if (socialInteractions === 'minimal') socialInteractionsValue = 2;
    else if (socialInteractions === 'moderate') socialInteractionsValue = 3;
    else if (socialInteractions === 'high') socialInteractionsValue = 4;

    // Convert arrays to strings for storage
    const physicalActivityStr = Array.isArray(physicalActivity) ? physicalActivity.join(',') : physicalActivity;
    const sleepDisturbancesValue = Array.isArray(sleepDisturbances) ? sleepDisturbances.length > 0 : !!sleepDisturbances;
    const depressionSymptomsStr = Array.isArray(depressionSymptoms) ? depressionSymptoms.join(',') : depressionSymptoms;
    const anxietySymptomsStr = Array.isArray(anxietySymptoms) ? anxietySymptoms.join(',') : anxietySymptoms;

    const log = await prisma.log.create({
      data: {
        userId,
        date: new Date(date || new Date()),
        mood,
        anxiety,
        sleepHours: sleepHours || null,
        sleepQuality: sleepQualityValue,
        sleepDisturbances: sleepDisturbancesValue,
        physicalActivity: physicalActivityStr,
        activityDuration: activityDuration || null,
        socialInteractions: socialInteractionsValue,
        stressLevel,
        depressionSymptoms: depressionSymptomsStr,
        anxietySymptoms: anxietySymptomsStr,
        notes: notes || null
      }
    });

    // Emit WebSocket event for real-time updates
    emitLogCreated(userId, log);

    res.status(201).json(log);
  } catch (error) {
    console.error('Error creating log:', error);
    res.status(500).json({ message: 'Failed to create log' });
  }
};

/**
 * Get all logs for the authenticated user
 * @param req Express request with user data from auth middleware
 * @param res Express response
 */
export const getLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // Parse query parameters for filtering
    const { startDate, endDate, limit } = req.query;

    // Build the where clause
    const where: any = { userId };

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string)
      };
    } else if (startDate) {
      where.date = {
        gte: new Date(startDate as string)
      };
    } else if (endDate) {
      where.date = {
        lte: new Date(endDate as string)
      };
    }

    // Get logs with pagination
    const logs = await prisma.log.findMany({
      where,
      orderBy: { date: 'desc' },
      take: limit ? parseInt(limit as string) : undefined
    });

    res.status(200).json(logs);
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ message: 'Failed to fetch logs' });
  }
};

/**
 * Get a specific log by ID
 * @param req Express request with user data from auth middleware
 * @param res Express response
 */
export const getLogById = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const logId = req.params.id;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const log = await prisma.log.findFirst({
      where: {
        id: logId,
        userId
      }
    });

    if (!log) {
      res.status(404).json({ message: 'Log not found' });
      return;
    }

    res.status(200).json(log);
  } catch (error) {
    console.error('Error fetching log:', error);
    res.status(500).json({ message: 'Failed to fetch log' });
  }
};

/**
 * Update a specific log
 * @param req Express request with user data from auth middleware
 * @param res Express response
 */
export const updateLog = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const logId = req.params.id;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const existingLog = await prisma.log.findFirst({
      where: {
        id: logId,
        userId
      }
    });

    if (!existingLog) {
      res.status(404).json({ message: 'Log not found' });
      return;
    }

    const updatedLog = await prisma.log.update({
      where: { id: logId },
      data: req.body
    });

    emitLogUpdated(userId, updatedLog);

    res.status(200).json(updatedLog);
  } catch (error) {
    console.error('Error updating log:', error);
    res.status(500).json({ message: 'Failed to update log' });
  }
};

/**
 * Delete a specific log
 * @param req Express request with user data from auth middleware
 * @param res Express response
 */
export const deleteLog = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const logId = req.params.id;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // Check if log exists and belongs to user
    const existingLog = await prisma.log.findFirst({
      where: {
        id: logId,
        userId
      }
    });

    if (!existingLog) {
      res.status(404).json({ message: 'Log not found' });
      return;
    }

    await prisma.log.delete({
      where: { id: logId }
    });
    emitLogDeleted(userId, logId);

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting log:', error);
    res.status(500).json({ message: 'Failed to delete log' });
  }
};

/**
 * Get summary statistics for visualization
 * @param req Express request with user data from auth middleware
 * @param res Express response
 */
export const getLogsSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { startDate, endDate, metrics } = req.query;
    const metricsArray = metrics ? (metrics as string).split(',') : ['mood', 'anxiety', 'stressLevel'];

    const where: any = { userId };

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string)
      };
    } else if (startDate) {
      where.date = {
        gte: new Date(startDate as string)
      };
    } else if (endDate) {
      where.date = {
        lte: new Date(endDate as string)
      };
    } else {
      where.date = {
        gte: new Date(new Date().setDate(new Date().getDate() - 30))
      };
    }

    const logs = await prisma.log.findMany({
      where,
      orderBy: { date: 'asc' },
      select: {
        id: true,
        date: true,
        ...Object.fromEntries(metricsArray.map(metric => [metric, true]))
      }
    });

    const averages: Record<string, number> = {};

    metricsArray.forEach(metric => {
      const values = logs
        .map((log: Record<string, any>) => log[metric])
        .filter((value: unknown) => value !== null && value !== undefined);

      if (values.length > 0) {
        averages[metric] = values.reduce((sum: number, val: number) => sum + val, 0) / values.length;
      }
    });

    res.status(200).json({
      logs,
      averages,
      period: {
        start: startDate || new Date(new Date().setDate(new Date().getDate() - 30)),
        end: endDate || new Date()
      }
    });
  } catch (error) {
    console.error('Error fetching logs summary:', error);
    res.status(500).json({ message: 'Failed to fetch logs summary' });
  }
};
