import React from 'react'
import { Sparkles, CheckCircle2, RefreshCw, Cpu, ShieldCheck } from 'lucide-react'
import './LoadingOverlay.css'

export default function LoadingOverlay({
  isOpen,
  message = 'AI is analyzing your resume and job description...',
  step = 1,
  totalSteps = 2,
  progress = 50
}) {
  if (!isOpen) return null

  const stepsList = [
    { id: 1, title: 'Parsing Resume Structure & Experience', desc: 'Extracting skills, metrics & project bullets' },
    { id: 2, title: 'Analyzing Job Description Keywords', desc: 'Extracting ATS priority requirements & hard skills' },
    { id: 3, title: 'Synthesizing Competency Gap Matrix', desc: 'Calculating ATS matching probability' }
  ]

  return (
    <div className="loading-overlay-backdrop animate-fade-in">
      <div className="loading-modal-card glass-card animate-fade-up">
        {/* Animated Emblem */}
        <div className="ai-icon-container">
          <div className="ai-aura-ring animate-pulse" />
          <div className="ai-icon-center">
            <Cpu size={32} className="ai-icon-svg" />
          </div>
        </div>

        {/* Title and Message */}
        <h3 className="loading-title">AI Processing in Progress</h3>
        <p className="loading-message text-sm text-secondary">{message}</p>

        {/* Shimmer Progress Track */}
        <div className="loading-progress-container">
          <div className="loading-progress-bar" style={{ width: `${Math.min(100, Math.max(10, progress))}%` }} />
        </div>

        {/* Multi-step Status List */}
        <div className="steps-progress-list">
          {stepsList.map((item) => {
            const isFinished = step > item.id
            const isCurrent = step === item.id

            return (
              <div
                key={item.id}
                className={`step-row ${isFinished ? 'step-finished' : ''} ${isCurrent ? 'step-current' : ''}`}
              >
                <div className="step-status-icon">
                  {isFinished ? (
                    <CheckCircle2 size={16} className="text-success" />
                  ) : isCurrent ? (
                    <RefreshCw size={14} className="animate-spin text-purple" />
                  ) : (
                    <div className="step-dot-pending" />
                  )}
                </div>
                <div className="step-text-wrap">
                  <span className="step-row-title">{item.title}</span>
                  <span className="step-row-desc text-xs text-muted">{item.desc}</span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Privacy Note */}
        <div className="loading-privacy-pill">
          <ShieldCheck size={13} className="text-success" />
          <span>Private Client-side Execution • Zero Data Retention</span>
        </div>
      </div>
    </div>
  )
}
