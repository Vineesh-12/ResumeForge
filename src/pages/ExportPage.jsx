import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Download, ArrowLeft, RotateCcw } from 'lucide-react'
import { useApp } from '../context/AppContext'
import PDFPreview from '../components/PDFPreview/PDFPreview'
import './ExportPage.css'

export default function ExportPage() {
  const { state, dispatch } = useApp()
  const navigate = useNavigate()

  const effectiveResume = state.tailoredResume || state.resumeParsed || {
    name: 'VINEET KUMAR',
    contact: {
      location: 'Bangalore, India',
      phone: '+91 98765 43210',
      email: 'vineet.kumar@email.com',
      linkedin: 'linkedin.com/in/vineet-kumar',
      github: 'github.com/vineet-kumar',
      customLinks: [
        { label: 'LinkedIn', url: 'https://linkedin.com/in/vineet-kumar' },
        { label: 'GitHub', url: 'https://github.com/vineet-kumar' }
      ]
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

  const handleStartNew = () => {
    if (window.confirm('Start new resume optimization?')) {
      dispatch({ type: 'RESET_ALL' })
      navigate('/')
    }
  }

  return (
    <div className="page-container export-page animate-fade-up">
      {/* Header */}
      <div className="page-hero">
        <div className="hero-badge animate-pulse">
          <Download size={14} />
          <span>Step 4 of 4 • Export &amp; Download</span>
        </div>
        <h1 className="page-title">
          Your Resume is <span className="text-gradient">ATS Ready to Apply</span>
        </h1>
        <p className="page-subtitle">
          Export as an uncorrupted, text-selectable Harvard-Jake PDF or copy formatted plain text ready for direct pasting into Workday, Greenhouse, or Lever.
        </p>
      </div>

      {/* Live PDF Preview & Download Actions */}
      <PDFPreview
        resumeData={effectiveResume}
        targetRole={state.jdParsed?.jobTitle || 'Software_Engineer'}
      />

      {/* Navigation Actions Bar */}
      <div className="page-nav-bar">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => navigate('/tailor')}
        >
          <ArrowLeft size={16} />
          <span>Back to Live Editor &amp; Copilot</span>
        </button>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => navigate(`/p/${state.activeCloudResumeId || 'active'}`)}
          style={{ borderColor: 'rgba(37, 99, 235, 0.35)', color: '#93C5FD' }}
        >
          <span>🌐 View Shareable Web Portfolio</span>
        </button>

        <button
          type="button"
          className="btn btn-ghost"
          onClick={handleStartNew}
        >
          <RotateCcw size={14} />
          <span>Start New Resume</span>
        </button>
      </div>
    </div>
  )
}
