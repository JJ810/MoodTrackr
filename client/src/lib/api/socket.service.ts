import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';
import type { MoodLog } from './types';

// Environment variables
const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 2000;
  private eventHandlers: Map<string, ((...args: any[]) => void)[]> = new Map();

  /**
   * Initialize WebSocket connection
   */
  connect(): Socket {
    if (this.socket && this.socket.connected) {
      console.log('Socket already connected');
      return this.socket;
    }

    console.log('Initializing WebSocket connection to:', SOCKET_URL);
    
    // Get the auth token for authentication
    const token = localStorage.getItem('authToken');
    
    // Initialize socket with auth token
    this.socket = io(SOCKET_URL, {
      auth: {
        token
      },
      reconnection: true,
      reconnectionDelay: this.reconnectDelay,
      reconnectionAttempts: this.maxReconnectAttempts
    });

    // Setup event listeners
    this.setupEventListeners();
    
    return this.socket;
  }

  /**
   * Disconnect WebSocket
   */
  disconnect(): void {
    if (this.socket) {
      console.log('Disconnecting WebSocket');
      this.socket.disconnect();
      this.socket = null;
      this.reconnectAttempts = 0;
    }
  }

  /**
   * Check if socket is connected
   */
  isConnected(): boolean {
    return !!this.socket?.connected;
  }

  /**
   * Setup default event listeners
   */
  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts > this.maxReconnectAttempts) {
        toast.error('Unable to connect to the server. Please check your connection.');
        this.disconnect();
      }
    });

    // Re-register any existing event handlers
    this.eventHandlers.forEach((handlers, event) => {
      handlers.forEach(handler => {
        this.socket?.on(event, handler);
      });
    });
  }

  /**
   * Subscribe to a WebSocket event
   * @param event - Event name
   * @param callback - Event handler
   */
  on<T = any>(event: string, callback: (data: T) => void): () => void {
    if (!this.socket) {
      this.connect();
    }

    // Store the handler for reconnection purposes
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)?.push(callback);
    
    // Register the handler
    this.socket?.on(event, callback);
    
    // Return an unsubscribe function
    return () => {
      this.off(event, callback);
    };
  }

  /**
   * Unsubscribe from a WebSocket event
   * @param event - Event name
   * @param callback - Event handler to remove
   */
  off<T = any>(event: string, callback: (data: T) => void): void {
    // Remove the handler from our storage
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(callback);
      if (index !== -1) {
        handlers.splice(index, 1);
      }
      if (handlers.length === 0) {
        this.eventHandlers.delete(event);
      }
    }
    
    // Unregister the handler
    this.socket?.off(event, callback);
  }

  /**
   * Emit a WebSocket event
   * @param event - Event name
   * @param data - Event data
   */
  emit<T = any>(event: string, data?: T): void {
    if (!this.socket) {
      this.connect();
    }
    
    this.socket?.emit(event, data);
  }

  /**
   * Subscribe to mood log updates
   * @param callback - Callback function for new mood logs
   */
  onMoodLogCreated(callback: (log: MoodLog) => void): () => void {
    return this.on<MoodLog>('mood_log_created', callback);
  }

  /**
   * Subscribe to mood log updates
   * @param callback - Callback function for updated mood logs
   */
  onMoodLogUpdated(callback: (log: MoodLog) => void): () => void {
    return this.on<MoodLog>('mood_log_updated', callback);
  }

  /**
   * Subscribe to mood log deletions
   * @param callback - Callback function for deleted mood log IDs
   */
  onMoodLogDeleted(callback: (logId: string) => void): () => void {
    return this.on<string>('mood_log_deleted', callback);
  }
}

// Create and export a singleton instance
export const socketService = new SocketService();
