import React, { useState, useEffect, useRef } from 'react'
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
  LogOut,
  FolderOpen,
  Briefcase,
  Layers,
  Settings as SettingsIcon,
  Sparkles,
  ChevronDown,
  Lock,
  ExternalLink
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
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const profileMenuRef = useRef(null)

  const isWizardRoute = ['/app', '/analyze', '/tailor', '/export'].includes(location.pathname)
  const currentStepObj = STEPS.find(s => s.path === location.pathname) || STEPS[0]
  const currentStep = currentStepObj.id

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setIsProfileMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

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
    setIsProfileMenuOpen(false)
    dispatch({ type: 'TOGGLE_AUTH_MODAL', payload: true })
  }

  const handleOpenDashboard = () => {
    setIsProfileMenuOpen(false)
    if (!state.currentUser) {
      dispatch({ type: 'TOGGLE_AUTH_MODAL', payload: true })
    } else {
      dispatch({ type: 'TOGGLE_DASHBOARD_MODAL', payload: true })
    }
  }

  const handleOpenApiKeyModal = () => {
    setIsProfileMenuOpen(false)
    dispatch({ type: 'TOGGLE_API_KEY_MODAL', payload: true })
  }

  const handleNavigateToSettings = () => {
    setIsProfileMenuOpen(false)
    navigate('/settings')
  }

  const handleSignOut = async () => {
    setIsProfileMenuOpen(false)
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

  const isTrackerActive = location.pathname === '/tracker'

  return (
    <>
      <header className="site-header glass-card">
        <div className="header-container">
          {/* FAR LEFT: Brand Logo */}
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

          {/* CENTER: Navigation (Wizard Stepper or Clean 2-Link Menu) */}
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
            </div>
          )}

          {/* FAR RIGHT: Consolidated Action Hub & Profile Dropdown */}
          <div className="header-actions">
            {/* Diff Tool Button (Only appears when viewing tailored version in wizard) */}
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

            {/* Reset / New Resume Button (Inside wizard only) */}
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

            {/* Consolidated Profile Hub Dropdown */}
            <div className="profile-hub-wrapper" ref={profileMenuRef}>
              {state.currentUser ? (
                <button
                  type="button"
                  className={`user-profile-trigger ${isProfileMenuOpen ? 'active' : ''}`}
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  title="Open Profile & Settings Menu"
                >
                  <div className="user-avatar-mini">
                    {state.currentUser.displayName ? (
                      state.currentUser.displayName.charAt(0).toUpperCase()
                    ) : (
                      <User size={13} />
                    )}
                  </div>
                  <span className="user-profile-name">
                    {state.currentUser.displayName || state.currentUser.email.split('@')[0]}
                  </span>
                  <ChevronDown size={14} className={`chevron-icon ${isProfileMenuOpen ? 'chevron-rotated' : ''}`} />
                </button>
              ) : (
                <div className="guest-profile-group">
                  <button
                    type="button"
                    className="btn-header-signin"
                    onClick={handleOpenAuth}
                  >
                    <User size={14} />
                    <span>Sign In</span>
                  </button>
                  <button
                    type="button"
                    className={`btn-guest-menu-toggle ${isProfileMenuOpen ? 'active' : ''}`}
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    title="Open Quick Settings"
                  >
                    <ChevronDown size={14} className={`chevron-icon ${isProfileMenuOpen ? 'chevron-rotated' : ''}`} />
                  </button>
                </div>
              )}

              {/* Dropdown Menu Popup */}
              {isProfileMenuOpen && (
                <div className="profile-dropdown-menu animate-fade-in">
                  {state.currentUser && (
                    <div className="dropdown-user-header">
                      <div className="dropdown-avatar">
                        {state.currentUser.displayName ? (
                          state.currentUser.displayName.charAt(0).toUpperCase()
                        ) : (
                          <User size={18} />
                        )}
                      </div>
                      <div className="dropdown-user-info">
                        <span className="dropdown-user-name">
                          {state.currentUser.displayName || 'Candidate'}
                        </span>
                        <span className="dropdown-user-email">
                          {state.currentUser.email}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="dropdown-items-stack">
                    {/* Item 1: Profile & Settings */}
                    <button
                      type="button"
                      className="dropdown-item-btn"
                      onClick={handleNavigateToSettings}
                    >
                      <div className="dropdown-item-icon">
                        <SettingsIcon size={16} />
                      </div>
                      <div className="dropdown-item-text">
                        <span>Profile &amp; Settings</span>
                        <small>Contact defaults &amp; templates</small>
                      </div>
                    </button>

                    {/* Item 2: My Saved Resumes */}
                    <button
                      type="button"
                      className="dropdown-item-btn"
                      onClick={handleOpenDashboard}
                    >
                      <div className="dropdown-item-icon">
                        <FolderOpen size={16} />
                      </div>
                      <div className="dropdown-item-text">
                        <span>My Resumes</span>
                        <small>
                          {state.userResumes.length > 0
                            ? `${state.userResumes.length} saved in cloud`
                            : 'Cloud backup storage'}
                        </small>
                      </div>
                    </button>

                    {/* Item 3: Gemini AI Engine Status */}
                    <button
                      type="button"
                      className="dropdown-item-btn"
                      onClick={handleOpenApiKeyModal}
                    >
                      <div className="dropdown-item-icon">
                        <KeyRound size={16} />
                      </div>
                      <div className="dropdown-item-text">
                        <div className="dropdown-row-flex">
                          <span>AI Engine Key</span>
                          <span className={`badge-api-chip ${state.apiKey ? 'chip-active' : 'chip-missing'}`}>
                            {state.apiKey ? 'Ready' : 'Set Key'}
                          </span>
                        </div>
                        <small>Google Gemini 2.5 Flash</small>
                      </div>
                    </button>
                  </div>

                  {/* Sign Out / Sign In Footer */}
                  <div className="dropdown-footer">
                    {state.currentUser ? (
                      <button
                        type="button"
                        className="dropdown-logout-btn"
                        onClick={handleSignOut}
                      >
                        <LogOut size={15} />
                        <span>Sign Out</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="dropdown-signin-btn"
                        onClick={handleOpenAuth}
                      >
                        <User size={15} />
                        <span>Sign In with Google / Email</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
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
