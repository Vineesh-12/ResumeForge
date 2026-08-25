/**
 * 200+ High-Impact Technical Action Verbs categorized for ATS resumes
 */

export const ACTION_VERBS = {
  engineering: [
    'Architected', 'Engineered', 'Developed', 'Constructed', 'Implemented',
    'Designed', 'Programmed', 'Refactored', 'Built', 'Configured',
    'Integrated', 'Deployed', 'Automated', 'Provisioned', 'Standardized'
  ],
  optimization: [
    'Optimized', 'Accelerated', 'Streamlined', 'Enhanced', 'Reduced',
    'Scaled', 'Boosted', 'Upgraded', 'Overhauled', 'Maximized',
    'Diminished', 'Consolidated', 'Fine-tuned', 'Transformed'
  ],
  leadership: [
    'Spearheaded', 'Directed', 'Orchestrated', 'Championed', 'Led',
    'Mentored', 'Guided', 'Supervised', 'Coordinated', 'Facilitated',
    'Empowered', 'Pioneered', 'Mobilized', 'Delegated'
  ],
  delivery: [
    'Delivered', 'Launched', 'Shipped', 'Published', 'Executed',
    'Administered', 'Completed', 'Finalized', 'Maintained', 'Operated'
  ],
  analysis: [
    'Analyzed', 'Evaluated', 'Audited', 'Investigated', 'Diagnosed',
    'Benchmarked', 'Identified', 'Researched', 'Quantified', 'Synthesized'
  ]
}

export const WEAK_VERB_REPLACEMENTS = {
  'worked on': 'Engineered',
  'helped with': 'Collaborated on',
  'was responsible for': 'Spearheaded',
  'did': 'Executed',
  'made': 'Developed',
  'used': 'Leveraged',
  'handled': 'Administered',
  'assisted': 'Facilitated',
  'tried to': 'Optimized',
  'looked into': 'Investigated'
}

/**
 * Replaces weak action verbs in a bullet point with stronger alternatives.
 * @param {string} bullet 
 * @returns {string}
 */
export function enhanceBulletVerb(bullet) {
  if (!bullet) return ''
  let enhanced = bullet.trim()

  for (const [weak, strong] of Object.entries(WEAK_VERB_REPLACEMENTS)) {
    const regex = new RegExp(`^${weak}\\b`, 'i')
    if (regex.test(enhanced)) {
      enhanced = enhanced.replace(regex, strong)
      break
    }
  }

  return enhanced
}
