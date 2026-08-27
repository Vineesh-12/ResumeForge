import { compareSkills, normalizeSkill } from '../utils/skillSynonyms.js'

/**
 * Escapes regex special characters safely.
 * @param {string} string 
 * @returns {string}
 */
export function escapeRegExp(string) {
  if (!string || typeof string !== 'string') return ''
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Counts keyword occurrences in text safely and accurately without false positives on single characters like "C" or symbols like "C++".
 * @param {string} text 
 * @param {string} term 
 * @returns {number}
 */
export function countKeywordOccurrences(text, term) {
  if (!text || !term) return 0
  const cleanTerm = term.trim()
  if (!cleanTerm) return 0

  // 1. Single letter programming languages or keywords (e.g., "C", "R")
  if (cleanTerm.length === 1) {
    const letter = cleanTerm.toUpperCase()
    // Match standalone single letter surrounded by word boundary or punctuation like (C, Java) or "C/C++"
    const regex = new RegExp(`(?:^|[\\s,;()\\[\\]/])${letter}(?=[\\s,;()\\[\\]/]|$)`, 'g')
    const matches = text.match(regex)
    return matches ? matches.length : 0
  }

  // 2. Terms with programming symbols (e.g. C++, C#, .NET, CI/CD, Node.js)
  if (/[+#.]/.test(cleanTerm)) {
    const escaped = escapeRegExp(cleanTerm)
    const regex = new RegExp(`(?:^|[\\s,;()\\[\\]/])${escaped}(?=[\\s,;()\\[\\]/]|$)`, 'gi')
    const matches = text.match(regex)
    return matches ? matches.length : 0
  }

  // 3. Multi-word or standard keywords (e.g., "Cybersecurity Testing", "Burp Suite", "Python")
  const escaped = escapeRegExp(cleanTerm)
  try {
    const regex = new RegExp(`\\b${escaped}\\b`, 'gi')
    const matches = text.match(regex)
    if (matches) return matches.length
  } catch {
    // Fallback if boundary construction fails
  }

  // 4. Safe whole-token normalized check (never raw substring indexOf for short words)
  const normText = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ')
  const normTerm = cleanTerm.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').trim()
  if (!normTerm) return 0

  const tokens = normText.split(/\s+/).filter(Boolean)
  const termTokens = normTerm.split(/\s+/).filter(Boolean)

  if (termTokens.length === 1) {
    return tokens.filter(t => t === termTokens[0]).length
  }

  // Multi-word sequence match
  let count = 0
  for (let i = 0; i <= tokens.length - termTokens.length; i++) {
    let match = true
    for (let j = 0; j < termTokens.length; j++) {
      if (tokens[i + j] !== termTokens[j]) {
        match = false
        break
      }
    }
    if (match) count++
  }

  return count
}

/**
 * Extracts a flattened list of all skills and competencies present in the parsed resume,
 * and constructs a comprehensive searchable text buffer including skills, summary, experience, and projects.
 * @param {object} resume 
 * @returns {{ allSkills: string[], fullText: string }}
 */
export function extractResumeCompetencies(resume) {
  if (!resume) return { allSkills: [], fullText: '' }

  const skillSet = new Set()
  let skillsText = ''

  // Extract from categorized skills object or array
  if (resume.skills) {
    if (Array.isArray(resume.skills)) {
      resume.skills.forEach(s => {
        if (s) {
          const trimmed = s.trim()
          skillSet.add(trimmed)
          skillsText += `${trimmed} `
        }
      })
    } else if (typeof resume.skills === 'object') {
      const categories = ['languages', 'frameworks', 'tools', 'databases', 'concepts', 'cloud', 'security']
      for (const cat of categories) {
        if (Array.isArray(resume.skills[cat])) {
          resume.skills[cat].forEach(s => {
            if (s) {
              const trimmed = s.trim()
              skillSet.add(trimmed)
              skillsText += `${trimmed} `
            }
          })
        }
      }
    }
  }

  // Extract from project tech stacks
  if (Array.isArray(resume.projects)) {
    resume.projects.forEach(p => {
      if (Array.isArray(p.technologies)) {
        p.technologies.forEach(t => {
          if (t) {
            const trimmed = t.trim()
            skillSet.add(trimmed)
            skillsText += `${trimmed} `
          }
        })
      }
    })
  }

  // Construct comprehensive full text representation including skills, experience, summary, and projects
  let fullText = `${resume.name || ''} ${resume.summary || ''}\n${skillsText}\n`
  if (Array.isArray(resume.experience)) {
    resume.experience.forEach(exp => {
      fullText += `${exp.title || ''} ${exp.company || ''} ${(exp.bullets || []).join(' ')}\n`
    })
  }
  if (Array.isArray(resume.projects)) {
    resume.projects.forEach(proj => {
      fullText += `${proj.name || ''} ${(proj.bullets || []).join(' ')}\n`
    })
  }

  return {
    allSkills: Array.from(skillSet),
    fullText: fullText
  }
}

/**
 * Extracts all unique required and high/medium priority keywords from the parsed JD.
 * @param {object} jd 
 * @returns {string[]}
 */
export function extractJDKeywords(jd) {
  if (!jd) return []

  const keywordSet = new Set()

  // Required skills
  if (jd.skills?.required) {
    const cats = ['hardSkills', 'tools', 'frameworks', 'softSkills']
    for (const c of cats) {
      if (Array.isArray(jd.skills.required[c])) {
        jd.skills.required[c].forEach(k => k && keywordSet.add(k.trim()))
      }
    }
  }

  // High & Medium ATS keywords
  if (jd.atsKeywords) {
    if (Array.isArray(jd.atsKeywords.highPriority)) {
      jd.atsKeywords.highPriority.forEach(k => k && keywordSet.add(k.trim()))
    }
    if (Array.isArray(jd.atsKeywords.mediumPriority)) {
      jd.atsKeywords.mediumPriority.forEach(k => k && keywordSet.add(k.trim()))
    }
    if (Array.isArray(jd.atsKeywords.lowPriority)) {
      jd.atsKeywords.lowPriority.forEach(k => k && keywordSet.add(k.trim()))
    }
  }

  return Array.from(keywordSet)
}

/**
 * Performs deep semantic gap analysis between candidate resume and target job description.
 * @param {object} resumeParsed 
 * @param {object} jdParsed 
 * @returns {object} Gap analysis report
 */
export function analyzeCompetencyGaps(resumeParsed, jdParsed) {
  const { allSkills: resumeSkills, fullText: resumeFullText } = extractResumeCompetencies(resumeParsed)
  const jdKeywords = extractJDKeywords(jdParsed)

  const matched = []
  const partial = []
  const missing = []
  const densityMap = {}

  for (const jdKw of jdKeywords) {
    let bestMatch = null
    const normJdKw = normalizeSkill(jdKw)

    // 1. Check against explicitly listed resume skills
    for (const resSkill of resumeSkills) {
      const cmp = compareSkills(jdKw, resSkill)
      if (cmp.isMatch) {
        if (!bestMatch || cmp.confidence > bestMatch.confidence) {
          bestMatch = {
            skill: jdKw,
            matchedWith: resSkill,
            confidence: cmp.confidence,
            isSynonym: cmp.isSynonym
          }
        }
      }
    }

    // 2. If not found in explicit skill lists, check in resume full text (summary/experience/projects)
    if (!bestMatch && normJdKw.length > 2) {
      const occurrences = countKeywordOccurrences(resumeFullText, jdKw)
      if (occurrences > 0) {
        bestMatch = {
          skill: jdKw,
          matchedWith: jdKw,
          confidence: 85,
          isSynonym: false,
          source: 'Experience Context'
        }
      }
    }

    // 3. Calculate keyword frequency / density safely
    let occurrences = countKeywordOccurrences(resumeFullText, jdKw)
    if (bestMatch && occurrences === 0) {
      // Ensure direct matched skills have at least 1 count from the verified match
      occurrences = 1
    }
    densityMap[jdKw] = occurrences

    // 4. Categorize into matched, partial, or missing
    if (bestMatch) {
      if (bestMatch.confidence >= 90) {
        matched.push(bestMatch)
      } else {
        partial.push(bestMatch)
      }
    } else {
      const isHighPriority = jdParsed?.atsKeywords?.highPriority?.includes(jdKw) || false
      missing.push({
        skill: jdKw,
        priority: isHighPriority ? 'high' : 'medium',
        suggestion: `Include "${jdKw}" in your skills or relevant experience bullets.`
      })
    }
  }

  const total = jdKeywords.length || 1
  const matchRate = Math.round(((matched.length + (partial.length * 0.6)) / total) * 100)

  return {
    matched,
    partial,
    missing,
    densityMap,
    metrics: {
      totalKeywords: total,
      matchedCount: matched.length,
      partialCount: partial.length,
      missingCount: missing.length,
      matchRate: Math.min(100, Math.max(0, matchRate))
    }
  }
}
