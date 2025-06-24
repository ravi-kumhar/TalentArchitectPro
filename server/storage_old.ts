import {
  users,
  jobs,
  candidates,
  applications,
  interviews,
  onboardingTasks,
  performanceReviews,
  activityLogs,
  type UpsertUser,
  type User,
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
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, like, sql, count } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
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
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
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
    return user;
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
    
    query = query.orderBy(desc(jobs.createdAt));
    
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    
    return await query;
  }

  async getJob(id: number): Promise<Job | undefined> {
    const [job] = await db.select().from(jobs).where(eq(jobs.id, id)).execute();
    return job;
  }

  async createJob(job: InsertJob): Promise<Job> {
    const [newJob] = await db.insert(jobs).values(job).returning().execute();
    return newJob;
  }

  async updateJob(id: number, job: Partial<InsertJob>): Promise<Job> {
    const [updatedJob] = await db
      .update(jobs)
      .set({ ...job, updatedAt: new Date() })
      .where(eq(jobs.id, id))
      .returning();
    return updatedJob;
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
    if (filters?.experience) {
      query = query.where(eq(candidates.experience, filters.experience));
    }
    
    query = query.orderBy(desc(candidates.createdAt));
    
    return await query;
  }

  async getCandidate(id: number): Promise<Candidate | undefined> {
    const [candidate] = await db.select().from(candidates).where(eq(candidates.id, id));
    return candidate;
  }

  async createCandidate(candidate: InsertCandidate): Promise<Candidate> {
    const [newCandidate] = await db.insert(candidates).values(candidate).returning();
    return newCandidate;
  }

  async updateCandidate(id: number, candidate: Partial<InsertCandidate>): Promise<Candidate> {
    const [updatedCandidate] = await db
      .update(candidates)
      .set({ ...candidate, updatedAt: new Date() })
      .where(eq(candidates.id, id))
      .returning();
    return updatedCandidate;
  }

  async deleteCandidate(id: number): Promise<void> {
    await db.delete(candidates).where(eq(candidates.id, id));
  }

  // Application operations
  async getApplications(filters?: { jobId?: number; candidateId?: number; status?: string }): Promise<Application[]> {
    let query = db.select().from(applications);
    
    const conditions = [];
    if (filters?.jobId) {
      conditions.push(eq(applications.jobId, filters.jobId));
    }
    if (filters?.candidateId) {
      conditions.push(eq(applications.candidateId, filters.candidateId));
    }
    if (filters?.status) {
      conditions.push(eq(applications.status, filters.status as any));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    query = query.orderBy(desc(applications.appliedAt));
    
    return await query;
  }

  async getApplication(id: number): Promise<Application | undefined> {
    const [application] = await db.select().from(applications).where(eq(applications.id, id));
    return application;
  }

  async createApplication(application: InsertApplication): Promise<Application> {
    const [newApplication] = await db.insert(applications).values(application).returning();
    return newApplication;
  }

  async updateApplication(id: number, application: Partial<InsertApplication>): Promise<Application> {
    const [updatedApplication] = await db
      .update(applications)
      .set({ ...application, updatedAt: new Date() })
      .where(eq(applications.id, id))
      .returning();
    return updatedApplication;
  }

  // Interview operations
  async getInterviews(filters?: { date?: Date; interviewerId?: string; status?: string }): Promise<Interview[]> {
    let query = db.select().from(interviews);
    
    const conditions = [];
    if (filters?.date) {
      const startOfDay = new Date(filters.date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(filters.date);
      endOfDay.setHours(23, 59, 59, 999);
      conditions.push(and(
        sql`${interviews.scheduledAt} >= ${startOfDay}`,
        sql`${interviews.scheduledAt} <= ${endOfDay}`
      ));
    }
    if (filters?.interviewerId) {
      conditions.push(eq(interviews.interviewerId, filters.interviewerId));
    }
    if (filters?.status) {
      conditions.push(eq(interviews.status, filters.status as any));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    query = query.orderBy(interviews.scheduledAt);
    
    return await query;
  }

  async getInterview(id: number): Promise<Interview | undefined> {
    const [interview] = await db.select().from(interviews).where(eq(interviews.id, id));
    return interview;
  }

  async createInterview(interview: InsertInterview): Promise<Interview> {
    const [newInterview] = await db.insert(interviews).values(interview).returning();
    return newInterview;
  }

  async updateInterview(id: number, interview: Partial<InsertInterview>): Promise<Interview> {
    const [updatedInterview] = await db
      .update(interviews)
      .set({ ...interview, updatedAt: new Date() })
      .where(eq(interviews.id, id))
      .returning();
    return updatedInterview;
  }

  // Onboarding operations
  async getOnboardingTasks(employeeId?: string): Promise<OnboardingTask[]> {
    let query = db.select().from(onboardingTasks);
    
    if (employeeId) {
      query = query.where(eq(onboardingTasks.employeeId, employeeId));
    }
    
    query = query.orderBy(onboardingTasks.dueDate);
    
    return await query;
  }

  async createOnboardingTask(task: InsertOnboardingTask): Promise<OnboardingTask> {
    const [newTask] = await db.insert(onboardingTasks).values(task).returning();
    return newTask;
  }

  async updateOnboardingTask(id: number, task: Partial<InsertOnboardingTask>): Promise<OnboardingTask> {
    const [updatedTask] = await db
      .update(onboardingTasks)
      .set({ ...task, updatedAt: new Date() })
      .where(eq(onboardingTasks.id, id))
      .returning();
    return updatedTask;
  }

  // Performance operations
  async getPerformanceReviews(employeeId?: string): Promise<PerformanceReview[]> {
    let query = db.select().from(performanceReviews);
    
    if (employeeId) {
      query = query.where(eq(performanceReviews.employeeId, employeeId));
    }
    
    query = query.orderBy(desc(performanceReviews.createdAt));
    
    return await query;
  }

  async createPerformanceReview(review: InsertPerformanceReview): Promise<PerformanceReview> {
    const [newReview] = await db.insert(performanceReviews).values(review).returning();
    return newReview;
  }

  async updatePerformanceReview(id: number, review: Partial<InsertPerformanceReview>): Promise<PerformanceReview> {
    const [updatedReview] = await db
      .update(performanceReviews)
      .set({ ...review, updatedAt: new Date() })
      .where(eq(performanceReviews.id, id))
      .returning();
    return updatedReview;
  }

  // Activity operations
  async getActivityLogs(userId?: string, limit = 50): Promise<ActivityLog[]> {
    let query = db.select().from(activityLogs);
    
    if (userId) {
      query = query.where(eq(activityLogs.userId, userId));
    }
    
    query = query.orderBy(desc(activityLogs.createdAt)).limit(limit);
    
    return await query;
  }

  async createActivityLog(log: InsertActivityLog): Promise<ActivityLog> {
    const [newLog] = await db.insert(activityLogs).values(log).returning();
    return newLog;
  }

  // Dashboard operations
  async getDashboardStats(): Promise<{
    openPositions: number;
    activeCandidates: number;
    interviewsToday: number;
    newHires: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const [openPositionsResult] = await db
      .select({ count: count() })
      .from(jobs)
      .where(eq(jobs.status, "active"));

    const [activeCandidatesResult] = await db
      .select({ count: count() })
      .from(candidates)
      .where(or(
        eq(candidates.status, "reviewing"),
        eq(candidates.status, "shortlisted"),
        eq(candidates.status, "interviewing")
      ));

    const [interviewsTodayResult] = await db
      .select({ count: count() })
      .from(interviews)
      .where(and(
        sql`${interviews.scheduledAt} >= ${today}`,
        sql`${interviews.scheduledAt} < ${tomorrow}`,
        eq(interviews.status, "scheduled")
      ));

    const [newHiresResult] = await db
      .select({ count: count() })
      .from(candidates)
      .where(and(
        eq(candidates.status, "hired"),
        sql`${candidates.updatedAt} >= ${thisMonth}`
      ));

    return {
      openPositions: openPositionsResult.count,
      activeCandidates: activeCandidatesResult.count,
      interviewsToday: interviewsTodayResult.count,
      newHires: newHiresResult.count,
    };
  }
}

export const storage = new DatabaseStorage();
