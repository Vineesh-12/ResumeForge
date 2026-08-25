import React from 'react'
import { Check, AlertTriangle, X, Sparkles } from 'lucide-react'
import './SkillBadge.css'

export default function SkillBadge({
  skill,
  type = 'matched', // 'matched' | 'partial' | 'missing' | 'custom'
  matchedWith = '',
  confidence = 100,
  priority = 'medium',
  onAction,
  actionLabel
}) {
  const getIcon = () => {
    switch (type) {
      case 'matched':
        return <Check size={12} className="badge-icon-status" />
      case 'partial':
        return <AlertTriangle size={12} className="badge-icon-status" />
      case 'missing':
        return <X size={12} className="badge-icon-status" />
      default:
        return <Sparkles size={12} className="badge-icon-status" />
    }
  }

  const tooltipText = type === 'partial' && matchedWith
    ? `Matched with "${matchedWith}" (${confidence}% confidence)`
    : type === 'missing'
    ? `${priority.toUpperCase()} Priority requirement in target JD`
    : type === 'matched'
    ? '100% matched with target job keyword'
    : skill

  return (
    <div
      className={`skill-badge-item badge-${type} ${priority === 'high' && type === 'missing' ? 'badge-high-priority' : ''}`}
      title={tooltipText}
    >
      <span className="badge-icon-wrap">{getIcon()}</span>
      <span className="badge-skill-name">{skill}</span>
      {type === 'partial' && matchedWith && (
        <span className="badge-synonym-tag">→ {matchedWith}</span>
      )}
      {onAction && actionLabel && (
        <button
          type="button"
          className="badge-inline-action"
          onClick={(e) => {
            e.stopPropagation()
            onAction(skill)
          }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}
