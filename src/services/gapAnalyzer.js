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
 * Counts keyword occurrences in text safely without crashing on special characters like C++, CI/CD, .NET.
 * @param {string} text 
 * @param {string} term 
 * @returns {number}
 */
export function countKeywordOccurrences(text, term) {
  if (!text || !term) return 0
  const cleanTerm = term.trim()
  if (!cleanTerm) return 0

  const escaped = escapeRegExp(cleanTerm)
  try {
    const regex = new RegExp(`\\b${escaped}\\b`, 'gi')
    const matches = text.match(regex)
    if (matches) return matches.length
  } catch {
    // Fallback if boundary fails on punctuation
  }

  // Fallback substring counting
  let count = 0
  let pos = 0
  const lowerText = text.toLowerCase()
  const lowerSearch = cleanTerm.toLowerCase()
  while ((pos = lowerText.indexOf(lowerSearch, pos)) !== -1) {
    count++
    pos += lowerSearch.length
  }
  return count
}

/**
 * Extracts a flattened list of all skills and competencies present in the parsed resume.
 * @param {object} resume 
 * @returns {{ allSkills: string[], fullText: string }}
 */
export function extractResumeCompetencies(resume) {
  if (!resume) return { allSkills: [], fullText: '' }

  const skillSet = new Set()

  // Extract from categorized skills object or array
  if (resume.skills) {
    if (Array.isArray(resume.skills)) {
      resume.skills.forEach(s => s && skillSet.add(s.trim()))
    } else if (typeof resume.skills === 'object') {
      const categories = ['languages', 'frameworks', 'tools', 'databases', 'concepts']
      for (const cat of categories) {
        if (Array.isArray(resume.skills[cat])) {
          resume.skills[cat].forEach(s => s && skillSet.add(s.trim()))
        }
      }
    }
  }

  // Extract from project tech stacks
  if (Array.isArray(resume.projects)) {
    resume.projects.forEach(p => {
      if (Array.isArray(p.technologies)) {
        p.technologies.forEach(t => t && skillSet.add(t.trim()))
      }
    })
  }

  // Construct full text representation for contextual scanning
  let fullText = `${resume.summary || ''}\n`
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
    fullText: fullText.toLowerCase()
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

    // Check against explicitly listed resume skills
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

    // If not found in skill lists, check if mentioned in resume experience body
    if (!bestMatch && normJdKw.length > 2 && resumeFullText.includes(normJdKw)) {
      bestMatch = {
        skill: jdKw,
        matchedWith: jdKw,
        confidence: 80,
        isSynonym: false,
        source: 'Experience Context'
      }
    }

    // Calculate keyword frequency / density safely
    const occurrences = countKeywordOccurrences(resumeFullText, jdKw)
    densityMap[jdKw] = occurrences

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
