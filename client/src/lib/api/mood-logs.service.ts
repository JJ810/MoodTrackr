import { apiClient } from './client';
import type { ApiResponse, MoodLog, MoodLogInput, PaginatedResponse } from './types';

export class MoodLogsService {
  /**
   * Get all mood logs with pagination
   */
  async getMoodLogs(page = 1, limit = 10): Promise<PaginatedResponse<MoodLog>> {
    return apiClient.get<ApiResponse<PaginatedResponse<MoodLog>>>(
      '/api/mood-logs',
      {
        params: { page, limit },
        useCache: true,
        cacheTime: 2 * 60 * 1000 // 2 minutes
      }
    ).then(response => response.data);
  }

  /**
   * Get mood logs for a specific date range
   */
  async getMoodLogsByDateRange(startDate: string, endDate: string): Promise<MoodLog[]> {
    return apiClient.get<ApiResponse<MoodLog[]>>(
      '/api/mood-logs/range',
      {
        params: { startDate, endDate },
        useCache: true,
        cacheTime: 5 * 60 * 1000 // 5 minutes
      }
    ).then(response => response.data);
  }

  /**
   * Get a single mood log by ID
   */
  async getMoodLog(id: string): Promise<MoodLog> {
    return apiClient.get<ApiResponse<MoodLog>>(
      `/api/mood-logs/${id}`,
      { useCache: true }
    ).then(response => response.data);
  }

  /**
   * Create a new mood log
   */
  async createMoodLog(data: MoodLogInput): Promise<MoodLog> {
    const response = await apiClient.post<ApiResponse<MoodLog>>(
      '/api/mood-logs',
      data
    );
    
    // Invalidate the cache for mood logs list
    apiClient.invalidateCache('/api/mood-logs');
    
    return response.data;
  }

  /**
   * Update an existing mood log
   */
  async updateMoodLog(id: string, data: Partial<MoodLogInput>): Promise<MoodLog> {
    const response = await apiClient.put<ApiResponse<MoodLog>>(
      `/api/mood-logs/${id}`,
      data
    );
    
    // Invalidate related caches
    apiClient.invalidateCache('/api/mood-logs');
    apiClient.invalidateCache(`/api/mood-logs/${id}`);
    
    return response.data;
  }

  /**
   * Delete a mood log
   */
  async deleteMoodLog(id: string): Promise<void> {
    await apiClient.delete<ApiResponse<void>>(`/api/mood-logs/${id}`);
    
    // Invalidate related caches
    apiClient.invalidateCache('/api/mood-logs');
    apiClient.invalidateCache(`/api/mood-logs/${id}`);
  }

  /**
   * Get mood analytics data
   */
  async getMoodAnalytics(timeframe: 'week' | 'month' | 'year' = 'week'): Promise<any> {
    return apiClient.get<ApiResponse<any>>(
      '/api/mood-logs/analytics',
      {
        params: { timeframe },
        useCache: true,
        cacheTime: 10 * 60 * 1000 // 10 minutes
      }
    ).then(response => response.data);
  }
}

// Create and export a singleton instance
export const moodLogsService = new MoodLogsService();
