import React, { useState } from 'react'
import {
  X,
  Mail,
  Lock,
  User,
  LogIn,
  UserPlus,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Sparkles
} from 'lucide-react'
import {
  signUpWithEmail,
  signInWithEmail,
  signInWithGoogle
} from '../../services/firebase'
import { useApp } from '../../context/AppContext'
import './AuthModal.css'

export default function AuthModal() {
  const { state, dispatch } = useApp()
  const [tab, setTab] = useState('signin') // 'signin' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  if (!state.showAuthModal) return null

  const handleClose = () => {
    setError('')
    dispatch({ type: 'TOGGLE_AUTH_MODAL', payload: false })
  }

  const handleEmailAuth = async (e) => {
    e.preventDefault()
    setError('')

    const cleanEmail = email.trim()
    if (!cleanEmail) {
      setError('Please enter a valid email address.')
      return
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }

    setIsLoading(true)
    try {
      if (tab === 'signup') {
        const user = await signUpWithEmail(cleanEmail, password, displayName.trim())
        dispatch({
          type: 'SET_TOAST',
          payload: {
            message: `Welcome to ResumeForge, ${user.displayName || user.email}!`,
            type: 'success'
          }
        })
      } else {
        const user = await signInWithEmail(cleanEmail, password)
        dispatch({
          type: 'SET_TOAST',
          payload: {
            message: `Welcome back, ${user.displayName || user.email}!`,
            type: 'success'
          }
        })
      }
      handleClose()
    } catch (err) {
      console.error('Auth error:', err)
      let msg = err.message || 'Authentication failed. Please try again.'
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        msg = 'Invalid email or password. Please check your credentials.'
      } else if (err.code === 'auth/email-already-in-use') {
        msg = 'This email is already registered. Please sign in instead.'
      } else if (err.code === 'auth/weak-password') {
        msg = 'Password is too weak. Please use at least 6 characters.'
      } else if (err.code === 'auth/popup-closed-by-user') {
        msg = 'Sign-in popup was closed before completing.'
      }
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setError('')
    setIsLoading(true)
    try {
      const user = await signInWithGoogle()
      dispatch({
        type: 'SET_TOAST',
        payload: {
          message: `Signed in as ${user.displayName || user.email}!`,
          type: 'success'
        }
      })
      handleClose()
    } catch (err) {
      console.error('Google sign-in error:', err)
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.message || 'Google sign in encountered an error.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div
        className="modal-content auth-modal-card glass-card animate-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="auth-brand-avatar">
              <Sparkles size={18} />
            </div>
            <div>
              <h3>{tab === 'signin' ? 'Welcome Back' : 'Create an Account'}</h3>
              <p className="text-xs text-muted">
                Save &amp; access your tailored resumes from any device
              </p>
            </div>
          </div>
          <button
            type="button"
            className="btn-close"
            onClick={handleClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="auth-tab-bar">
          <button
            type="button"
            className={`auth-tab-btn ${tab === 'signin' ? 'active' : ''}`}
            onClick={() => {
              setTab('signin')
              setError('')
            }}
          >
            <LogIn size={15} />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${tab === 'signup' ? 'active' : ''}`}
            onClick={() => {
              setTab('signup')
              setError('')
            }}
          >
            <UserPlus size={15} />
            <span>Sign Up</span>
          </button>
        </div>

        {/* 1-Click Google Sign In */}
        <div className="oauth-section">
          <button
            type="button"
            className="btn-google-auth"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            <svg className="google-icon" viewBox="0 0 24 24" width="18" height="18">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>
        </div>

        <div className="auth-divider">
          <span>or continue with email</span>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleEmailAuth} className="auth-form">
          {tab === 'signup' && (
            <div className="form-group">
              <label className="form-label">
                <span>Your Name</span>
              </label>
              <div className="input-with-icon">
                <User size={16} className="field-icon" />
                <input
                  type="text"
                  className="input-control"
                  placeholder="e.g. Vineesh Reddy"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">
              <span>Email Address</span>
            </label>
            <div className="input-with-icon">
              <Mail size={16} className="field-icon" />
              <input
                type="email"
                className="input-control"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              <span>Password</span>
            </label>
            <div className="input-with-icon">
              <Lock size={16} className="field-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                className="input-control"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="btn-toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="auth-error-banner animate-fade-in">
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-auth-submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <span>Connecting...</span>
            ) : tab === 'signin' ? (
              <>
                <LogIn size={16} />
                <span>Sign In to ResumeForge</span>
              </>
            ) : (
              <>
                <UserPlus size={16} />
                <span>Create Free Account</span>
              </>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="auth-modal-footer">
          <p className="text-xs text-muted">
            By continuing, your tailored resumes will securely sync to your private cloud storage.
          </p>
        </div>
      </div>
    </div>
  )
}
