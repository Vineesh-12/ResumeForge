import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  QrCode,
  Share2,
  Check,
  ShieldCheck,
  Award,
  Sparkles,
  ArrowLeft
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { db } from '../services/firebase'
import { doc, getDoc } from 'firebase/firestore'
import './PublicResumePage.css'

export default function PublicResumePage() {
  const { id } = useParams()
  const { state } = useApp()
  const navigate = useNavigate()

  const [resumeData, setResumeData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [showQr, setShowQr] = useState(false)

  useEffect(() => {
    async function fetchResume() {
      setIsLoading(true)

      // Check if viewing active local draft
      if (id === 'active' || id === 'preview') {
        const active = state.tailoredResume || state.resumeParsed
        setResumeData(active)
        setIsLoading(false)
        return
      }

      // Check if user has it in local state
      const foundInState = state.userResumes?.find(r => r.id === id)
      if (foundInState && foundInState.resumeData) {
        setResumeData(foundInState.resumeData)
        setIsLoading(false)
        return
      }

      // Fetch from Firestore if logged in
      if (state.currentUser?.uid && id) {
        try {
          const docRef = doc(db, 'users', state.currentUser.uid, 'resumes', id)
          const snap = await getDoc(docRef)
          if (snap.exists()) {
            setResumeData(snap.data().resumeData)
            setIsLoading(false)
            return
          }
        } catch (err) {
          console.warn('Direct Firestore resume fetch error:', err)
        }
      }

      // Fallback: use active resume if available
      setResumeData(state.tailoredResume || state.resumeParsed)
      setIsLoading(false)
    }

    fetchResume()
  }, [id, state.currentUser, state.tailoredResume, state.userResumes])

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    } catch {
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    }
  }

  if (isLoading) {
    return (
      <div className="public-loading-container">
        <div className="animate-spin text-purple">
          <Sparkles size={36} />
        </div>
        <p className="text-sm text-secondary">Loading Web Resume Portfolio...</p>
      </div>
    )
  }

  if (!resumeData) {
    return (
      <div className="public-empty-container page-container">
        <div className="glass-card public-empty-card">
          <h2>No Resume Found</h2>
          <p className="text-sm text-muted">
            The requested web resume is either private or has not been published yet.
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            <ArrowLeft size={16} />
            <span>Go to ResumeForge Home</span>
          </button>
        </div>
      </div>
    )
  }

  const contact = resumeData.contact || {}
  const rawContactLinks = Array.isArray(contact.customLinks)
    ? contact.customLinks
    : [
        contact.linkedin ? { label: 'LinkedIn', url: contact.linkedin } : null,
        contact.github ? { label: 'GitHub', url: contact.github } : null
      ].filter(Boolean)

  const skills = resumeData.skills || {}
  const experience = resumeData.experience || []
  const projects = resumeData.projects || []
  const education = resumeData.education || []
  const certifications = resumeData.certifications || []

  // Dynamic QR Code URL
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(window.location.href)}&color=2563eb&bgcolor=111827`

  return (
    <div className="public-resume-page animate-fade-up">
      {/* Top Floating Control Bar */}
      <div className="public-top-nav">
        <button
          type="button"
          className="btn-back-link"
          onClick={() => navigate('/')}
        >
          <ArrowLeft size={15} />
          <span>ResumeForge</span>
        </button>

        <div className="public-nav-actions">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setShowQr(!showQr)}
            title="Show QR Code"
          >
            <QrCode size={14} />
            <span>QR Code</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleShare}
          >
            {copied ? <Check size={14} className="text-success" /> : <Share2 size={14} />}
            <span>{copied ? 'Link Copied!' : 'Share'}</span>
          </button>

          {contact.email && (
            <a
              href={`mailto:${contact.email}?subject=Career Opportunity for ${encodeURIComponent(resumeData.name || 'Candidate')}`}
              className="btn btn-primary btn-sm btn-hire-me"
            >
              <Mail size={14} />
              <span>Hire Me</span>
            </a>
          )}
        </div>
      </div>

      {/* QR Code Popup Card */}
      {showQr && (
        <div className="qr-popup-card glass-card animate-fade-in">
          <div className="qr-header">
            <span>Scan to View on Mobile</span>
            <button type="button" onClick={() => setShowQr(false)} className="btn-close-qr">✕</button>
          </div>
          <img src={qrApiUrl} alt="Resume QR Code" className="qr-img" width="180" height="180" />
          <p className="text-xs text-muted">Scan with phone camera to open portfolio</p>
        </div>
      )}

      {/* Main Resume Canvas Card */}
      <div className="public-resume-card glass-card">
        {/* Header Section */}
        <header className="pub-header">
          <div className="pub-title-row">
            <div>
              <h1 className="pub-name">{resumeData.name || 'Candidate Name'}</h1>
              <div className="pub-contact-row">
                {contact.location && (
                  <span className="pub-meta-item">
                    <MapPin size={13} /> {contact.location}
                  </span>
                )}
                {contact.phone && (
                  <span className="pub-meta-item">
                    <Phone size={13} /> {contact.phone}
                  </span>
                )}
                {contact.email && (
                  <a href={`mailto:${contact.email}`} className="pub-meta-item pub-meta-link">
                    <Mail size={13} /> {contact.email}
                  </a>
                )}
              </div>
            </div>

            <div className="pub-badge-status">
              <ShieldCheck size={16} className="text-success" />
              <span>Verified ATS Standard</span>
            </div>
          </div>

          {/* Links Pills */}
          {rawContactLinks.length > 0 && (
            <div className="pub-links-bar">
              {rawContactLinks.map((l, idx) => {
                if (!l || !l.url) return null
                const fullUrl = l.url.startsWith('http') ? l.url : `https://${l.url}`
                return (
                  <a
                    key={idx}
                    href={fullUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pub-link-chip"
                  >
                    <ExternalLink size={12} />
                    <span>{l.label || l.url.replace(/^https?:\/\//, '')}</span>
                  </a>
                )
              })}
            </div>
          )}
        </header>

        {/* Professional Summary */}
        {resumeData.summary && (
          <section className="pub-section">
            <h3 className="pub-section-title">Professional Summary</h3>
            <p className="pub-summary-text">{resumeData.summary}</p>
          </section>
        )}

        {/* Skills */}
        {skills && (
          <section className="pub-section">
            <h3 className="pub-section-title">Technical Expertise</h3>
            <div className="pub-skills-stack">
              {skills.languages?.length > 0 && (
                <div className="pub-skill-row">
                  <span className="pub-skill-label">Languages:</span>
                  <div className="pub-chips-wrap">
                    {skills.languages.map((s, i) => <span key={i} className="pub-tech-chip">{s}</span>)}
                  </div>
                </div>
              )}
              {skills.frameworks?.length > 0 && (
                <div className="pub-skill-row">
                  <span className="pub-skill-label">Frameworks &amp; Libraries:</span>
                  <div className="pub-chips-wrap">
                    {skills.frameworks.map((s, i) => <span key={i} className="pub-tech-chip chip-cyan">{s}</span>)}
                  </div>
                </div>
              )}
              {skills.tools?.length > 0 && (
                <div className="pub-skill-row">
                  <span className="pub-skill-label">Developer Tools &amp; Cloud:</span>
                  <div className="pub-chips-wrap">
                    {skills.tools.map((s, i) => <span key={i} className="pub-tech-chip">{s}</span>)}
                  </div>
                </div>
              )}
              {skills.databases?.length > 0 && (
                <div className="pub-skill-row">
                  <span className="pub-skill-label">Databases:</span>
                  <div className="pub-chips-wrap">
                    {skills.databases.map((s, i) => <span key={i} className="pub-tech-chip">{s}</span>)}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <section className="pub-section">
            <h3 className="pub-section-title">Experience</h3>
            <div className="pub-entries-list">
              {experience.map((exp, idx) => {
                const expLinks = Array.isArray(exp.links) ? exp.links.filter(l => l && l.url) : []

                return (
                  <div key={idx} className="pub-entry-item">
                    <div className="pub-entry-header">
                      <div>
                        <h4 className="pub-entry-title">
                          {exp.title}
                          {expLinks.map((l, lIdx) => {
                            const fullUrl = l.url.startsWith('http') ? l.url : `https://${l.url}`
                            return (
                              <a
                                key={lIdx}
                                href={fullUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="pub-inline-link"
                              >
                                <ExternalLink size={11} /> {l.label || 'Proof'}
                              </a>
                            )
                          })}
                        </h4>
                        <span className="pub-company-name">
                          {exp.company}{exp.location ? ` • ${exp.location}` : ''}
                        </span>
                      </div>
                      <span className="pub-date-badge">
                        {exp.startDate} – {exp.endDate}
                      </span>
                    </div>

                    <ul className="pub-bullets-list">
                      {(exp.bullets || []).map((bullet, bIdx) => (
                        <li key={bIdx}>{bullet}</li>
                      ))}
                    </ul>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <section className="pub-section">
            <h3 className="pub-section-title">Projects</h3>
            <div className="pub-entries-list">
              {projects.map((proj, idx) => {
                const pLinks = Array.isArray(proj.links) ? proj.links.filter(l => l && l.url) : []

                return (
                  <div key={idx} className="pub-entry-item">
                    <div className="pub-entry-header">
                      <div>
                        <h4 className="pub-entry-title">
                          {proj.name}
                          {pLinks.map((l, lIdx) => {
                            const fullUrl = l.url.startsWith('http') ? l.url : `https://${l.url}`
                            return (
                              <a
                                key={lIdx}
                                href={fullUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="pub-inline-link"
                              >
                                <ExternalLink size={11} /> {l.label || 'Demo'}
                              </a>
                            )
                          })}
                        </h4>
                        {proj.technologies?.length > 0 && (
                          <div className="pub-chips-wrap" style={{ marginTop: 4 }}>
                            {proj.technologies.map((t, tIdx) => (
                              <span key={tIdx} className="pub-tech-chip chip-sm">{t}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <span className="pub-date-badge">{proj.date}</span>
                    </div>

                    <ul className="pub-bullets-list">
                      {(proj.bullets || []).map((bullet, bIdx) => (
                        <li key={bIdx}>{bullet}</li>
                      ))}
                    </ul>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Education & Certifications */}
        <div className="pub-2col-grid">
          {education.length > 0 && (
            <section className="pub-section">
              <h3 className="pub-section-title">Education</h3>
              {education.map((edu, idx) => (
                <div key={idx} className="pub-sub-item">
                  <div className="pub-entry-header">
                    <div>
                      <h4 className="pub-entry-title">{edu.degree} — {edu.major}</h4>
                      <span className="pub-company-name">{edu.institution}{edu.location ? `, ${edu.location}` : ''}</span>
                    </div>
                    <span className="pub-date-badge">{edu.startDate ? `${edu.startDate} – ` : ''}{edu.endDate}</span>
                  </div>
                  {edu.gpa && <span className="pub-gpa-tag">CGPA: {edu.gpa}</span>}
                </div>
              ))}
            </section>
          )}

          {certifications.length > 0 && (
            <section className="pub-section">
              <h3 className="pub-section-title">Certifications</h3>
              <div className="pub-certs-stack">
                {certifications.map((cert, idx) => {
                  const fullUrl = cert.url ? (cert.url.startsWith('http') ? cert.url : `https://${cert.url}`) : null
                  return (
                    <div key={idx} className="pub-cert-card">
                      <Award size={16} className="text-purple" />
                      <div>
                        <strong>{cert.name}</strong>
                        <span className="pub-cert-meta">
                          {cert.issuer} {cert.year ? `(${cert.year})` : ''}
                        </span>
                      </div>
                      {fullUrl && (
                        <a href={fullUrl} target="_blank" rel="noreferrer" className="pub-inline-link" style={{ marginLeft: 'auto' }}>
                          <ExternalLink size={12} /> {cert.label || 'View'}
                        </a>
                      )}
                    </div>
                  )
                })}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
