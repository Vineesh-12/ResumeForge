import React, { useState } from 'react'
import { PDFDownloadLink, BlobProvider } from '@react-pdf/renderer'
import {
  Download,
  Copy,
  Check,
  FileText,
  CheckCircle2,
  Layout
} from 'lucide-react'
import HarvardJakeTemplate from '../../templates/HarvardJakeTemplate'
import TechLeadMinimalistTemplate from '../../templates/TechLeadMinimalistTemplate'
import ExecutiveClassicTemplate from '../../templates/ExecutiveClassicTemplate'
import ModernCompactTemplate from '../../templates/ModernCompactTemplate'
import './PDFPreview.css'

const TEMPLATES = [
  {
    id: 'harvard',
    name: 'Harvard-Jake',
    tag: 'Classic Standard',
    desc: 'Battle-tested single column standard used across FAANG & top tech.'
  },
  {
    id: 'techlead',
    name: 'Tech Lead Minimalist',
    tag: 'High Density',
    desc: 'Compact technical layout optimized for senior engineering & devops.'
  },
  {
    id: 'executive',
    name: 'Executive Classic',
    tag: 'Formal Serif',
    desc: 'Traditional Times typography ideal for leadership & management.'
  },
  {
    id: 'modern',
    name: 'Modern Compact',
    tag: 'Clean Accent',
    desc: 'Left-aligned date styling with high-readability spacing.'
  }
]

