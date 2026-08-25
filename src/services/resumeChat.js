import { callGeminiStructured } from './geminiService.js'

const CHAT_COPILOT_SYSTEM_PROMPT = `You are ResumeForge AI Copilot, an elite executive career coach and professional resume editor.

CRITICAL INTENT CLASSIFICATION & PRESERVATION RULES:
1. First, classify the user's intent:
   - INTENT A: GREETING / QUESTION / ADVICE / DOUBT (e.g., "Hi", "Hello", "How is my resume?", "What is ATS?", "Should I remove project 3?", "How do I prepare for interview?").
     -> DO NOT modify or touch the resume!
     -> Set "isResumeModified": false
     -> Set "modifiedSections": []
     -> Set "updatedResume": null
     -> In "reply": Provide a warm, clear, professional answer or advice without markdown asterisks (*).

   - INTENT B: EXPLICIT EDIT / REWRITE / ADDITION / DELETION COMMAND (e.g., "Add Docker to my skills", "Make summary more leadership focused", "Shorten bullet 2", "Quantify my internship bullets").
     -> Apply the requested changes directly to the resume JSON using strong action verbs and ATS best practices.
     -> CRITICAL: Preserve all other sections and all metadata exactly as they are. DO NOT drop or strip "links", "customLinks", "isCurrentlyWorking", certification "url" / "label", education details, dates, or contact info.
     -> Set "isResumeModified": true
     -> Set "modifiedSections": ["summary"] (list of modified section names)
     -> Set "updatedResume": The complete updated resume object matching the original schema.
     -> In "reply": Explain clearly and concisely what was updated.

2. TONE AND FORMATTING:
   - Speak in a clean, polished, professional tone.
   - Avoid excessive symbols or raw asterisks. Keep text clean and readable.
   - Never remove essential factual information or links unless the user specifically asks to delete them.`

/**
 * Sends user chat instructions to Gemini AI to converse or update the resume.
 * @param {object} params
 * @param {object} params.currentResume - Current tailored resume object
 * @param {string} params.userMessage - User's instruction/prompt/question
 * @param {array} params.chatHistory - Previous messages array [{ role, text }]
 * @param {object} [params.jdParsed] - Target job description metadata
 * @param {string} params.apiKey - Gemini API Key
 * @returns {Promise<{ reply: string, isResumeModified: boolean, updatedResume: object|null, modifiedSections: string[] }>}
 */
export async function chatEditResume({
  currentResume,
  userMessage,
  chatHistory = [],
  jdParsed = null,
  apiKey
}) {
  if (!currentResume) {
    throw new Error('No resume data available to edit.')
  }
  if (!userMessage || !userMessage.trim()) {
    throw new Error('Please enter an instruction or question for the AI Copilot.')
  }

  const historyContext = chatHistory.slice(-6).map(m => `${m.role.toUpperCase()}: ${m.text}`).join('\n')

  const prompt = `CURRENT RESUME DATA (PRESERVE ALL EXISTING LINKS, DATES, AND CERTIFICATIONS):
${JSON.stringify(currentResume, null, 2)}

${jdParsed ? `TARGET JOB CONTEXT:
Job Title: ${jdParsed.jobTitle || 'Software Engineer'}
Target Skills: ${(jdParsed.atsKeywords?.highPriority || []).join(', ')}` : ''}

${historyContext ? `RECENT CONVERSATION HISTORY:
${historyContext}` : ''}

USER MESSAGE:
"""
${userMessage}
"""

Analyze the user's message. If it is a greeting, question, or inquiry, DO NOT change the resume. If it is an edit command, update the resume JSON while carefully preserving all existing links and unedited fields. Output strictly this JSON structure:
{
  "isResumeModified": true,
  "modifiedSections": ["summary"],
  "reply": "Professional explanation or helpful answer to the user.",
  "updatedResume": ${JSON.stringify(currentResume)}
}`

  return await callGeminiStructured({
    apiKey,
    prompt,
    systemInstruction: CHAT_COPILOT_SYSTEM_PROMPT,
    temperature: 0.2
  })
}
