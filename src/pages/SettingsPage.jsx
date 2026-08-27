import React, { useState, useEffect } from 'react'
import {
  User,
  Key,
  Sliders,
  Shield,
  Download,
  Trash2,
  CheckCircle2,
  ExternalLink,
  Eye,
  EyeOff,
  Save,
  RotateCcw,
  Sparkles,
  FileText,
  Briefcase,
  AlertTriangle
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { getJobApplications } from '../services/trackerService'
import { getUserResumes } from '../services/firebase'
import './SettingsPage.css'

const SETTINGS_STORAGE_KEY = 'resumeforge_user_settings'

export default function SettingsPage() {
  const { state, dispatch } = useApp()

  // Profile Form State
  const [profile, setProfile] = useState({
    fullName: '',
    targetTitle: '',
    email: '',
    phone: '',
    location: '',
    linkedIn: '',
    github: '',
    website: ''
  })

  // Preferences Form State
  const [preferences, setPreferences] = useState({
    defaultTemplate: 'harvard', // 'harvard' | 'tech' | 'executive' | 'modern'
    paperFormat: 'letter',      // 'letter' | 'a4'
    autoSaveEnabled: true
  })

  // API Key State
  const [apiKeyInput, setApiKeyInput] = useState('')
  const [showApiKey, setShowApiKey] = useState(false)
  const [isSavedToast, setIsSavedToast] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  // Load existing settings
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed.profile) setProfile(parsed.profile)
        if (parsed.preferences) setPreferences(parsed.preferences)
      } else if (state.resumeParsed) {
        // Pre-fill from currently parsed resume
        setProfile({
          fullName: state.resumeParsed.name || '',
          targetTitle: state.jdParsed?.jobTitle || '',
          email: state.resumeParsed.contact?.email || state.currentUser?.email || '',
          phone: state.resumeParsed.contact?.phone || '',
          location: state.resumeParsed.contact?.location || '',
          linkedIn: state.resumeParsed.contact?.linkedIn || '',
          github: state.resumeParsed.contact?.github || '',
          website: state.resumeParsed.contact?.website || ''
        })
      }
    } catch (err) {
      console.warn('Failed to load user settings:', err)
    }

    if (state.apiKey) {
      setApiKeyInput(state.apiKey)
    }
  }, [state.apiKey, state.currentUser])

  // Save Settings
  const handleSaveSettings = (e) => {
    e?.preventDefault()

    const payload = {
      profile,
      preferences,
      updatedAt: new Date().toISOString()
    }

    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(payload))
      
      // Also update global API key if modified
      if (apiKeyInput.trim() !== state.apiKey) {
        dispatch({ type: 'SET_API_KEY', payload: apiKeyInput.trim() })
      }

      dispatch({
        type: 'SET_TOAST',
        payload: { message: 'Settings & Contact Defaults saved successfully!', type: 'success' }
      })

      setIsSavedToast(true)
      setTimeout(() => setIsSavedToast(false), 3000)
    } catch (err) {
      console.error('Failed to save settings:', err)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to save settings to local storage.' })
    }
  }

  // Export All Data as JSON Archive
  const handleExportDataArchive = async () => {
    try {
      const applications = await getJobApplications(state.currentUser?.uid)
      let cloudResumes = []
      if (state.currentUser) {
        try {
          cloudResumes = await getUserResumes(state.currentUser.uid)
        } catch {
          cloudResumes = state.userResumes || []
        }
      }

      const archive = {
        app: 'ResumeForge',
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        user: {
          uid: state.currentUser?.uid || 'guest_user',
          email: state.currentUser?.email || profile.email || 'guest@resumeforge.local',
          profile
        },
        preferences,
        currentActiveResume: state.tailoredResume || state.resumeParsed,
        savedCloudResumes: cloudResumes,
        jobApplications: applications
      }

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(archive, null, 2))
      const downloadAnchor = document.createElement('a')
      downloadAnchor.setAttribute('href', dataStr)
      downloadAnchor.setAttribute('download', `ResumeForge_Archive_${new Date().toISOString().slice(0, 10)}.json`)
      document.body.appendChild(downloadAnchor)
      downloadAnchor.click()
      downloadAnchor.remove()

      dispatch({
        type: 'SET_TOAST',
        payload: { message: 'Full data archive exported as JSON!', type: 'success' }
      })
    } catch (err) {
      console.error('Failed to export data:', err)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to generate data archive.' })
    }
  }

  // Apply Contact Defaults to Active Resume
  const handleApplyDefaultsToResume = () => {
    const target = state.tailoredResume || state.resumeParsed
    if (!target) {
      dispatch({ type: 'SET_ERROR', payload: 'No active resume found. Upload a resume first.' })
      return
    }

    const updated = {
      ...target,
      name: profile.fullName || target.name,
      contact: {
        ...target.contact,
        email: profile.email || target.contact?.email,
        phone: profile.phone || target.contact?.phone,
        location: profile.location || target.contact?.location,
        linkedIn: profile.linkedIn || target.contact?.linkedIn,
        github: profile.github || target.contact?.github,
        website: profile.website || target.contact?.website
      }
    }

    if (state.tailoredResume) {
      dispatch({ type: 'SET_TAILORED_RESUME', payload: updated })
    } else {
      dispatch({ type: 'SET_RESUME_PARSED', payload: updated })
    }

    dispatch({
      type: 'SET_TOAST',
      payload: { message: 'Contact defaults applied to active resume canvas!', type: 'success' }
    })
  }

  // Wipe All Local Data
  const handleWipeData = () => {
    try {
      localStorage.removeItem(SETTINGS_STORAGE_KEY)
      localStorage.removeItem('resumeforge_job_applications')
      localStorage.removeItem('resumeforge_api_key')
      setShowDeleteModal(false)
      dispatch({ type: 'RESET_STATE' })
      dispatch({
        type: 'SET_TOAST',
        payload: { message: 'All local data and cache have been wiped clean.', type: 'info' }
      })
    } catch (err) {
      console.error('Failed to wipe data:', err)
    }
  }

  return (
    <div className="settings-page-container animate-fade-up">
      {/* Header Banner */}
      <div className="settings-header">
        <div className="settings-header-title">
          <div className="settings-avatar-badge">
            <User size={22} />
          </div>
          <div>
            <h1>Account &amp; Profile Settings</h1>
            <p className="text-sm text-muted">
              Manage your global contact defaults, persistent AI keys, template preferences, and data privacy.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={handleSaveSettings}
        >
          <Save size={16} />
          <span>Save Changes</span>
        </button>
      </div>

      <form onSubmit={handleSaveSettings} className="settings-grid">
        {/* Left Column: Personal Defaults & Preferences */}
        <div className="settings-main-col">
          {/* Card 1: Candidate Contact Defaults */}
          <div className="glass-card settings-card">
            <div className="settings-card-header">
              <div className="card-icon-pill">
                <User size={18} />
              </div>
              <div>
                <h3>Personal Profile &amp; Contact Defaults</h3>
                <p className="text-xs text-muted">
                  These details automatically pre-fill your contact header on newly optimized resumes.
                </p>
              </div>
            </div>

            <div className="settings-form-grid">
              <div className="form-group">
                <label>Full Legal Name</label>
                <input
                  type="text"
                  className="input-control"
                  placeholder="e.g. Alex Morgan"
                  value={profile.fullName}
                  onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Target Job Title</label>
                <input
                  type="text"
                  className="input-control"
                  placeholder="e.g. Senior Full Stack Engineer"
                  value={profile.targetTitle}
                  onChange={(e) => setProfile({ ...profile, targetTitle: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  className="input-control"
                  placeholder="e.g. alex.morgan@gmail.com"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  className="input-control"
                  placeholder="e.g. +1 (555) 019-2834"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Location / Timezone</label>
                <input
                  type="text"
                  className="input-control"
                  placeholder="e.g. San Francisco, CA (PST)"
                  value={profile.location}
                  onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>LinkedIn Profile URL</label>
                <input
                  type="url"
                  className="input-control"
                  placeholder="e.g. linkedin.com/in/alexmorgan"
                  value={profile.linkedIn}
                  onChange={(e) => setProfile({ ...profile, linkedIn: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>GitHub Profile URL</label>
                <input
                  type="url"
                  className="input-control"
                  placeholder="e.g. github.com/alexmorgan"
                  value={profile.github}
                  onChange={(e) => setProfile({ ...profile, github: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Portfolio / Personal Website</label>
                <input
                  type="url"
                  className="input-control"
                  placeholder="e.g. alexmorgan.dev"
                  value={profile.website}
                  onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                />
              </div>
            </div>

            <div className="card-footer-actions">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleApplyDefaultsToResume}
              >
                <Sparkles size={14} />
                <span>Apply Defaults to Active Resume Canvas</span>
              </button>
            </div>
          </div>

          {/* Card 2: Resume Engine Preferences */}
          <div className="glass-card settings-card">
            <div className="settings-card-header">
              <div className="card-icon-pill">
                <Sliders size={18} />
              </div>
              <div>
                <h3>Resume Engine &amp; Layout Preferences</h3>
                <p className="text-xs text-muted">Customize your default typography and export standards.</p>
              </div>
            </div>

            <div className="settings-form-grid">
              <div className="form-group">
                <label>Default ATS Template</label>
                <select
                  className="select-control"
                  value={preferences.defaultTemplate}
                  onChange={(e) => setPreferences({ ...preferences, defaultTemplate: e.target.value })}
                >
                  <option value="harvard">Harvard-Jake (Standard Single Column)</option>
                  <option value="tech">Tech Lead Minimalist (Clean Badges)</option>
                  <option value="executive">Executive Classic (Traditional Serif)</option>
                  <option value="modern">Modern Compact (Date-Aligned Side)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Default Paper Format</label>
                <select
                  className="select-control"
                  value={preferences.paperFormat}
                  onChange={(e) => setPreferences({ ...preferences, paperFormat: e.target.value })}
                >
                  <option value="letter">US Letter (8.5 × 11 inches — US &amp; Canada standard)</option>
                  <option value="a4">International A4 (210 × 297 mm — Global standard)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: AI Key & Data Governance */}
        <div className="settings-side-col">
          {/* Card 3: AI Engine & Gemini Key */}
          <div className="glass-card settings-card">
            <div className="settings-card-header">
              <div className="card-icon-pill">
                <Key size={18} />
              </div>
              <div>
                <h3>Google Gemini AI Engine</h3>
                <p className="text-xs text-muted">Your private API key for tailoring and gap analysis.</p>
              </div>
            </div>

            <div className="api-key-panel">
              <div className="api-status-strip">
                <span className={`status-indicator-dot ${state.apiKey ? 'dot-active' : 'dot-missing'}`} />
                <span className="text-xs text-bold">
                  {state.apiKey ? 'AI Engine Ready (BYOK Active)' : 'API Key Missing — Free tier rate limits may apply'}
                </span>
              </div>

              <div className="input-password-wrapper">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  className="input-control"
                  placeholder="AIzaSy..."
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                />
                <button
                  type="button"
                  className="btn-toggle-eye"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="link-external text-xs"
              >
                <span>Get a free Gemini API key from Google AI Studio</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>

          {/* Card 4: Data Governance & Privacy */}
          <div className="glass-card settings-card">
            <div className="settings-card-header">
              <div className="card-icon-pill">
                <Shield size={18} />
              </div>
              <div>
                <h3>Data Governance &amp; Privacy</h3>
                <p className="text-xs text-muted">100% Client-Side Privacy Compliance.</p>
              </div>
            </div>

            <div className="data-governance-stack">
              <div className="governance-item">
                <div>
                  <h4 className="text-sm font-bold">Export All My Data</h4>
                  <p className="text-xs text-muted">
                    Download a full JSON archive containing your profile, saved resumes, and tracked jobs.
                  </p>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleExportDataArchive}
                >
                  <Download size={14} />
                  <span>Export JSON</span>
                </button>
              </div>

              <div className="governance-divider" />

              <div className="governance-item">
                <div>
                  <h4 className="text-sm font-bold text-danger">Wipe Local Storage &amp; Cache</h4>
                  <p className="text-xs text-muted">
                    Permanently delete all locally cached resumes and job applications on this browser.
                  </p>
                </div>
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={() => setShowDeleteModal(true)}
                >
                  <Trash2 size={14} />
                  <span>Wipe Data</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Confirmation Modal for Data Wipe */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in" style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <div className="modal-title-group">
                <div className="modal-icon" style={{ background: '#FEF2F2', borderColor: '#FECACA', color: '#DC2626' }}>
                  <AlertTriangle size={20} />
                </div>
                <h3>Wipe All Local Data?</h3>
              </div>
            </div>
            <p className="text-sm text-secondary" style={{ marginBottom: 'var(--space-4)' }}>
              This will permanently delete all cached resumes, saved job applications, and contact preferences stored in your browser. This action cannot be undone.
            </p>
            <div className="modal-actions" style={{ justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleWipeData}
              >
                Yes, Wipe Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
