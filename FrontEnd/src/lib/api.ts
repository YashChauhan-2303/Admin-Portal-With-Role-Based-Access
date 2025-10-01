// API Configuration and utilities for connecting to backend

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface ApiError {
  success: false;
  message: string;
  errors?: string[];
}

// Token management
export const tokenManager = {
  get: () => localStorage.getItem('auth_token'),
  getRefresh: () => localStorage.getItem('refresh_token'),
  set: (token: string, refreshToken?: string) => {
    localStorage.setItem('auth_token', token);
    if (refreshToken) {
      localStorage.setItem('refresh_token', refreshToken);
    }
  },
  clear: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
  }
};

// Create axios-like request function
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const token = tokenManager.get();

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        // Log the full error for debugging with stringification
        console.error('API Error Response:', JSON.stringify({
          status: response.status,
          statusText: response.statusText,
          data: data
        }, null, 2));
        
        // Extract detailed validation errors if available
        if (data.errors) {
          console.error('Validation Errors:', JSON.stringify(data.errors, null, 2));
        }
        
        // Handle 401 (Unauthorized) - try to refresh token
        if (response.status === 401 && token) {
          const refreshed = await this.refreshToken();
          if (refreshed) {
            // Retry the original request with new token
            const newToken = tokenManager.get();
            const retryConfig: RequestInit = {
              ...config,
              headers: {
                ...config.headers,
                Authorization: `Bearer ${newToken}`,
              },
            };
            const retryResponse = await fetch(url, retryConfig);
            const retryData = await retryResponse.json();
            
            if (!retryResponse.ok) {
              console.error('API Error Response:', retryData);
              throw new Error(retryData.message || 'Request failed');
            }
            return retryData;
          } else {
            // Refresh failed, clear tokens and redirect to login
            tokenManager.clear();
            window.location.href = '/login';
            throw new Error('Session expired');
          }
        }
        console.error('API Error Response:', data);
        throw new Error(data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: Record<string, unknown>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: Record<string, unknown>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Refresh token
  private async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = tokenManager.getRefresh();
      if (!refreshToken) return false;

      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        tokenManager.set(data.data.token, data.data.refreshToken);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }
}

// Create API client instance
export const apiClient = new ApiClient(API_BASE_URL);

// Utility function for handling API errors
export const handleApiError = (error: unknown): string => {
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
};