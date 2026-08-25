import { callGeminiStructured } from './geminiService.js'

const TAILOR_ENGINE_SYSTEM_PROMPT = `You are an elite Career Coach, Senior Technical Recruiter, and ATS Optimization Specialist.
Your mission is to tailor the candidate's parsed resume to achieve a 90%+ match score against the target Job Description while preserving 100% truthfulness (no fake companies or degrees).

STRICT TAILORING & PRESERVATION RULES:
1. PROFESSIONAL SUMMARY: Rewrite into a powerful 2-3 sentence summary specifically targeting the target job title. Naturally weave in the top 4-5 high-priority JD keywords.
2. TECHNICAL SKILLS:
   - Harmonize naming to match target JD terminology exactly (e.g. if JD says "React.js", use "React.js").
   - Suggest adding missing skills that are plausibly related to the candidate's existing background (e.g., adding TypeScript when JavaScript is present, adding Docker when backend is present).
3. EXPERIENCE BULLETS:
   - Upgrade every bullet point to follow the XYZ Formula: "[Strong Action Verb] + [What was engineered/developed] + [Using target tech/frameworks] + [Quantified result / metric]".
   - Replace weak verbs ("worked on", "helped") with impactful technical action verbs ("Architected", "Engineered", "Optimized").
   - CRITICAL: Always preserve all experience "links" arrays, "isCurrentlyWorking" flags, dates, and locations.
4. PROJECTS:
   - Ensure target technologies appear prominently in the project tech stack tags and bullet descriptions.
   - CRITICAL: Always preserve all project "links" (e.g. GitHub, Live App, Devpost) with their "label" and "url".
5. CERTIFICATIONS & EDUCATION:
   - CRITICAL: Preserve all certifications with their "name", "issuer", "year", "url", and "label".
   - CRITICAL: Preserve all education entries with degrees, coursework, and GPAs.
6. CHANGE LOG & SUGGESTIONS:
   - Document every key modification in a structured changesLog array with 'section', 'type', 'before', 'after', and 'reason'.
   - List each suggested skill in skillSuggestions with confidence percentage (70-100% for close relatives, 40-69% for moderate).

Output strictly valid JSON conforming to the schema.`

/**
 * Generates an ATS-tailored resume using Gemini AI.
 * @param {object} resumeParsed 
 * @param {object} jdParsed 
 * @param {object} gapAnalysis 
 * @param {string} apiKey 
 * @returns {Promise<{ tailoredResume: object, changesLog: array, skillSuggestions: array }>}
 */
export async function tailorResumeWithAI(resumeParsed, jdParsed, gapAnalysis, apiKey) {
  if (!resumeParsed || !jdParsed) {
    throw new Error('Resume or Job Description data is missing for tailoring.')
  }

  const prompt = `Tailor the following candidate resume for the target job description.

TARGET JOB DESCRIPTION:
Title: ${jdParsed.jobTitle || 'Software Engineer'}
Company: ${jdParsed.company || 'Target Company'}
High-Priority ATS Keywords: ${(jdParsed.atsKeywords?.highPriority || []).join(', ')}
Required Hard Skills: ${(jdParsed.skills?.required?.hardSkills || []).join(', ')}
Required Tools: ${(jdParsed.skills?.required?.tools || []).join(', ')}

CURRENT RESUME DATA (PRESERVE ALL LINKS, CERTIFICATIONS, AND DATES):
${JSON.stringify(resumeParsed, null, 2)}

GAP ANALYSIS (MISSING / PARTIAL):
Missing Keywords: ${JSON.stringify(gapAnalysis?.missing || [])}
Partial Matches: ${JSON.stringify(gapAnalysis?.partial || [])}

Generate a JSON object with this exact structure:
{
  "tailoredResume": {
    "name": "${resumeParsed.name || 'Candidate Name'}",
    "contact": ${JSON.stringify(resumeParsed.contact || {})},
    "summary": "Optimized professional summary targeting ${jdParsed.jobTitle || 'the role'} with top keywords",
    "skills": {
      "languages": ["..."],
      "frameworks": ["..."],
      "tools": ["..."],
      "databases": ["..."],
      "concepts": ["..."]
    },
    "experience": [
      {
        "title": "Job Title",
        "company": "Company",
        "location": "Location",
        "startDate": "Start",
        "endDate": "End",
        "isCurrentlyWorking": false,
        "links": [
          { "label": "Certificate", "url": "https://..." }
        ],
        "bullets": [
          "Optimized bullet following XYZ formula with action verb and metrics"
        ]
      }
    ],
    "projects": [
      {
        "name": "Project Name",
        "technologies": ["React.js", "Node.js", "PostgreSQL"],
        "date": "Date",
        "isCurrentlyWorking": false,
        "links": [
          { "label": "GitHub", "url": "https://github.com/..." },
          { "label": "Live App", "url": "https://..." }
        ],
        "bullets": [
          "Enhanced bullet with target keywords"
        ]
      }
    ],
    "education": ${JSON.stringify(resumeParsed.education || [])},
    "certifications": ${JSON.stringify(resumeParsed.certifications || [])}
  },
  "changesLog": [
    {
      "section": "Professional Summary",
      "type": "rewritten",
      "before": "Old summary",
      "after": "New summary",
      "reason": "Integrated top 5 JD keywords and aligned role title"
    },
    {
      "section": "Experience",
      "type": "enhanced",
      "before": "Old bullet",
      "after": "New bullet",
      "reason": "Upgraded action verb and quantified performance impact by 35%"
    }
  ],
  "skillSuggestions": [
    {
      "skill": "TypeScript",
      "category": "languages",
      "confidence": 85,
      "reason": "Required in JD; strongly complemented by your JavaScript foundation"
    },
    {
      "skill": "Docker",
      "category": "tools",
      "confidence": 75,
      "reason": "High priority JD keyword relevant to full-stack containerization"
    }
  ]
}`

  return await callGeminiStructured({
    apiKey,
    prompt,
    systemInstruction: TAILOR_ENGINE_SYSTEM_PROMPT,
    temperature: 0.25
  })
}
