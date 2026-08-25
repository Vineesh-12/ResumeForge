import React, { useState } from 'react'
import { PDFDownloadLink, BlobProvider } from '@react-pdf/renderer'
import { Download, Copy, Check, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react'
import HarvardJakeTemplate from '../../templates/HarvardJakeTemplate'
import './PDFPreview.css'

export default function PDFPreview({ resumeData, targetRole = 'Software_Engineer' }) {
  const [copied, setCopied] = useState(false)

  if (!resumeData) return null

  const cleanName = (resumeData.name || 'Candidate')
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_]/g, '')
  const cleanRole = (targetRole || 'Software_Engineer')
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_]/g, '')
  const fileName = `Resume_${cleanName}_${cleanRole}.pdf`

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
      ...rawContactLinks.map(l => l.url || l.label)
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

      lines.push(`${exp.title} | ${exp.company} (${exp.startDate} - ${exp.endDate})${expLinks ? ` | ${expLinks}` : ''}`)
      if (exp.location) lines.push(`Location: ${exp.location}`)
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

      lines.push(`${proj.name}${projLinks ? ` | ${projLinks}` : ''} | ${proj.technologies?.join(', ') || ''} (${proj.date || ''})`)
      ;(proj.bullets || []).forEach(b => lines.push(`• ${b}`))
      lines.push('')
    })

    lines.push('='.repeat(50))
    lines.push('EDUCATION')
    lines.push('='.repeat(50))
    ;(resumeData.education || []).forEach(edu => {
      lines.push(`${edu.degree} - ${edu.major}, ${edu.institution} (${edu.startDate ? `${edu.startDate} - ` : ''}${edu.endDate})`)
      if (edu.gpa) lines.push(`CGPA: ${edu.gpa}`)
      if (edu.coursework?.length) lines.push(`Coursework: ${edu.coursework.join(', ')}`)
      lines.push('')
    })

    if (resumeData.certifications?.length) {
      lines.push('='.repeat(50))
      lines.push('CERTIFICATIONS')
      lines.push('='.repeat(50))
      resumeData.certifications.forEach(cert => {
        lines.push(`• ${cert.name} - ${cert.issuer} (${cert.year || ''})${cert.url ? ` | ${cert.label || 'Credential'}: ${cert.url}` : ''}`)
      })
    }

    return lines.join('\n')
  }

  const handleCopy = async () => {
    const text = generatePlainText()
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text)
      } else {
        const textarea = document.createElement('textarea')
        textarea.value = text
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
      }
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch (err) {
      console.warn('Clipboard write error, falling back:', err)
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  return (
    <div className="pdf-preview-container">
      {/* Action Controls Card */}
      <div className="glass-card pdf-actions-sidebar">
        <div className="sidebar-card-header">
          <div className="header-status-badge">
            <ShieldCheck size={16} className="text-success" />
            <span className="badge badge-success">ATS 95%+ Ready</span>
          </div>
          <h3>Harvard-Jake Classic</h3>
          <p className="text-xs text-muted">A4 • Single Column • Text Selectable</p>
        </div>

        {/* Download Buttons Group */}
        <div className="download-buttons-stack">
          <PDFDownloadLink
            document={<HarvardJakeTemplate data={resumeData} />}
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
            <span>Standard headings: Summary, Skills, Experience</span>
          </div>
          <div className="qa-check-item">
            <CheckCircle2 size={14} className="text-success" />
            <span>Contact details placed in document body</span>
          </div>
          <div className="qa-check-item">
            <CheckCircle2 size={14} className="text-success" />
            <span>Universal Helvetica font embedded</span>
          </div>
          <div className="qa-check-item">
            <CheckCircle2 size={14} className="text-success" />
            <span>100% Text-Selectable PDF output</span>
          </div>
        </div>
      </div>

      {/* Live PDF Document Frame Preview */}
      <div className="glass-card pdf-live-frame-container">
        <div className="frame-meta-bar">
          <span className="text-xs text-muted">File: {fileName}</span>
          <span className="badge badge-info">Standard A4 Format</span>
        </div>

        {/* Render PDF blob in an iframe if available, or simulated high-fidelity preview */}
        <div className="frame-canvas-wrap">
          <BlobProvider document={<HarvardJakeTemplate data={resumeData} />}>
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
