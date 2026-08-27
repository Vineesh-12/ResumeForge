import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarChart3, ArrowRight, ArrowLeft, Wand2 } from 'lucide-react'
import { useApp } from '../context/AppContext'
import ATSScore from '../components/ATSScore/ATSScore'
import GapAnalysis from '../components/GapAnalysis/GapAnalysis'
import { analyzeCompetencyGaps } from '../services/gapAnalyzer'
import { calculateATSScore } from '../services/atsScorer'
import './AnalysisPage.css'

export default function AnalysisPage() {
  const { state, dispatch } = useApp()
  const navigate = useNavigate()

  useEffect(() => {
    // Only calculate if not already present in state
    if (!state.gapAnalysis && state.resumeParsed && state.jdParsed) {
      const gaps = analyzeCompetencyGaps(state.resumeParsed, state.jdParsed)
      const atsReport = calculateATSScore(state.resumeParsed, state.jdParsed, gaps)

      dispatch({
        type: 'SET_GAP_ANALYSIS',
        payload: {
          gapAnalysis: gaps,
          atsScore: atsReport.totalScore,
          atsGrade: atsReport.grade,
          atsBreakdown: atsReport.breakdown
        }
      })
    }
  }, [state.gapAnalysis, state.resumeParsed, state.jdParsed, dispatch])

  // Fallback / default gap analysis if user navigates directly without input
  const effectiveGaps = state.gapAnalysis || {
    matched: [
      { skill: 'React.js', matchedWith: 'React', confidence: 100 },
      { skill: 'JavaScript (ES6+)', matchedWith: 'JavaScript', confidence: 100 },
      { skill: 'REST APIs', matchedWith: 'REST API', confidence: 100 },
      { skill: 'Node.js', matchedWith: 'Node.js', confidence: 100 },
      { skill: 'PostgreSQL', matchedWith: 'PostgreSQL', confidence: 100 },
      { skill: 'Git', matchedWith: 'Git', confidence: 100 }
    ],
    partial: [
      { skill: 'TypeScript', matchedWith: 'JavaScript', confidence: 85, isSynonym: true },
      { skill: 'CI/CD Pipelines', matchedWith: 'GitHub Actions', confidence: 80, isSynonym: true }
    ],
    missing: [
      { skill: 'Docker Containerization', priority: 'high', suggestion: 'Add Docker container skills' },
      { skill: 'AWS (S3 / Lambda)', priority: 'medium', suggestion: 'Mention AWS cloud knowledge' }
    ],
    densityMap: {
      'React.js': 3,
      'Node.js': 2,
      'REST APIs': 2,
      'PostgreSQL': 1,
      'Docker': 0,
      'AWS': 0
    },
    metrics: {
      totalKeywords: 10,
      matchedCount: 6,
      partialCount: 2,
      missingCount: 2,
      matchRate: 80
    }
  }

  const dynamicMissing = effectiveGaps?.missing?.slice(0, 3)?.map(m => m.skill)?.join(', ')
  const dynamicRecommendations = state.atsRecommendations || [
    dynamicMissing
      ? `Incorporate missing target keywords (${dynamicMissing}) into your Skills & Projects.`
      : 'Incorporate missing target keywords from the Job Description into your Skills & Projects.',
    'Quantify achievements in your experience section with numbers or percentage gains.'
  ]

  const effectiveATSReport = {
    score: state.atsScore || 82,
    grade: state.atsGrade || 'A-',
    breakdown: state.atsBreakdown || {
      keywordMatch: { score: 28, max: 35, label: 'Keyword Density Match' },
      keywordPlacement: { score: 12, max: 15, label: 'Top 1/3 Keyword Placement' },
      structuralHierarchy: { score: 15, max: 15, label: 'Standard Section Hierarchy' },
      xyzBullets: { score: 12, max: 15, label: 'XYZ Impact Formula Bullets' },
      categoryDepth: { score: 8, max: 10, label: 'Technical Skills Breadth' },
      contactParsability: { score: 10, max: 10, label: 'Contact Info Completeness' }
    },
    recommendations: dynamicRecommendations
  }

  return (
    <div className="page-container analysis-page animate-fade-up">
      {/* Header */}
      <div className="page-hero">
        <div className="hero-badge animate-pulse">
          <BarChart3 size={14} />
          <span>Step 2 of 4 • ATS Keyword &amp; Gap Analysis</span>
        </div>
        <h1 className="page-title">
          ATS Screening <span className="text-gradient">Diagnostic Report</span>
        </h1>
        <p className="page-subtitle">
          Real-time semantic comparison between candidate competencies and target job posting keywords.
        </p>
      </div>

      {/* Main Analysis Dashboard Grid */}
      <div className="analysis-dashboard-grid">
        {/* Left Column: ATS Score Gauge Card */}
        <div className="score-sidebar-col">
          <ATSScore
            score={effectiveATSReport.score}
            grade={effectiveATSReport.grade}
            breakdown={effectiveATSReport.breakdown}
            recommendations={effectiveATSReport.recommendations}
          />
        </div>

        {/* Right Column: Keyword Match Matrix */}
        <div className="matrix-main-col">
          <GapAnalysis gapAnalysis={effectiveGaps} />
        </div>
      </div>

      {/* Navigation Actions */}
      <div className="page-nav-bar">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => navigate('/')}
        >
          <ArrowLeft size={16} />
          <span>Back to Upload</span>
        </button>
        <button
          type="button"
          className="btn btn-primary btn-lg"
          onClick={() => navigate('/tailor')}
        >
          <Wand2 size={18} />
          <span>Proceed to AI Tailoring</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  )
}
