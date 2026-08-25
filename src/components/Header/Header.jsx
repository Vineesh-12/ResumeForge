import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { FileUp, BarChart3, Wand2, Download, KeyRound, RotateCcw, Check, ShieldCheck } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import './Header.css'

const STEPS = [
  { id: 1, path: '/', label: 'Upload & JD', icon: FileUp },
  { id: 2, path: '/analyze', label: 'Gap Analysis', icon: BarChart3 },
  { id: 3, path: '/tailor', label: 'AI Tailor', icon: Wand2 },
  { id: 4, path: '/export', label: 'Export PDF', icon: Download }
]

export default function Header() {
  const { state, dispatch } = useApp()
  const navigate = useNavigate()
  const location = useLocation()

  const currentStepObj = STEPS.find(s => s.path === location.pathname) || STEPS[0]
  const currentStep = currentStepObj.id

  const handleStepClick = (step) => {
    // Allow navigation to step 1 anytime, or to steps that are already completed
    if (step.id === 1 || state.completedSteps[step.id] || step.id <= currentStep) {
      navigate(step.path)
    }
  }

  const handleReset = () => {
    if (window.confirm('Start over with a new resume and job description?')) {
      dispatch({ type: 'RESET_ALL' })
      navigate('/')
    }
  }

  return (
    <header className="site-header glass-card">
      <div className="header-container">
        {/* Brand Logo */}
        <div className="brand-section" onClick={() => navigate('/')}>
          <div className="brand-icon">
            <ShieldCheck size={22} className="brand-svg" />
          </div>
          <div className="brand-text">
            <div className="brand-title">
              <span className="text-gradient">ResumeForge</span>
              <span className="badge-free">100% FREE</span>
            </div>
            <span className="brand-sub">Harvard-Jake ATS Engine</span>
          </div>
        </div>

        {/* 4-Step Progress Navigation */}
        <nav className="stepper-nav" aria-label="Progress Tracker">
          {STEPS.map((step, idx) => {
            const Icon = step.icon
            const isActive = step.path === location.pathname
            const isCompleted = state.completedSteps[step.id]
            const isClickable = step.id === 1 || isCompleted || step.id <= currentStep

            return (
              <React.Fragment key={step.id}>
                {idx > 0 && (
                  <div
                    className={`step-connector ${
                      isCompleted || step.id <= currentStep ? 'connector-active' : ''
                    }`}
                  />
                )}
                <button
                  type="button"
                  className={`step-item ${isActive ? 'step-active' : ''} ${
                    isCompleted ? 'step-completed' : ''
                  } ${isClickable ? 'step-clickable' : 'step-disabled'}`}
                  onClick={() => handleStepClick(step)}
                  disabled={!isClickable}
                  title={`Step ${step.id}: ${step.label}`}
                >
                  <div className="step-badge">
                    {isCompleted && !isActive ? (
                      <Check size={14} className="step-check" />
                    ) : (
                      <Icon size={15} />
                    )}
                  </div>
                  <span className="step-label">{step.label}</span>
                </button>
              </React.Fragment>
            )
          })}
        </nav>

        {/* Header Right Actions */}
        <div className="header-actions">
          {/* API Key Status & Config Trigger */}
          <button
            type="button"
            className={`btn-api-key ${state.apiKey ? 'api-active' : 'api-missing'}`}
            onClick={() => dispatch({ type: 'TOGGLE_API_KEY_MODAL', payload: true })}
            title={state.apiKey ? 'Gemini API Key Connected (Click to change)' : 'Set Gemini API Key'}
          >
            <KeyRound size={15} />
            <span className="api-key-text">
              {state.apiKey ? 'AI Ready' : 'Set API Key'}
            </span>
            <span className="api-status-dot" />
          </button>

          {/* Reset / New Resume Button */}
          {(state.resumeFile || state.jobDescription) && (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={handleReset}
              title="Reset & Start New"
            >
              <RotateCcw size={14} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
