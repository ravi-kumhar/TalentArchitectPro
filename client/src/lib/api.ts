import { queryClient } from "./queryClient";

export class APIError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'APIError';
  }
}

export async function apiRequest<T = any>(
  method: string,
  url: string,
  data?: unknown,
  options?: RequestInit
): Promise<T> {
  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    credentials: 'include',
    ...options,
  };

  if (data && method !== 'GET') {
    config.body = JSON.stringify(data);
  }

  const response = await fetch(url, config);

  if (!response.ok) {
    const errorText = await response.text();
    throw new APIError(response.status, errorText || response.statusText);
  }

  return response.json();
}

export async function uploadFile(url: string, file: File, additionalData?: Record<string, any>) {
  const formData = new FormData();
  formData.append('resume', file);
  
  if (additionalData) {
    Object.entries(additionalData).forEach(([key, value]) => {
      formData.append(key, String(value));
    });
  }

  const response = await fetch(url, {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new APIError(response.status, errorText || response.statusText);
  }

  return response.json();
}

// Job API functions
export const jobsAPI = {
  getAll: (filters?: Record<string, any>) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    const url = `/api/jobs${params.toString() ? `?${params.toString()}` : ''}`;
    return apiRequest('GET', url);
  },
  
  getById: (id: number) => apiRequest('GET', `/api/jobs/${id}`),
  
  create: (data: any) => apiRequest('POST', '/api/jobs', data),
  
  update: (id: number, data: any) => apiRequest('PUT', `/api/jobs/${id}`, data),
  
  delete: (id: number) => apiRequest('DELETE', `/api/jobs/${id}`),
};

// Candidates API functions
export const candidatesAPI = {
  getAll: (filters?: Record<string, any>) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    const url = `/api/candidates${params.toString() ? `?${params.toString()}` : ''}`;
    return apiRequest('GET', url);
  },
  
  getById: (id: number) => apiRequest('GET', `/api/candidates/${id}`),
  
  create: (data: any) => apiRequest('POST', '/api/candidates', data),
  
  update: (id: number, data: any) => apiRequest('PUT', `/api/candidates/${id}`, data),
  
  delete: (id: number) => apiRequest('DELETE', `/api/candidates/${id}`),
  
  parseResume: (file: File) => uploadFile('/api/candidates/parse-resume', file),
};

// AI API functions
export const aiAPI = {
  generateJobDescription: (data: {
    title: string;
    department?: string;
    experienceLevel?: string;
    employmentType?: string;
    workLocation?: string;
  }) => apiRequest('POST', '/api/ai/generate-job-description', data),
  
  matchResume: (candidateId: number, jobId: number) => 
    apiRequest('POST', '/api/ai/match-resume', { candidateId, jobId }),
  
  chat: (message: string, context?: any) => 
    apiRequest('POST', '/api/ai/chat', { message, context }),
};

// Dashboard API functions
export const dashboardAPI = {
  getStats: () => apiRequest('GET', '/api/dashboard/stats'),
  
  getRecentActivity: (limit = 10) => 
    apiRequest('GET', `/api/dashboard/recent-activity?limit=${limit}`),
};

// Interviews API functions
export const interviewsAPI = {
  getAll: (filters?: Record<string, any>) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    const url = `/api/interviews${params.toString() ? `?${params.toString()}` : ''}`;
    return apiRequest('GET', url);
  },
  
  getToday: () => apiRequest('GET', '/api/interviews/today'),
  
  create: (data: any) => apiRequest('POST', '/api/interviews', data),
  
  update: (id: number, data: any) => apiRequest('PUT', `/api/interviews/${id}`, data),
};

// Cache invalidation helpers
export const invalidateQueries = {
  jobs: () => queryClient.invalidateQueries({ queryKey: ['/api/jobs'] }),
  candidates: () => queryClient.invalidateQueries({ queryKey: ['/api/candidates'] }),
  interviews: () => queryClient.invalidateQueries({ queryKey: ['/api/interviews'] }),
  dashboard: () => queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] }),
  all: () => queryClient.invalidateQueries(),
};
