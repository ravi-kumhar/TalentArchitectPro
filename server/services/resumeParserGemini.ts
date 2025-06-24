import { GoogleGenAI } from "@google/genai";
import type { InsertCandidate } from "@shared/schema";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function parseResume(fileBuffer: Buffer, mimeType: string): Promise<Partial<InsertCandidate>> {
  try {
    // For now, return a basic structure that the frontend can populate
    // In production, you would use libraries like:
    // - pdf-parse for PDF files
    // - mammoth for DOCX files
    // - Gemini for intelligent extraction
    
    const fileName = `resume_${Date.now()}.${getFileExtension(mimeType)}`;
    
    // This is a simplified version - you would implement actual parsing logic here
    return {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      location: "",
      experience: 0,
      currentPosition: "",
      currentCompany: "",
      skills: [],
      education: [],
      resumeUrl: fileName,
      status: "new",
      source: "direct",
    };
  } catch (error) {
    console.error("Error parsing resume:", error);
    throw new Error("Failed to parse resume");
  }
}

function getFileExtension(mimeType: string): string {
  switch (mimeType) {
    case 'application/pdf':
      return 'pdf';
    case 'application/msword':
      return 'doc';
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      return 'docx';
    default:
      return 'txt';
  }
}

export async function extractSkillsFromText(text: string): Promise<string[]> {
  try {
    const prompt = `Extract technical and professional skills from this text. Return only a JSON object with a "skills" array containing skill names as strings:

${text}

Example response format:
{"skills": ["JavaScript", "React", "Node.js", "Python", "Project Management"]}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an expert at identifying technical and professional skills. Return only a JSON array of skill names.",
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            skills: { type: "array", items: { type: "string" } }
          }
        }
      }
    });

    const result = JSON.parse(response.text || '{"skills": []}');
    return result.skills || [];
  } catch (error) {
    console.error("Error extracting skills:", error);
    return [];
  }
}

export async function extractEducationFromText(text: string): Promise<any[]> {
  try {
    const prompt = `Extract education information from this text. Return a JSON object with an "education" array containing education records:

${text}

Example response format:
{"education": [{"degree": "Bachelor of Science", "field": "Computer Science", "institution": "University of Technology", "year": "2020"}]}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an expert at extracting education information. Return education records as JSON array.",
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            education: { type: "array" }
          }
        }
      }
    });

    const result = JSON.parse(response.text || '{"education": []}');
    return result.education || [];
  } catch (error) {
    console.error("Error extracting education:", error);
    return [];
  }
}