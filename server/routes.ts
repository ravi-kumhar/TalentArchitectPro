import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { getSession, isAuthenticated, hashPassword, comparePassword } from "./auth";
import { 
  insertJobSchema, 
  insertCandidateSchema, 
  insertApplicationSchema,
  insertInterviewSchema,
  insertOnboardingTaskSchema,
  insertPerformanceReviewSchema,
  insertActivityLogSchema,
  insertJobTemplateSchema
} from "@shared/schema";
import { z } from "zod";
import { generateJobDescription, analyzeResumeMatch } from "./services/gemini";
import { parseResume } from "./services/resumeParserGemini";
import multer from "multer";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || 
        file.mimetype === 'application/msword' || 
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, and DOCX files are allowed.'));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Session middleware
  app.use(getSession());

  // Auth routes
  app.post('/api/auth/signup', async (req, res) => {
    try {
      const { firstName, lastName, email, password } = req.body;

      if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" });
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Create user
      const user = await storage.createUser({
        firstName,
        lastName,
        email,
        password: hashedPassword,
      });

      res.status(201).json({ message: "User created successfully", userId: user.id });
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      // Get user by email
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Verify password
      const isValidPassword = await comparePassword(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Create session
      req.session.userId = user.id;
      req.session.user = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      };

      res.json({ 
        message: "Login successful", 
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        }
      });
    } catch (error) {
      console.error("Error logging in:", error);
      res.status(500).json({ message: "Failed to login" });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.json({ message: "Logout successful" });
    });
  });

  app.get('/api/auth/user', isAuthenticated, async (req, res) => {
    try {
      res.json(req.user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Dashboard routes
  app.get('/api/dashboard/stats', isAuthenticated, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  app.get('/api/dashboard/recent-activity', isAuthenticated, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const activities = await storage.getActivityLogs(undefined, limit);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching recent activity:", error);
      res.status(500).json({ message: "Failed to fetch recent activity" });
    }
  });

  // Job routes
  app.get('/api/jobs', isAuthenticated, async (req, res) => {
    try {
      const { status, department, limit } = req.query;
      const jobs = await storage.getJobs({
        status: status as string,
        department: department as string,
        limit: limit ? parseInt(limit as string) : undefined,
      });
      res.json(jobs);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      res.status(500).json({ message: "Failed to fetch jobs" });
    }
  });

  app.get('/api/jobs/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const job = await storage.getJob(id);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      res.json(job);
    } catch (error) {
      console.error("Error fetching job:", error);
      res.status(500).json({ message: "Failed to fetch job" });
    }
  });

  app.post('/api/jobs', isAuthenticated, async (req: any, res) => {
    try {
      // Clean the job data to handle empty dates and convert data types
      const cleanedData = { ...req.body };
      
      // Handle empty dates
      if (cleanedData.applicationDeadline === "" || cleanedData.applicationDeadline === null) {
        delete cleanedData.applicationDeadline;
      }
      if (cleanedData.startDate === "" || cleanedData.startDate === null) {
        delete cleanedData.startDate;
      }
      
      const jobData = insertJobSchema.parse({
        ...cleanedData,
        postedBy: req.user.id,
        salaryMin: cleanedData.salaryMin ? cleanedData.salaryMin.toString() : null,
        salaryMax: cleanedData.salaryMax ? cleanedData.salaryMax.toString() : null,
      });
      const job = await storage.createJob(jobData);
      
      // Log activity
      await storage.createActivityLog({
        userId: req.user.id.toString(),
        action: "create_job",
        entityType: "job",
        entityId: job.id.toString(),
        description: `Created job posting: ${job.title}`,
      });
      
      res.status(201).json(job);
    } catch (error) {
      console.error("Error creating job:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid job data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create job" });
    }
  });

  app.put('/api/jobs/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const jobData = insertJobSchema.partial().parse(req.body);
      const job = await storage.updateJob(id, jobData);
      
      // Log activity
      await storage.createActivityLog({
        userId: req.user.id.toString(),
        action: "update_job",
        entityType: "job",
        entityId: job.id.toString(),
        description: `Updated job posting: ${job.title}`,
      });
      
      res.json(job);
    } catch (error) {
      console.error("Error updating job:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid job data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update job" });
    }
  });

  app.delete('/api/jobs/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const job = await storage.getJob(id);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      await storage.deleteJob(id);
      
      // Log activity
      await storage.createActivityLog({
        userId: req.user.id.toString(),
        action: "delete_job",
        entityType: "job",
        entityId: id.toString(),
        description: `Deleted job posting: ${job.title}`,
      });
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting job:", error);
      res.status(500).json({ message: "Failed to delete job" });
    }
  });

  // AI Job Description Generation
  app.post('/api/ai/generate-job-description', isAuthenticated, async (req, res) => {
    try {
      const { title, department, experienceLevel, employmentType, workLocation } = req.body;
      
      if (!title) {
        return res.status(400).json({ message: "Job title is required" });
      }
      
      const jobDescription = await generateJobDescription({
        title,
        department,
        experienceLevel,
        employmentType,
        workLocation,
      });
      
      res.json({ description: jobDescription });
    } catch (error) {
      console.error("Error generating job description:", error);
      res.status(500).json({ message: "Failed to generate job description" });
    }
  });

  // Candidate routes
  app.get('/api/candidates', isAuthenticated, async (req, res) => {
    try {
      const { status, experience, skills } = req.query;
      const candidates = await storage.getCandidates({
        status: status as string,
        experience: experience ? parseInt(experience as string) : undefined,
        skills: skills ? (skills as string).split(',') : undefined,
      });
      res.json(candidates);
    } catch (error) {
      console.error("Error fetching candidates:", error);
      res.status(500).json({ message: "Failed to fetch candidates" });
    }
  });

  app.get('/api/candidates/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const candidate = await storage.getCandidate(id);
      if (!candidate) {
        return res.status(404).json({ message: "Candidate not found" });
      }
      res.json(candidate);
    } catch (error) {
      console.error("Error fetching candidate:", error);
      res.status(500).json({ message: "Failed to fetch candidate" });
    }
  });

  app.post('/api/candidates', isAuthenticated, async (req: any, res) => {
    try {
      const candidateData = insertCandidateSchema.parse(req.body);
      const candidate = await storage.createCandidate(candidateData);
      
      // Log activity
      await storage.createActivityLog({
        userId: req.user.id.toString(),
        action: "create_candidate",
        entityType: "candidate",
        entityId: candidate.id.toString(),
        description: `Added new candidate: ${candidate.firstName} ${candidate.lastName}`,
      });
      
      res.status(201).json(candidate);
    } catch (error) {
      console.error("Error creating candidate:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid candidate data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create candidate" });
    }
  });

  // Resume upload and parsing
  app.post('/api/candidates/parse-resume', isAuthenticated, upload.single('resume'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No resume file provided" });
      }
      
      const parsedData = await parseResume(req.file.buffer, req.file.mimetype);
      res.json(parsedData);
    } catch (error) {
      console.error("Error parsing resume:", error);
      res.status(500).json({ message: "Failed to parse resume" });
    }
  });

  // AI Resume matching
  app.post('/api/ai/match-resume', isAuthenticated, async (req, res) => {
    try {
      const { candidateId, jobId } = req.body;
      
      if (!candidateId || !jobId) {
        return res.status(400).json({ message: "Candidate ID and Job ID are required" });
      }
      
      const candidate = await storage.getCandidate(candidateId);
      const job = await storage.getJob(jobId);
      
      if (!candidate || !job) {
        return res.status(404).json({ message: "Candidate or job not found" });
      }
      
      const matchResult = await analyzeResumeMatch(candidate, job);
      res.json(matchResult);
    } catch (error) {
      console.error("Error analyzing resume match:", error);
      res.status(500).json({ message: "Failed to analyze resume match" });
    }
  });

  // Application routes
  app.get('/api/applications', isAuthenticated, async (req, res) => {
    try {
      const { jobId, candidateId, status } = req.query;
      const applications = await storage.getApplications({
        jobId: jobId ? parseInt(jobId as string) : undefined,
        candidateId: candidateId ? parseInt(candidateId as string) : undefined,
        status: status as string,
      });
      res.json(applications);
    } catch (error) {
      console.error("Error fetching applications:", error);
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  app.post('/api/applications', isAuthenticated, async (req: any, res) => {
    try {
      const applicationData = insertApplicationSchema.parse(req.body);
      const application = await storage.createApplication(applicationData);
      
      // Log activity
      await storage.createActivityLog({
        userId: req.user.id.toString(),
        action: "create_application",
        entityType: "application",
        entityId: application.id.toString(),
        description: `New application received`,
      });
      
      res.status(201).json(application);
    } catch (error) {
      console.error("Error creating application:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid application data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create application" });
    }
  });

  // Interview routes
  app.get('/api/interviews', isAuthenticated, async (req, res) => {
    try {
      const { date, interviewerId, status } = req.query;
      const interviews = await storage.getInterviews({
        date: date ? new Date(date as string) : undefined,
        interviewerId: interviewerId as string,
        status: status as string,
      });
      res.json(interviews);
    } catch (error) {
      console.error("Error fetching interviews:", error);
      res.status(500).json({ message: "Failed to fetch interviews" });
    }
  });

  app.post('/api/interviews', isAuthenticated, async (req: any, res) => {
    try {
      const interviewData = insertInterviewSchema.parse(req.body);
      const interview = await storage.createInterview(interviewData);
      
      // Log activity
      await storage.createActivityLog({
        userId: req.user.id.toString(),
        action: "schedule_interview",
        entityType: "interview",
        entityId: interview.id.toString(),
        description: `Scheduled interview`,
      });
      
      res.status(201).json(interview);
    } catch (error) {
      console.error("Error creating interview:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid interview data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create interview" });
    }
  });

  // Get today's interviews
  app.get('/api/interviews/today', isAuthenticated, async (req, res) => {
    try {
      const today = new Date();
      const interviews = await storage.getInterviews({ date: today });
      res.json(interviews);
    } catch (error) {
      console.error("Error fetching today's interviews:", error);
      res.status(500).json({ message: "Failed to fetch today's interviews" });
    }
  });

  // Onboarding routes
  app.get('/api/onboarding/tasks', isAuthenticated, async (req, res) => {
    try {
      const { employeeId } = req.query;
      const tasks = await storage.getOnboardingTasks(employeeId as string);
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching onboarding tasks:", error);
      res.status(500).json({ message: "Failed to fetch onboarding tasks" });
    }
  });

  app.post('/api/onboarding/tasks', isAuthenticated, async (req: any, res) => {
    try {
      const taskData = insertOnboardingTaskSchema.parse(req.body);
      const task = await storage.createOnboardingTask(taskData);
      
      // Log activity
      await storage.createActivityLog({
        userId: req.user.id.toString(),
        action: "create_onboarding_task",
        entityType: "onboarding_task",
        entityId: task.id.toString(),
        description: `Created onboarding task: ${task.title}`,
      });
      
      res.status(201).json(task);
    } catch (error) {
      console.error("Error creating onboarding task:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid task data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create onboarding task" });
    }
  });

  // Performance routes
  app.get('/api/performance/reviews', isAuthenticated, async (req, res) => {
    try {
      const { employeeId } = req.query;
      const reviews = await storage.getPerformanceReviews(employeeId as string);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching performance reviews:", error);
      res.status(500).json({ message: "Failed to fetch performance reviews" });
    }
  });

  app.post('/api/performance/reviews', isAuthenticated, async (req: any, res) => {
    try {
      const reviewData = insertPerformanceReviewSchema.parse(req.body);
      const review = await storage.createPerformanceReview(reviewData);
      
      // Log activity
      await storage.createActivityLog({
        userId: req.user.id.toString(),
        action: "create_performance_review",
        entityType: "performance_review",
        entityId: review.id.toString(),
        description: `Created performance review`,
      });
      
      res.status(201).json(review);
    } catch (error) {
      console.error("Error creating performance review:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid review data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create performance review" });
    }
  });

  // Profile routes
  app.get('/api/profile', isAuthenticated, async (req: any, res) => {
    try {
      res.json(req.user);
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.put('/api/profile', isAuthenticated, async (req: any, res) => {
    try {
      const updatedUser = await storage.updateUser(req.user.id, req.body);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Activity logs routes
  app.get('/api/activity-logs', isAuthenticated, async (req: any, res) => {
    try {
      const { userId, limit } = req.query;
      const logs = await storage.getActivityLogs(userId || req.user.id.toString(), parseInt(limit) || 50);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching activity logs:", error);
      res.status(500).json({ message: "Failed to fetch activity logs" });
    }
  });

  // Dashboard routes
  app.get('/api/dashboard/stats', isAuthenticated, async (req, res) => {
    try {
      const today = new Date();
      const [jobs, candidates, interviewsToday, applications] = await Promise.all([
        storage.getJobs({ status: 'active' }),
        storage.getCandidates({}),
        storage.getInterviews({ date: today }),
        storage.getApplications({})
      ]);

      const stats = {
        openPositions: jobs.length,
        activeCandidates: candidates.length,
        interviewsToday: interviewsToday.length,
        newHires: applications.filter(app => app.status === 'hired').length
      };

      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  app.get('/api/dashboard/recent-activity', isAuthenticated, async (req: any, res) => {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const logs = await storage.getActivityLogs(null, limit);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching recent activity:", error);
      res.status(500).json({ message: "Failed to fetch recent activity" });
    }
  });

  // Employee routes
  app.get('/api/employees', isAuthenticated, async (req: any, res) => {
    try {
      const employees = await storage.getUsers();
      res.json(employees);
    } catch (error) {
      console.error("Error fetching employees:", error);
      res.status(500).json({ message: "Failed to fetch employees" });
    }
  });

  app.put('/api/employees/:id', isAuthenticated, async (req: any, res) => {
    try {
      const updatedUser = await storage.updateUser(parseInt(req.params.id), req.body);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating employee:", error);
      res.status(500).json({ message: "Failed to update employee" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
