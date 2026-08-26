import { callGeminiStructured } from './geminiService.js'

/**
 * Strips HTML tags and script/style content to extract clean text from raw web pages.
 */
function cleanHtmlContent(html) {
  if (!html) return ''
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
    .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, ' ')
    .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, ' ')
    .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, ' ')
    .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, ' ')
    .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Fetches page content using cascading multi-proxy fallbacks to bypass CORS and anti-bot blocks.
 */
async function fetchPageWithFallbacks(url) {
  // Method 1: Jina AI Markdown Reader (optimal for article/job content)
  try {
    const jinaUrl = `https://r.jina.ai/${url}`
    const res = await fetch(jinaUrl, {
      headers: {
        'Accept': 'text/plain',
        'X-No-Cache': 'true'
      }
    })
    if (res.ok) {
      const text = await res.text()
      if (text && text.trim().length > 100 && !text.includes('Security Check') && !text.includes('Just a moment...')) {
        return text
      }
    }
  } catch (err) {
    console.warn('Jina proxy failed, trying AllOrigins:', err)
  }

  // Method 2: AllOrigins JSON Proxy
  try {
    const allOriginsUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`
    const res = await fetch(allOriginsUrl)
    if (res.ok) {
      const data = await res.json()
      if (data?.contents) {
        const cleaned = cleanHtmlContent(data.contents)
        if (cleaned.length > 100) return cleaned
      }
    }
  } catch (err) {
    console.warn('AllOrigins proxy failed, trying CodeTabs:', err)
  }

  // Method 3: CodeTabs CORS Proxy
  try {
    const codeTabsUrl = `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`
    const res = await fetch(codeTabsUrl)
    if (res.ok) {
      const html = await res.text()
      const cleaned = cleanHtmlContent(html)
      if (cleaned.length > 100) return cleaned
    }
  } catch (err) {
    console.warn('CodeTabs proxy failed:', err)
  }

  throw new Error('Unable to extract job text automatically. Some sites (like LinkedIn or Workday) require account login. Please copy and paste the job description text directly.')
}

/**
 * Scrapes job posting text from a URL using client-safe reader proxy
 * and uses Gemini AI to extract structured job title, company, and requirements.
 * @param {string} rawUrl - Target job posting URL
 * @param {string} apiKey - Gemini API key
 * @returns {Promise<{ jobTitle: string, company: string, rawDescription: string }>}
 */
export async function scrapeJobDescriptionFromUrl(rawUrl, apiKey) {
  if (!rawUrl || !rawUrl.trim()) {
    throw new Error('Please enter a valid job posting URL.')
  }

  let cleanUrl = rawUrl.trim()
  if (!/^https?:\/\//i.test(cleanUrl)) {
    cleanUrl = 'https://' + cleanUrl
  }

  // Validate URL format
  try {
    new URL(cleanUrl)
  } catch {
    throw new Error('Invalid URL format. Please include a valid website link.')
  }

  // Fetch page content
  const rawContent = await fetchPageWithFallbacks(cleanUrl)

  // Detect login walls / bot challenge keywords
  const lower = rawContent.toLowerCase()
  if (
    lower.includes('sign in to view') ||
    lower.includes('join linkedin') ||
    lower.includes('please enable javascript and cookies to continue') ||
    lower.includes('access denied') ||
    lower.includes('captcha')
  ) {
    throw new Error('This job posting is behind a login wall or anti-bot shield. Please copy and paste the job description text directly into the box.')
  }

  // Extract first 10,000 characters
  const excerpt = rawContent.substring(0, 10000)

  // If no API key is set yet, return the cleaned excerpt directly
  if (!apiKey) {
    return {
      jobTitle: 'Target Role',
      company: 'Target Company',
      rawDescription: excerpt
    }
  }

  // Use Gemini AI to structure into clear sections
  const prompt = `You are an elite technical recruiter assistant. Extract the Job Title, Company Name, and the complete Job Description text (including About Role, Responsibilities, Required Qualifications, and Technical Stack) from the following scraped webpage content.
Ignore navigational links, cookie notices, header/footer text, and unrelated sidebar job recommendations.

SCRAPED WEBPAGE CONTENT:
"""
${excerpt}
"""

Return strictly valid JSON with this schema:
{
  "jobTitle": "Job Title (e.g. Senior Full Stack Engineer)",
  "company": "Company Name (e.g. Stripe)",
  "rawDescription": "Complete cleaned-up job description text formatted clearly with sections for About the Role, Key Responsibilities, and Required Qualifications."
}`

  try {
    const result = await callGeminiStructured({
      apiKey,
      prompt,
      systemInstruction: 'You extract clean, professional job descriptions from raw webpage text.',
      temperature: 0.1
    })

    const title = result?.jobTitle || 'Target Role'
    const company = result?.company || 'Target Company'
    const description = result?.rawDescription || excerpt

    return {
      jobTitle: title,
      company: company,
      rawDescription: description
    }
  } catch {
    // If structured extraction fails, return the excerpt
    return {
      jobTitle: 'Target Role',
      company: 'Target Company',
      rawDescription: excerpt
    }
  }
}
