import { callGeminiStructured } from './geminiService.js'

const RESUME_PARSER_SYSTEM_PROMPT = `You are an expert ATS Resume Parsing Engine.
Your job is to parse unstructured resume text into a strict, standardized JSON format.
Rules:
1. Extract ALL factual information accurately.
2. If a field is not present in the resume text, use an empty string "" or empty array [].
3. Categorize skills cleanly into languages, frameworks, tools, databases, and concepts.
4. Extract every bullet point under work experience and projects without truncating.
5. Capture any project or experience URLs (GitHub, Live App, Certificate links) into structured links arrays [{ label, url }].
6. Capture any profile links (LinkedIn, GitHub, Portfolio, LeetCode) into customLinks arrays [{ label, url }].
7. Do NOT invent or hallucinate any fake dates, companies, or degrees.
8. Return strictly valid JSON conforming to the schema.`

/**
 * Parses raw extracted resume text into a normalized structured JSON schema using Gemini AI.
 * @param {string} rawText 
 * @param {string} apiKey 
 * @returns {Promise<object>}
 */
export async function parseResumeWithAI(rawText, apiKey) {
  if (!rawText || !rawText.trim()) {
    throw new Error('Resume text is empty. Please upload or provide resume text first.')
  }

  const prompt = `Parse the following resume text into this exact JSON structure:
{
  "name": "Candidate Full Name",
  "contact": {
    "email": "email address",
    "phone": "phone number",
    "location": "City, Country or State",
    "linkedin": "linkedin URL or handle",
    "github": "github URL or handle",
    "customLinks": [
      { "label": "LinkedIn", "url": "linkedin.com/in/..." },
      { "label": "GitHub", "url": "github.com/..." }
    ]
  },
  "summary": "Professional summary or objective statement if present",
  "skills": {
    "languages": ["JavaScript", "Python", "SQL"],
    "frameworks": ["React.js", "Node.js", "Express.js"],
    "tools": ["Git", "Docker", "VS Code", "Postman"],
    "databases": ["PostgreSQL", "MongoDB"],
    "concepts": ["REST APIs", "CI/CD", "Agile/Scrum", "OOP"]
  },
  "experience": [
    {
      "title": "Job Title",
      "company": "Company Name",
      "location": "Location or Remote",
      "startDate": "Month Year",
      "endDate": "Month Year or Present",
      "isCurrentlyWorking": false,
      "links": [
        { "label": "Certificate", "url": "https://..." }
      ],
      "bullets": [
        "First bullet point describing accomplishment",
        "Second bullet point describing accomplishment"
      ]
    }
  ],
  "projects": [
    {
      "name": "Project Name",
      "technologies": ["React", "Node.js"],
      "date": "Month Year",
      "isCurrentlyWorking": false,
      "links": [
        { "label": "GitHub", "url": "https://github.com/..." },
        { "label": "Live App", "url": "https://..." }
      ],
      "bullets": [
        "Bullet point explaining what was built and impact"
      ]
    }
  ],
  "education": [
    {
      "degree": "B.Tech / B.S. / M.S. etc.",
      "major": "Computer Science or Field of Study",
      "institution": "University / College Name",
      "location": "Location",
      "startDate": "Year or Month Year",
      "endDate": "Year or Month Year",
      "gpa": "GPA or Percentage if listed",
      "coursework": ["Data Structures", "Algorithms", "DBMS"]
    }
  ],
  "certifications": [
    {
      "name": "Certification Name",
      "issuer": "Issuing Org",
      "year": "Year",
      "url": "https://...",
      "label": "Credential"
    }
  ]
}

RESUME TEXT TO PARSE:
"""
${rawText}
"""`

  return await callGeminiStructured({
    apiKey,
    prompt,
    systemInstruction: RESUME_PARSER_SYSTEM_PROMPT,
    temperature: 0.1
  })
}
