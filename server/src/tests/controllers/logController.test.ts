import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import * as logController from '../../controllers/logController';
import * as socketService from '../../services/socketService';

jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    log: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $disconnect: jest.fn(),
  };
  return {
    PrismaClient: jest.fn(() => mockPrismaClient),
  };
});

jest.mock('../../services/socketService', () => ({
  emitLogCreated: jest.fn(),
  emitLogUpdated: jest.fn(),
  emitLogDeleted: jest.fn(),
}));

describe('Log Controller', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let prisma: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = {
      user: { id: 'user-123', email: 'test@example.com' },
      body: {},
      params: {},
      query: {},
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    prisma = new PrismaClient();
  });

  describe('createLog', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockReq.user = undefined;

      await logController.createLog(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
    });

    it('should return 400 if required fields are missing', async () => {
      mockReq.body = {
        date: '2025-07-15',
        sleepHours: 8,
      };

      await logController.createLog(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Mood and anxiety levels are required' });
    });

    it('should return 409 if a log already exists for the date', async () => {
      const existingLog = {
        id: 'log-123',
        userId: 'user-123',
        date: new Date('2025-07-15'),
        mood: 3,
        anxiety: 3,
      };

      prisma.log.findUnique.mockResolvedValue(existingLog);

      mockReq.body = {
        date: '2025-07-15',
        mood: 4,
        anxiety: 2,
      };

      await logController.createLog(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(409);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'A log already exists for this date' });
      expect(prisma.log.create).not.toHaveBeenCalled();
      expect(socketService.emitLogCreated).not.toHaveBeenCalled();
    });

    it('should create a new log if none exists for the date', async () => {
      prisma.log.findUnique.mockResolvedValue(null);

      const newLog = {
        id: 'new-log-123',
        userId: 'user-123',
        date: new Date('2025-07-15'),
        mood: 5,
        anxiety: 1,
      };

      prisma.log.create.mockResolvedValue(newLog);

      mockReq.body = {
        date: '2025-07-15',
        mood: 5,
        anxiety: 1,
      };

      await logController.createLog(mockReq as Request, mockRes as Response);

      expect(prisma.log.create).toHaveBeenCalled();
      expect(socketService.emitLogCreated).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(newLog);
    });
  });

  describe('getLogs', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockReq.user = undefined;

      await logController.getLogs(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
    });

    it('should return logs for the authenticated user', async () => {
      const mockLogs = [
        { id: 'log-1', userId: 'user-123', mood: 4 },
        { id: 'log-2', userId: 'user-123', mood: 3 },
      ];

      prisma.log.findMany.mockResolvedValue(mockLogs);

      await logController.getLogs(mockReq as Request, mockRes as Response);

      expect(prisma.log.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'user-123' },
        })
      );
      expect(mockRes.json).toHaveBeenCalledWith(mockLogs);
    });
  });
});