export default function PDFPreview({ resumeData, targetRole = 'Software_Engineer' }) {
  const [copied, setCopied] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState('harvard')

  if (!resumeData) return null

  const cleanName = (resumeData.name || 'Candidate')
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_]/g, '')
  const cleanRole = (targetRole || 'Software_Engineer')
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_]/g, '')
  const fileName = `Resume_${cleanName}_${cleanRole}_${selectedTemplate}.pdf`

  // Render selected React PDF Document
  const renderPdfDocument = () => {
    switch (selectedTemplate) {
      case 'techlead':
        return <TechLeadMinimalistTemplate data={resumeData} />
      case 'executive':
        return <ExecutiveClassicTemplate data={resumeData} />
      case 'modern':
        return <ModernCompactTemplate data={resumeData} />
      case 'harvard':
      default:
        return <HarvardJakeTemplate data={resumeData} />
    }
  }

  // Generate plain text formatted for direct ATS application portal pasting
  const generatePlainText = () => {
    const lines = []
    lines.push((resumeData.name || 'CANDIDATE NAME').toUpperCase())
    const contact = resumeData.contact || {}
    const rawContactLinks = Array.isArray(contact.customLinks)
      ? contact.customLinks
      : [
          contact.linkedin ? { label: 'LinkedIn', url: contact.linkedin } : null,
          contact.github ? { label: 'GitHub', url: contact.github } : null
        ].filter(Boolean)

    const headerItems = [
      contact.location,
      contact.phone,
      contact.email,
      ...rawContactLinks.map(l => l.label || l.url)
    ].filter(Boolean)

    lines.push(headerItems.join(' | '))
    lines.push('\n' + '='.repeat(50))
    lines.push('PROFESSIONAL SUMMARY')
    lines.push('='.repeat(50))
    lines.push(resumeData.summary || '')

    lines.push('\n' + '='.repeat(50))
    lines.push('TECHNICAL SKILLS')
    lines.push('='.repeat(50))
    const skills = resumeData.skills || {}
    if (skills.languages?.length) lines.push(`Languages: ${skills.languages.join(', ')}`)
    if (skills.frameworks?.length) lines.push(`Frameworks: ${skills.frameworks.join(', ')}`)
    if (skills.tools?.length) lines.push(`Developer Tools: ${skills.tools.join(', ')}`)
    if (skills.databases?.length) lines.push(`Databases: ${skills.databases.join(', ')}`)
    if (skills.concepts?.length) lines.push(`Concepts: ${skills.concepts.join(', ')}`)

    lines.push('\n' + '='.repeat(50))
    lines.push('EXPERIENCE')
    lines.push('='.repeat(50))
    ;(resumeData.experience || []).forEach(exp => {
      const expLinks = Array.isArray(exp.links)
        ? exp.links.filter(l => l && l.url).map(l => `${l.label || 'Proof'}: ${l.url}`).join(' | ')
        : (exp.link ? `Proof: ${exp.link}` : '')

      lines.push(`${(exp.title || '').toUpperCase()} — ${exp.company || ''} (${exp.startDate || ''} – ${exp.endDate || ''})${exp.location ? ` | ${exp.location}` : ''}${expLinks ? ` | ${expLinks}` : ''}`)
      ;(exp.bullets || []).forEach(b => lines.push(`• ${b}`))
      lines.push('')
    })

    lines.push('='.repeat(50))
    lines.push('PROJECTS')
    lines.push('='.repeat(50))
    ;(resumeData.projects || []).forEach(proj => {
      const projLinks = Array.isArray(proj.links)
        ? proj.links.filter(l => l && l.url).map(l => `${l.label || 'Link'}: ${l.url}`).join(' | ')
        : (proj.link ? `Link: ${proj.link}` : '')

      const tech = proj.technologies?.length ? ` [${proj.technologies.join(', ')}]` : ''
      lines.push(`${(proj.name || '').toUpperCase()}${tech} (${proj.date || ''})${projLinks ? ` | ${projLinks}` : ''}`)
      ;(proj.bullets || []).forEach(b => lines.push(`• ${b}`))
      lines.push('')
    })

    lines.push('='.repeat(50))
    lines.push('EDUCATION')
    lines.push('='.repeat(50))
    ;(resumeData.education || []).forEach(edu => {
      lines.push(`${(edu.degree || '').toUpperCase()} in ${edu.major || ''} — ${edu.institution || ''} (${edu.startDate ? `${edu.startDate} – ` : ''}${edu.endDate || ''})${edu.gpa ? ` | GPA: ${edu.gpa}` : ''}`)
      if (edu.coursework?.length) lines.push(`Coursework: ${edu.coursework.join(', ')}`)
    })

    if (resumeData.certifications?.length) {
      lines.push('\n' + '='.repeat(50))
      lines.push('CERTIFICATIONS')
      lines.push('='.repeat(50))
      resumeData.certifications.forEach(cert => {
        const certLink = cert.url ? ` | ${cert.label || 'Credential'}: ${cert.url}` : ''
        lines.push(`• ${cert.name} — ${cert.issuer}${cert.year ? ` (${cert.year})` : ''}${certLink}`)
      })
    }

    return lines.join('\n')
  }

  const handleCopy = async () => {
    try {
      const text = generatePlainText()
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    } catch {
      // Fallback
      const textArea = document.createElement('textarea')
      textArea.value = generatePlainText()
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    }
  }

  const activeDoc = renderPdfDocument()

  return (
    <div className="pdf-preview-container animate-fade-up">
      {/* Sidebar Controls */}
      <div className="pdf-controls-sidebar">
        {/* Template Selector Gallery */}
        <div className="template-gallery-box glass-card">
          <div className="template-gallery-header">
            <Layout size={16} className="text-purple" />
            <h4>ATS Template Gallery</h4>
          </div>
          <div className="template-cards-grid">
            {TEMPLATES.map((tmpl) => (
              <button
                key={tmpl.id}
                type="button"
                className={`template-card-btn ${selectedTemplate === tmpl.id ? 'active' : ''}`}
                onClick={() => setSelectedTemplate(tmpl.id)}
              >
                <div className="template-card-top">
                  <span className="template-card-name">{tmpl.name}</span>
                  <span className="template-tag">{tmpl.tag}</span>
                </div>
                <p className="template-card-desc">{tmpl.desc}</p>
                {selectedTemplate === tmpl.id && (
                  <div className="template-selected-badge">
                    <Check size={11} /> Selected
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Download Buttons Stack */}
        <div className="download-buttons-stack">
          <PDFDownloadLink
            document={activeDoc}
            fileName={fileName}
            className="btn btn-primary btn-lg btn-download-pdf"
          >
            {({ loading }) => (
              <>
                <Download size={18} />
                <span>{loading ? 'Preparing ATS PDF...' : 'Download Clean PDF'}</span>
              </>
            )}
          </PDFDownloadLink>

          <button
            type="button"
            className="btn btn-secondary btn-copy-text"
            onClick={handleCopy}
          >
            {copied ? <Check size={16} className="text-success" /> : <Copy size={16} />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy Plain Text for Workday'}</span>
          </button>
        </div>

        {/* ATS Quality Assurance Checklist */}
        <div className="qa-checklist-box">
          <h4>ATS Compliance Checklist</h4>
          <div className="qa-check-item">
            <CheckCircle2 size={14} className="text-success" />
            <span>Single-column linear parsing flow</span>
          </div>
          <div className="qa-check-item">
            <CheckCircle2 size={14} className="text-success" />
            <span>Zero tables, textboxes, or graphic elements</span>
          </div>
          <div className="qa-check-item">
            <CheckCircle2 size={14} className="text-success" />
            <span>Standard headings &amp; contact hierarchy</span>
          </div>
          <div className="qa-check-item">
            <CheckCircle2 size={14} className="text-success" />
            <span>Universal standard font embedding</span>
          </div>
          <div className="qa-check-item">
            <CheckCircle2 size={14} className="text-success" />
            <span>100% Text-Selectable vector PDF output</span>
          </div>
        </div>
      </div>

      {/* Live PDF Document Frame Preview */}
      <div className="glass-card pdf-live-frame-container">
        <div className="frame-meta-bar">
          <span className="text-xs text-muted">File: {fileName}</span>
          <span className="badge badge-info">Template: {TEMPLATES.find(t => t.id === selectedTemplate)?.name}</span>
        </div>

        {/* Render PDF blob in an iframe */}
        <div className="frame-canvas-wrap">
          <BlobProvider document={activeDoc}>
            {({ url, loading, error }) => {
              if (loading) {
                return (
                  <div className="blob-loading-state">
                    <FileText size={32} className="text-purple animate-pulse" />
                    <p className="text-sm text-secondary">Rendering high-precision ATS PDF...</p>
                  </div>
                )
              }
              if (error || !url) {
                return (
                  <div className="blob-fallback-sheet">
                    <h2>{resumeData.name || 'Candidate Name'}</h2>
                    <p className="contact-text">
                      {[resumeData.contact?.location, resumeData.contact?.email, resumeData.contact?.phone].filter(Boolean).join(' • ')}
                    </p>
                    <hr />
                    <h4>PROFESSIONAL SUMMARY</h4>
                    <p>{resumeData.summary}</p>
                  </div>
                )
              }
              return (
                <iframe
                  key={selectedTemplate}
                  src={`${url}#toolbar=0&navpanes=0&scrollbar=1`}
                  className="live-pdf-iframe"
                  title="ATS Resume PDF Preview"
                />
              )
            }}
          </BlobProvider>
        </div>
      </div>
    </div>
  )
}
