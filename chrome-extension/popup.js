const APP_BASE_URL = 'https://resume-forge-psi.vercel.app/'

document.getElementById('btn-open-app').addEventListener('click', () => {
  chrome.tabs.create({ url: APP_BASE_URL })
})

document.getElementById('btn-extract').addEventListener('click', async () => {
  const statusBox = document.getElementById('status-box')
  statusBox.style.display = 'block'
  statusBox.className = 'status-box'
  statusBox.innerText = 'Extracting job posting from current tab...'

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (!tab || !tab.id) {
      throw new Error('No active browser tab found.')
    }

    // Inject and execute extractor script
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: extractJobContentFromPage
    })

    const extracted = results?.[0]?.result
    if (!extracted || !extracted.text || extracted.text.length < 30) {
      statusBox.className = 'status-box status-error'
      statusBox.innerText = 'Could not detect job description text on this page. Opening app...'
      setTimeout(() => {
        chrome.tabs.create({ url: APP_BASE_URL })
      }, 1500)
      return
    }

    statusBox.className = 'status-box status-success'
    statusBox.innerText = `Found "${extracted.title || 'Job Posting'}"! Opening ResumeForge...`

    // Open ResumeForge with job text encoded in URL
    const targetUrl = new URL(APP_BASE_URL)
    targetUrl.searchParams.set('jd', extracted.text.substring(0, 8000))
    targetUrl.searchParams.set('jdUrl', tab.url || '')

    setTimeout(() => {
      chrome.tabs.create({ url: targetUrl.toString() })
    }, 800)
  } catch (err) {
    statusBox.className = 'status-box status-error'
    statusBox.innerText = 'Error: ' + (err.message || 'Could not extract.')
  }
})

// Function executed in target web page context
function extractJobContentFromPage() {
  let title = ''
  let text = ''

  // 1. LinkedIn Jobs
  const linkedInDesc = document.querySelector('.jobs-description, .jobs-description-content, #job-details, .job-view-layout')
  const linkedInTitle = document.querySelector('.job-details-jobs-unified-top-card__job-title, .jobs-unified-top-card__job-title, h1')
  if (linkedInDesc) {
    text = linkedInDesc.innerText
    title = linkedInTitle ? linkedInTitle.innerText.trim() : ''
  }

  // 2. Indeed Jobs
  if (!text) {
    const indeedDesc = document.querySelector('#jobDescriptionText, .jobsearch-jobDescriptionText')
    const indeedTitle = document.querySelector('.jobsearch-JobInfoHeader-title, h1')
    if (indeedDesc) {
      text = indeedDesc.innerText
      title = indeedTitle ? indeedTitle.innerText.trim() : ''
    }
  }

  // 3. Greenhouse Jobs
  if (!text) {
    const ghContent = document.querySelector('#content, .body, #app')
    const ghTitle = document.querySelector('.app-title, h1.heading')
    if (ghContent && ghTitle) {
      text = ghContent.innerText
      title = ghTitle.innerText.trim()
    }
  }

  // 4. Lever Jobs
  if (!text) {
    const leverPost = document.querySelector('.section-wrapper, .posting-page')
    const leverTitle = document.querySelector('.posting-headline h2, h2')
    if (leverPost) {
      text = leverPost.innerText
      title = leverTitle ? leverTitle.innerText.trim() : ''
    }
  }

  // 5. Generic Fallback: Search for main article or body
  if (!text) {
    const mainEl = document.querySelector('main, article, [role="main"]')
    if (mainEl) {
      text = mainEl.innerText
    } else {
      text = document.body.innerText
    }
    const h1 = document.querySelector('h1')
    title = h1 ? h1.innerText.trim() : document.title
  }

  return {
    title,
    text: text ? text.replace(/\s+/g, ' ').trim() : ''
  }
}
