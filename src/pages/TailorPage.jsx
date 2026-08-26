import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Wand2, ArrowRight, ArrowLeft, RefreshCw, MessageSquare, ShieldCheck } from 'lucide-react'
import { useApp } from '../context/AppContext'
import SkillVerification from '../components/SkillVerification/SkillVerification'
import ChangeLog from '../components/ChangeLog/ChangeLog'
import ResumeEditor from '../components/ResumeEditor/ResumeEditor'
import ResumeChat from '../components/ResumeChat/ResumeChat'
import LoadingOverlay from '../components/LoadingOverlay/LoadingOverlay'
import { tailorResumeWithAI } from '../services/resumeTailor'
import './TailorPage.css'

export default function TailorPage() {
  const { state, dispatch } = useApp()
  const navigate = useNavigate()
  const [isTailoring, setIsTailoring] = useState(false)
  const [sidebarTab, setSidebarTab] = useState('guard') // Default to 'guard' first for token efficiency and skill review

  // Run AI tailoring automatically on mount if not already tailored
  useEffect(() => {
    async function runAutoTailoring() {
      if (!state.tailoredResume && state.resumeParsed && state.jdParsed && state.apiKey) {
        setIsTailoring(true)
        try {
          const result = await tailorResumeWithAI(
            state.resumeParsed,
            state.jdParsed,
            state.gapAnalysis,
            state.apiKey
          )
          dispatch({
            type: 'SET_TAILORED_RESUME',
            payload: {
              tailoredResume: result.tailoredResume,
              changesLog: result.changesLog || [],
              skillSuggestions: result.skillSuggestions || []
            }
          })
        } catch (err) {
          console.error('Tailoring error:', err)
          dispatch({
            type: 'SET_ERROR',
            payload: 'AI Tailoring failed: ' + err.message
          })
        } finally {
          setIsTailoring(false)
        }
      }
    }
    runAutoTailoring()
  }, [state.tailoredResume, state.resumeParsed, state.jdParsed, state.gapAnalysis, state.apiKey, dispatch])

  // Effective tailored resume data
  const effectiveTailoredResume = state.tailoredResume || state.resumeParsed || {
    name: 'VINEET KUMAR',
    contact: {
      location: 'Bangalore, India',
      phone: '+91 98765 43210',
      email: 'vineet.kumar@email.com',
      linkedin: 'linkedin.com/in/vineet-kumar',
      github: 'github.com/vineet-kumar'
    },
    summary: 'Results-driven Full Stack Software Engineer with hands-on expertise architecting high-performance web systems using React.js, TypeScript, and Node.js. Demonstrated mastery in RESTful API development, PostgreSQL database optimization, and Docker microservices deployment.',
    skills: {
      languages: ['JavaScript (ES6+)', 'TypeScript', 'Python', 'SQL', 'HTML5', 'CSS3'],
      frameworks: ['React.js', 'Node.js', 'Express.js', 'Tailwind CSS'],
      tools: ['Git', 'GitHub', 'Docker', 'AWS (S3, Lambda)', 'Postman', 'Vite'],
      databases: ['PostgreSQL', 'MongoDB'],
      concepts: ['REST APIs', 'CI/CD Pipelines', 'Agile/Scrum', 'Data Structures & Algorithms']
    },
    experience: [
      {
        title: 'Software Development Intern',
        company: 'InnovateTech Labs',
        location: 'Bangalore, India',
        startDate: 'Jun 2025',
        endDate: 'Aug 2025',
        isCurrentlyWorking: false,
        links: [{ label: 'Certificate', url: 'https://example.com/certificate' }],
        bullets: [
          'Architected and deployed 12+ responsive React.js UI components, improving user workflow efficiency by 25%.',
          'Engineered secure Node.js/Express RESTful APIs serving 10,000+ daily requests with 99.9% uptime.',
          'Optimized PostgreSQL queries with composite indexing, slashing database response latency from 320ms to 180ms.'
        ]
      }
    ],
    projects: [
      {
        name: 'CardioCare AI — Clinical Decision Support for Heart Disease',
        technologies: ['Python', 'Streamlit', 'Scikit-Learn', 'XGBoost', 'Data Structures', 'Plotly', 'Pandas'],
        date: '2025',
        isCurrentlyWorking: false,
        links: [
          { label: 'GitHub', url: 'https://github.com/Vineesh-12/CardioCare-AI' },
          { label: 'Live App', url: 'https://cardiocare-ai.streamlit.app' }
        ],
        bullets: [
          'Engineered a clinical decision-support web app using Python, Streamlit, and efficient Data Structures to predict heart disease risk with 92% accuracy.',
          'Developed a Stacking Ensemble Classifier using Scikit-Learn and integrated Explainable AI (SHAP & LIME) for interpretability.',
          'Designed dynamic data visualizers with Plotly and built an automated EHR note generator using custom string parsing logic.'
        ]
      },
      {
        name: 'DevConnect — Developer Social Platform',
        technologies: ['React.js', 'Node.js', 'PostgreSQL', 'Docker'],
        date: 'Jan 2025',
        isCurrentlyWorking: false,
        links: [
          { label: 'GitHub', url: 'https://github.com/vineet-kumar/devconnect' }
        ],
        bullets: [
          'Engineered full-stack social platform supporting JWT authentication and AWS S3 media uploads.',
          'Automated containerized deployment using Docker and GitHub Actions CI/CD pipelines.'
        ]
      }
    ],
    education: [
      {
        degree: 'Bachelor of Technology in Computer Science',
        major: 'Computer Science & Engineering',
        institution: 'National Institute of Technology',
        location: 'India',
        startDate: '2022',
        endDate: '2026',
        gpa: '8.7 / 10.0',
        coursework: ['Data Structures & Algorithms', 'DBMS', 'Operating Systems', 'Computer Networks']
      }
    ],
    certifications: [
      {
        name: 'Meta Front-End Developer Professional Certificate',
        issuer: 'Coursera',
        year: '2025',
        url: 'https://coursera.org/verify/professional-cert',
        label: 'Credential'
      },
      {
        name: 'AWS Certified Cloud Practitioner',
        issuer: 'Amazon Web Services',
        year: '2025',
        url: 'https://aws.amazon.com/verification',
        label: 'Credential'
      }
    ]
  }

  const effectiveChangesLog = state.changesLog?.length > 0 ? state.changesLog : [
    {
      section: 'Professional Summary',
      type: 'rewritten',
      before: 'Motivated Computer Science graduate with hands-on experience in full-stack web development...',
      after: 'Results-driven Full Stack Software Engineer with hands-on expertise architecting high-performance web systems using React.js, TypeScript, and Node.js...',
      reason: 'Integrated top 5 target JD keywords: React.js, TypeScript, Node.js, REST APIs, and Docker'
    },
    {
      section: 'Technical Skills',
      type: 'added',
      before: 'Languages: JavaScript, Python, Java',
      after: 'Languages: JavaScript (ES6+), TypeScript, Python, Java',
      reason: 'Injected TypeScript keyword (high-priority requirement)'
    },
    {
      section: 'Experience Bullets',
      type: 'enhanced',
      before: 'Developed and maintained 12+ responsive React UI components',
      after: 'Architected and deployed 12+ responsive React.js UI components, improving user workflow efficiency by 25%',
      reason: 'Upgraded weak action verb to "Architected" and added quantified metric'
    }
  ]

  const effectiveSuggestions = state.skillSuggestions?.length > 0 ? state.skillSuggestions : [
    {
      skill: 'TypeScript',
      category: 'languages',
      confidence: 88,
      reason: 'High priority JD requirement; strongly aligned with your JavaScript background'
    },
    {
      skill: 'Docker',
      category: 'tools',
      confidence: 78,
      reason: 'Required for containerized microservices mentioned in job responsibilities'
    }
  ]

  const handleApproveSkill = (skillObj) => {
    const cat = skillObj.category || 'tools'
    const currentList = effectiveTailoredResume.skills?.[cat] || []
    if (!currentList.includes(skillObj.skill)) {
      const updatedSkills = {
        ...effectiveTailoredResume.skills,
        [cat]: [...currentList, skillObj.skill]
      }
      dispatch({
        type: 'UPDATE_TAILORED_SECTION',
        payload: { section: 'skills', data: updatedSkills }
      })
    }
  }

  const handleUpdateSection = (sectionKey, data) => {
    dispatch({
      type: 'UPDATE_TAILORED_SECTION',
      payload: { section: sectionKey, data }
    })
  }

  const handleReTailor = async () => {
    if (!state.resumeParsed || !state.jdParsed || !state.apiKey) return
    setIsTailoring(true)
    try {
      const result = await tailorResumeWithAI(
        state.resumeParsed,
        state.jdParsed,
        state.gapAnalysis,
        state.apiKey
      )
      dispatch({
        type: 'SET_TAILORED_RESUME',
        payload: {
          tailoredResume: result.tailoredResume,
          changesLog: result.changesLog || [],
          skillSuggestions: result.skillSuggestions || []
        }
      })
    } catch (err) {
      dispatch({
        type: 'SET_ERROR',
        payload: 'Re-tailoring failed: ' + (err.message || 'Unknown error')
      })
    } finally {
      setIsTailoring(false)
    }
  }

  return (
    <div className="page-container tailor-page animate-fade-up">
      {/* Loading Overlay */}
      <LoadingOverlay
        isOpen={isTailoring}
        message="AI is tailoring your resume with XYZ action verbs and ATS keywords..."
        step={2}
        progress={70}
      />

      {/* Header */}
      <div className="page-hero">
        <div className="hero-badge animate-pulse">
          <Wand2 size={14} />
          <span>Step 3 of 4 • Review Suggestions &amp; Edit Resume</span>
        </div>
        <h1 className="page-title">
          Smart Resume <span className="text-gradient">Tailor &amp; AI Copilot</span>
        </h1>
        <p className="page-subtitle">
          Review approved skill suggestions and changelog diffs, or chat with the AI Copilot for conversational revisions.
        </p>
      </div>

      {/* Workspace Grid */}
      <div className="tailor-workspace-grid">
        {/* Left Column: Skill Guard, Diff, & AI Copilot Chat */}
        <div className="tailor-sidebar-col">
          {/* Sidebar Tab Selector: Skill Guard & Diff is first! */}
          <div className="sidebar-tab-switcher">
            <button
              type="button"
              className={`sidebar-tab-btn ${sidebarTab === 'guard' ? 'active' : ''}`}
              onClick={() => setSidebarTab('guard')}
            >
              <ShieldCheck size={14} />
              <span>Skill Guard &amp; Diff</span>
            </button>
            <button
              type="button"
              className={`sidebar-tab-btn ${sidebarTab === 'chat' ? 'active' : ''}`}
              onClick={() => setSidebarTab('chat')}
            >
              <MessageSquare size={14} />
              <span>AI Copilot Chat</span>
            </button>
          </div>

          {/* Tab 1: Skill Guard & Changelog (Default) */}
          {sidebarTab === 'guard' && (
            <div className="sidebar-guard-group animate-fade-in">
              <SkillVerification
                suggestions={effectiveSuggestions}
                onApproveSkill={handleApproveSkill}
              />
              <ChangeLog changes={effectiveChangesLog} />
            </div>
          )}

          {/* Tab 2: AI Copilot Chat */}
          {sidebarTab === 'chat' && (
            <ResumeChat
              currentResume={effectiveTailoredResume}
              onResumeUpdated={(updated) => {
                dispatch({
                  type: 'SET_TAILORED_RESUME',
                  payload: {
                    tailoredResume: updated,
                    changesLog: state.changesLog || [],
                    skillSuggestions: state.skillSuggestions || []
                  }
                })
              }}
            />
          )}
        </div>

        {/* Right Column: Live Interactive Resume Editor Canvas */}
        <div className="tailor-editor-col">
          <ResumeEditor
            resumeData={effectiveTailoredResume}
            onChangeSection={handleUpdateSection}
          />
        </div>
      </div>

      {/* Navigation Actions */}
      <div className="page-nav-bar">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => navigate('/analyze')}
        >
          <ArrowLeft size={16} />
          <span>Back to Gap Analysis</span>
        </button>

        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleReTailor}
            disabled={isTailoring}
          >
            <RefreshCw size={15} className={isTailoring ? 'animate-spin' : ''} />
            <span>Re-Generate Tailoring</span>
          </button>
          <button
            type="button"
            className="btn btn-primary btn-lg"
            onClick={() => navigate('/export')}
          >
            <span>Proceed to PDF Export</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
