import {
  users,
  jobs,
  candidates,
  applications,
  interviews,
  onboardingTasks,
  performanceReviews,
  activityLogs,
  jobTemplates,
  type User,
  type UpsertUser,
  type Job,
  type InsertJob,
  type Candidate,
  type InsertCandidate,
  type Application,
  type InsertApplication,
  type Interview,
  type InsertInterview,
  type OnboardingTask,
  type InsertOnboardingTask,
  type PerformanceReview,
  type InsertPerformanceReview,
  type ActivityLog,
  type InsertActivityLog,
  type JobTemplate,
  type InsertJobTemplate,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, desc, asc } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getUsers(): Promise<User[]>;
  updateUser(id: number, userData: Partial<{ firstName: string; lastName: string; email: string; role: string; department: string; isActive: boolean; }>): Promise<User>;
  
  // Job operations  
  getJobs(filters?: { status?: string; department?: string; limit?: number }): Promise<Job[]>;
  getJob(id: number): Promise<Job | undefined>;
  createJob(job: InsertJob): Promise<Job>;
  updateJob(id: number, job: Partial<InsertJob>): Promise<Job>;
  deleteJob(id: number): Promise<void>;
  
  // Candidate operations
  getCandidates(filters?: { status?: string; experience?: number; skills?: string[] }): Promise<Candidate[]>;
  getCandidate(id: number): Promise<Candidate | undefined>;
  createCandidate(candidate: InsertCandidate): Promise<Candidate>;
  updateCandidate(id: number, candidate: Partial<InsertCandidate>): Promise<Candidate>;
  deleteCandidate(id: number): Promise<void>;
  
  // Application operations
  getApplications(filters?: { jobId?: number; candidateId?: number; status?: string }): Promise<Application[]>;
  getApplication(id: number): Promise<Application | undefined>;
  createApplication(application: InsertApplication): Promise<Application>;
  updateApplication(id: number, application: Partial<InsertApplication>): Promise<Application>;
  
  // Interview operations
  getInterviews(filters?: { date?: Date; interviewerId?: string; status?: string }): Promise<Interview[]>;
  getInterview(id: number): Promise<Interview | undefined>;
  createInterview(interview: InsertInterview): Promise<Interview>;
  updateInterview(id: number, interview: Partial<InsertInterview>): Promise<Interview>;
  
  // Onboarding operations
  getOnboardingTasks(employeeId?: string): Promise<OnboardingTask[]>;
  createOnboardingTask(task: InsertOnboardingTask): Promise<OnboardingTask>;
  updateOnboardingTask(id: number, task: Partial<InsertOnboardingTask>): Promise<OnboardingTask>;
  
  // Performance operations
  getPerformanceReviews(employeeId?: string): Promise<PerformanceReview[]>;
  createPerformanceReview(review: InsertPerformanceReview): Promise<PerformanceReview>;
  updatePerformanceReview(id: number, review: Partial<InsertPerformanceReview>): Promise<PerformanceReview>;
  
  // Activity operations
  getActivityLogs(userId?: string, limit?: number): Promise<ActivityLog[]>;
  createActivityLog(log: InsertActivityLog): Promise<ActivityLog>;
  
  // Dashboard operations
  getDashboardStats(): Promise<{
    openPositions: number;
    activeCandidates: number;
    interviewsToday: number;
    newHires: number;
  }>;

  // Job Template operations
  getJobTemplates(): Promise<JobTemplate[]>;
  getJobTemplate(id: number): Promise<JobTemplate | undefined>;
  createJobTemplate(template: InsertJobTemplate): Promise<JobTemplate>;
  updateJobTemplate(id: number, template: Partial<InsertJobTemplate>): Promise<JobTemplate>;
  deleteJobTemplate(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) return undefined;
    const result = await db.select().from(users).where(eq(users.id, numericId));
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0];
  }

  async createUser(userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role?: string;
    department?: string;
  }): Promise<User> {
    const result = await db.insert(users).values({
      email: userData.email,
      password: userData.password,
      firstName: userData.firstName,
      lastName: userData.lastName,

      role: (userData.role as "admin" | "hr_manager" | "recruiter" | "manager" | "employee") || "employee",
      department: userData.department || "General",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();
    return result[0];
  }

  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async updateUser(id: number, userData: Partial<{
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    department: string;
    isActive: boolean;
  }>): Promise<User> {
    const result = await db.update(users)
      .set({ 
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        role: userData.role as "admin" | "hr_manager" | "recruiter" | "manager" | "employee" | null,
        department: userData.department,
        isActive: userData.isActive,
        updatedAt: new Date() 
      })
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const result = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return result[0];
  }

  // Job operations
  async getJobs(filters?: { status?: string; department?: string; limit?: number }): Promise<Job[]> {
    let query = db.select().from(jobs);
    
    if (filters?.status) {
      query = query.where(eq(jobs.status, filters.status as any));
    }
    if (filters?.department) {
      query = query.where(eq(jobs.department, filters.department));
    }
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    
    return await query;
  }

  async getJob(id: number): Promise<Job | undefined> {
    const result = await db.select().from(jobs).where(eq(jobs.id, id));
    return result[0];
  }

  async createJob(job: InsertJob): Promise<Job> {
    const result = await db.insert(jobs).values(job).returning();
    return result[0];
  }

  async updateJob(id: number, job: Partial<InsertJob>): Promise<Job> {
    const result = await db.update(jobs).set(job).where(eq(jobs.id, id)).returning();
    return result[0];
  }

  async deleteJob(id: number): Promise<void> {
    await db.delete(jobs).where(eq(jobs.id, id));
  }

  // Candidate operations
  async getCandidates(filters?: { status?: string; experience?: number; skills?: string[] }): Promise<Candidate[]> {
    let query = db.select().from(candidates);
    
    if (filters?.status) {
      query = query.where(eq(candidates.status, filters.status as any));
    }
    
    return await query;
  }

  async getCandidate(id: number): Promise<Candidate | undefined> {
    const result = await db.select().from(candidates).where(eq(candidates.id, id));
    return result[0];
  }

  async createCandidate(candidate: InsertCandidate): Promise<Candidate> {
    const result = await db.insert(candidates).values(candidate).returning();
    return result[0];
  }

  async updateCandidate(id: number, candidate: Partial<InsertCandidate>): Promise<Candidate> {
    const result = await db.update(candidates).set(candidate).where(eq(candidates.id, id)).returning();
    return result[0];
  }

  async deleteCandidate(id: number): Promise<void> {
    await db.delete(candidates).where(eq(candidates.id, id));
  }

  // Application operations
  async getApplications(filters?: { jobId?: number; candidateId?: number; status?: string }): Promise<Application[]> {
    let query = db.select().from(applications);
    
    if (filters?.jobId) {
      query = query.where(eq(applications.jobId, filters.jobId));
    }
    if (filters?.candidateId) {
      query = query.where(eq(applications.candidateId, filters.candidateId));
    }
    if (filters?.status) {
      // Handle multiple statuses separated by comma
      const statuses = filters.status.split(',');
      if (statuses.length === 1) {
        query = query.where(eq(applications.status, filters.status as any));
      } else {
        // For multiple statuses, use the first one for now
        query = query.where(eq(applications.status, statuses[0] as any));
      }
    }
    
    return await query;
  }

  async getApplication(id: number): Promise<Application | undefined> {
    const result = await db.select().from(applications).where(eq(applications.id, id));
    return result[0];
  }

  async createApplication(application: InsertApplication): Promise<Application> {
    const result = await db.insert(applications).values(application).returning();
    return result[0];
  }

  async updateApplication(id: number, application: Partial<InsertApplication>): Promise<Application> {
    const result = await db.update(applications).set(application).where(eq(applications.id, id)).returning();
    return result[0];
  }

  // Interview operations
  async getInterviews(filters?: { date?: Date; interviewerId?: string; status?: string }): Promise<Interview[]> {
    let query = db.select().from(interviews);
    
    if (filters?.interviewerId) {
      query = query.where(eq(interviews.interviewerId, filters.interviewerId));
    }
    if (filters?.status) {
      query = query.where(eq(interviews.status, filters.status as any));
    }
    
    return await query;
  }

  async getInterview(id: number): Promise<Interview | undefined> {
    const result = await db.select().from(interviews).where(eq(interviews.id, id));
    return result[0];
  }

  async createInterview(interview: InsertInterview): Promise<Interview> {
    const result = await db.insert(interviews).values(interview).returning();
    return result[0];
  }

  async updateInterview(id: number, interview: Partial<InsertInterview>): Promise<Interview> {
    const result = await db.update(interviews).set(interview).where(eq(interviews.id, id)).returning();
    return result[0];
  }

  // Onboarding operations
  async getOnboardingTasks(employeeId?: string): Promise<OnboardingTask[]> {
    let query = db.select().from(onboardingTasks);
    
    if (employeeId) {
      query = query.where(eq(onboardingTasks.employeeId, employeeId));
    }
    
    return await query;
  }

  async createOnboardingTask(task: InsertOnboardingTask): Promise<OnboardingTask> {
    const result = await db.insert(onboardingTasks).values(task).returning();
    return result[0];
  }

  async updateOnboardingTask(id: number, task: Partial<InsertOnboardingTask>): Promise<OnboardingTask> {
    const result = await db.update(onboardingTasks).set(task).where(eq(onboardingTasks.id, id)).returning();
    return result[0];
  }

  // Performance operations
  async getPerformanceReviews(employeeId?: string): Promise<PerformanceReview[]> {
    let query = db.select().from(performanceReviews);
    
    if (employeeId) {
      query = query.where(eq(performanceReviews.employeeId, employeeId));
    }
    
    return await query;
  }

  async createPerformanceReview(review: InsertPerformanceReview): Promise<PerformanceReview> {
    const result = await db.insert(performanceReviews).values(review).returning();
    return result[0];
  }

  async updatePerformanceReview(id: number, review: Partial<InsertPerformanceReview>): Promise<PerformanceReview> {
    const result = await db.update(performanceReviews).set(review).where(eq(performanceReviews.id, id)).returning();
    return result[0];
  }

  // Activity operations
  async getActivityLogs(userId?: string, limit = 50): Promise<ActivityLog[]> {
    if (userId) {
      const numericUserId = parseInt(userId, 10);
      if (isNaN(numericUserId)) return [];
      return await db.select().from(activityLogs).where(eq(activityLogs.userId, numericUserId)).limit(limit);
    }
    return await db.select().from(activityLogs).limit(limit);
  }

  async createActivityLog(log: InsertActivityLog): Promise<ActivityLog> {
    const result = await db.insert(activityLogs).values(log).returning();
    return result[0];
  }

  // Dashboard operations
  async getDashboardStats(): Promise<{
    openPositions: number;
    activeCandidates: number;
    interviewsToday: number;
    newHires: number;
  }> {
    // Get open positions count
    const openJobsResult = await db.select().from(jobs).where(eq(jobs.status, 'active' as any));
    
    // Get active candidates count
    const activeCandidatesResult = await db.select().from(candidates).where(eq(candidates.status, 'active' as any));
    
    // Get today's interviews count
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayInterviewsResult = await db.select().from(interviews).where(
      and(
        gte(interviews.scheduledAt, today),
        lte(interviews.scheduledAt, tomorrow)
      )
    );
    
    // Get new hires count (hired in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const newHiresResult = await db.select().from(candidates).where(
      and(
        eq(candidates.status, 'hired' as any),
        gte(candidates.updatedAt, thirtyDaysAgo)
      )
    );

    return {
      openPositions: openJobsResult.length,
      activeCandidates: activeCandidatesResult.length,
      interviewsToday: todayInterviewsResult.length,
      newHires: newHiresResult.length,
    };
  }

  // Job Template operations
  async getJobTemplates(): Promise<JobTemplate[]> {
    try {
      return await db.select().from(jobTemplates).where(eq(jobTemplates.isActive, true)).orderBy(desc(jobTemplates.createdAt));
    } catch (error) {
      console.error('Error getting job templates:', error);
      return [];
    }
  }

  async getJobTemplate(id: number): Promise<JobTemplate | undefined> {
    try {
      const [template] = await db.select().from(jobTemplates).where(eq(jobTemplates.id, id));
      return template;
    } catch (error) {
      console.error('Error getting job template:', error);
      return undefined;
    }
  }

  async createJobTemplate(template: InsertJobTemplate): Promise<JobTemplate> {
    try {
      const [newTemplate] = await db.insert(jobTemplates).values(template).returning();
      return newTemplate;
    } catch (error) {
      console.error('Error creating job template:', error);
      throw error;
    }
  }

  async updateJobTemplate(id: number, template: Partial<InsertJobTemplate>): Promise<JobTemplate> {
    try {
      const [updatedTemplate] = await db.update(jobTemplates)
        .set({ ...template, updatedAt: new Date() })
        .where(eq(jobTemplates.id, id))
        .returning();
      return updatedTemplate;
    } catch (error) {
      console.error('Error updating job template:', error);
      throw error;
    }
  }

  async deleteJobTemplate(id: number): Promise<void> {
    try {
      await db.update(jobTemplates)
        .set({ isActive: false, updatedAt: new Date() })
        .where(eq(jobTemplates.id, id));
    } catch (error) {
      console.error('Error deleting job template:', error);
      throw error;
    }
  }
}

export const storage = new DatabaseStorage();