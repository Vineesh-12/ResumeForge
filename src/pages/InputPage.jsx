import React, { useState, useEffect } from 'react'
import {
  FileUp,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Globe,
  FileText,
  RotateCw,
  Link as LinkIcon
} from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import ResumeUpload from '../components/ResumeUpload/ResumeUpload'
import LoadingOverlay from '../components/LoadingOverlay/LoadingOverlay'
import { parseResumeWithAI } from '../services/resumeAnalyzer'
import { parseJobDescriptionWithAI } from '../services/jdAnalyzer'
import { analyzeCompetencyGaps } from '../services/gapAnalyzer'
import { calculateATSScore } from '../services/atsScorer'
import { scrapeJobDescriptionFromUrl } from '../services/jdScraper'
import './InputPage.css'

export default function InputPage() {
  const { state, dispatch } = useApp()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [jdTab, setJdTab] = useState('text') // 'text' | 'url'
  const [jobUrl, setJobUrl] = useState('')
  const [isScraping, setIsScraping] = useState(false)

  const [aiState, setAiState] = useState({
    isLoading: false,
    message: '',
    step: 1,
    progress: 0
  })

  // Handle Chrome Extension or query param pre-fills (?jd=... or ?jdUrl=...)
  useEffect(() => {
    const jdParam = searchParams.get('jd')
    const urlParam = searchParams.get('jdUrl')

    if (jdParam && !state.jobDescription) {
      dispatch({ type: 'SET_JOB_DESCRIPTION', payload: jdParam })
      dispatch({
        type: 'SET_TOAST',
        payload: { message: 'Job Description imported from browser extension!', type: 'success' }
      })
    } else if (urlParam && !state.jobDescription) {
      setJobUrl(urlParam)
      setJdTab('url')
    }
  }, [searchParams])

  const hasResume = Boolean(state.resumeRawText && state.resumeRawText.trim().length > 0)
  const hasJD = Boolean(state.jobDescription && state.jobDescription.trim().length > 30)

  const handleScrapeUrl = async (e) => {
    e?.preventDefault()
    if (!jobUrl || !jobUrl.trim()) {
      dispatch({ type: 'SET_ERROR', payload: 'Please enter a valid job posting URL.' })
      return
    }

    setIsScraping(true)
    try {
      const result = await scrapeJobDescriptionFromUrl(jobUrl, state.apiKey)
      dispatch({ type: 'SET_JOB_DESCRIPTION', payload: result.rawDescription })
      setJdTab('text')
      dispatch({
        type: 'SET_TOAST',
        payload: {
          message: result.company !== 'Target Company'
            ? `Extracted "${result.jobTitle}" at ${result.company}!`
            : 'Job description extracted and filled successfully!',
          type: 'success'
        }
      })
    } catch (err) {
      console.error('Scraping error:', err)
      dispatch({
        type: 'SET_ERROR',
        payload: err.message || 'Could not extract job description from URL. Please paste text directly.'
      })
    } finally {
      setIsScraping(false)
    }
  }

  const handleStartAnalysis = async () => {
    if (!hasResume) {
      dispatch({
        type: 'SET_ERROR',
        payload: 'Please upload your resume PDF or load a sample resume first.'
      })
      return
    }

    if (!hasJD) {
      dispatch({
        type: 'SET_ERROR',
        payload: 'Please paste a job description (at least 30 characters).'
      })
      return
    }

    if (!state.apiKey) {
      dispatch({ type: 'TOGGLE_API_KEY_MODAL', payload: true })
      dispatch({
        type: 'SET_ERROR',
        payload: 'Please enter your Google Gemini API key to run the AI analyzer.'
      })
      return
    }

    dispatch({ type: 'CLEAR_ERROR' })

    try {
      // Step 1: Parse Resume with AI
      setAiState({
        isLoading: true,
        message: 'Parsing resume structure, experience metrics, and technical competencies...',
        step: 1,
        progress: 25
      })

      let parsedResume = state.resumeParsed
      if (!parsedResume) {
        parsedResume = await parseResumeWithAI(state.resumeRawText, state.apiKey)
        dispatch({
          type: 'SET_RESUME_DATA',
          payload: { parsed: parsedResume }
        })
      }

      // Step 2: Parse Job Description with AI
      setAiState({
        isLoading: true,
        message: 'Analyzing target Job Description for critical ATS keywords and requirements...',
        step: 2,
        progress: 65
      })

      const parsedJD = await parseJobDescriptionWithAI(state.jobDescription, state.apiKey)
      dispatch({
        type: 'SET_JD_PARSED',
        payload: parsedJD
      })

      // Step 3: Compute Gap Analysis & 100-Point ATS Score
      setAiState({
        isLoading: true,
        message: 'Synthesizing competency gap matrix and ATS matching diagnostics...',
        step: 3,
        progress: 95
      })

      const gaps = analyzeCompetencyGaps(parsedResume, parsedJD)
      const atsReport = calculateATSScore(parsedResume, parsedJD, gaps)

      dispatch({
        type: 'SET_GAP_ANALYSIS',
        payload: {
          gapAnalysis: gaps,
          atsScore: atsReport.totalScore,
          atsGrade: atsReport.grade,
          atsBreakdown: atsReport.breakdown
        }
      })

      // Allow visual completion animation
      await new Promise((resolve) => setTimeout(resolve, 500))

      setAiState({ isLoading: false, message: '', step: 1, progress: 100 })
      navigate('/analyze')
    } catch (err) {
      console.error('AI Analysis failed:', err)
      setAiState({ isLoading: false, message: '', step: 1, progress: 0 })

      if (err.message && (err.message.includes('API key') || err.message.includes('Authentication Failed'))) {
        dispatch({ type: 'TOGGLE_API_KEY_MODAL', payload: true })
      }

      dispatch({
        type: 'SET_ERROR',
        payload: err.message || 'AI Analysis encountered an error. Please try again.'
      })
    }
  }

  return (
    <div className="page-container input-page animate-fade-up">
      {/* Real-time AI Progress Loading Overlay */}
      <LoadingOverlay
        isOpen={aiState.isLoading}
        message={aiState.message}
        step={aiState.step}
        progress={aiState.progress}
      />

      {/* Hero Header */}
      <div className="page-hero">
        <div className="hero-badge animate-pulse">
          <Sparkles size={14} />
          <span>Step 1 of 4 • Free ATS Optimization</span>
        </div>
        <h1 className="page-title">
          Tailor Your Resume for <span className="text-gradient">Any Job in Seconds</span>
        </h1>
        <p className="page-subtitle">
          Upload your existing resume PDF and paste the target job description or job URL. 
          Our AI extracts keywords, detects gaps, and reformats into the battle-tested Harvard-Jake ATS format.
        </p>
      </div>

      {/* Two-Panel Input Grid */}
      <div className="input-grid">
        {/* Left: Resume Upload Card */}
        <div className="glass-card input-card">
          <div className="card-header">
            <div className="card-icon-badge">
              <FileUp size={20} />
            </div>
            <div>
              <h3>1. Upload Your Resume</h3>
              <p className="text-sm text-muted">PDF format • Max 5MB • 100% In-Browser</p>
            </div>
            {hasResume && (
              <span className="badge badge-success" style={{ marginLeft: 'auto' }}>
                <CheckCircle2 size={13} /> Loaded
              </span>
            )}
          </div>

          {/* Interactive Resume Upload Component */}
          <ResumeUpload />
        </div>

        {/* Right: Job Description Card with Dual-Input Tabs */}
        <div className="glass-card input-card">
          <div className="card-header">
            <div className="card-icon-badge badge-cyan">
              <Sparkles size={20} />
            </div>
            <div>
              <h3>2. Job Description</h3>
              <p className="text-sm text-muted">Paste job text or import directly from URL</p>
            </div>
            {hasJD && (
              <span className="badge badge-success" style={{ marginLeft: 'auto' }}>
                <CheckCircle2 size={13} /> Ready
              </span>
            )}
          </div>

          {/* Tab Selection */}
          <div className="jd-tab-switcher">
            <button
              type="button"
              className={`jd-tab-btn ${jdTab === 'text' ? 'active' : ''}`}
              onClick={() => setJdTab('text')}
            >
              <FileText size={14} />
              <span>Paste Text</span>
            </button>
            <button
              type="button"
              className={`jd-tab-btn ${jdTab === 'url' ? 'active' : ''}`}
              onClick={() => setJdTab('url')}
            >
              <Globe size={14} />
              <span>Import from Job URL</span>
              <span className="badge-new">New</span>
            </button>
          </div>

          {jdTab === 'url' ? (
            <div className="jd-url-import-panel">
              <p className="text-xs text-muted" style={{ marginBottom: 'var(--space-2)' }}>
                Paste any job posting URL from <strong>LinkedIn</strong>, <strong>Indeed</strong>, <strong>Greenhouse</strong>, <strong>Lever</strong>, or company careers pages:
              </p>
              <form onSubmit={handleScrapeUrl} className="jd-url-form">
                <div className="input-url-wrapper">
                  <LinkIcon size={16} className="url-icon" />
                  <input
                    type="url"
                    className="input-control jd-url-input"
                    placeholder="https://www.linkedin.com/jobs/view/..."
                    value={jobUrl}
                    onChange={(e) => setJobUrl(e.target.value)}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary btn-scrape"
                  disabled={isScraping || !jobUrl.trim()}
                >
                  {isScraping ? (
                    <>
                      <RotateCw size={14} className="animate-spin" />
                      <span>Extracting...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} />
                      <span>Extract &amp; Fill</span>
                    </>
                  )}
                </button>
              </form>
              <span className="text-xs text-muted">
                💡 AI will automatically parse the company, title, and requirements.
              </span>
            </div>
          ) : (
            <div className="jd-placeholder-zone">
              <textarea
                className="textarea-control jd-textarea"
                placeholder="Paste the full job posting here (e.g. from LinkedIn, Indeed, Greenhouse, Workday, Lever)..."
                value={state.jobDescription}
                onChange={(e) => dispatch({ type: 'SET_JOB_DESCRIPTION', payload: e.target.value })}
                rows={8}
              />
              <div className="jd-footer">
                <span className="text-xs text-muted">
                  {state.jobDescription.length} characters
                </span>
                {state.jobDescription && (
                  <button
                    type="button"
                    className="btn-clear-jd"
                    onClick={() => dispatch({ type: 'SET_JOB_DESCRIPTION', payload: '' })}
                  >
                    Clear Text
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action CTA Bar */}
      <div className="cta-action-bar">
        <button
          type="button"
          className="btn btn-primary btn-lg"
          onClick={handleStartAnalysis}
          disabled={!hasResume || !hasJD || aiState.isLoading}
        >
          <span>Run ATS Gap Analysis</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  )
}
