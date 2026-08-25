/**
 * Core Gemini API Client for ResumeForge
 * Supports Google Gemini Free Tier with structured JSON generation,
 * automatic model fallback, retry with exponential backoff, and robust error recovery.
 */

const GEMINI_MODELS = [
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-3.1-flash-lite'
]

/**
 * Sleeps for the specified number of milliseconds.
 * @param {number} ms 
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Clean and parse JSON response from LLM output.
 * Handles cases where markdown code blocks (```json ... ```) wrap the response.
 * @param {string} text 
 * @returns {object}
 */
export function safeParseJSON(text) {
  if (!text || typeof text !== 'string') {
    throw new Error('Empty response received from AI model.')
  }

  // Remove markdown code fences if present
  let cleaned = text.trim()
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7)
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3)
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3)
  }
  cleaned = cleaned.trim()

  try {
    return JSON.parse(cleaned)
  } catch (err) {
    // Attempt to extract the first valid JSON object or array substring
    const firstBrace = cleaned.indexOf('{')
    const lastBrace = cleaned.lastIndexOf('}')
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const jsonCandidate = cleaned.substring(firstBrace, lastBrace + 1)
      return JSON.parse(jsonCandidate)
    }
    throw new Error(`Failed to parse AI output as JSON: ${err.message}`)
  }
}

/**
 * Calls the Google Gemini API with automatic model fallback and retries.
 * @param {object} options
 * @param {string} options.apiKey - The Google Gemini API key
 * @param {string} options.prompt - The prompt text
 * @param {string} [options.systemInstruction] - The system role/instruction
 * @param {number} [options.temperature=0.2] - Generation temperature (0.0 to 1.0)
 * @param {number} [options.maxRetries=2] - Number of retry attempts for network/rate issues
 * @returns {Promise<object>} The parsed JSON object
 */
export async function callGeminiStructured({
  apiKey,
  prompt,
  systemInstruction = 'You are an expert ATS (Applicant Tracking System) optimization specialist and technical recruiter. Output strictly valid JSON.',
  temperature = 0.2,
  maxRetries = 2
}) {
  if (!apiKey || !apiKey.trim()) {
    throw new Error('Gemini API key is required. Please set your API key in the configuration modal.')
  }

  const cleanKey = apiKey.trim()
  let lastError = null

  // Try each model in preference order
  for (const model of GEMINI_MODELS) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(cleanKey)}`

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const payload = {
          contents: [
            {
              role: 'user',
              parts: [{ text: prompt }]
            }
          ],
          systemInstruction: systemInstruction
            ? {
                parts: [{ text: systemInstruction }]
              }
            : undefined,
          generationConfig: {
            temperature,
            responseMimeType: 'application/json'
          }
        }

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        })

        if (!response.ok) {
          const errorBody = await response.json().catch(() => ({}))
          const errorMessage = errorBody?.error?.message || `HTTP ${response.status} ${response.statusText}`

          // Handle Rate Limiting (429) -> Wait with backoff and retry
          if (response.status === 429 && attempt < maxRetries) {
            const backoffMs = Math.pow(2, attempt) * 1500
            console.warn(`[Gemini API] Rate limit encountered (429). Retrying in ${backoffMs}ms...`)
            await sleep(backoffMs)
            continue
          }

          // Handle Invalid Key (400/403)
          if (response.status === 400 || response.status === 403) {
            throw new Error(`Gemini API Key Authentication Failed: ${errorMessage}. Please check your API key.`)
          }

          // Model not found or deprecated -> move to next model
          if (response.status === 404) {
            console.warn(`[Gemini API] Model ${model} not available. Trying fallback model...`)
            break // Break retry loop to try next model
          }

          throw new Error(`Gemini API error (${response.status}): ${errorMessage}`)
        }

        const data = await response.json()
        const parts = data?.candidates?.[0]?.content?.parts || []
        
        // Find the text part (ignoring thoughts if separate)
        let candidateText = ''
        for (let i = parts.length - 1; i >= 0; i--) {
          if (parts[i].text && !parts[i].thought) {
            candidateText = parts[i].text
            break
          }
        }

        if (!candidateText && parts.length > 0) {
          candidateText = parts[0].text
        }

        if (!candidateText) {
          throw new Error('Gemini API returned an empty completion candidate.')
        }

        return safeParseJSON(candidateText)
      } catch (err) {
        lastError = err
        // If authentication error, don't keep retrying across models
        if (err.message && err.message.includes('Authentication Failed')) {
          throw err
        }
        if (attempt < maxRetries) {
          await sleep(1000 * (attempt + 1))
        }
      }
    }
  }

  throw lastError || new Error('All Gemini AI model attempts failed. Please verify your internet connection and API key.')
}
