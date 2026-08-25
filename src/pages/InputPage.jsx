import React, { useState } from 'react'
import { FileUp, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import ResumeUpload from '../components/ResumeUpload/ResumeUpload'
import LoadingOverlay from '../components/LoadingOverlay/LoadingOverlay'
import { parseResumeWithAI } from '../services/resumeAnalyzer'
import { parseJobDescriptionWithAI } from '../services/jdAnalyzer'
import { analyzeCompetencyGaps } from '../services/gapAnalyzer'
import { calculateATSScore } from '../services/atsScorer'
import './InputPage.css'

export default function InputPage() {
  const { state, dispatch } = useApp()
  const navigate = useNavigate()

  const [aiState, setAiState] = useState({
    isLoading: false,
    message: '',
    step: 1,
    progress: 0
  })

  const hasResume = Boolean(state.resumeRawText && state.resumeRawText.trim().length > 0)
  const hasJD = Boolean(state.jobDescription && state.jobDescription.trim().length > 30)

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
          Upload your existing resume PDF and paste the target job description. 
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

        {/* Right: Job Description Card */}
        <div className="glass-card input-card">
          <div className="card-header">
            <div className="card-icon-badge badge-cyan">
              <Sparkles size={20} />
            </div>
            <div>
              <h3>2. Paste Job Description</h3>
              <p className="text-sm text-muted">Target role requirements, skills &amp; keywords</p>
            </div>
            {hasJD && (
              <span className="badge badge-success" style={{ marginLeft: 'auto' }}>
                <CheckCircle2 size={13} /> Ready
              </span>
            )}
          </div>

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
            </div>
          </div>
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
