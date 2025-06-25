-- TalentArchitect Database Setup Script
-- This script creates all necessary tables for the TalentArchitect HR platform
-- Run this script in your PostgreSQL database

-- Create database (uncomment if needed)
-- CREATE DATABASE talent_architect;

-- Connect to the database
-- \c talent_architect;

-- Enable UUID extension for unique identifiers
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Sessions table for authentication
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    session_data TEXT NOT NULL,
    expires TIMESTAMPTZ
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'employee',
    department TEXT,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    department TEXT NOT NULL,
    description TEXT,
    requirements TEXT,
    location TEXT,
    employment_type TEXT NOT NULL DEFAULT 'full_time',
    experience_level TEXT NOT NULL DEFAULT 'mid',
    salary_min INTEGER,
    salary_max INTEGER,
    skills TEXT[],
    benefits TEXT[],
    status TEXT NOT NULL DEFAULT 'draft',
    posted_by TEXT REFERENCES users(id),
    posted_at TIMESTAMPTZ,
    closes_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Job Templates table
CREATE TABLE IF NOT EXISTS job_templates (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    title TEXT NOT NULL,
    department TEXT NOT NULL,
    description TEXT,
    requirements TEXT,
    location TEXT,
    employment_type TEXT NOT NULL DEFAULT 'full_time',
    experience_level TEXT NOT NULL DEFAULT 'mid',
    salary_min INTEGER,
    salary_max INTEGER,
    skills TEXT[],
    benefits TEXT[],
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Candidates table
CREATE TABLE IF NOT EXISTS candidates (
    id SERIAL PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    current_position TEXT,
    experience INTEGER DEFAULT 0,
    skills TEXT[],
    education TEXT,
    location TEXT,
    resume_url TEXT,
    linkedin_url TEXT,
    portfolio_url TEXT,
    status TEXT NOT NULL DEFAULT 'new',
    source TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Applications table
CREATE TABLE IF NOT EXISTS applications (
    id SERIAL PRIMARY KEY,
    job_id INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    candidate_id INTEGER NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'applied',
    cover_letter TEXT,
    applied_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(job_id, candidate_id)
);

-- Interviews table
CREATE TABLE IF NOT EXISTS interviews (
    id SERIAL PRIMARY KEY,
    application_id INTEGER NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    interviewer_id TEXT NOT NULL REFERENCES users(id),
    type TEXT NOT NULL DEFAULT 'phone',
    scheduled_at TIMESTAMPTZ NOT NULL,
    duration INTEGER DEFAULT 60,
    location TEXT,
    meeting_link TEXT,
    status TEXT NOT NULL DEFAULT 'scheduled',
    feedback TEXT,
    score INTEGER,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Onboarding Tasks table
CREATE TABLE IF NOT EXISTS onboarding_tasks (
    id SERIAL PRIMARY KEY,
    employee_id TEXT NOT NULL REFERENCES users(id),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    assigned_to TEXT REFERENCES users(id),
    due_date TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'pending',
    priority TEXT NOT NULL DEFAULT 'medium',
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Performance Reviews table
CREATE TABLE IF NOT EXISTS performance_reviews (
    id SERIAL PRIMARY KEY,
    employee_id TEXT NOT NULL REFERENCES users(id),
    reviewer_id TEXT NOT NULL REFERENCES users(id),
    review_period_start DATE NOT NULL,
    review_period_end DATE NOT NULL,
    overall_rating INTEGER,
    goals TEXT,
    achievements TEXT,
    areas_for_improvement TEXT,
    manager_feedback TEXT,
    employee_comments TEXT,
    status TEXT NOT NULL DEFAULT 'draft',
    submitted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Activity Logs table
CREATE TABLE IF NOT EXISTS activity_logs (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    action TEXT NOT NULL,
    resource TEXT NOT NULL,
    resource_id TEXT,
    details JSONB,
    timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_department ON jobs(department);
CREATE INDEX IF NOT EXISTS idx_jobs_posted_at ON jobs(posted_at);

CREATE INDEX IF NOT EXISTS idx_candidates_status ON candidates(status);
CREATE INDEX IF NOT EXISTS idx_candidates_email ON candidates(email);
CREATE INDEX IF NOT EXISTS idx_candidates_created_at ON candidates(created_at);

CREATE INDEX IF NOT EXISTS idx_applications_job_id ON applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_candidate_id ON applications(candidate_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);

CREATE INDEX IF NOT EXISTS idx_interviews_scheduled_at ON interviews(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_interviews_status ON interviews(status);
CREATE INDEX IF NOT EXISTS idx_interviews_interviewer_id ON interviews(interviewer_id);

CREATE INDEX IF NOT EXISTS idx_onboarding_tasks_employee_id ON onboarding_tasks(employee_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_tasks_status ON onboarding_tasks(status);
CREATE INDEX IF NOT EXISTS idx_onboarding_tasks_due_date ON onboarding_tasks(due_date);

CREATE INDEX IF NOT EXISTS idx_performance_reviews_employee_id ON performance_reviews(employee_id);
CREATE INDEX IF NOT EXISTS idx_performance_reviews_reviewer_id ON performance_reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_performance_reviews_status ON performance_reviews(status);

CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_timestamp ON activity_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_activity_logs_resource ON activity_logs(resource);

-- Insert sample data

-- Sample job templates
INSERT INTO job_templates (name, title, department, description, requirements, employment_type, experience_level, skills, benefits) VALUES
('Senior Software Engineer Template', 'Senior Software Engineer', 'Engineering', 
 'We are looking for an experienced Senior Software Engineer to join our dynamic team. You will be responsible for developing high-quality software solutions, mentoring junior developers, and contributing to architectural decisions.',
 '• Bachelor''s degree in Computer Science or related field
• 5+ years of experience in software development
• Proficiency in React, Node.js, and TypeScript
• Experience with cloud platforms (AWS/GCP preferred)
• Strong problem-solving and communication skills
• Experience with microservices architecture',
 'full_time', 'senior',
 ARRAY['React', 'Node.js', 'TypeScript', 'AWS', 'Docker', 'PostgreSQL'],
 ARRAY['Health Insurance', 'Flexible Hours', 'Remote Work', 'Professional Development', '401k Matching']
),
('Product Manager Template', 'Product Manager', 'Product',
 'Join our product team to drive the vision and strategy for our core products. You will work closely with engineering, design, and business teams to deliver exceptional user experiences.',
 '• Bachelor''s degree in Business, Engineering, or related field
• 3+ years of product management experience
• Experience with agile development methodologies
• Strong analytical and data-driven decision making skills
• Excellent communication and leadership abilities
• Experience with user research and product analytics',
 'full_time', 'mid',
 ARRAY['Product Strategy', 'Agile', 'Analytics', 'User Research', 'Roadmap Planning'],
 ARRAY['Health Insurance', 'Flexible Hours', 'Professional Development', 'Stock Options']
),
('UX Designer Template', 'UX Designer', 'Design',
 'We are seeking a talented UX Designer to create intuitive and engaging user experiences for our digital products. You will conduct user research, create wireframes and prototypes, and collaborate with cross-functional teams.',
 '• Bachelor''s degree in Design, HCI, or related field
• 3+ years of UX design experience
• Proficiency in Figma, Sketch, or Adobe Creative Suite
• Experience with user research methodologies
• Strong portfolio demonstrating design thinking process
• Knowledge of accessibility standards and best practices',
 'full_time', 'mid',
 ARRAY['Figma', 'User Research', 'Prototyping', 'Wireframing', 'Accessibility', 'Design Systems'],
 ARRAY['Health Insurance', 'Flexible Hours', 'Remote Work', 'Professional Development', 'Creative Time']
);

-- Sample candidates
INSERT INTO candidates (first_name, last_name, email, phone, current_position, experience, skills, education, location, status, source) VALUES
('Sarah', 'Johnson', 'sarah.johnson@email.com', '+1 (555) 123-4567', 'Senior Software Engineer at TechCorp', 6, 
 ARRAY['React', 'Node.js', 'TypeScript', 'AWS', 'PostgreSQL'], 
 'Bachelor of Science in Computer Science, Stanford University', 'San Francisco, CA', 'new', 'LinkedIn'),
('Michael', 'Chen', 'michael.chen@email.com', '+1 (555) 234-5678', 'Product Manager at StartupXYZ', 4,
 ARRAY['Product Strategy', 'Agile', 'Analytics', 'SQL', 'Tableau'],
 'MBA from Harvard Business School, BS in Engineering', 'New York, NY', 'reviewing', 'Referral'),
('Emily', 'Rodriguez', 'emily.rodriguez@email.com', '+1 (555) 345-6789', 'UX Designer at DesignStudio', 3,
 ARRAY['Figma', 'User Research', 'Prototyping', 'Design Systems', 'Accessibility'],
 'Master of Fine Arts in Interaction Design, RISD', 'Austin, TX', 'interviewing', 'Company Website'),
('David', 'Thompson', 'david.thompson@email.com', '+1 (555) 456-7890', 'Full Stack Developer at WebCo', 5,
 ARRAY['React', 'Python', 'Django', 'PostgreSQL', 'Docker'],
 'Bachelor of Computer Science, UC Berkeley', 'Seattle, WA', 'shortlisted', 'Indeed'),
('Lisa', 'Wang', 'lisa.wang@email.com', '+1 (555) 567-8901', 'Marketing Manager at GrowthCorp', 4,
 ARRAY['Digital Marketing', 'SEO', 'Analytics', 'Content Strategy', 'A/B Testing'],
 'Bachelor of Marketing, Northwestern University', 'Chicago, IL', 'new', 'LinkedIn');

-- Sample admin user
INSERT INTO users (id, name, email, role, department) VALUES
('admin-001', 'Admin User', 'admin@talentarchitect.com', 'admin', 'HR'),
('hr-001', 'Jane Smith', 'jane.smith@talentarchitect.com', 'hr_manager', 'HR'),
('recruiter-001', 'John Doe', 'john.doe@talentarchitect.com', 'recruiter', 'HR');

-- Sample jobs
INSERT INTO jobs (title, department, description, requirements, location, employment_type, experience_level, salary_min, salary_max, skills, benefits, status, posted_by) VALUES
('Senior React Developer', 'Engineering', 
 'Join our engineering team to build the next generation of our web applications using React and modern web technologies.',
 '• 5+ years of React development experience
• Strong TypeScript skills
• Experience with state management (Redux/Zustand)
• Knowledge of testing frameworks (Jest, React Testing Library)
• Experience with modern build tools (Vite, Webpack)',
 'Remote', 'full_time', 'senior', 120000, 150000,
 ARRAY['React', 'TypeScript', 'Redux', 'Jest', 'Git'],
 ARRAY['Health Insurance', 'Remote Work', 'Flexible Hours', '401k'],
 'open', 'hr-001'),
('Product Designer', 'Design',
 'We are looking for a Product Designer to help shape the user experience of our core products.',
 '• 3+ years of product design experience
• Proficiency in Figma and prototyping tools
• Strong understanding of user-centered design principles
• Experience conducting user research
• Portfolio demonstrating end-to-end design process',
 'San Francisco, CA', 'full_time', 'mid', 90000, 120000,
 ARRAY['Figma', 'User Research', 'Prototyping', 'Design Systems'],
 ARRAY['Health Insurance', 'Flexible Hours', 'Professional Development'],
 'open', 'hr-001');

-- Update timestamps trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_job_templates_updated_at BEFORE UPDATE ON job_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_candidates_updated_at BEFORE UPDATE ON candidates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_interviews_updated_at BEFORE UPDATE ON interviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_onboarding_tasks_updated_at BEFORE UPDATE ON onboarding_tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_performance_reviews_updated_at BEFORE UPDATE ON performance_reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions (adjust as needed for your environment)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_app_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_app_user;

COMMIT;

-- Connection information:
-- Database: talent_architect
-- Tables: users, jobs, job_templates, candidates, applications, interviews, onboarding_tasks, performance_reviews, activity_logs, sessions
-- 
-- To connect your application, use these environment variables:
-- DATABASE_URL=postgresql://username:password@localhost:5432/talent_architect
-- PGHOST=localhost
-- PGPORT=5432
-- PGUSER=your_username
-- PGPASSWORD=your_password
-- PGDATABASE=talent_architect