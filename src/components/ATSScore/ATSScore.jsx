import React, { useEffect, useState } from 'react'
import { ShieldCheck, TrendingUp } from 'lucide-react'
import './ATSScore.css'

export default function ATSScore({
  score = 82,
  grade = 'A-',
  breakdown = {},
  recommendations = []
}) {
  const [animatedScore, setAnimatedScore] = useState(0)

  useEffect(() => {
    let start = 0
    const end = Math.min(100, Math.max(0, score))
    const duration = 900
    const stepTime = 15
    const increment = end / (duration / stepTime)

    const timer = setInterval(() => {
      start += increment
      if (start >= end) {
        setAnimatedScore(end)
        clearInterval(timer)
      } else {
        setAnimatedScore(Math.round(start))
      }
    }, stepTime)

    return () => clearInterval(timer)
  }, [score])

  // SVG Circular Gauge calculations
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference

  const getScoreColor = () => {
    if (animatedScore >= 85) return 'var(--status-success)'
    if (animatedScore >= 70) return 'var(--status-warning)'
    return 'var(--status-danger)'
  }

  const breakdownList = Object.entries(breakdown).map(([key, val]) => ({
    key,
    label: val.label || key,
    score: val.score,
    max: val.max,
    percent: Math.round((val.score / val.max) * 100)
  }))

  return (
    <div className="ats-score-widget glass-card">
      <div className="score-widget-header">
        <div className="header-title-wrap">
          <ShieldCheck size={20} className="score-badge-icon" />
          <h4>ATS Screening Simulator</h4>
        </div>
        <span className="grade-badge" style={{ color: getScoreColor(), borderColor: getScoreColor() }}>
          Grade: {grade}
        </span>
      </div>

      {/* Circular Gauge */}
      <div className="gauge-visual-wrap">
        <svg className="gauge-svg" width="140" height="140" viewBox="0 0 140 140">
          {/* Background Track */}
          <circle
            className="gauge-circle-bg"
            cx="70"
            cy="70"
            r={radius}
            strokeWidth="10"
          />
          {/* Animated Value Arc */}
          <circle
            className="gauge-circle-val"
            cx="70"
            cy="70"
            r={radius}
            strokeWidth="10"
            stroke={getScoreColor()}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>

        <div className="gauge-center-content">
          <span className="gauge-score-digits" style={{ color: getScoreColor() }}>
            {animatedScore}
          </span>
          <span className="gauge-score-denominator">/ 100</span>
        </div>
      </div>

      {/* Breakdown Metrics */}
      <div className="breakdown-metrics-group">
        {breakdownList.map((item) => (
          <div key={item.key} className="metric-row">
            <div className="metric-label-row">
              <span className="metric-title">{item.label}</span>
              <span className="metric-score-text">
                {item.score} / {item.max}
              </span>
            </div>
            <div className="metric-track">
              <div
                className="metric-fill"
                style={{
                  width: `${item.percent}%`,
                  background: item.percent >= 80 ? 'var(--status-success)' : item.percent >= 60 ? 'var(--status-warning)' : 'var(--status-danger)'
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Recommendations Box */}
      {recommendations && recommendations.length > 0 && (
        <div className="score-recommendations-card">
          <div className="recs-header">
            <TrendingUp size={14} className="text-cyan" />
            <span className="text-xs font-bold">Optimization Advice:</span>
          </div>
          <ul className="recs-list">
            {recommendations.slice(0, 2).map((rec, idx) => (
              <li key={idx}>{rec}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
