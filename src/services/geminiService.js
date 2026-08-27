/**
 * Core Gemini API Client for ResumeForge
 * Supports Google Gemini Free Tier with structured JSON generation,
 * automatic model fallback, retry with exponential backoff, and robust error recovery.
 */

const GEMINI_MODELS = [
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-3.1-flash-lite',
  'gemini-2.5-flash',
  'gemini-flash-latest',
  'gemini-flash-lite-latest'
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
      try {
        return JSON.parse(jsonCandidate)
      } catch (innerErr) {
        // continue
      }
    }
    const firstBracket = cleaned.indexOf('[')
    const lastBracket = cleaned.lastIndexOf(']')
    if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
      const arrayCandidate = cleaned.substring(firstBracket, lastBracket + 1)
      try {
        return JSON.parse(arrayCandidate)
      } catch (innerErr) {
        // continue
      }
    }
    throw new Error(`Failed to parse AI output as JSON: ${err.message}`)
  }
}

/**
 * Tests connection to Google Gemini with the provided API Key.
 * @param {string} apiKey 
 * @returns {Promise<{ success: boolean, model: string, message: string }>}
 */
export async function testGeminiApiKey(apiKey) {
  const cleanKey = (apiKey || '').trim()
  if (!cleanKey) {
    throw new Error('Please enter a Google Gemini API key first.')
  }

  let lastError = null

  for (const model of GEMINI_MODELS) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(cleanKey)}`
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: 'Respond with "OK"' }] }],
          generationConfig: { maxOutputTokens: 10 }
        }),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        return { success: true, model, message: `Connected successfully using Google ${model}!` }
      }

      const errBody = await response.json().catch(() => ({}))
      const errorMsg = errBody?.error?.message || response.statusText

      if (response.status === 400 && (errorMsg?.includes('API_KEY_INVALID') || errorMsg?.includes('API key not valid'))) {
        throw new Error('Invalid Gemini API Key. Please verify your key from Google AI Studio.')
      }

      if (response.status === 403) {
        throw new Error('API Key access forbidden. Please check your Google AI Studio project.')
      }

      if (response.status === 429) {
        console.warn(`[Gemini API] Model ${model} rate limited during test. Trying fallback...`)
        continue
      }

      if (response.status === 404) {
        console.warn(`[Gemini API] Model ${model} not available. Trying fallback...`)
        continue
      }

      lastError = new Error(`Google Gemini error (${response.status}): ${errorMsg}`)
    } catch (err) {
      if (err.message && (err.message.includes('Invalid') || err.message.includes('forbidden'))) {
        throw err
      }
      lastError = err
    }
  }

  throw lastError || new Error('Connection failed. Please check your API key and network connection.')
}

/**
 * Calls the Google Gemini API with automatic model fallback and retries.
 * @param {object} options
 * @param {string} options.apiKey - The Google Gemini API key
 * @param {string} options.prompt - The prompt text
 * @param {string} [options.systemInstruction] - The system role/instruction
 * @param {number} [options.temperature=0.2] - Generation temperature (0.0 to 1.0)
 * @param {number} [options.maxRetries=1] - Number of retry attempts for network/rate issues
 * @returns {Promise<object>} The parsed JSON object
 */
export async function callGeminiStructured({
  apiKey,
  prompt,
  systemInstruction = 'You are an expert ATS (Applicant Tracking System) optimization specialist and technical recruiter. Output strictly valid JSON.',
  temperature = 0.2,
  maxRetries = 1
}) {
  const cleanKey = (
    apiKey ||
    (typeof localStorage !== 'undefined' && localStorage.getItem('resumeforge_gemini_api_key')) ||
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) ||
    ''
  ).trim()

  if (!cleanKey) {
    throw new Error('Gemini API key is required. Please set your API key in the configuration modal.')
  }

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
            temperature: Math.min(1.0, Math.max(0.0, temperature)),
            responseMimeType: 'application/json',
            maxOutputTokens: 8192
          }
        }

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 20000)

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload),
          signal: controller.signal
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          const errorMessage = errorData?.error?.message || response.statusText

          if (response.status === 400 && (errorMessage?.includes('API_KEY_INVALID') || errorMessage?.includes('API key not valid'))) {
            throw new Error('Authentication Failed: Invalid Google Gemini API Key. Please verify in Google AI Studio.')
          }

          if (response.status === 429) {
            console.warn(`[Gemini API] Rate limit on ${model} (attempt ${attempt + 1}). Backing off...`)
            if (attempt < maxRetries) {
              await sleep(1500 * (attempt + 1))
              continue
            }
            break // Switch to next model
          }

          if (response.status === 404) {
            console.warn(`[Gemini API] Model ${model} not available. Trying fallback model...`)
            break // Break retry loop to try next model
          }

          throw new Error(`Gemini API error (${response.status}): ${errorMessage}`)
        }

        const data = await response.json()
        const parts = data?.candidates?.[0]?.content?.parts || []
        
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
        if (err.message && (err.message.includes('Authentication Failed') || err.message.includes('Invalid Google Gemini API Key'))) {
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
