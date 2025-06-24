# TalentArchitect - AI-Powered HR Platform

## Overview

TalentArchitect is a comprehensive AI-powered HR management platform built with a modern full-stack architecture. The application streamlines recruitment, enhances hiring decisions, and accelerates onboarding through intelligent automation and data-driven insights. It provides a complete solution for managing job postings, candidate tracking, interviews, onboarding, employee management, and performance reviews.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite for fast development and optimized builds
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript for full-stack type safety
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL storage
- **File Upload**: Multer for resume processing

### Development Environment
- **Platform**: Replit with Node.js 20, web modules, and PostgreSQL 16
- **Hot Reload**: Vite HMR for frontend, tsx for backend development
- **Build Process**: Vite for frontend bundling, esbuild for backend compilation

## Key Components

### Authentication System
- **Provider**: Replit Auth using OpenID Connect
- **Session Storage**: PostgreSQL-backed sessions with connect-pg-simple
- **Security**: HTTP-only cookies, secure session handling
- **User Management**: Role-based access control (admin, hr_manager, recruiter, manager, employee)

### Database Schema
- **Users**: Complete user profiles with roles and departments
- **Jobs**: Job postings with detailed requirements and status tracking
- **Candidates**: Candidate profiles with skills, education, and resume storage
- **Applications**: Job application tracking with status management
- **Interviews**: Interview scheduling and feedback collection
- **Onboarding**: Task management for new hire onboarding
- **Performance**: Performance review and goal tracking
- **Activity Logs**: Comprehensive audit trail

### AI Integration
- **OpenAI Integration**: GPT-4o for job description generation and resume analysis
- **Resume Parser**: Automated resume parsing and skill extraction
- **Candidate Matching**: AI-powered candidate-job matching algorithms

### Core Features
1. **Recruitment Management**: Job posting creation, candidate sourcing, application tracking
2. **Candidate Management**: Profile management, resume parsing, skill assessment
3. **Interview Scheduling**: Calendar integration, feedback collection, decision tracking
4. **Onboarding Automation**: Task workflows, document management, progress tracking
5. **Employee Management**: Profile management, role assignment, department organization
6. **Performance Reviews**: Goal setting, review cycles, feedback collection
7. **Analytics Dashboard**: Recruitment metrics, diversity insights, performance analytics

## Data Flow

### Authentication Flow
1. User accesses protected route
2. Middleware checks session validity
3. Redirects to Replit Auth if unauthenticated
4. Creates/updates user profile on successful auth
5. Establishes secure session with PostgreSQL storage

### Recruitment Pipeline
1. HR creates job posting with AI-assisted description generation
2. Candidates apply with resume upload and parsing
3. AI analyzes candidate-job fit and provides matching scores
4. Recruiters review applications and schedule interviews
5. Interview feedback is collected and hiring decisions are made
6. Successful candidates enter onboarding workflow

### Data Persistence
- All data stored in PostgreSQL with Drizzle ORM
- Type-safe database operations with shared schema
- Migration management through Drizzle Kit
- Connection pooling with Neon serverless driver

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL serverless driver
- **drizzle-orm**: Type-safe database ORM
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI components
- **openai**: AI integration for content generation
- **passport**: Authentication middleware
- **multer**: File upload handling

### Development Tools
- **tsx**: TypeScript execution for development
- **vite**: Build tool and dev server
- **tailwindcss**: Utility-first CSS framework
- **@replit/vite-plugin-***: Replit-specific development tools

### UI Components
- Complete shadcn/ui component library
- Accessible components with Radix UI primitives
- Consistent design system with CSS variables
- Dark mode support

## Deployment Strategy

### Development Environment
- **Runtime**: Node.js 20 with hot reload
- **Database**: PostgreSQL 16 instance
- **Port Configuration**: Internal port 5000, external port 80
- **Development Command**: `npm run dev`

### Production Build
- **Frontend**: Vite build with static asset optimization
- **Backend**: esbuild compilation to ESM modules
- **Deployment**: Replit autoscale deployment target
- **Start Command**: `npm run start`

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Session encryption key
- `OPENAI_API_KEY`: OpenAI API access key
- `REPL_ID`: Replit environment identifier
- `ISSUER_URL`: OpenID Connect issuer URL

## Changelog

- June 24, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.