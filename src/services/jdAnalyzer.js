import { callGeminiStructured } from './geminiService.js'

const JD_ANALYZER_SYSTEM_PROMPT = `You are an expert Technical Recruiter and ATS Keyword Extraction Engine.
Your job is to deeply analyze job descriptions and extract all critical keywords, hard skills, software tools, qualifications, and action verbs that ATS algorithms (Workday, Greenhouse, Lever, Taleo) use to rank candidates.
Rules:
1. Extract exact terminology (e.g., if JD mentions "React.js", capture "React.js" as well as "React").
2. Categorize keywords strictly into high-priority (must-haves mentioned in requirements/title), medium-priority (technical tools & frameworks), and low-priority (bonus/preferred).
3. Extract strong action verbs mentioned in the job description duties.
4. Output strictly valid JSON conforming to the schema.`

/**
 * Analyzes target Job Description text using Gemini AI to extract ATS keywords and competency requirements.
 * @param {string} jdText 
 * @param {string} apiKey 
 * @returns {Promise<object>}
 */
export async function parseJobDescriptionWithAI(jdText, apiKey) {
  if (!jdText || !jdText.trim()) {
    throw new Error('Job description is empty. Please paste a job description first.')
  }

  const prompt = `Analyze this job posting and extract all requirements, skills, and ATS ranking keywords into this exact JSON schema:
{
  "jobTitle": "Target Job Title (e.g. Full Stack Developer)",
  "company": "Company Name if mentioned, or 'Target Company'",
  "experienceLevel": "e.g. Entry Level (0-2 yrs), Mid-Level (2-5 yrs), Senior",
  "skills": {
    "required": {
      "hardSkills": ["React.js", "TypeScript", "Node.js", "REST APIs"],
      "tools": ["Git", "Docker", "AWS", "PostgreSQL"],
      "frameworks": ["Express.js", "Next.js", "Tailwind CSS"],
      "softSkills": ["Problem Solving", "Agile Collaboration", "Communication"]
    },
    "preferred": {
      "hardSkills": ["GraphQL", "CI/CD Pipelines", "Microservices"],
      "tools": ["Kubernetes", "Jest", "Redis"]
    }
  },
  "atsKeywords": {
    "highPriority": ["React.js", "TypeScript", "Node.js", "REST APIs", "PostgreSQL"],
    "mediumPriority": ["Docker", "Git", "Agile", "AWS", "State Management"],
    "lowPriority": ["GraphQL", "Microservices", "Jest"]
  },
  "actionVerbs": ["Architected", "Engineered", "Implemented", "Optimized", "Collaborated", "Deployed"],
  "keyResponsibilities": [
    "Build responsive web applications using modern front-end frameworks",
    "Design and optimize RESTful backend APIs and database schemas"
  ],
  "qualifications": [
    "Bachelor's degree in Computer Science or related discipline",
    "Hands-on proficiency in JavaScript/TypeScript and web architectures"
  ]
}

JOB DESCRIPTION TEXT TO ANALYZE:
"""
${jdText}
"""`

  return await callGeminiStructured({
    apiKey,
    prompt,
    systemInstruction: JD_ANALYZER_SYSTEM_PROMPT,
    temperature: 0.1
  })
}
