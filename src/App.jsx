import React from 'react'
import { Outlet } from 'react-router-dom'
import Header from './components/Header/Header'
import ApiKeyModal from './components/ApiKeyModal/ApiKeyModal'
import { useApp } from './context/AppContext'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'
import './App.css'

export default function App() {
  const { state, dispatch } = useApp()

  return (
    <div className="app-shell">
      {/* Universal Top Navigation Header */}
      <Header />

      {/* Global Toast Notification */}
      {state.toast && (
        <div className={`toast-notification toast-${state.toast.type} animate-fade-in`}>
          {state.toast.type === 'success' && <CheckCircle2 size={16} />}
          {state.toast.type === 'error' && <AlertCircle size={16} />}
          {state.toast.type === 'info' && <Info size={16} />}
          <span>{state.toast.message}</span>
          <button
            type="button"
            className="toast-close"
            onClick={() => dispatch({ type: 'CLEAR_TOAST' })}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Active Route Page Content */}
      <main className="main-content">
        <Outlet />
      </main>

      {/* API Key Modal Configuration */}
      <ApiKeyModal />

      {/* Minimal Footer */}
      <footer className="site-footer">
        <p className="text-xs text-muted">
          ResumeForge • 100% Free &amp; Open Client-side ATS Optimizer • Built for students &amp; engineers
        </p>
      </footer>
    </div>
  )
}
