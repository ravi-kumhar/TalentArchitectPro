import { GoogleGenerativeAI } from '@google/generative-ai';
import type { InsertCandidate } from "@shared/schema";

const ai = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

export async function parseResume(fileBuffer: Buffer, mimeType: string): Promise<Partial<InsertCandidate>> {
  try {
    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `Extract candidate information from this resume and return as JSON with these exact fields:
    {
      "firstName": "string",
      "lastName": "string", 
      "email": "string",
      "phone": "string",
      "currentPosition": "string",
      "location": "string",
      "experience": "number (years)",
      "skills": ["array", "of", "skills"],
      "education": "string (highest degree and institution)",
      "summary": "brief professional summary"
    }

    Extract only factual information from the resume. If a field is not available, use empty string or empty array.`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: fileBuffer.toString('base64'),
          mimeType: mimeType
        }
      }
    ]);

    const response = result.response;
    const text = response.text();
    
    try {
      const parsed = JSON.parse(text);
      return {
        firstName: parsed.firstName || '',
        lastName: parsed.lastName || '',
        email: parsed.email || '',
        phone: parsed.phone || '',
        currentPosition: parsed.currentPosition || '',
        location: parsed.location || '',
        experience: parsed.experience || 0,
        skills: Array.isArray(parsed.skills) ? parsed.skills : [],
        education: parsed.education || '',
        status: 'new'
      };
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      return {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        currentPosition: '',
        location: '',
        experience: 0,
        skills: [],
        education: '',
        status: 'new'
      };
    }
  } catch (error) {
    console.error('Error parsing resume:', error);
    return {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      currentPosition: '',
      location: '',
      experience: 0,
      skills: [],
      education: '',
      status: 'new'
    };
  }
}

function getFileExtension(mimeType: string): string {
  const mimeToExt: { [key: string]: string } = {
    'application/pdf': 'pdf',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'text/plain': 'txt'
  };
  return mimeToExt[mimeType] || 'unknown';
}

export async function extractSkillsFromText(text: string): Promise<string[]> {
  try {
    const prompt = `Extract technical skills and competencies from this text. Return only a JSON array of skills:

    Text: ${text}

    Return format: ["skill1", "skill2", "skill3"]
    
    Focus on technical skills, programming languages, frameworks, tools, certifications, and professional competencies.`;

    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const response = result.response;
    const responseText = response.text();
    
    try {
      return JSON.parse(responseText);
    } catch {
      return [];
    }
  } catch (error) {
    console.error('Error extracting skills:', error);
    return [];
  }
}

export async function extractEducationFromText(text: string): Promise<any[]> {
  try {
    const prompt = `Extract education information from this text. Return as JSON array:

    Text: ${text}

    Return format: [{"degree": "Bachelor of Science", "field": "Computer Science", "institution": "University Name", "year": "2020"}]
    
    Include degrees, certifications, and relevant educational background.`;

    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const response = result.response;
    const responseText = response.text();
    
    try {
      return JSON.parse(responseText);
    } catch {
      return [];
    }
  } catch (error) {
    console.error('Error extracting education:', error);
    return [];
  }
}