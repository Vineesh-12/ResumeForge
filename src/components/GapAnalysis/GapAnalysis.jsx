import React from 'react'
import { CheckCircle2, AlertTriangle, XCircle, BarChart2, Layers } from 'lucide-react'
import SkillBadge from '../SkillBadge/SkillBadge'
import './GapAnalysis.css'

export default function GapAnalysis({ gapAnalysis }) {
  if (!gapAnalysis) return null

  const { matched = [], partial = [], missing = [], densityMap = {}, metrics = {} } = gapAnalysis

  return (
    <div className="gap-analysis-dashboard glass-card">
      {/* Metrics Summary Strip */}
      <div className="metrics-summary-strip">
        <div className="metric-stat-item">
          <span className="stat-value">{metrics.totalKeywords || 0}</span>
          <span className="stat-label">JD Keywords</span>
        </div>
        <div className="metric-stat-divider" />
        <div className="metric-stat-item text-success">
          <span className="stat-value">{metrics.matchedCount || 0}</span>
          <span className="stat-label">Matched (100%)</span>
        </div>
        <div className="metric-stat-divider" />
        <div className="metric-stat-item text-warning">
          <span className="stat-value">{metrics.partialCount || 0}</span>
          <span className="stat-label">Partial / Synonyms</span>
        </div>
        <div className="metric-stat-divider" />
        <div className="metric-stat-item text-danger">
          <span className="stat-value">{metrics.missingCount || 0}</span>
          <span className="stat-label">Missing Gaps</span>
        </div>
      </div>

      {/* Competency Group Lists */}
      <div className="matrix-groups-container">
        {/* Matched Group */}
        <div className="matrix-category-group">
          <div className="category-group-header">
            <div className="header-left">
              <CheckCircle2 size={16} className="text-success" />
              <h4>100% Matched Keywords ({matched.length})</h4>
            </div>
            <span className="text-xs text-muted">Found directly in resume</span>
          </div>

          <div className="badges-flow-wrap">
            {matched.length > 0 ? (
              matched.map((item, idx) => (
                <SkillBadge
                  key={idx}
                  skill={item.skill}
                  type="matched"
                  confidence={item.confidence}
                />
              ))
            ) : (
              <p className="text-xs text-muted italic">No direct matches identified.</p>
            )}
          </div>
        </div>

        {/* Partial & Synonym Matches */}
        <div className="matrix-category-group">
          <div className="category-group-header">
            <div className="header-left">
              <AlertTriangle size={16} className="text-warning" />
              <h4>Partial &amp; Synonym Matches ({partial.length})</h4>
            </div>
            <span className="text-xs text-muted">Recognized via semantic synonyms</span>
          </div>

          <div className="badges-flow-wrap">
            {partial.length > 0 ? (
              partial.map((item, idx) => (
                <SkillBadge
                  key={idx}
                  skill={item.skill}
                  matchedWith={item.matchedWith}
                  type="partial"
                  confidence={item.confidence}
                />
              ))
            ) : (
              <p className="text-xs text-muted italic">No partial matches found.</p>
            )}
          </div>
        </div>

        {/* Missing Keywords */}
        <div className="matrix-category-group">
          <div className="category-group-header">
            <div className="header-left">
              <XCircle size={16} className="text-danger" />
              <h4>Missing Target Keywords ({missing.length})</h4>
            </div>
            <span className="text-xs text-muted">AI will inject these into tailored resume</span>
          </div>

          <div className="badges-flow-wrap">
            {missing.length > 0 ? (
              missing.map((item, idx) => (
                <SkillBadge
                  key={idx}
                  skill={item.skill}
                  type="missing"
                  priority={item.priority}
                />
              ))
            ) : (
              <p className="text-xs text-muted italic">Zero missing keywords — complete coverage!</p>
            )}
          </div>
        </div>

        {/* Keyword Density Frequency Bar */}
        {Object.keys(densityMap).length > 0 && (
          <div className="matrix-category-group density-map-section">
            <div className="category-group-header">
              <div className="header-left">
                <BarChart2 size={16} className="text-cyan" />
                <h4>Keyword Frequency &amp; Density Distribution</h4>
              </div>
              <span className="text-xs text-muted">Optimal: 2–3 occurrences per critical keyword</span>
            </div>

            <div className="density-tags-grid">
              {Object.entries(densityMap).slice(0, 12).map(([kw, count], idx) => (
                <div key={idx} className="density-tag-card">
                  <span className="density-kw-name">{kw}</span>
                  <span className={`density-count-pill ${count >= 2 ? 'count-optimal' : count === 1 ? 'count-low' : 'count-zero'}`}>
                    {count}x
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
