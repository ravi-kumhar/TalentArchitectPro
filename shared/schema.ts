import { 
  pgTable, 
  text, 
  varchar, 
  timestamp, 
  jsonb, 
  index,
  serial,
  integer,
  boolean,
  decimal,
  date
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role", { enum: ["admin", "hr_manager", "recruiter", "manager", "employee"] }).default("employee"),
  department: varchar("department"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Job postings
export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  requirements: text("requirements"),
  responsibilities: text("responsibilities"),
  department: varchar("department"),
  location: varchar("location"),
  employmentType: varchar("employment_type", { 
    enum: ["full_time", "part_time", "contract", "internship"] 
  }).default("full_time"),
  workLocation: varchar("work_location", { 
    enum: ["remote", "on_site", "hybrid"] 
  }).default("on_site"),
  experienceLevel: varchar("experience_level", { 
    enum: ["entry", "mid", "senior", "lead"] 
  }).default("mid"),
  salaryMin: decimal("salary_min", { precision: 10, scale: 2 }),
  salaryMax: decimal("salary_max", { precision: 10, scale: 2 }),
  status: varchar("status", { 
    enum: ["draft", "active", "paused", "closed"] 
  }).default("draft"),
  applicationDeadline: date("application_deadline"),
  postedBy: integer("posted_by").references(() => users.id),
  aiScore: integer("ai_score").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Candidates
export const candidates = pgTable("candidates", {
  id: serial("id").primaryKey(),
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  email: varchar("email").unique().notNull(),
  phone: varchar("phone"),
  location: varchar("location"),
  experience: integer("experience_years"),
  currentPosition: varchar("current_position"),
  currentCompany: varchar("current_company"),
  skills: jsonb("skills"),
  education: jsonb("education"),
  resumeUrl: varchar("resume_url"),
  linkedinUrl: varchar("linkedin_url"),
  githubUrl: varchar("github_url"),
  portfolioUrl: varchar("portfolio_url"),
  status: varchar("status", { 
    enum: ["new", "reviewing", "shortlisted", "interviewing", "offered", "hired", "rejected"] 
  }).default("new"),
  source: varchar("source", { 
    enum: ["direct", "linkedin", "referral", "job_board", "career_page"] 
  }).default("direct"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Job applications
export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").references(() => jobs.id).notNull(),
  candidateId: integer("candidate_id").references(() => candidates.id).notNull(),
  status: varchar("status", { 
    enum: ["applied", "screening", "interviewing", "offered", "hired", "rejected"] 
  }).default("applied"),
  aiMatchScore: integer("ai_match_score").default(0),
  coverLetter: text("cover_letter"),
  appliedAt: timestamp("applied_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Interviews
export const interviews = pgTable("interviews", {
  id: serial("id").primaryKey(),
  applicationId: integer("application_id").references(() => applications.id).notNull(),
  interviewerId: integer("interviewer_id").references(() => users.id).notNull(),
  scheduledAt: timestamp("scheduled_at").notNull(),
  duration: integer("duration_minutes").default(60),
  type: varchar("type", { 
    enum: ["phone", "video", "on_site", "technical", "behavioral"] 
  }).default("video"),
  location: varchar("location"),
  meetingLink: varchar("meeting_link"),
  status: varchar("status", { 
    enum: ["scheduled", "in_progress", "completed", "cancelled", "rescheduled"] 
  }).default("scheduled"),
  feedback: text("feedback"),
  rating: integer("rating"), // 1-5 scale
  recommendation: varchar("recommendation", { 
    enum: ["strong_hire", "hire", "no_hire", "strong_no_hire"] 
  }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Onboarding tasks
export const onboardingTasks = pgTable("onboarding_tasks", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").references(() => users.id).notNull(),
  title: varchar("title").notNull(),
  description: text("description"),
  category: varchar("category", { 
    enum: ["hr", "it", "admin", "training", "documentation"] 
  }).default("hr"),
  assignedTo: integer("assigned_to").references(() => users.id),
  dueDate: date("due_date"),
  status: varchar("status", { 
    enum: ["pending", "in_progress", "completed", "overdue"] 
  }).default("pending"),
  priority: varchar("priority", { 
    enum: ["low", "medium", "high", "urgent"] 
  }).default("medium"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Performance reviews
export const performanceReviews = pgTable("performance_reviews", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").references(() => users.id).notNull(),
  reviewerId: integer("reviewer_id").references(() => users.id).notNull(),
  period: varchar("period"), // e.g., "Q1 2024", "2024 Annual"
  type: varchar("type", { 
    enum: ["quarterly", "annual", "30_day", "60_day", "90_day"] 
  }).default("quarterly"),
  goals: jsonb("goals"),
  achievements: text("achievements"),
  feedback: text("feedback"),
  rating: integer("rating"), // 1-5 scale
  status: varchar("status", { 
    enum: ["draft", "submitted", "reviewed", "completed"] 
  }).default("draft"),
  dueDate: date("due_date"),
  submittedAt: timestamp("submitted_at"),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Activity logs
export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  action: varchar("action").notNull(),
  entityType: varchar("entity_type"), // job, candidate, application, etc.
  entityId: varchar("entity_id"),
  description: text("description").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const jobTemplates = pgTable("job_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  title: text("title").notNull(),
  department: text("department").notNull(),
  description: text("description"),
  requirements: text("requirements"),
  location: text("location"),
  employmentType: text("employment_type").notNull().default("full_time"),
  experienceLevel: text("experience_level").notNull().default("mid"),
  salaryMin: integer("salary_min"),
  salaryMax: integer("salary_max"),
  skills: text("skills").array(),
  benefits: text("benefits").array(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  jobsPosted: many(jobs),
  interviews: many(interviews),
  onboardingTasks: many(onboardingTasks),
  performanceReviews: many(performanceReviews),
  activityLogs: many(activityLogs),
}));

export const jobsRelations = relations(jobs, ({ one, many }) => ({
  postedBy: one(users, {
    fields: [jobs.postedBy],
    references: [users.id],
  }),
  applications: many(applications),
}));

export const candidatesRelations = relations(candidates, ({ many }) => ({
  applications: many(applications),
}));

export const applicationsRelations = relations(applications, ({ one, many }) => ({
  job: one(jobs, {
    fields: [applications.jobId],
    references: [jobs.id],
  }),
  candidate: one(candidates, {
    fields: [applications.candidateId],
    references: [candidates.id],
  }),
  interviews: many(interviews),
}));

export const interviewsRelations = relations(interviews, ({ one }) => ({
  application: one(applications, {
    fields: [interviews.applicationId],
    references: [applications.id],
  }),
  interviewer: one(users, {
    fields: [interviews.interviewerId],
    references: [users.id],
  }),
}));

export const onboardingTasksRelations = relations(onboardingTasks, ({ one }) => ({
  employee: one(users, {
    fields: [onboardingTasks.employeeId],
    references: [users.id],
  }),
  assignedTo: one(users, {
    fields: [onboardingTasks.assignedTo],
    references: [users.id],
  }),
}));

export const performanceReviewsRelations = relations(performanceReviews, ({ one }) => ({
  employee: one(users, {
    fields: [performanceReviews.employeeId],
    references: [users.id],
  }),
  reviewer: one(users, {
    fields: [performanceReviews.reviewerId],
    references: [users.id],
  }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
}));

export const jobTemplatesRelations = relations(jobTemplates, ({ many }) => ({
  jobs: many(jobs),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertJobSchema = createInsertSchema(jobs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCandidateSchema = createInsertSchema(candidates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertApplicationSchema = createInsertSchema(applications).omit({
  id: true,
  appliedAt: true,
  updatedAt: true,
});

export const insertInterviewSchema = createInsertSchema(interviews).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOnboardingTaskSchema = createInsertSchema(onboardingTasks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPerformanceReviewSchema = createInsertSchema(performanceReviews).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertActivityLogSchema = createInsertSchema(activityLogs).omit({
  id: true,
  timestamp: true,
});

export const insertJobTemplateSchema = createInsertSchema(jobTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type UpsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Job = typeof jobs.$inferSelect;
export type InsertJob = z.infer<typeof insertJobSchema>;
export type Candidate = typeof candidates.$inferSelect;
export type InsertCandidate = z.infer<typeof insertCandidateSchema>;
export type Application = typeof applications.$inferSelect;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type Interview = typeof interviews.$inferSelect;
export type InsertInterview = z.infer<typeof insertInterviewSchema>;
export type OnboardingTask = typeof onboardingTasks.$inferSelect;
export type InsertOnboardingTask = z.infer<typeof insertOnboardingTaskSchema>;
export type PerformanceReview = typeof performanceReviews.$inferSelect;
export type InsertPerformanceReview = z.infer<typeof insertPerformanceReviewSchema>;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
export type JobTemplate = typeof jobTemplates.$inferSelect;
export type InsertJobTemplate = z.infer<typeof insertJobTemplateSchema>;
