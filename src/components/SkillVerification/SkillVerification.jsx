import React, { useState } from 'react'
import { ShieldCheck, Check, X, Sparkles, AlertCircle } from 'lucide-react'
import './SkillVerification.css'

export default function SkillVerification({
  suggestions = [],
  onApproveSkill,
  onRejectSkill
}) {
  const [decisions, setDecisions] = useState({})

  if (!suggestions || suggestions.length === 0) return null

  const handleApprove = (skillObj) => {
    setDecisions(prev => ({ ...prev, [skillObj.skill]: 'approved' }))
    if (onApproveSkill) onApproveSkill(skillObj)
  }

  const handleReject = (skillObj) => {
    setDecisions(prev => ({ ...prev, [skillObj.skill]: 'rejected' }))
    if (onRejectSkill) onRejectSkill(skillObj)
  }

  const getConfidenceBadge = (confidence) => {
    if (confidence >= 75) {
      return <span className="badge badge-success">{confidence}% Confidence</span>
    }
    if (confidence >= 50) {
      return <span className="badge badge-warning">{confidence}% Moderate</span>
    }
    return <span className="badge badge-danger">{confidence}% Low Evidence</span>
  }

  return (
    <div className="skill-guard-card glass-card">
      <div className="guard-header">
        <div className="header-icon-wrap">
          <ShieldCheck size={18} className="text-success" />
          <h4>Skill Verification Guard</h4>
        </div>
        <span className="text-xs text-muted">Prevent ATS Hallucinations</span>
      </div>

      <p className="guard-description text-xs text-muted">
        AI identified missing job keywords that complement your experience. Review and approve before adding:
      </p>

      <div className="guard-items-stack">
        {suggestions.map((item, idx) => {
          const decision = decisions[item.skill]

          return (
            <div
              key={idx}
              className={`guard-row-card ${decision === 'approved' ? 'row-approved' : decision === 'rejected' ? 'row-rejected' : ''}`}
            >
              <div className="guard-row-top">
                <span className="guard-skill-title">{item.skill}</span>
                {getConfidenceBadge(item.confidence || 80)}
              </div>

              <p className="guard-skill-reason text-xs text-secondary">
                {item.reason || `Target requirement for ${item.category || 'skills'}`}
              </p>

              {decision ? (
                <div className="decision-feedback">
                  {decision === 'approved' ? (
                    <span className="text-xs text-success">✓ Added to {item.category || 'Skills'}</span>
                  ) : (
                    <span className="text-xs text-muted">✕ Skipped</span>
                  )}
                </div>
              ) : (
                <div className="guard-actions-row">
                  <button
                    type="button"
                    className="btn btn-sm btn-secondary btn-approve"
                    onClick={() => handleApprove(item)}
                  >
                    <Check size={12} className="text-success" />
                    <span>Approve &amp; Add</span>
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-ghost btn-reject"
                    onClick={() => handleReject(item)}
                  >
                    <X size={12} />
                    <span>Skip</span>
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
