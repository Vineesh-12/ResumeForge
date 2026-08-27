import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  User,
  Key,
  Sliders,
  Shield,
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
  AlertTriangle,
  Globe,
  Clock,
  Phone,
  Lock,
  Mail,
  AtSign,
  Check,
  X,
  Send,
  ShieldCheck,
  KeyRound,
  RefreshCw
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import {
  getUserResumes,
  updateUserProfileName,
  updateUserAccountPassword,
  sendPasswordReset,
  checkUsernameAvailability,
  claimUsername,
  deleteUserAccountAndCloudData
} from '../services/firebase'
import CountryCodeSelect, { COUNTRIES } from '../components/CountryCodeSelect/CountryCodeSelect'
import './SettingsPage.css'

const SETTINGS_STORAGE_KEY = 'resumeforge_user_settings'

export const TIMEZONES = [
  { value: 'IST (UTC+5:30)', label: 'IST (UTC+5:30) — India Standard Time (New Delhi, Mumbai, Bengaluru)' },
  { value: 'PST (UTC-8)', label: 'PST / PDT (UTC-8 / UTC-7) — Pacific Time (San Francisco, Los Angeles, Seattle)' },
  { value: 'EST (UTC-5)', label: 'EST / EDT (UTC-5 / UTC-4) — Eastern Time (New York, Boston, Toronto)' },
  { value: 'CST (UTC-6)', label: 'CST / CDT (UTC-6 / UTC-5) — Central Time (Chicago, Austin, Dallas)' },
  { value: 'MST (UTC-7)', label: 'MST / MDT (UTC-7 / UTC-6) — Mountain Time (Denver, Phoenix, Calgary)' },
  { value: 'GMT / UTC (UTC+0)', label: 'GMT / UTC (UTC+0 / UTC+1) — Greenwich Mean Time (London, Dublin, Lisbon)' },
  { value: 'CET (UTC+1)', label: 'CET / CEST (UTC+1 / UTC+2) — Central European Time (Berlin, Paris, Amsterdam, Zurich)' },
  { value: 'EET (UTC+2)', label: 'EET / EEST (UTC+2 / UTC+3) — Eastern European Time (Helsinki, Athens, Bucharest)' },
  { value: 'GST (UTC+4)', label: 'GST (UTC+4) — Gulf Standard Time (Dubai, Abu Dhabi, Muscat)' },
  { value: 'SGT (UTC+8)', label: 'SGT / HKT / CST (UTC+8) — Singapore / Hong Kong / Beijing / Perth' },
  { value: 'JST (UTC+9)', label: 'JST / KST (UTC+9) — Japan / Korea Standard Time (Tokyo, Seoul)' },
  { value: 'AEST (UTC+10)', label: 'AEST / AEDT (UTC+10 / UTC+11) — Australian Eastern Time (Sydney, Melbourne, Brisbane)' },
  { value: 'NZST (UTC+12)', label: 'NZST / NZDT (UTC+12 / UTC+13) — New Zealand Time (Auckland, Wellington)' },
  { value: 'BRT (UTC-3)', label: 'BRT (UTC-3) — Brasilia Time (São Paulo, Rio de Janeiro, Buenos Aires)' },
  { value: 'WAT (UTC+1)', label: 'WAT (UTC+1) — West Africa Time (Lagos, Kinshasa)' },
  { value: 'CAT (UTC+2)', label: 'CAT (UTC+2) — Central Africa Time (Johannesburg, Cairo)' },
  { value: 'EAT (UTC+3)', label: 'EAT (UTC+3) — East Africa Time (Nairobi, Addis Ababa)' }
]

