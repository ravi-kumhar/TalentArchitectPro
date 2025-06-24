export interface DashboardStats {
  openPositions: number;
  activeCandidates: number;
  interviewsToday: number;
  newHires: number;
}

export interface JobFormData {
  title: string;
  department: string;
  location: string;
  employmentType: 'full_time' | 'part_time' | 'contract' | 'internship';
  workLocation: 'remote' | 'on_site' | 'hybrid';
  experienceLevel: 'entry' | 'mid' | 'senior' | 'lead';
  description?: string;
  requirements?: string;
  responsibilities?: string;
  salaryMin?: number;
  salaryMax?: number;
  applicationDeadline?: string;
}

export interface CandidateFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  location?: string;
  experience?: number;
  currentPosition?: string;
  currentCompany?: string;
  skills?: string[];
  education?: any[];
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  notes?: string;
}

export interface ResumeParseResult {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  experience: number;
  currentPosition: string;
  currentCompany: string;
  skills: string[];
  education: any[];
}

export interface AIResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface FilterOptions {
  status?: string;
  department?: string;
  location?: string;
  experienceLevel?: string;
  workLocation?: string;
  limit?: number;
  offset?: number;
}
