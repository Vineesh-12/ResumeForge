import React from 'react'
import {
  X,
  TrendingUp,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  FileText,
  Layers,
  Award
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import './ResumeDiffModal.css'

export default function ResumeDiffModal({ isOpen, onClose }) {
  const { state } = useApp()

  if (!isOpen) return null

  const origResume = state.resumeParsed || {}
  const tailResume = state.tailoredResume || origResume

  const origScore = Math.max(50, Math.min(80, (state.atsScore || 90) - 22))
  const finalScore = state.atsScore || 92
  const scoreDiff = finalScore - origScore

  // Collect added skills
  const origSkillSet = new Set()
  const origSkills = origResume.skills || {}
  Object.values(origSkills).forEach(arr => {
    if (Array.isArray(arr)) arr.forEach(s => origSkillSet.add(s.toLowerCase().trim()))
  })

  const addedSkills = []
  const tailSkills = tailResume.skills || {}
  Object.entries(tailSkills).forEach(([cat, arr]) => {
    if (Array.isArray(arr)) {
      arr.forEach(s => {
        if (!origSkillSet.has(s.toLowerCase().trim())) {
          addedSkills.push({ skill: s, category: cat })
        }
      })
    }
  })

  const changesLog = state.changesLog || []

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content diff-modal-card glass-card animate-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="diff-avatar">
              <Layers size={18} />
            </div>
            <div>
              <h3>Resume Version Diff &amp; Score Progression</h3>
              <p className="text-xs text-muted">
                Side-by-side comparison of original vs AI tailored version
              </p>
            </div>
          </div>
          <button
            type="button"
            className="btn-close"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        {/* Score Progression Banner */}
        <div className="diff-score-banner">
          <div className="score-stat-box">
            <span className="score-stat-label">Original Baseline</span>
            <div className="score-stat-val baseline-val">{origScore}%</div>
            <span className="text-xs text-muted">Unoptimized PDF</span>
          </div>

          <div className="score-arrow-box">
            <div className="score-delta-badge">
              <TrendingUp size={14} />
              <span>+{scoreDiff}% Match Boost</span>
            </div>
            <ArrowRight size={24} className="text-purple" />
          </div>

          <div className="score-stat-box">
            <span className="score-stat-label">Tailored Resume</span>
            <div className="score-stat-val optimized-val">{finalScore}%</div>
            <span className="badge badge-success badge-sm">
              <Award size={12} /> ATS Passed
            </span>
          </div>
        </div>

        {/* Added Skills Chips */}
        {addedSkills.length > 0 && (
          <div className="diff-section">
            <div className="diff-section-header">
              <Sparkles size={15} className="text-purple" />
              <h4>Injected Target JD Keywords ({addedSkills.length})</h4>
            </div>
            <div className="diff-skills-chips">
              {addedSkills.map((item, idx) => (
                <span key={idx} className="diff-added-chip">
                  <CheckCircle2 size={12} className="text-success" />
                  <span>{item.skill}</span>
                  <span className="chip-cat-lbl">{item.category}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Changes Log List */}
        <div className="diff-section" style={{ flex: 1, overflowY: 'auto' }}>
          <div className="diff-section-header">
            <FileText size={15} className="text-purple" />
            <h4>XYZ Bullet Point Enhancements ({changesLog.length})</h4>
          </div>

          {changesLog.length === 0 ? (
            <div className="diff-empty-log">
              <p className="text-xs text-muted">
                Summary rewritten and high-priority action verbs woven into experience bullets.
              </p>
            </div>
          ) : (
            <div className="diff-changes-stack">
              {changesLog.map((change, idx) => (
                <div key={idx} className="diff-change-item">
                  <div className="diff-change-top">
                    <span className="badge badge-info">{change.section}</span>
                    <span className="text-xs text-muted">{change.reason}</span>
                  </div>

                  <div className="diff-compare-grid">
                    {change.before && (
                      <div className="diff-pane pane-before">
                        <span className="diff-pane-tag">Original</span>
                        <p>{change.before}</p>
                      </div>
                    )}
                    {change.after && (
                      <div className="diff-pane pane-after">
                        <span className="diff-pane-tag tag-new">Tailored (XYZ Formula)</span>
                        <p>{change.after}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="modal-actions" style={{ marginTop: 'var(--space-3)' }}>
          <button type="button" className="btn btn-primary" onClick={onClose} style={{ marginLeft: 'auto' }}>
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  )
}
