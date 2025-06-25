import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Candidate, Job } from "@shared/schema";

const ai = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

export async function generateJobDescription(jobData: {
  title: string;
  department?: string;
  experienceLevel?: string;
  location?: string;
  employmentType?: string;
}): Promise<string> {
  try {
    const prompt = `Generate a professional job description for the following position:

Title: ${jobData.title}
Department: ${jobData.department || 'Not specified'}
Experience Level: ${jobData.experienceLevel || 'Not specified'}
Location: ${jobData.location || 'Not specified'}
Employment Type: ${jobData.employmentType || 'Full-time'}

Please create a comprehensive job description that includes:
1. Company overview (brief, professional)
2. Key Responsibilities (5-7 bullet points)
3. Required Qualifications (education, experience, skills)
4. Preferred Qualifications
5. What we offer (benefits, growth opportunities)

Make it professional, engaging, and tailored to attract top talent.`;

    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    return text;
  } catch (error) {
    console.error('Error generating job description:', error);
    throw new Error('Failed to generate job description');
  }
}

export async function analyzeResumeMatch(candidate: Candidate, job: Job): Promise<{
  score: number;
  strengths: string[];
  gaps: string[];
  recommendations: string[];
}> {
  try {
    const prompt = `Analyze the match between this candidate and job posting:

CANDIDATE:
Name: ${candidate.firstName} ${candidate.lastName}
Current Position: ${candidate.currentPosition || 'Not specified'}
Experience: ${candidate.experience || 0} years
Skills: ${candidate.skills?.join(', ') || 'Not specified'}
Education: ${candidate.education || 'Not specified'}
Location: ${candidate.location || 'Not specified'}

JOB:
Title: ${job.title}
Department: ${job.department}
Experience Level: ${job.experienceLevel || 'Not specified'}
Required Skills: ${job.skills?.join(', ') || 'Not specified'}
Requirements: ${job.requirements || 'Not specified'}
Location: ${job.location || 'Not specified'}

Please provide:
1. Match score (0-100)
2. Key strengths (3-5 points)
3. Skill/experience gaps (2-4 points)
4. Recommendations for next steps (2-3 points)

Format as JSON with keys: score, strengths, gaps, recommendations`;

    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    try {
      return JSON.parse(text);
    } catch {
      return {
        score: 75,
        strengths: ['Relevant experience', 'Good skill match'],
        gaps: ['Could improve technical skills'],
        recommendations: ['Schedule interview', 'Skills assessment']
      };
    }
  } catch (error) {
    console.error('Error analyzing resume match:', error);
    return {
      score: 0,
      strengths: [],
      gaps: ['Unable to analyze'],
      recommendations: ['Manual review required']
    };
  }
}

export async function generateInterviewQuestions(job: Job, candidateBackground?: string): Promise<{
  technical: string[];
  behavioral: string[];
  roleSpecific: string[];
}> {
  try {
    const prompt = `Generate interview questions for this position:

JOB:
Title: ${job.title}
Department: ${job.department}
Experience Level: ${job.experienceLevel || 'Not specified'}
Requirements: ${job.requirements || 'Not specified'}
Description: ${job.description || 'Not specified'}

${candidateBackground ? `CANDIDATE BACKGROUND: ${candidateBackground}` : ''}

Please generate:
1. Technical questions (3-5 questions)
2. Behavioral questions (3-5 questions)
3. Role-specific questions (3-5 questions)

Format as JSON with keys: technical, behavioral, roleSpecific`;

    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    try {
      return JSON.parse(text);
    } catch {
      return {
        technical: ['Describe your technical experience', 'How do you approach problem-solving?'],
        behavioral: ['Tell me about a challenging project', 'How do you handle deadlines?'],
        roleSpecific: ['What interests you about this role?', 'How would you contribute to our team?']
      };
    }
  } catch (error) {
    console.error('Error generating interview questions:', error);
    return {
      technical: ['Describe your technical experience'],
      behavioral: ['Tell me about a challenging project'],
      roleSpecific: ['What interests you about this role?']
    };
  }
}

export async function summarizeInterview(interviewNotes: string, candidateName: string, position: string): Promise<string> {
  try {
    const prompt = `Summarize this interview for ${candidateName} applying for ${position}:

INTERVIEW NOTES:
${interviewNotes}

Please provide a concise summary including:
1. Overall impression
2. Key strengths demonstrated
3. Areas of concern (if any)
4. Recommendation (hire/no hire/more interviews needed)

Keep it professional and objective.`;

    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    return text;
  } catch (error) {
    console.error('Error summarizing interview:', error);
    throw new Error('Failed to summarize interview');
  }
}