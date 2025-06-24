import { GoogleGenAI } from "@google/genai";
import type { Candidate, Job } from "@shared/schema";

// Note that the newest Gemini model series is "gemini-2.5-flash" or "gemini-2.5-pro"
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generateJobDescription(jobData: {
  title: string;
  department?: string;
  experienceLevel?: string;
  employmentType?: string;
  workLocation?: string;
}): Promise<string> {
  try {
    const prompt = `Create a comprehensive job description for the following position:

Job Title: ${jobData.title}
Department: ${jobData.department || 'Not specified'}
Experience Level: ${jobData.experienceLevel || 'Not specified'}
Employment Type: ${jobData.employmentType || 'Not specified'}
Work Location: ${jobData.workLocation || 'Not specified'}

Please include:
1. Job Summary (2-3 sentences)
2. Key Responsibilities (5-7 bullet points)
3. Required Qualifications (education, experience, skills)
4. Preferred Qualifications
5. What we offer (benefits, growth opportunities)

Make it professional, engaging, and tailored to attract top talent.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }]
        }
      ],
      config: {
        systemInstruction: "You are an expert HR professional specializing in creating compelling job descriptions that attract top talent while being clear about requirements and expectations."
      }
    });

    return response.text || "";
  } catch (error) {
    console.error("Error generating job description:", error);
    throw new Error("Failed to generate job description");
  }
}

export async function analyzeResumeMatch(candidate: Candidate, job: Job): Promise<{
  matchScore: number;
  strengths: string[];
  gaps: string[];
  recommendation: string;
}> {
  try {
    const candidateProfile = `
Name: ${candidate.firstName} ${candidate.lastName}
Experience: ${candidate.experience} years
Current Position: ${candidate.currentPosition || 'Not specified'}
Current Company: ${candidate.currentCompany || 'Not specified'}
Skills: ${JSON.stringify(candidate.skills) || 'Not specified'}
Education: ${JSON.stringify(candidate.education) || 'Not specified'}
`;

    const jobRequirements = `
Job Title: ${job.title}
Department: ${job.department || 'Not specified'}
Experience Level: ${job.experienceLevel || 'Not specified'}
Description: ${job.description || 'Not specified'}
Requirements: ${job.requirements || 'Not specified'}
Responsibilities: ${job.responsibilities || 'Not specified'}
`;

    const prompt = `Analyze how well this candidate matches the job requirements. Provide a detailed assessment in JSON format:

CANDIDATE:
${candidateProfile}

JOB:
${jobRequirements}

Respond with JSON in this exact format:
{
  "matchScore": <number between 0-100>,
  "strengths": ["strength1", "strength2", "strength3"],
  "gaps": ["gap1", "gap2", "gap3"],
  "recommendation": "Overall recommendation summary"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: prompt,
      config: {
        systemInstruction: "You are an expert technical recruiter with deep experience in matching candidates to job requirements. Provide honest, actionable assessments.",
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            matchScore: { type: "number" },
            strengths: { type: "array", items: { type: "string" } },
            gaps: { type: "array", items: { type: "string" } },
            recommendation: { type: "string" }
          },
          required: ["matchScore", "strengths", "gaps", "recommendation"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    
    return {
      matchScore: Math.max(0, Math.min(100, result.matchScore || 0)),
      strengths: result.strengths || [],
      gaps: result.gaps || [],
      recommendation: result.recommendation || "Unable to provide recommendation"
    };
  } catch (error) {
    console.error("Error analyzing resume match:", error);
    throw new Error("Failed to analyze resume match");
  }
}

export async function generateInterviewQuestions(job: Job, candidateBackground?: string): Promise<{
  technical: string[];
  behavioral: string[];
  roleSpecific: string[];
}> {
  try {
    const prompt = `Generate interview questions for this position:

Job Title: ${job.title}
Department: ${job.department || 'Not specified'}
Experience Level: ${job.experienceLevel || 'Not specified'}
Requirements: ${job.requirements || 'Not specified'}
Responsibilities: ${job.responsibilities || 'Not specified'}

${candidateBackground ? `Candidate Background: ${candidateBackground}` : ''}

Provide questions in JSON format:
{
  "technical": ["question1", "question2", "question3", "question4", "question5"],
  "behavioral": ["question1", "question2", "question3", "question4", "question5"],
  "roleSpecific": ["question1", "question2", "question3", "question4", "question5"]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: prompt,
      config: {
        systemInstruction: "You are an expert interviewer who creates insightful questions to assess both technical skills and cultural fit.",
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            technical: { type: "array", items: { type: "string" } },
            behavioral: { type: "array", items: { type: "string" } },
            roleSpecific: { type: "array", items: { type: "string" } }
          },
          required: ["technical", "behavioral", "roleSpecific"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    
    return {
      technical: result.technical || [],
      behavioral: result.behavioral || [],
      roleSpecific: result.roleSpecific || []
    };
  } catch (error) {
    console.error("Error generating interview questions:", error);
    throw new Error("Failed to generate interview questions");
  }
}

export async function summarizeInterview(interviewNotes: string, candidateName: string, position: string): Promise<string> {
  try {
    const prompt = `Summarize this interview for ${candidateName} applying for ${position}:

Interview Notes:
${interviewNotes}

Provide a concise summary covering:
1. Key strengths demonstrated
2. Areas of concern or gaps
3. Overall impression
4. Recommendation (hire/no hire/further evaluation)

Keep it professional and actionable for hiring decisions.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an expert HR professional who creates clear, actionable interview summaries for hiring decisions."
      }
    });

    return response.text || "";
  } catch (error) {
    console.error("Error summarizing interview:", error);
    throw new Error("Failed to summarize interview");
  }
}