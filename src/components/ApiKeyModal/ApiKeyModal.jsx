import React, { useState, useEffect } from 'react'
import { KeyRound, ShieldCheck, ExternalLink, X, Eye, EyeOff, Check, AlertCircle } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import './ApiKeyModal.css'

export default function ApiKeyModal() {
  const { state, dispatch } = useApp()
  const [inputValue, setInputValue] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [validationError, setValidationError] = useState('')

  useEffect(() => {
    if (state.apiKey) {
      setInputValue(state.apiKey)
    }
  }, [state.apiKey, state.showApiKeyModal])

  if (!state.showApiKeyModal) return null

  const handleSave = (e) => {
    e?.preventDefault()
    const trimmed = inputValue.trim()
    if (!trimmed) {
      setValidationError('Please enter a valid Google Gemini API key.')
      return
    }

    setValidationError('')
    dispatch({ type: 'SET_API_KEY', payload: trimmed })
  }

  const handleClear = () => {
    setInputValue('')
    dispatch({ type: 'SET_API_KEY', payload: null })
  }

  const handleClose = () => {
    dispatch({ type: 'TOGGLE_API_KEY_MODAL', payload: false })
  }

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content glass-card animate-fade-up" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon">
              <KeyRound size={20} />
            </div>
            <div>
              <h3>Gemini API Configuration</h3>
              <p className="text-sm text-muted">Free AI Engine for Resume Tailoring</p>
            </div>
          </div>
          <button type="button" className="btn-close" onClick={handleClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Info Banner */}
        <div className="modal-info-box">
          <ShieldCheck size={18} className="info-icon" />
          <div className="info-text">
            <strong>100% Free &amp; Private:</strong> Your API key and resume content stay strictly inside your browser's local storage and are never transmitted to third-party databases.
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSave} className="modal-form">
          <label className="form-label">
            <span>Google Gemini API Key</span>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="link-external"
            >
              Get Free Key <ExternalLink size={12} />
            </a>
          </label>

          <div className="input-password-wrapper">
            <input
              type={showKey ? 'text' : 'password'}
              className={`input-control ${validationError ? 'input-error' : ''}`}
              placeholder="Paste your Gemini API key (e.g. AIzaSy... or AQ...)"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value)
                if (validationError) setValidationError('')
              }}
              autoFocus
            />
            <button
              type="button"
              className="btn-toggle-eye"
              onClick={() => setShowKey(!showKey)}
              title={showKey ? 'Hide key' : 'Show key'}
            >
              {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {validationError && (
            <div className="error-message">
              <AlertCircle size={14} />
              <span>{validationError}</span>
            </div>
          )}

          {/* Quick Steps Guide */}
          <div className="guide-box">
            <span className="guide-title">How to get a Free Key in 30 seconds:</span>
            <ol className="guide-steps">
              <li>Open <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer">Google AI Studio</a></li>
              <li>Click <strong>&quot;Create API Key&quot;</strong> in a free project</li>
              <li>Copy and paste the generated key here</li>
            </ol>
          </div>

          {/* Actions */}
          <div className="modal-actions">
            {state.apiKey && (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={handleClear}
              >
                Clear Key
              </button>
            )}
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 'var(--space-2)' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
              >
                <Check size={16} />
                Save &amp; Connect
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
