import { callGeminiStructured } from './geminiService.js'

const TAILOR_ENGINE_SYSTEM_PROMPT = `You are an elite Career Coach, Senior Technical Recruiter, and ATS Optimization Specialist.
Your mission is to tailor the candidate's parsed resume to achieve a 90%+ match score against the target Job Description while preserving 100% of the candidate's existing background, projects, skills, and links.

ABSOLUTE NON-DESTRUCTIVE & ADDITIVE RULES:
1. NEVER DELETE OR OMIT EXISTING CONTENT:
   - DO NOT remove or drop any of the candidate's existing skills.
   - DO NOT remove or drop any of the candidate's existing projects.
   - DO NOT remove, alter, or drop any links (GitHub, Live App, Certificate links, or Header contact links).
   - Treat the candidate's existing data as the permanent foundation. All tailoring must be purely ADDITIVE and ENHANCING.

2. TECHNICAL SKILLS (ADDITIVE UNION):
   - Keep 100% of the candidate's existing skills in every category (languages, frameworks, tools, databases, concepts).
   - Seamlessly ADD missing target JD keywords into their appropriate categories.
   - Harmonize naming to match target JD keywords without deleting original skills.

3. PROFESSIONAL SUMMARY:
   - Rewrite into a punchy, high-impact 2-3 sentence summary specifically aligned with the target job title and incorporating top JD keywords.

4. EXPERIENCE & PROJECTS (IN-PLACE ENHANCEMENT):
   - Keep ALL work experience and project entries. Never truncate the list.
   - Upgrade every bullet point to follow Google's XYZ Formula: "[Strong Action Verb] + [What was engineered/built] + [Using target tech/frameworks] + [Quantified impact / metric]".
   - CRITICAL: Preserve all original project & experience "links" arrays, "isCurrentlyWorking" flags, and dates.

5. CHANGE LOG & SKILL SUGGESTIONS:
   - Document key bullet and summary improvements in changesLog.
   - List each recommended skill addition in skillSuggestions with confidence ratings.

Output strictly valid JSON conforming to the schema.`

/**
 * Deterministically merges tailored AI output with the original resume data
 * to guarantee 100% zero data loss of existing skills, projects, links, and credentials.
 * @param {object} original 
 * @param {object} tailored 
 * @returns {object}
 */
