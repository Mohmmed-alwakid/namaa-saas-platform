import type { ApiResponse } from '../../shared/types';

const API_BASE_URL = '/api';

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    const authStore = localStorage.getItem('auth-storage');
    if (authStore) {
      try {
        const parsed = JSON.parse(authStore);
        if (parsed.state?.session?.access_token) {
          config.headers = {
            ...config.headers,
            Authorization: `Bearer ${parsed.state.session.access_token}`,
          };
        }
      } catch (error) {
        console.warn('Failed to parse auth storage:', error);
      }
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
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

  async patch<T>(endpoint: string, data?: Record<string, unknown>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // File upload with FormData
  async upload<T>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      method: 'POST',
      body: formData,
      // Don't set Content-Type header for FormData - browser will set it with boundary
    };

    // Add auth token if available
    const authStore = localStorage.getItem('auth-storage');
    if (authStore) {
      try {
        const parsed = JSON.parse(authStore);
        if (parsed.state?.session?.access_token) {
          config.headers = {
            Authorization: `Bearer ${parsed.state.session.access_token}`,
          };
        }
      } catch (error) {
        console.warn('Failed to parse auth storage:', error);
      }
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API upload failed: ${endpoint}`, error);
      throw error;
    }
  }
}

// Create and export a singleton instance
export const apiClient = new ApiClient();

// Export the class for custom instances if needed
export { ApiClient };
