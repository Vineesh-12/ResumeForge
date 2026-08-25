import pdfToText from 'react-pdftotext'

/**
 * Maximum supported PDF file size in bytes (5MB)
 */
export const MAX_FILE_SIZE = 5 * 1024 * 1024

/**
 * Validates the uploaded file.
 * @param {File} file 
 * @returns {{ valid: boolean, error?: string }}
 */
export function validatePDFFile(file) {
  if (!file) {
    return { valid: false, error: 'No file selected.' }
  }

  // Check file type
  const isPDF = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
  if (!isPDF) {
    return { valid: false, error: 'Invalid file format. Please upload a PDF file (.pdf).' }
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1)
    return { valid: false, error: `File is too large (${sizeMB}MB). Maximum allowed size is 5MB.` }
  }

  if (file.size === 0) {
    return { valid: false, error: 'The selected PDF file is empty (0 bytes).' }
  }

  return { valid: true }
}

/**
 * Extracts all plain text content from a PDF file using client-side Web Workers.
 * @param {File} file 
 * @returns {Promise<{ text: string, wordCount: number, charCount: number }>}
 */
export async function extractTextFromPDF(file) {
  const validation = validatePDFFile(file)
  if (!validation.valid) {
    throw new Error(validation.error)
  }

  try {
    const rawText = await pdfToText(file)
    
    if (!rawText || !rawText.trim()) {
      throw new Error(
        'Could not extract text from this PDF. The document might be a scanned image or password-protected. Please ensure the PDF contains selectable text.'
      )
    }

    // Clean up excessive blank lines and normalize whitespace
    const cleanedText = rawText
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim()

    const words = cleanedText.match(/\b\S+\b/g) || []

    return {
      text: cleanedText,
      wordCount: words.length,
      charCount: cleanedText.length
    }
  } catch (err) {
    if (err.message && err.message.includes('password')) {
      throw new Error('This PDF is password-protected. Please provide an unlocked PDF.')
    }
    throw new Error(err.message || 'Failed to extract text from the PDF file.')
  }
}

/**
 * Sample resumes for instant demonstration and testing.
 */
export const SAMPLE_RESUMES = {
  softwareEngineer: {
    fileName: 'Sample_Vineet_Kumar_SWE.pdf',
    fileSize: 142850,
    text: `VINEET KUMAR
Bangalore, India • +91 98765 43210 • vineet.kumar@email.com
linkedin.com/in/vineet-kumar • github.com/vineet-kumar

PROFESSIONAL SUMMARY
Motivated Computer Science graduate with hands-on experience in full-stack web development, specializing in React.js, Node.js, and modern JavaScript. Proven ability to build responsive web apps, design RESTful APIs, and collaborate in Agile sprint teams. Passionate about software craftsmanship, clean code, and cloud infrastructure.

TECHNICAL SKILLS
• Programming Languages: JavaScript (ES6+), Python, Java, SQL, HTML5, CSS3
• Frameworks & Libraries: React.js, Express.js, Node.js, Tailwind CSS, Bootstrap
• Developer Tools: Git, GitHub, VS Code, Postman, npm, Vite
• Databases: PostgreSQL, MongoDB, MySQL
• Core Concepts: REST APIs, Object-Oriented Programming (OOP), Data Structures & Algorithms, Agile/Scrum

EXPERIENCE
Software Development Intern
InnovateTech Labs • Bangalore, India
June 2025 – August 2025
• Developed and maintained 12+ responsive React UI components, improving user onboarding workflow efficiency by 25%.
• Implemented robust REST API endpoints in Node.js and Express to handle user authentication and profile management.
• Optimized PostgreSQL database queries with indexing, reducing average API response latency from 320ms to 180ms.
• Participated in daily standups and bi-weekly sprint planning meetings following Agile methodologies.

Frontend Developer Intern
CloudScale Solutions • Remote
January 2025 – May 2025
• Built dynamic dashboard analytics pages using React and Chart.js, visualizing key performance metrics for 5,000+ active users.
• Refactored legacy CSS into modular Tailwind utility classes, cutting total frontend bundle size by 30%.
• Collaborated with backend engineers to integrate third-party payment gateway APIs and webhook listeners.

PROJECTS
DevConnect — Developer Social & Portfolio Platform | React, Node.js, PostgreSQL
• Built a full-stack platform enabling developers to showcase projects, write tech articles, and connect with peers.
• Implemented JWT-based authentication, role-based access control, and image uploads via AWS S3.
• Deployed the frontend to Vercel and backend microservices to Railway with automated CI/CD GitHub Actions.

TaskFlow — Real-time Agile Kanban Board | React, TypeScript, Firebase
• Created an interactive Kanban board application with drag-and-drop task management and real-time collaboration.
• Integrated Firebase Realtime Database for instant state synchronization across multiple simultaneous active users.
• Implemented dark mode, filter tags, and export capabilities to CSV and JSON formats.

EDUCATION
Bachelor of Technology in Computer Science & Engineering
National Institute of Technology • 2022 – 2026
• Relevant Coursework: Data Structures & Algorithms, Database Management Systems, Computer Networks, Operating Systems, Software Engineering
• CGPA: 8.7 / 10.0

CERTIFICATIONS
• Meta Front-End Developer Professional Certificate (Coursera)
• AWS Certified Cloud Practitioner (Foundational)`
  }
}
