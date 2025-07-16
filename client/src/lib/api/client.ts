import axios from 'axios';
import type {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig
} from 'axios';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

interface CacheItem {
  data: any;
  timestamp: number;
  expiresIn: number;
}

class ApiCache {
  private cache: Map<string, CacheItem> = new Map();

  set(key: string, data: any, expiresIn = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresIn
    });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.timestamp + item.expiresIn) {
      this.delete(key);
      return null;
    }

    return item.data;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  getCacheKey(config: AxiosRequestConfig): string {
    const { url, method = 'get', params, data } = config;
    return `${method}:${url}:${JSON.stringify(params)}:${JSON.stringify(data)}`;
  }
}

export class ApiClient {
  private instance: AxiosInstance;
  private cache: ApiCache;

  constructor() {
    this.instance = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: false,
    });

    this.cache = new ApiCache();
    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
        const token = localStorage.getItem('authToken');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        (config as any)._requestStartTime = Date.now();

        return config;
      },
      (error: AxiosError) => {
        console.error('Request setup error:', error);
        return Promise.reject(error);
      }
    );

    this.instance.interceptors.response.use(
      (response: AxiosResponse): AxiosResponse => {
        const requestStartTime = (response.config as any)._requestStartTime;
        if (requestStartTime) {
          const duration = Date.now() - requestStartTime;
          console.debug(`Request to ${response.config.url} completed in ${duration}ms`);
        }

        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: number };

        if (
          originalRequest &&
          (!error.response || (error.response.status >= 500 && error.response.status < 600)) &&
          (!originalRequest._retry || originalRequest._retry < MAX_RETRIES)
        ) {
          originalRequest._retry = (originalRequest._retry || 0) + 1;

          const delay = RETRY_DELAY * Math.pow(2, originalRequest._retry - 1);
          console.log(`Retrying request (${originalRequest._retry}/${MAX_RETRIES}) after ${delay}ms`);

          await new Promise(resolve => setTimeout(resolve, delay));
          return this.instance(originalRequest);
        }

        if (error.response) {
          switch (error.response.status) {
            case 401:
              console.warn('Authentication error, redirecting to login');
              localStorage.removeItem('authToken');
              if (!window.location.pathname.includes('/login')) {
                toast.error('Your session has expired. Please log in again.');
                window.location.href = '/login';
              }
              break;
            case 403:
              toast.error('You do not have permission to access this resource');
              break;
            case 404:
              console.error('Resource not found');
              break;
            case 429:
              toast.error('Too many requests. Please try again later.');
              break;
            case 500:
              toast.error('Server error. Our team has been notified.');
              break;
            default:
              const message = (error.response.data as any)?.message || 'An unexpected error occurred';
              toast.error(message);
          }
        } else if (error.request) {
          toast.error('Unable to connect to the server. Please check your internet connection.');
          console.error('No response received:', error.request);
        } else {
          toast.error('Something went wrong. Please try again.');
          console.error('Error setting up request:', error.message);
        }

        return Promise.reject(error);
      }
    );
  }

  async request<T = any>(config: AxiosRequestConfig & {
    useCache?: boolean;
    cacheTime?: number;
  }): Promise<T> {
    const { useCache = false, cacheTime, ...axiosConfig } = config;

    if (useCache && axiosConfig.method?.toLowerCase() === 'get') {
      const cacheKey = this.cache.getCacheKey(axiosConfig);
      const cachedData = this.cache.get(cacheKey);

      if (cachedData) {
        console.debug(`Using cached data for ${axiosConfig.url}`);
        return cachedData;
      }

      const response = await this.instance.request<T>(axiosConfig);

      const responseData = response.data;
      this.cache.set(cacheKey, responseData, cacheTime);
      return responseData;
    }

    const response = await this.instance.request<T>(axiosConfig);
    return response.data;
  }

  async get<T = any>(url: string, config?: Omit<AxiosRequestConfig, 'url' | 'method'> & {
    useCache?: boolean;
    cacheTime?: number;
  }): Promise<T> {
    return this.request<T>({ ...config, url, method: 'get' });
  }

  async post<T = any>(url: string, data?: any, config?: Omit<AxiosRequestConfig, 'url' | 'method'>): Promise<T> {
    return this.request<T>({ ...config, url, method: 'post', data });
  }

  async put<T = any>(url: string, data?: any, config?: Omit<AxiosRequestConfig, 'url' | 'method'>): Promise<T> {
    return this.request<T>({ ...config, url, method: 'put', data });
  }

  async delete<T = any>(url: string, config?: Omit<AxiosRequestConfig, 'url' | 'method'>): Promise<T> {
    return this.request<T>({ ...config, url, method: 'delete' });
  }

  clearCache(): void {
    this.cache.clear();
  }

  invalidateCache(url: string, method = 'get', params?: any, data?: any): void {
    const cacheKey = this.cache.getCacheKey({ url, method, params, data });
    this.cache.delete(cacheKey);
  }
}

export const apiClient = new ApiClient();
