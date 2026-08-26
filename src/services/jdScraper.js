import { callGeminiStructured } from './geminiService.js'

/**
 * Scrapes job posting text from a URL using client-safe reader proxy
 * and uses Gemini AI to extract structured job title, company, and requirements.
 * @param {string} url - Target job posting URL
 * @param {string} apiKey - Gemini API key
 * @returns {Promise<{ jobTitle: string, company: string, rawDescription: string }>}
 */
export async function scrapeJobDescriptionFromUrl(url, apiKey) {
  if (!url || !url.trim()) {
    throw new Error('Please enter a valid job posting URL.')
  }

  const cleanUrl = url.trim()

  // 1. Fetch page content via reader proxy (jina.ai reader bypasses CORS & returns clean markdown)
  let rawText = ''
  try {
    const readerUrl = `https://r.jina.ai/${cleanUrl}`
    const response = await fetch(readerUrl, {
      headers: {
        'Accept': 'text/plain',
        'X-No-Cache': 'true'
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch job posting (Status: ${response.status})`)
    }

    rawText = await response.text()
    if (!rawText || rawText.length < 50) {
      throw new Error('Retrieved webpage content was too short. Please paste the job description text manually.')
    }
  } catch (err) {
    console.warn('Reader proxy fetch failed, attempting backup fetch:', err)
    // Fallback: try allorigins proxy
    try {
      const backupUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(cleanUrl)}`
      const backupRes = await fetch(backupUrl)
      if (!backupRes.ok) throw new Error('Backup fetch failed.')
      rawText = await backupRes.text()
    } catch {
      throw new Error('Could not access the job posting URL directly due to website restrictions. Please copy and paste the job description text manually.')
    }
  }

  // Trim to first 12,000 characters to keep within context limits
  const pageExcerpt = rawText.substring(0, 12000)

  // 2. Use Gemini AI to extract the clean job description text, title, and company
  const prompt = `You are a technical recruiter assistant. Extract the Job Title, Company Name, and the complete Job Description text (including responsibilities, requirements, and tech stack) from the following scraped webpage content. Ignore navigational headers, footers, cookie banners, and irrelevant website clutter.

SCRAPED WEBPAGE CONTENT:
"""
${pageExcerpt}
"""

Return strictly valid JSON with this schema:
{
  "jobTitle": "Job Title (e.g. Senior Full Stack Engineer)",
  "company": "Company Name (e.g. Stripe)",
  "rawDescription": "Complete cleaned-up job description text formatted clearly with sections for About the Role, Responsibilities, and Required Qualifications."
}`

  const result = await callGeminiStructured({
    apiKey,
    prompt,
    systemInstruction: 'You extract clean, professional job description text from raw scraped web content.',
    temperature: 0.1
  })

  return {
    jobTitle: result?.jobTitle || 'Target Role',
    company: result?.company || 'Target Company',
    rawDescription: result?.rawDescription || pageExcerpt
  }
}
