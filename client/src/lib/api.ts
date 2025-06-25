import { queryClient } from "@/lib/queryClient";

export const jobsAPI = {
  getAll: () => fetch('/api/jobs').then(res => res.json()),
  get: (id: number) => fetch(`/api/jobs/${id}`).then(res => res.json()),
  create: (data: any) => fetch('/api/jobs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(res => res.json()),
  update: (id: number, data: any) => fetch(`/api/jobs/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(res => res.json()),
  delete: (id: number) => fetch(`/api/jobs/${id}`, {
    method: 'DELETE'
  })
};

export const candidatesAPI = {
  getAll: () => fetch('/api/candidates').then(res => res.json()),
  get: (id: number) => fetch(`/api/candidates/${id}`).then(res => res.json()),
  create: (data: any) => fetch('/api/candidates', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(res => res.json()),
  update: (id: number, data: any) => fetch(`/api/candidates/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(res => res.json()),
  delete: (id: number) => fetch(`/api/candidates/${id}`, {
    method: 'DELETE'
  })
};

export const jobTemplatesAPI = {
  getAll: () => fetch('/api/job-templates').then(res => res.json()),
  get: (id: number) => fetch(`/api/job-templates/${id}`).then(res => res.json()),
  create: (data: any) => fetch('/api/job-templates', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(res => res.json()),
  update: (id: number, data: any) => fetch(`/api/job-templates/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(res => res.json()),
  delete: (id: number) => fetch(`/api/job-templates/${id}`, {
    method: 'DELETE'
  })
};

export const pipelineAPI = {
  export: (format = 'csv') => fetch(`/api/pipeline/export?format=${format}`).then(res => {
    if (format === 'csv') {
      return res.blob();
    }
    return res.json();
  })
};

export const invalidateQueries = {
  jobs: () => queryClient.invalidateQueries({ queryKey: ['/api/jobs'] }),
  candidates: () => queryClient.invalidateQueries({ queryKey: ['/api/candidates'] }),
  jobTemplates: () => queryClient.invalidateQueries({ queryKey: ['/api/job-templates'] }),
  all: () => queryClient.invalidateQueries()
};