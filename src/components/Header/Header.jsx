import React, { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import {
  FileUp,
  BarChart3,
  Wand2,
  Download,
  KeyRound,
  RotateCcw,
  Check,
  ShieldCheck,
  User,
  Cloud,
  LogOut,
  FolderOpen,
  Briefcase,
  Layers,
  Settings as SettingsIcon,
  Sparkles
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { signOutUser } from '../../services/firebase'
import ResumeDiffModal from '../ResumeDiffModal/ResumeDiffModal'
import './Header.css'

const STEPS = [
  { id: 1, path: '/app', label: 'Upload & JD', icon: FileUp },
  { id: 2, path: '/analyze', label: 'Gap Analysis', icon: BarChart3 },
  { id: 3, path: '/tailor', label: 'AI Tailor', icon: Wand2 },
  { id: 4, path: '/export', label: 'Export PDF', icon: Download }
]

export default function Header() {
  const { state, dispatch } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const [showDiffModal, setShowDiffModal] = useState(false)

  const isWizardRoute = ['/app', '/analyze', '/tailor', '/export'].includes(location.pathname)
  const currentStepObj = STEPS.find(s => s.path === location.pathname) || STEPS[0]
  const currentStep = currentStepObj.id

  const handleStepClick = (step) => {
    if (step.id === 1 || state.completedSteps[step.id] || step.id <= currentStep) {
      navigate(step.path)
    }
  }

  const handleReset = () => {
    if (window.confirm('Start over with a new resume and job description?')) {
      dispatch({ type: 'RESET_ALL' })
      navigate('/app')
    }
  }

  const handleOpenAuth = () => {
    dispatch({ type: 'TOGGLE_AUTH_MODAL', payload: true })
  }

  const handleOpenDashboard = () => {
    if (!state.currentUser) {
      dispatch({ type: 'TOGGLE_AUTH_MODAL', payload: true })
    } else {
      dispatch({ type: 'TOGGLE_DASHBOARD_MODAL', payload: true })
    }
  }

  const handleSignOut = async () => {
    try {
      await signOutUser()
      dispatch({
        type: 'SET_TOAST',
        payload: { message: 'Signed out successfully.', type: 'info' }
      })
    } catch (err) {
      console.error('Sign out error:', err)
    }
  }

  const activeResume = state.tailoredResume || state.resumeParsed
  const isTrackerActive = location.pathname === '/tracker'
  const isSettingsActive = location.pathname === '/settings'

  return (
    <>
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

          {/* Stepper Navigation (Active during Resume Optimization Workflow) */}
          {isWizardRoute ? (
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
          ) : (
            <div className="header-middle-nav">
              <Link to="/app" className={`nav-link-item ${location.pathname === '/app' ? 'nav-active' : ''}`}>
                <Sparkles size={15} />
                <span>Resume Optimizer</span>
              </Link>
              <Link to="/tracker" className={`nav-link-item ${isTrackerActive ? 'nav-active' : ''}`}>
                <Briefcase size={15} />
                <span>Job Tracker</span>
              </Link>
              <Link to="/settings" className={`nav-link-item ${isSettingsActive ? 'nav-active' : ''}`}>
                <SettingsIcon size={15} />
                <span>Profile &amp; Settings</span>
              </Link>
            </div>
          )}

          {/* Header Right Actions */}
          <div className="header-actions">
            {/* If on landing/settings, show direct CTA */}
            {!isWizardRoute && (
              <button
                type="button"
                className="btn btn-primary btn-sm header-cta-pill"
                onClick={() => navigate('/app')}
              >
                <span>Optimize Resume</span>
              </button>
            )}

            {/* Job Tracker Button (when inside wizard) */}
            {isWizardRoute && (
              <button
                type="button"
                className={`btn-header-tracker ${isTrackerActive ? 'tracker-active' : ''}`}
                onClick={() => navigate('/tracker')}
                title="Open Kanban Job Application Tracker"
              >
                <Briefcase size={14} />
                <span className="header-btn-text">Job Tracker</span>
              </button>
            )}

            {/* Score Diff Comparison Button */}
            {state.tailoredResume && isWizardRoute && (
              <button
                type="button"
                className="btn-header-diff"
                onClick={() => setShowDiffModal(true)}
                title="View Side-by-Side Version Diff & Score Growth"
              >
                <Layers size={14} />
                <span className="header-btn-text">Diff Tool</span>
              </button>
            )}

            {/* Cloud "My Resumes" Button */}
            <button
              type="button"
              className="btn-header-cloud"
              onClick={handleOpenDashboard}
              title={state.currentUser ? 'Open My Saved Resumes Dashboard' : 'Sign in to view saved resumes'}
            >
              <FolderOpen size={14} />
              <span className="header-btn-text">
                My Resumes {state.userResumes.length > 0 ? `(${state.userResumes.length})` : ''}
              </span>
            </button>

            {/* Quick "Save to Cloud" Button */}
            {activeResume && (
              <button
                type="button"
                className="btn-header-save"
                onClick={handleOpenDashboard}
                title="Save current resume to cloud"
              >
                <Cloud size={14} />
                <span className="header-btn-text">Save</span>
              </button>
            )}

            {/* Settings Quick Icon */}
            <button
              type="button"
              className={`btn-header-settings ${isSettingsActive ? 'settings-active' : ''}`}
              onClick={() => navigate('/settings')}
              title="Account & Profile Settings"
            >
              <SettingsIcon size={15} />
            </button>

            {/* User Auth Chip */}
            {state.currentUser ? (
              <div className="user-profile-menu">
                <div
                  className="user-chip"
                  onClick={() => navigate('/settings')}
                  title={`Logged in as ${state.currentUser.email} (Click to open Settings)`}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="user-avatar-mini">
                    {state.currentUser.displayName ? (
                      state.currentUser.displayName.charAt(0).toUpperCase()
                    ) : (
                      <User size={13} />
                    )}
                  </div>
                  <span className="user-chip-name">
                    {state.currentUser.displayName || state.currentUser.email.split('@')[0]}
                  </span>
                </div>
                <button
                  type="button"
                  className="btn-logout"
                  onClick={handleSignOut}
                  title="Log out of account"
                >
                  <LogOut size={14} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="btn-header-signin"
                onClick={handleOpenAuth}
              >
                <User size={14} />
                <span>Sign In</span>
              </button>
            )}

            {/* API Key Status & Config Trigger */}
            <button
              type="button"
              className={`btn-api-key ${state.apiKey ? 'api-active' : 'api-missing'}`}
              onClick={() => dispatch({ type: 'TOGGLE_API_KEY_MODAL', payload: true })}
              title={state.apiKey ? 'Gemini API Key Connected (Click to change)' : 'Set Gemini API Key'}
            >
              <KeyRound size={14} />
              <span className="api-key-text">
                {state.apiKey ? 'AI Ready' : 'Set API Key'}
              </span>
              <span className="api-status-dot" />
            </button>

            {/* Reset / New Resume Button */}
            {(state.resumeFile || state.jobDescription) && isWizardRoute && (
              <button
                type="button"
                className="btn btn-ghost btn-sm btn-header-reset"
                onClick={handleReset}
                title="Reset & Start New"
              >
                <RotateCcw size={14} />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Resume Version Diff Modal */}
      <ResumeDiffModal
        isOpen={showDiffModal}
        onClose={() => setShowDiffModal(false)}
      />
    </>
  )
}
