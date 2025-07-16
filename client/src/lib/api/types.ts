// API Response Types
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
}

// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  createdAt: string;
  updatedAt: string;
}

// Auth Types
export interface AuthResponse {
  token: string;
  user: User;
}

// Mood Log Types
export interface MoodLog {
  id: string;
  userId: string;
  date: string;
  mood: number;
  anxiety: number;
  sleepHours: number | null;
  sleepQuality: number | null;
  sleepDisturbances: boolean | null;
  physicalActivity: string | null;
  activityDuration: number | null;
  socialInteractions: number | null;
  stressLevel: number | null;
  depressionSymptoms: string | null;
  anxietySymptoms: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MoodLogInput {
  date: string;
  mood: number;
  anxiety: number;
  sleepHours?: number;
  sleepQuality?: number;
  sleepDisturbances?: boolean;
  physicalActivity?: string;
  activityDuration?: number;
  socialInteractions?: number;
  stressLevel?: number;
  depressionSymptoms?: string;
  anxietySymptoms?: string;
  notes?: string;
}

// Pagination Types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Error Types
export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, any>;
}