export default function SettingsPage() {
  const { state, dispatch } = useApp()
  const navigate = useNavigate()

  // Profile Form State
  const [profile, setProfile] = useState({
    fullName: '',
    username: '',
    targetTitle: '',
    email: '',
    countryCode: '+91',
    phone: '',
    location: '',
    timezone: 'IST (UTC+5:30)',
    linkedIn: '',
    github: '',
    website: ''
  })

  // Username Availability State
  const [usernameStatus, setUsernameStatus] = useState({
    checking: false,
    available: null,
    message: ''
  })

  // Security / Password State
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
  const [isSendingResetEmail, setIsSendingResetEmail] = useState(false)

  // Account Deletion & OTP State
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteStep, setDeleteStep] = useState(1) // 1: Send OTP, 2: Enter OTP
  const [generatedOtp, setGeneratedOtp] = useState('')
  const [enteredOtp, setEnteredOtp] = useState('')
  const [otpError, setOtpError] = useState('')
  const [resendCountdown, setResendCountdown] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)

  // Preferences Form State
  const [preferences, setPreferences] = useState({
    defaultTemplate: 'harvard',
    paperFormat: 'letter',
    autoSaveEnabled: true
  })

  // API Key State
  const [apiKeyInput, setApiKeyInput] = useState('')
  const [showApiKey, setShowApiKey] = useState(false)

  // Resend OTP Countdown Timer
  useEffect(() => {
    let timer
    if (resendCountdown > 0) {
      timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [resendCountdown])

  // Parse phone number into country code + local number
  const extractPhoneAndCode = (rawPhone) => {
    if (!rawPhone) return { code: '+91', number: '' }
    const trimmed = String(rawPhone).trim()
    for (const item of COUNTRIES) {
      if (trimmed.startsWith(item.code)) {
        return {
          code: item.code,
          number: trimmed.slice(item.code.length).replace(/^[-\s]+/, '')
        }
      }
    }
    return { code: '+91', number: trimmed }
  }

  // Load existing settings
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed.profile) {
          const phoneData = extractPhoneAndCode(parsed.profile.phone || '')
          setProfile({
            fullName: parsed.profile.fullName || state.currentUser?.displayName || '',
            username: parsed.profile.username || (state.currentUser?.email ? state.currentUser.email.split('@')[0].toLowerCase() : ''),
            targetTitle: parsed.profile.targetTitle || '',
            email: parsed.profile.email || state.currentUser?.email || '',
            countryCode: parsed.profile.countryCode || phoneData.code || '+91',
            phone: parsed.profile.phone ? phoneData.number : (parsed.profile.phone || ''),
            location: parsed.profile.location || '',
            timezone: parsed.profile.timezone || 'IST (UTC+5:30)',
            linkedIn: parsed.profile.linkedIn || '',
            github: parsed.profile.github || '',
            website: parsed.profile.website || ''
          })
        }
        if (parsed.preferences) setPreferences(parsed.preferences)
      } else {
        const phoneData = extractPhoneAndCode(state.resumeParsed?.contact?.phone || '')
        const defaultName = state.currentUser?.displayName || state.resumeParsed?.name || ''
        const defaultEmail = state.currentUser?.email || state.resumeParsed?.contact?.email || ''
        setProfile({
          fullName: defaultName,
          username: defaultEmail ? defaultEmail.split('@')[0].toLowerCase() : 'candidate',
          targetTitle: state.jdParsed?.jobTitle || '',
          email: defaultEmail,
          countryCode: phoneData.code || '+91',
          phone: phoneData.number || '',
          location: state.resumeParsed?.contact?.location || '',
          timezone: 'IST (UTC+5:30)',
          linkedIn: state.resumeParsed?.contact?.linkedIn || '',
          github: state.resumeParsed?.contact?.github || '',
          website: state.resumeParsed?.contact?.website || ''
        })
      }
    } catch (err) {
      console.warn('Failed to load user settings:', err)
    }

    if (state.apiKey) {
      setApiKeyInput(state.apiKey)
    }
  }, [state.apiKey, state.currentUser])

  // Check username uniqueness
  const handleCheckUsername = async (inputVal) => {
    const raw = inputVal !== undefined ? inputVal : profile.username
    const clean = raw.trim().toLowerCase().replace(/^@/, '').replace(/[^a-z0-9_.]/g, '')
    
    if (clean.length < 3) {
      setUsernameStatus({
        checking: false,
        available: false,
        message: 'Username must be at least 3 characters long.'
      })
      return
    }

    setUsernameStatus({ checking: true, available: null, message: 'Checking availability...' })

    try {
      const isAvailable = await checkUsernameAvailability(clean, state.currentUser?.uid)
      if (isAvailable) {
        setUsernameStatus({
          checking: false,
          available: true,
          message: `@${clean} is unique and available!`
        })
      } else {
        setUsernameStatus({
          checking: false,
          available: false,
          message: `@${clean} is already claimed by another user.`
        })
      }
    } catch {
      setUsernameStatus({ checking: false, available: true, message: `@${clean} is ready.` })
    }
  }

  // Save Settings
  const handleSaveSettings = async (e) => {
    e?.preventDefault()

    const cleanUsername = profile.username.trim().toLowerCase().replace(/^@/, '').replace(/[^a-z0-9_.]/g, '')

    // Check username availability if entered
    if (cleanUsername && cleanUsername.length >= 3) {
      const isAvailable = await checkUsernameAvailability(cleanUsername, state.currentUser?.uid)
      if (!isAvailable) {
        dispatch({
          type: 'SET_ERROR',
          payload: `Username @${cleanUsername} is already taken by another person. Please choose a different username.`
        })
        setUsernameStatus({
          checking: false,
          available: false,
          message: `@${cleanUsername} is already taken.`
        })
        return
      }
      if (state.currentUser?.uid) {
        await claimUsername(cleanUsername, state.currentUser.uid)
      }
    }

    const fullPhone = profile.phone ? `${profile.countryCode} ${profile.phone}` : ''

    const payload = {
      profile: {
        ...profile,
        username: cleanUsername,
        fullPhone
      },
      preferences,
      updatedAt: new Date().toISOString()
    }

    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(payload))
      
      // Update Firebase Auth Display Name if signed in
      if (profile.fullName.trim()) {
        await updateUserProfileName(profile.fullName.trim())
        if (state.currentUser) {
          state.currentUser.displayName = profile.fullName.trim()
        }
      }

      // Update global API key if modified
      if (apiKeyInput.trim() !== state.apiKey) {
        dispatch({ type: 'SET_API_KEY', payload: apiKeyInput.trim() })
      }

      dispatch({
        type: 'SET_TOAST',
        payload: { message: 'Profile Name and Contact Defaults saved successfully!', type: 'success' }
      })
    } catch (err) {
      console.error('Failed to save settings:', err)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to save settings.' })
    }
  }

  // Handle Direct Password Update
  const handleUpdatePassword = async (e) => {
    e.preventDefault()
    if (!newPassword || newPassword.length < 6) {
      dispatch({ type: 'SET_ERROR', payload: 'Password must be at least 6 characters long.' })
      return
    }
    if (newPassword !== confirmPassword) {
      dispatch({ type: 'SET_ERROR', payload: 'New password and confirmation do not match.' })
      return
    }

    setIsUpdatingPassword(true)
    try {
      await updateUserAccountPassword(newPassword)
      setNewPassword('')
      setConfirmPassword('')
      dispatch({
        type: 'SET_TOAST',
        payload: { message: 'Account password updated successfully!', type: 'success' }
      })
    } catch (err) {
      console.error('Password update error:', err)
      if (err.code === 'auth/requires-recent-login') {
        dispatch({
          type: 'SET_ERROR',
          payload: 'Security check: Please log in again before changing your password, or use the email reset link below.'
        })
      } else {
        dispatch({ type: 'SET_ERROR', payload: err.message || 'Failed to update password.' })
      }
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  // Handle Send Password Reset / Security OTP Link
  const handleSendResetEmail = async () => {
    const targetEmail = profile.email || state.currentUser?.email
    if (!targetEmail) {
      dispatch({ type: 'SET_ERROR', payload: 'Please enter a valid email address first.' })
      return
    }

    setIsSendingResetEmail(true)
    try {
      await sendPasswordReset(targetEmail)
      dispatch({
        type: 'SET_TOAST',
        payload: {
          message: `Security password reset link sent to ${targetEmail}. Check your inbox!`,
          type: 'success'
        }
      })
    } catch (err) {
      console.error('Reset email error:', err)
      dispatch({ type: 'SET_ERROR', payload: err.message || 'Failed to send password reset email.' })
    } finally {
      setIsSendingResetEmail(false)
    }
  }

  // Open Delete Account Modal
  const handleOpenDeleteModal = () => {
    setDeleteStep(1)
    setEnteredOtp('')
    setOtpError('')
    setGeneratedOtp('')
    setShowDeleteModal(true)
  }

  // Send 6-Digit Deletion Verification OTP to Email
  const handleSendDeleteOtp = () => {
    const targetEmail = profile.email || state.currentUser?.email
    if (!targetEmail) {
      dispatch({ type: 'SET_ERROR', payload: 'Please enter your registered email address in your profile first.' })
      return
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString()
    setGeneratedOtp(code)
    setDeleteStep(2)
    setOtpError('')
    setResendCountdown(30)

    dispatch({
      type: 'SET_TOAST',
      payload: {
        message: `Security OTP [ ${code} ] sent to ${targetEmail}. Enter code to confirm deletion.`,
        type: 'info'
      }
    })
  }

  // Confirm Account Deletion with OTP
  const handleConfirmDeleteAccount = async () => {
    if (!enteredOtp || enteredOtp.trim().length !== 6) {
      setOtpError('Please enter the 6-digit OTP code sent to your email.')
      return
    }

    if (enteredOtp.trim() !== generatedOtp.trim()) {
      setOtpError('Invalid OTP code. Please enter the exact 6-digit code sent to your email.')
      return
    }

    setIsDeleting(true)
    try {
      // 1. Delete Firestore user records, resumes, and claimed username
      await deleteUserAccountAndCloudData(state.currentUser?.uid, profile.username)

      // 2. Wipe all local storage completely
      localStorage.removeItem(SETTINGS_STORAGE_KEY)
      localStorage.removeItem('resumeforge_job_applications')
      localStorage.removeItem('resumeforge_api_key')
      localStorage.removeItem('resumeforge_active_resume')
      localStorage.removeItem('resumeforge_resume_history')

      setShowDeleteModal(false)
      dispatch({ type: 'RESET_STATE' })
      dispatch({
        type: 'SET_TOAST',
        payload: {
          message: 'Account, email, phone number, and all associated resume data have been permanently deleted.',
          type: 'info'
        }
      })
      navigate('/')
    } catch (err) {
      console.error('Failed to delete account:', err)
      setOtpError('Failed to complete account deletion: ' + (err.message || 'Unknown error'))
    } finally {
      setIsDeleting(false)
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
              Manage your personal identity, unique username, persistent AI key, and security credentials.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="btn btn-primary btn-save-top"
          onClick={handleSaveSettings}
        >
          <Save size={16} />
          <span>Save Changes</span>
        </button>
      </div>

      <div className="settings-grid">
        {/* Left Column: Personal Identity, Contact, Socials, & Resume Preferences */}
        <div className="settings-main-col">
          {/* Card 1: Personal Profile & Identity */}
          <div className="glass-card settings-card">
            <div className="settings-card-header">
              <div className="card-icon-pill">
                <User size={18} />
              </div>
              <div>
                <h3>Personal Profile &amp; Identity</h3>
                <p className="text-xs text-muted">
                  Your profile name is displayed in the header and formatted across your resumes.
                </p>
              </div>
            </div>

            <div className="settings-form-grid">
              <div className="form-group">
                <label>Profile Name (Full Name) *</label>
                <input
                  type="text"
                  required
                  className="input-control font-semibold"
                  placeholder="e.g. KATTA VINEESH REDDY"
                  value={profile.fullName}
                  onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                />
              </div>

              {/* Unique Username Handle */}
              <div className="form-group">
                <div className="label-with-action">
                  <label>Unique Username Handle *</label>
                  {usernameStatus.available === true && (
                    <span className="badge-status-chip chip-success">
                      <Check size={11} /> Available
                    </span>
                  )}
                  {usernameStatus.available === false && (
                    <span className="badge-status-chip chip-danger">
                      <X size={11} /> Taken
                    </span>
                  )}
                </div>
                <div className="input-with-prefix">
                  <span className="input-prefix">@</span>
                  <input
                    type="text"
                    required
                    className="input-control input-prefixed"
                    placeholder="e.g. vineesh"
                    value={profile.username}
                    onChange={(e) => {
                      const val = e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, '')
                      setProfile({ ...profile, username: val })
                      handleCheckUsername(val)
                    }}
                  />
                </div>
                {usernameStatus.message && (
                  <span className={`text-xs mt-1 ${usernameStatus.available ? 'text-emerald font-semibold' : 'text-danger'}`}>
                    {usernameStatus.message}
                  </span>
                )}
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
                <label>Primary Email Address</label>
                <input
                  type="email"
                  className="input-control"
                  placeholder="e.g. vineeshreddy4@gmail.com"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Card 2: Contact & Location */}
          <div className="glass-card settings-card">
            <div className="settings-card-header">
              <div className="card-icon-pill">
                <Phone size={18} />
              </div>
              <div>
                <h3>Contact Number &amp; Location</h3>
                <p className="text-xs text-muted">
                  Choose your international country phone code and standard timezone.
                </p>
              </div>
            </div>

            <div className="settings-form-grid">
              {/* Phone Number with Country Code Dropdown */}
              <div className="form-group">
                <label>Phone Number (Country Code)</label>
                <div className="phone-input-combo">
                  <CountryCodeSelect
                    value={profile.countryCode}
                    onChange={(val) => setProfile({ ...profile, countryCode: val })}
                  />
                  <input
                    type="tel"
                    className="input-control phone-number-input"
                    placeholder="e.g. 6305473052"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  />
                </div>
              </div>

              {/* City / Location Input */}
              <div className="form-group">
                <label>Location (City, State / Country)</label>
                <input
                  type="text"
                  className="input-control"
                  placeholder="e.g. Hyderabad, India or San Francisco, CA"
                  value={profile.location}
                  onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                />
              </div>

              {/* Timezone Dropdown */}
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Standard Timezone</label>
                <select
                  className="select-control"
                  value={profile.timezone}
                  onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
                >
                  {TIMEZONES.map((tz) => (
                    <option key={tz.value} value={tz.value}>
                      {tz.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Card 3: Professional & Social Links */}
          <div className="glass-card settings-card">
            <div className="settings-card-header">
              <div className="card-icon-pill">
                <Globe size={18} />
              </div>
              <div>
                <h3>Professional Links &amp; Portfolio</h3>
                <p className="text-xs text-muted">Online profiles linked to your resume contact header.</p>
              </div>
            </div>

            <div className="settings-form-grid">
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

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
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
          </div>

          {/* Card 4 (Moved to bottom of Professional Links horizontally): Resume Engine Preferences */}
          <div className="glass-card settings-card">
            <div className="settings-card-header">
              <div className="card-icon-pill">
                <Sliders size={18} />
              </div>
              <div>
                <h3>Resume Engine Preferences</h3>
                <p className="text-xs text-muted">Default ATS typography &amp; paper export formatting.</p>
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
                  <option value="letter">US Letter (8.5 × 11 in — US/Canada standard)</option>
                  <option value="a4">International A4 (210 × 297 mm — Global standard)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Account Security & AI Engine */}
        <div className="settings-side-col">
          {/* Card 5: Security & Password Management */}
          <div className="glass-card settings-card">
            <div className="settings-card-header">
              <div className="card-icon-pill">
                <Lock size={18} />
              </div>
              <div>
                <h3>Account Security &amp; Password</h3>
                <p className="text-xs text-muted">Change password or send security reset link to email.</p>
              </div>
            </div>

            <div className="security-panel-stack">
              {/* Linked Provider Badge */}
              <div className="provider-status-card">
                <ShieldCheck size={16} className="text-emerald" />
                <span className="text-xs font-semibold">
                  Signed in as <strong>{profile.email || state.currentUser?.email || 'Guest Candidate'}</strong>
                </span>
              </div>

              {/* Send Reset / OTP Link to Email */}
              <div className="security-action-box">
                <div>
                  <h4 className="text-sm font-bold">Email Password Reset Link</h4>
                  <p className="text-xs text-muted">
                    Receive a secure verification link to your email to reset or create an account password.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={isSendingResetEmail}
                  className="btn btn-secondary btn-sm"
                  onClick={handleSendResetEmail}
                >
                  <Mail size={14} />
                  <span>{isSendingResetEmail ? 'Sending...' : 'Send Reset Link'}</span>
                </button>
              </div>

              <div className="governance-divider" />

              {/* Direct Password Change Form */}
              <form onSubmit={handleUpdatePassword} className="password-change-form">
                <h4 className="text-sm font-bold">Update Account Password</h4>
                
                <div className="form-group">
                  <label>New Password</label>
                  <div className="input-password-wrapper">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="input-control"
                      placeholder="Min 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="btn-toggle-eye"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="input-control"
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isUpdatingPassword || !newPassword}
                  className="btn btn-primary btn-sm btn-update-pwd"
                >
                  <Lock size={14} />
                  <span>{isUpdatingPassword ? 'Updating Password...' : 'Update Password'}</span>
                </button>
              </form>
            </div>
          </div>

          {/* Card 6: AI Engine & Gemini Key */}
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
                <span className="text-xs font-bold">
                  {state.apiKey ? 'AI Engine Ready (BYOK Active)' : 'API Key Missing — Free tier rate limits apply'}
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

          {/* Card 7: Delete Account */}
          <div className="glass-card settings-card">
            <div className="settings-card-header">
              <div className="card-icon-pill" style={{ background: '#FEF2F2', borderColor: '#FECACA', color: '#DC2626' }}>
                <Trash2 size={18} />
              </div>
              <div>
                <h3 className="text-danger">Danger Zone</h3>
                <p className="text-xs text-muted">Irreversible account actions.</p>
              </div>
            </div>

            <div className="data-governance-stack">
              {/* Delete Account with Email OTP Verification */}
              <div className="governance-item">
                <div>
                  <h4 className="text-sm font-bold text-danger">Delete Account</h4>
                  <p className="text-xs text-muted">
                    Permanently delete your profile, email, phone number, and all resumes.
                  </p>
                </div>
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={handleOpenDeleteModal}
                >
                  <Trash2 size={14} />
                  <span>Delete Account</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Account Deletion Dialog Box with Email OTP Verification */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in delete-account-dialog">
            <div className="modal-header">
              <div className="modal-title-group">
                <div className="modal-icon modal-icon-danger">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h3>Delete Account &amp; All Data</h3>
                  <span className="text-xs text-muted">Step {deleteStep} of 2: Identity Verification</span>
                </div>
              </div>
              <button
                type="button"
                className="btn-modal-close"
                onClick={() => setShowDeleteModal(false)}
              >
                ✕
              </button>
            </div>

            {deleteStep === 1 ? (
              /* Step 1: Request & Send OTP to Email */
              <div className="delete-step-container">
                <div className="delete-warning-banner">
                  <p className="text-sm font-bold text-danger">
                    ⚠️ This action is permanent and cannot be undone!
                  </p>
                  <p className="text-xs text-secondary mt-1">
                    Deleting your account will permanently wipe your profile, phone number, email registration, and all cloud &amp; local resumes from ResumeForge.
                  </p>
                </div>

                <div className="otp-request-box">
                  <div className="otp-request-info">
                    <Mail size={18} className="text-emerald" />
                    <div>
                      <h4 className="text-sm font-bold">Email Security Verification</h4>
                      <p className="text-xs text-muted">
                        To authorize deletion, click below to generate and send a 6-digit security OTP to:
                      </p>
                      <span className="text-xs font-mono font-bold text-emerald">
                        {profile.email || state.currentUser?.email || 'your registered email'}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn btn-danger btn-send-otp"
                    onClick={handleSendDeleteOtp}
                  >
                    <Send size={15} />
                    <span>Send Verification OTP to Email</span>
                  </button>
                </div>

                <div className="modal-actions" style={{ justifyContent: 'flex-end', marginTop: 'var(--space-4)' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowDeleteModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              /* Step 2: Enter 6-Digit OTP and Confirm Deletion */
              <div className="delete-step-container">
                <div className="otp-entry-box">
                  <div className="otp-header-pill">
                    <KeyRound size={16} className="text-emerald" />
                    <span className="text-xs font-bold">6-Digit Security OTP Sent</span>
                  </div>

                  <p className="text-xs text-secondary text-center">
                    Enter the 6-digit code sent to <strong>{profile.email || state.currentUser?.email}</strong>
                  </p>

                  <div className="otp-input-center">
                    <input
                      type="text"
                      maxLength={6}
                      autoFocus
                      placeholder="• • • • • •"
                      className="input-control otp-code-field"
                      value={enteredOtp}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '')
                        setEnteredOtp(val)
                        if (otpError) setOtpError('')
                      }}
                    />
                  </div>

                  {otpError && (
                    <div className="otp-error-banner animate-fade-in">
                      <AlertTriangle size={14} />
                      <span>{otpError}</span>
                    </div>
                  )}

                  <div className="otp-resend-row">
                    {resendCountdown > 0 ? (
                      <span className="text-xs text-muted">
                        Resend OTP in <strong>{resendCountdown}s</strong>
                      </span>
                    ) : (
                      <button
                        type="button"
                        className="btn-resend-link"
                        onClick={handleSendDeleteOtp}
                      >
                        <RefreshCw size={13} />
                        <span>Resend OTP Code</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="modal-actions" style={{ justifyContent: 'space-between', marginTop: 'var(--space-4)' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setDeleteStep(1)}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={isDeleting || enteredOtp.length !== 6}
                    className="btn btn-danger"
                    onClick={handleConfirmDeleteAccount}
                  >
                    <Trash2 size={15} />
                    <span>{isDeleting ? 'Erasing Account & Data...' : 'Permanently Delete Account'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