export function mergeNonDestructiveResume(original, tailored) {
  if (!original) return tailored || {}
  if (!tailored) return original

  const merged = { ...original }

  // 1. Name & Summary
  merged.name = tailored.name || original.name || 'Candidate Name'
  merged.summary = tailored.summary || original.summary || ''

  // 2. Contact & Unlimited Links (100% preservation)
  const origContact = original.contact || {}
  const tailContact = tailored.contact || {}
  
  const origLinks = Array.isArray(origContact.customLinks) ? origContact.customLinks : []
  const tailLinks = Array.isArray(tailContact.customLinks) ? tailContact.customLinks : []
  
  // Merge custom links by URL deduplication
  const linkUrlSet = new Set()
  const mergedCustomLinks = []
  
  for (const l of [...origLinks, ...tailLinks]) {
    if (l && l.url && !linkUrlSet.has(l.url.trim().toLowerCase())) {
      linkUrlSet.add(l.url.trim().toLowerCase())
      mergedCustomLinks.push(l)
    }
  }

  merged.contact = {
    location: tailContact.location || origContact.location || '',
    phone: tailContact.phone || origContact.phone || '',
    email: tailContact.email || origContact.email || '',
    linkedin: origContact.linkedin || tailContact.linkedin || '',
    github: origContact.github || tailContact.github || '',
    customLinks: mergedCustomLinks.length > 0 ? mergedCustomLinks : origLinks
  }

  // 3. Skills (Additive Union across all categories)
  const origSkills = original.skills || {}
  const tailSkills = tailored.skills || {}
  const categories = ['languages', 'frameworks', 'tools', 'databases', 'concepts']
  const mergedSkills = {}

  for (const cat of categories) {
    const origList = Array.isArray(origSkills[cat]) ? origSkills[cat] : []
    const tailList = Array.isArray(tailSkills[cat]) ? tailSkills[cat] : []
    
    const seen = new Set()
    const combined = []

    // Add all original skills first
    for (const s of origList) {
      if (s && !seen.has(s.trim().toLowerCase())) {
        seen.add(s.trim().toLowerCase())
        combined.push(s.trim())
      }
    }
    // Append new tailored skills
    for (const s of tailList) {
      if (s && !seen.has(s.trim().toLowerCase())) {
        seen.add(s.trim().toLowerCase())
        combined.push(s.trim())
      }
    }
    mergedSkills[cat] = combined
  }
  merged.skills = mergedSkills

  // 4. Projects (Keep all original projects + preserve all links)
  const origProjects = Array.isArray(original.projects) ? original.projects : []
  const tailProjects = Array.isArray(tailored.projects) ? tailored.projects : []

  const mergedProjects = origProjects.map((origProj, idx) => {
    // Find matching project in tailored output by name or index
    const tailProj = tailProjects.find(
      tp => tp.name && origProj.name && tp.name.toLowerCase().trim() === origProj.name.toLowerCase().trim()
    ) || tailProjects[idx] || {}

    // Technologies union
    const origTech = Array.isArray(origProj.technologies) ? origProj.technologies : []
    const tailTech = Array.isArray(tailProj.technologies) ? tailProj.technologies : []
    const techSet = new Set()
    const combinedTech = []
    for (const t of [...origTech, ...tailTech]) {
      if (t && !techSet.has(t.trim().toLowerCase())) {
        techSet.add(t.trim().toLowerCase())
        combinedTech.push(t.trim())
      }
    }

    // Links union
    const origProjLinks = Array.isArray(origProj.links) ? origProj.links : (origProj.link ? [{ label: origProj.linkLabel || 'Link', url: origProj.link }] : [])
    const tailProjLinks = Array.isArray(tailProj.links) ? tailProj.links : []
    const pLinkSet = new Set()
    const combinedProjLinks = []
    for (const l of [...origProjLinks, ...tailProjLinks]) {
      if (l && l.url && !pLinkSet.has(l.url.trim().toLowerCase())) {
        pLinkSet.add(l.url.trim().toLowerCase())
        combinedProjLinks.push(l)
      }
    }

    return {
      name: origProj.name || tailProj.name || 'Project Name',
      technologies: combinedTech.length > 0 ? combinedTech : origTech,
      date: origProj.date || tailProj.date || '',
      isCurrentlyWorking: origProj.isCurrentlyWorking ?? tailProj.isCurrentlyWorking ?? false,
      links: combinedProjLinks,
      bullets: (Array.isArray(tailProj.bullets) && tailProj.bullets.length > 0)
        ? tailProj.bullets
        : (origProj.bullets || [])
    }
  })

  // If AI generated an additional new project, append it
  if (tailProjects.length > origProjects.length) {
    for (let i = origProjects.length; i < tailProjects.length; i++) {
      mergedProjects.push(tailProjects[i])
    }
  }
  merged.projects = mergedProjects

  // 5. Experience (Keep all original jobs + preserve all links)
  const origExp = Array.isArray(original.experience) ? original.experience : []
  const tailExp = Array.isArray(tailored.experience) ? tailored.experience : []

  const mergedExp = origExp.map((origJob, idx) => {
    const tailJob = tailExp.find(
      tj => tj.company && origJob.company && tj.company.toLowerCase().trim() === origJob.company.toLowerCase().trim()
    ) || tailExp[idx] || {}

    // Links union
    const origExpLinks = Array.isArray(origJob.links) ? origJob.links : (origJob.link ? [{ label: 'Proof', url: origJob.link }] : [])
    const tailExpLinks = Array.isArray(tailJob.links) ? tailJob.links : []
    const eLinkSet = new Set()
    const combinedExpLinks = []
    for (const l of [...origExpLinks, ...tailExpLinks]) {
      if (l && l.url && !eLinkSet.has(l.url.trim().toLowerCase())) {
        eLinkSet.add(l.url.trim().toLowerCase())
        combinedExpLinks.push(l)
      }
    }

    return {
      title: origJob.title || tailJob.title || 'Job Title',
      company: origJob.company || tailJob.company || 'Company',
      location: origJob.location || tailJob.location || '',
      startDate: origJob.startDate || tailJob.startDate || '',
      endDate: origJob.endDate || tailJob.endDate || '',
      isCurrentlyWorking: origJob.isCurrentlyWorking ?? tailJob.isCurrentlyWorking ?? false,
      links: combinedExpLinks,
      bullets: (Array.isArray(tailJob.bullets) && tailJob.bullets.length > 0)
        ? tailJob.bullets
        : (origJob.bullets || [])
    }
  })

  if (tailExp.length > origExp.length) {
    for (let i = origExp.length; i < tailExp.length; i++) {
      mergedExp.push(tailExp[i])
    }
  }
  merged.experience = mergedExp

  // 6. Education & Certifications (100% preservation)
  merged.education = Array.isArray(original.education) && original.education.length > 0
    ? original.education
    : (tailored.education || [])

  merged.certifications = Array.isArray(original.certifications) && original.certifications.length > 0
    ? original.certifications
    : (tailored.certifications || [])

  return merged
}

/**
 * Generates an ATS-tailored resume using Gemini AI with 100% zero data loss guarantees.
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

  const prompt = `Tailor the following candidate resume for the target job description using purely ADDITIVE enhancements.

TARGET JOB DESCRIPTION:
Title: ${jdParsed.jobTitle || 'Software Engineer'}
Company: ${jdParsed.company || 'Target Company'}
High-Priority ATS Keywords: ${(jdParsed.atsKeywords?.highPriority || []).join(', ')}
Required Hard Skills: ${(jdParsed.skills?.required?.hardSkills || []).join(', ')}
Required Tools: ${(jdParsed.skills?.required?.tools || []).join(', ')}

CURRENT RESUME DATA (PRESERVE 100% OF ALL SKILLS, ALL PROJECTS, AND ALL LINKS):
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

  const rawResult = await callGeminiStructured({
    apiKey,
    prompt,
    systemInstruction: TAILOR_ENGINE_SYSTEM_PROMPT,
    temperature: 0.25
  })

  // Apply deterministic non-destructive merge safeguard
  const robustTailoredResume = mergeNonDestructiveResume(
    resumeParsed,
    rawResult?.tailoredResume || resumeParsed
  )

  return {
    tailoredResume: robustTailoredResume,
    changesLog: rawResult?.changesLog || [],
    skillSuggestions: rawResult?.skillSuggestions || []
  }
}
