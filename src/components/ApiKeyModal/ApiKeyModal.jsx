import React, { useState, useEffect } from 'react'
import { KeyRound, ShieldCheck, ExternalLink, X, Eye, EyeOff, Check, AlertCircle, RefreshCw, Sparkles } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { testGeminiApiKey } from '../../services/geminiService'
import './ApiKeyModal.css'

export default function ApiKeyModal() {
  const { state, dispatch } = useApp()
  const [inputValue, setInputValue] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [validationError, setValidationError] = useState('')
  const [testStatus, setTestStatus] = useState(null) // { success: boolean, message: string } | null
  const [isTesting, setIsTesting] = useState(false)

  useEffect(() => {
    if (state.apiKey) {
      setInputValue(state.apiKey)
    }
  }, [state.apiKey, state.showApiKeyModal])

  if (!state.showApiKeyModal) return null

  const handleTest = async () => {
    const trimmed = inputValue.trim()
    if (!trimmed) {
      setValidationError('Please enter a Google Gemini API key to test.')
      return
    }

    setValidationError('')
    setIsTesting(true)
    setTestStatus(null)

    try {
      const result = await testGeminiApiKey(trimmed)
      setTestStatus({
        success: true,
        message: `✅ ${result.message}`
      })
    } catch (err) {
      setTestStatus({
        success: false,
        message: err.message || 'Connection failed. Please verify the API key.'
      })
    } finally {
      setIsTesting(false)
    }
  }

  const handleSave = (e) => {
    e?.preventDefault()
    const trimmed = inputValue.trim()
    if (!trimmed) {
      setValidationError('Please enter a valid Google Gemini API key.')
      return
    }

    setValidationError('')
    dispatch({ type: 'SET_API_KEY', payload: trimmed })
    dispatch({
      type: 'SET_TOAST',
      payload: {
        message: 'Google Gemini API Key connected successfully!',
        type: 'success'
      }
    })
    handleClose()
  }

  const handleClear = () => {
    setInputValue('')
    setTestStatus(null)
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
              <h3>Google Gemini API Key</h3>
              <p className="text-sm text-muted">Powered by Gemini 2.0 Flash • 100% In-Browser Privacy</p>
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
            <strong>Client-Side Only:</strong> Your Google Gemini API Key is stored only in your local browser storage. It is never logged or saved to any external database.
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSave} className="modal-form">
          <label className="form-label">
            <span>Enter Google Gemini API Key</span>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="link-external"
            >
              Get Free Key from Google AI Studio <ExternalLink size={12} />
            </a>
          </label>

          <div className="input-password-wrapper">
            <input
              type={showKey ? 'text' : 'password'}
              className={`input-control ${validationError ? 'input-error' : ''}`}
              placeholder="AIzaSy..."
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value)
                if (validationError) setValidationError('')
                if (testStatus) setTestStatus(null)
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

          <p className="text-xs text-muted" style={{ marginTop: '4px', marginBottom: '8px' }}>
            ✨ Access high-speed, deep-precision resume analysis and tailoring via Google Gemini 2.0 Flash.
          </p>

          {validationError && (
            <div className="error-message">
              <AlertCircle size={14} />
              <span>{validationError}</span>
            </div>
          )}

          {testStatus && (
            <div className={`test-status-box ${testStatus.success ? 'success' : 'error'}`} style={{
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              marginTop: '8px',
              marginBottom: '10px',
              background: testStatus.success ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.08)',
              border: `1px solid ${testStatus.success ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.25)'}`,
              color: testStatus.success ? '#065f46' : '#991b1b'
            }}>
              {testStatus.message}
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
          <div className="modal-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleTest}
              disabled={isTesting || !inputValue.trim()}
            >
              {isTesting ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <RefreshCw size={14} />
                  Test Connection
                </>
              )}
            </button>

            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              {state.apiKey && (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={handleClear}
                >
                  Clear Key
                </button>
              )}
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
                Save Key
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
