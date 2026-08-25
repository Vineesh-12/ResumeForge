import React, { useState } from 'react'
import { Sparkles, ChevronDown, ChevronUp, CheckCircle2, ArrowRight } from 'lucide-react'
import './ChangeLog.css'

export default function ChangeLog({ changes = [] }) {
  const [expandedIndex, setExpandedIndex] = useState(null)

  if (!changes || changes.length === 0) return null

  const toggleExpand = (idx) => {
    setExpandedIndex(expandedIndex === idx ? null : idx)
  }

  return (
    <div className="changelog-card glass-card">
      <div className="changelog-header">
        <div className="header-title-wrap">
          <Sparkles size={16} className="text-cyan" />
          <h4>Optimization Changelog ({changes.length})</h4>
        </div>
        <span className="text-xs text-muted">AI Enhancements</span>
      </div>

      <div className="changes-accordion-list">
        {changes.map((item, idx) => {
          const isExpanded = expandedIndex === idx

          return (
            <div key={idx} className="change-item-box">
              <div
                className="change-item-header"
                onClick={() => toggleExpand(idx)}
              >
                <div className="change-title-group">
                  <span className="change-section-tag">{item.section || 'General'}</span>
                  <span className={`change-type-badge type-${item.type || 'enhanced'}`}>
                    {item.type || 'Enhanced'}
                  </span>
                </div>
                <button type="button" className="btn-toggle-expand">
                  {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
              </div>

              {/* Rationale Snippet */}
              <p className="change-reason text-xs text-secondary">
                <strong>Why:</strong> {item.reason || 'Aligned with target job keywords and action verb metrics.'}
              </p>

              {/* Diff View (Expanded or Summary) */}
              {isExpanded && (item.before || item.after) && (
                <div className="diff-view-container animate-fade-in">
                  {item.before && (
                    <div className="diff-block diff-before">
                      <span className="diff-label">Original:</span>
                      <p className="diff-text-del">{item.before}</p>
                    </div>
                  )}
                  {item.after && (
                    <div className="diff-block diff-after">
                      <span className="diff-label">Tailored:</span>
                      <p className="diff-text-add">{item.after}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
