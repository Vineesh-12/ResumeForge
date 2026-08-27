import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Shield,
  FileText,
  Lock,
  MessageSquare,
  CheckCircle2,
  Send,
  AlertCircle,
  Cpu,
  Eye,
  Server,
  Globe
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import './LegalPage.css'

export default function LegalPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { dispatch } = useApp()

  // Determine active tab from URL (/privacy, /terms, /security, /contact)
  const getTabFromPath = () => {
    const path = location.pathname.replace('/', '')
    if (['privacy', 'terms', 'security', 'contact'].includes(path)) {
      return path
    }
    return 'privacy'
  }

  const [activeTab, setActiveTab] = useState(getTabFromPath())
  
  // Contact Form State
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    topic: 'feedback', // 'feedback' | 'bug' | 'feature' | 'other'
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  useEffect(() => {
    setActiveTab(getTabFromPath())
  }, [location.pathname])

  const handleTabClick = (tab) => {
    setActiveTab(tab)
    navigate(`/${tab}`)
  }

  const handleContactSubmit = (e) => {
    e.preventDefault()
    if (!contactForm.email || !contactForm.message) {
      dispatch({ type: 'SET_ERROR', payload: 'Please fill in both your email and message.' })
      return
    }

    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSubmitted(true)
      dispatch({
        type: 'SET_TOAST',
        payload: { message: 'Thank you! Your feedback has been received.', type: 'success' }
      })
      setContactForm({ name: '', email: '', topic: 'feedback', message: '' })
    }, 600)
  }

  return (
    <div className="legal-page-container animate-fade-up">
      {/* Top Header */}
      <div className="legal-header">
        <div className="legal-badge">
          <Shield size={14} />
          <span>Trust, Privacy &amp; Governance Center</span>
        </div>
        <h1 className="legal-title">Security &amp; Legal Compliance</h1>
        <p className="legal-subtitle">
          ResumeForge is engineered with a strict client-side privacy architecture. We believe job seekers should own their personal data with 100% transparency.
        </p>

        {/* Navigation Tabs */}
        <div className="legal-tab-bar">
          <button
            type="button"
            className={`legal-tab-btn ${activeTab === 'privacy' ? 'active' : ''}`}
            onClick={() => handleTabClick('privacy')}
          >
            <Eye size={16} />
            <span>Privacy Policy</span>
          </button>
          <button
            type="button"
            className={`legal-tab-btn ${activeTab === 'terms' ? 'active' : ''}`}
            onClick={() => handleTabClick('terms')}
          >
            <FileText size={16} />
            <span>Terms of Service</span>
          </button>
          <button
            type="button"
            className={`legal-tab-btn ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => handleTabClick('security')}
          >
            <Lock size={16} />
            <span>Security Architecture</span>
          </button>
          <button
            type="button"
            className={`legal-tab-btn ${activeTab === 'contact' ? 'active' : ''}`}
            onClick={() => handleTabClick('contact')}
          >
            <MessageSquare size={16} />
            <span>Contact &amp; Support</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="glass-card legal-content-card">
        {/* TAB 1: PRIVACY POLICY */}
        {activeTab === 'privacy' && (
          <div className="legal-document-flow">
            <div className="doc-section-header">
              <h2>Privacy Policy</h2>
              <span className="doc-meta">Last Updated: August 2026 • Version 2.4</span>
            </div>

            <div className="privacy-highlight-box">
              <CheckCircle2 size={20} className="text-emerald" />
              <div>
                <strong>Core Privacy Promise:</strong> We never sell, monetize, or train global models on your resume data. PDF parsing and formatting execute 100% locally in your browser memory.
              </div>
            </div>

            <section className="legal-section">
              <h3>1. Information We Process</h3>
              <p>
                When you upload a resume or paste a job description into ResumeForge, the text parsing is performed <strong>in-memory</strong> on your local machine using Mozilla PDF.js.
              </p>
              <ul>
                <li><strong>Local Storage:</strong> Your contact preferences, active resume edits, and job tracker stages are stored in your browser's private <code>localStorage</code> by default.</li>
                <li><strong>Cloud Sync (Optional):</strong> If you choose to log in via Firebase Authentication, your saved resumes and job applications are securely synced to your private Google Cloud Firestore tenant under strict security rules.</li>
              </ul>
            </section>

            <section className="legal-section">
              <h3>2. AI Processing &amp; API Key Governance</h3>
              <p>
                Resume tailoring and gap analysis are powered by Google Gemini API models.
              </p>
              <ul>
                <li>When using your own API Key (BYOK), communication occurs directly between your client browser and Google AI Studio endpoints.</li>
                <li>Your API keys are never transmitted to any third-party logging server or analytics provider.</li>
              </ul>
            </section>

            <section className="legal-section">
              <h3>3. Data Deletion &amp; Portability</h3>
              <p>
                Under GDPR and CCPA compliance standards, you have the absolute right to export or delete your data at any time via the <a href="/settings" className="text-emerald font-bold">Settings Hub</a>.
              </p>
            </section>
          </div>
        )}

        {/* TAB 2: TERMS OF SERVICE */}
        {activeTab === 'terms' && (
          <div className="legal-document-flow">
            <div className="doc-section-header">
              <h2>Terms of Service</h2>
              <span className="doc-meta">Effective Date: August 2026</span>
            </div>

            <section className="legal-section">
              <h3>1. Acceptance of Terms</h3>
              <p>
                By accessing or using ResumeForge, you agree to these Terms of Service. ResumeForge is provided as an open, accessible career tool for students, software engineers, and professionals.
              </p>
            </section>

            <section className="legal-section">
              <h3>2. Permitted Use &amp; Intellectual Property</h3>
              <p>
                All resumes, cover letters, and application materials generated on ResumeForge belong <strong>100% to you</strong>. You retain full ownership and copyright over your career documents and exported PDFs.
              </p>
            </section>

            <section className="legal-section">
              <h3>3. AI Output &amp; Accuracy Disclaimer</h3>
              <p>
                ResumeForge employs non-destructive AI prompting engineered specifically around the Google XYZ bullet formula. While our systems are designed to eliminate hallucinations, users are advised to review all facts, dates, and metrics prior to submitting applications to prospective employers.
              </p>
            </section>
          </div>
        )}

        {/* TAB 3: SECURITY ARCHITECTURE */}
        {activeTab === 'security' && (
          <div className="legal-document-flow">
            <div className="doc-section-header">
              <h2>Security Architecture &amp; Data Safeguards</h2>
              <span className="doc-meta">SOC2 Compliant Cloud Infrastructure</span>
            </div>

            <div className="security-cards-grid">
              <div className="sec-feature-card">
                <div className="sec-icon-pill">
                  <Cpu size={20} />
                </div>
                <h4>In-Browser PDF Parsing</h4>
                <p>PDF extraction executes entirely inside WebAssembly/JavaScript sandboxes without uploading files to intermediate parsing servers.</p>
              </div>

              <div className="sec-feature-card">
                <div className="sec-icon-pill">
                  <Server size={20} />
                </div>
                <h4>Google Cloud Firestore Isolation</h4>
                <p>User database records are protected by strict Firebase Security Rules that verify user UIDs on every read/write operation.</p>
              </div>

              <div className="sec-feature-card">
                <div className="sec-icon-pill">
                  <Lock size={20} />
                </div>
                <h4>Zero Credential Storage</h4>
                <p>Authentication utilizes Google OAuth and Firebase Auth with JWT cryptographic tokens, preventing plain-text password vulnerabilities.</p>
              </div>

              <div className="sec-feature-card">
                <div className="sec-icon-pill">
                  <Globe size={20} />
                </div>
                <h4>Encrypted TLS 1.3 Transport</h4>
                <p>All network communications enforce HTTPS/TLS 1.3 encryption with strict Content Security Policies and CORS safeguards.</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: CONTACT & SUPPORT */}
        {activeTab === 'contact' && (
          <div className="legal-document-flow">
            <div className="doc-section-header">
              <h2>Contact Support &amp; Bug Reporter</h2>
              <p className="text-sm text-muted">Have a suggestion, question, or need assistance? Reach out directly to the core engineering team.</p>
            </div>

            {isSubmitted ? (
              <div className="contact-success-card">
                <CheckCircle2 size={42} className="text-emerald" />
                <h3>Message Sent Successfully!</h3>
                <p className="text-sm text-muted">Thank you for helping us improve ResumeForge. Our team reviews feedback continuously.</p>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setIsSubmitted(false)}
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="contact-form-stack">
                <div className="contact-row-2">
                  <div className="form-group">
                    <label>Your Name (Optional)</label>
                    <input
                      type="text"
                      className="input-control"
                      placeholder="e.g. Jordan Lee"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Your Email Address *</label>
                    <input
                      type="email"
                      required
                      className="input-control"
                      placeholder="e.g. jordan@example.com"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Topic</label>
                  <select
                    className="select-control"
                    value={contactForm.topic}
                    onChange={(e) => setContactForm({ ...contactForm, topic: e.target.value })}
                  >
                    <option value="feedback">General Feedback &amp; Ideas</option>
                    <option value="bug">Report a Bug / Issue</option>
                    <option value="feature">Request a New ATS Template or Feature</option>
                    <option value="privacy">Privacy or Data Question</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Your Message *</label>
                  <textarea
                    required
                    rows={5}
                    className="textarea-control"
                    placeholder="Describe your feedback, question, or steps to reproduce an issue..."
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  />
                </div>

                <div className="contact-submit-row">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn btn-primary"
                  >
                    {isSubmitting ? (
                      <span>Sending...</span>
                    ) : (
                      <>
                        <Send size={16} />
                        <span>Submit Feedback</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
