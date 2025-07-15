import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import {
  initializeSocketIO,
  emitLogCreated,
  emitLogUpdated,
  emitLogDeleted,
  getIO
} from '../../services/socketService';
import config from '../../config';

jest.mock('socket.io', () => {
  const mockIo = {
    use: jest.fn().mockReturnThis(),
    on: jest.fn().mockReturnThis(),
    to: jest.fn().mockReturnThis(),
    emit: jest.fn(),
  };
  return {
    Server: jest.fn(() => mockIo),
  };
});

jest.mock('jsonwebtoken');

describe('Socket Service', () => {
  let mockHttpServer: HttpServer;
  let mockIo: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockHttpServer = {} as HttpServer;

    initializeSocketIO(mockHttpServer);

    mockIo = getIO();
  });

  describe('initializeSocketIO', () => {
    it('should initialize Socket.IO with correct options', () => {
      expect(SocketIOServer).toHaveBeenCalledWith(mockHttpServer, {
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
    });

    it('should set up authentication middleware', () => {
      expect(mockIo.use).toHaveBeenCalled();
    });
  });

  describe('emitLogCreated', () => {
    it('should emit log created event to the correct user', async () => {
      const userId = 'user-123';
      const logData = { id: 'log-123', mood: 5 };

      await emitLogCreated(userId, logData);

      expect(mockIo.to).toHaveBeenCalledWith(`user-${userId}`);
      expect(mockIo.emit).toHaveBeenCalledWith('log:created', expect.anything());
    });
  });

  describe('emitLogUpdated', () => {
    it('should emit log updated event to the correct user', async () => {
      const userId = 'user-123';
      const logData = { id: 'log-123', mood: 4 };

      await emitLogUpdated(userId, logData);

      expect(mockIo.to).toHaveBeenCalledWith(`user-${userId}`);
      expect(mockIo.emit).toHaveBeenCalledWith('log:updated', expect.anything());
    });
  });

  describe('emitLogDeleted', () => {
    it('should emit log deleted event to the correct user', async () => {
      const userId = 'user-123';
      const logId = 'log-123';

      await emitLogDeleted(userId, logId);

      expect(mockIo.to).toHaveBeenCalledWith(`user-${userId}`);
      expect(mockIo.emit).toHaveBeenCalledWith('log:deleted', expect.anything());
    });
  });
});
