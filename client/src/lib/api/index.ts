/**
 * API Services and Types
 * 
 * This file exports all API services and types for the application.
 * It provides a central point for importing API-related functionality.
 */

// Core API client
export { apiClient } from './client';

// Service exports
export { authService } from './auth.service';
export { moodLogsService } from './mood-logs.service';
export { socketService } from './socket.service';

// Type exports
export type * from './types';

// Re-exports for backward compatibility
import { authService } from './auth.service';
export const authAPI = authService;
