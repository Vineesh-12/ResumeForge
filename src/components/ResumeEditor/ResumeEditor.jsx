import React, { useState } from 'react'
import { Edit3, Check, Plus, Trash2, ShieldCheck, Sparkles, X, User, Briefcase, FolderGit2, GraduationCap, Wrench, Award, Link2 } from 'lucide-react'
import './ResumeEditor.css'

export default function ResumeEditor({
  resumeData,
  onChangeSection
}) {
  const [editingSection, setEditingSection] = useState(null)
  const [editFormData, setEditFormData] = useState(null)

  if (!resumeData) return null

  // Open appropriate form editor with cloned data
  const startEditing = (sectionKey) => {
    setEditingSection(sectionKey)
    if (sectionKey === 'summary') {
      setEditFormData(resumeData.summary || '')
    } else if (sectionKey === 'skills') {
      setEditFormData({
        languages: (resumeData.skills?.languages || []).join(', '),
        frameworks: (resumeData.skills?.frameworks || []).join(', '),
        tools: (resumeData.skills?.tools || []).join(', '),
        databases: (resumeData.skills?.databases || []).join(', '),
        concepts: (resumeData.skills?.concepts || []).join(', ')
      })
    } else if (sectionKey === 'experience') {
      setEditFormData(
        (resumeData.experience || []).map(exp => ({
          title: exp.title || '',
          company: exp.company || '',
          location: exp.location || '',
          startDate: exp.startDate || '',
          endDate: exp.endDate || '',
          isCurrentlyWorking: exp.isCurrentlyWorking || exp.endDate?.toLowerCase() === 'present',
          links: Array.isArray(exp.links) ? [...exp.links] : (exp.link ? [{ label: 'Proof', url: exp.link }] : []),
          bullets: Array.isArray(exp.bullets) ? [...exp.bullets] : ['']
        }))
      )
    } else if (sectionKey === 'projects') {
      setEditFormData(
        (resumeData.projects || []).map(proj => ({
          name: proj.name || '',
          technologies: Array.isArray(proj.technologies) ? proj.technologies.join(', ') : '',
          date: proj.date || '',
          isCurrentlyWorking: proj.isCurrentlyWorking || false,
          links: Array.isArray(proj.links)
            ? [...proj.links]
            : (proj.link ? [{ label: proj.linkLabel || 'Link', url: proj.link }] : []),
          bullets: Array.isArray(proj.bullets) ? [...proj.bullets] : ['']
        }))
      )
    } else if (sectionKey === 'education') {
      setEditFormData(
        (resumeData.education || []).map(edu => ({
          degree: edu.degree || '',
          major: edu.major || '',
          institution: edu.institution || '',
          location: edu.location || '',
          startDate: edu.startDate || '',
          endDate: edu.endDate || '',
          gpa: edu.gpa || '',
          coursework: Array.isArray(edu.coursework) ? edu.coursework.join(', ') : ''
        }))
      )
    } else if (sectionKey === 'certifications') {
      setEditFormData(
        (resumeData.certifications || []).map(cert => ({
          name: cert.name || '',
          issuer: cert.issuer || '',
          year: cert.year || '',
          url: cert.url || cert.link || '',
          label: cert.label || 'Credential'
        }))
      )
    } else if (sectionKey === 'contact') {
      // Initialize header links
      let initialLinks = []
      if (Array.isArray(resumeData.contact?.customLinks)) {
        initialLinks = [...resumeData.contact.customLinks]
      } else {
        if (resumeData.contact?.linkedin) {
          initialLinks.push({ label: 'LinkedIn', url: resumeData.contact.linkedin })
        }
        if (resumeData.contact?.github) {
          initialLinks.push({ label: 'GitHub', url: resumeData.contact.github })
        }
      }

      setEditFormData({
        name: resumeData.name || '',
        location: resumeData.contact?.location || '',
        phone: resumeData.contact?.phone || '',
        email: resumeData.contact?.email || '',
        customLinks: initialLinks
      })
    }
  }

  const cancelEdit = () => {
    setEditingSection(null)
    setEditFormData(null)
  }

  // Save handler per section
  const handleSave = (sectionKey) => {
    if (sectionKey === 'summary') {
      onChangeSection('summary', editFormData)
    } else if (sectionKey === 'skills') {
      const parseList = (str) =>
        str ? str.split(',').map(s => s.trim()).filter(Boolean) : []

      const formattedSkills = {
        languages: parseList(editFormData.languages),
        frameworks: parseList(editFormData.frameworks),
        tools: parseList(editFormData.tools),
        databases: parseList(editFormData.databases),
        concepts: parseList(editFormData.concepts)
      }
      onChangeSection('skills', formattedSkills)
    } else if (sectionKey === 'experience') {
      const formattedExp = editFormData.map(exp => ({
        ...exp,
        endDate: exp.isCurrentlyWorking ? 'Present' : exp.endDate,
        links: (exp.links || []).filter(l => l && l.url && l.url.trim())
      }))
      onChangeSection('experience', formattedExp)
    } else if (sectionKey === 'projects') {
      const formattedProjects = editFormData.map(proj => ({
        ...proj,
        technologies: typeof proj.technologies === 'string'
          ? proj.technologies.split(',').map(t => t.trim()).filter(Boolean)
          : proj.technologies,
        links: (proj.links || []).filter(l => l && l.url && l.url.trim())
      }))
      onChangeSection('projects', formattedProjects)
    } else if (sectionKey === 'education') {
      const formattedEdu = editFormData.map(edu => ({
        ...edu,
        coursework: typeof edu.coursework === 'string'
          ? edu.coursework.split(',').map(c => c.trim()).filter(Boolean)
          : edu.coursework
      }))
      onChangeSection('education', formattedEdu)
    } else if (sectionKey === 'certifications') {
      const formattedCerts = editFormData.filter(c => c && c.name?.trim())
      onChangeSection('certifications', formattedCerts)
    } else if (sectionKey === 'contact') {
      const cleanLinks = (editFormData.customLinks || []).filter(l => l && l.url && l.url.trim())
      const linkedin = cleanLinks.find(l => l.label?.toLowerCase().includes('linkedin'))?.url || ''
      const github = cleanLinks.find(l => l.label?.toLowerCase().includes('github'))?.url || ''

      onChangeSection('name', editFormData.name)
      onChangeSection('contact', {
        location: editFormData.location,
        phone: editFormData.phone,
        email: editFormData.email,
        linkedin,
        github,
        customLinks: cleanLinks
      })
    }
    setEditingSection(null)
    setEditFormData(null)
  }

  const contact = resumeData.contact || {}
  const rawContactLinks = Array.isArray(contact.customLinks)
    ? contact.customLinks
    : [
        contact.linkedin ? { label: 'LinkedIn', url: contact.linkedin } : null,
        contact.github ? { label: 'GitHub', url: contact.github } : null
      ].filter(Boolean)

  const headerContactItems = [
    contact.location,
    contact.phone,
    contact.email,
    ...rawContactLinks.map(l => l.url || l.label)
  ].filter(Boolean)

  const skills = resumeData.skills || {}
  const experience = resumeData.experience || []
  const projects = resumeData.projects || []
  const education = resumeData.education || []
  const certifications = resumeData.certifications || []

  return (
    <div className="resume-editor-container">
      {/* Editor Toolbar */}
      <div className="editor-top-toolbar">
        <div className="toolbar-status">
          <span className="badge badge-success">
            <ShieldCheck size={13} /> Harvard-Jake ATS Standard
          </span>
          <span className="text-xs text-muted">Click the edit button (✏️) on any section to customize</span>
        </div>
      </div>

      {/* Live Document Paper Canvas */}
      <div className="editor-paper-sheet">
        {/* HEADER & CONTACT */}
        <div className="sheet-header">
          <div className="section-title-bar-ghost">
            <h1 className="sheet-name">{resumeData.name || 'Candidate Name'}</h1>
            <button
              type="button"
              className="btn-edit-section"
              onClick={() => startEditing('contact')}
              title="Edit Contact & Header Info"
            >
              <Edit3 size={13} />
            </button>
          </div>
          <p className="sheet-contact-line">
            {headerContactItems.join(' • ')}
          </p>
        </div>

        {/* CONTACT MODAL / FORM WITH UNLIMITED LINKS */}
        {editingSection === 'contact' && editFormData && (
          <div className="human-editor-modal animate-fade-in">
            <div className="modal-form-header">
              <h4><User size={16} /> Edit Contact &amp; Header Info (With Unlimited Links)</h4>
              <button type="button" className="btn-close-modal" onClick={cancelEdit}><X size={15} /></button>
            </div>
            <div className="modal-form-body">
              <div className="form-row-2col">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    className="input-control"
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Location (City, Country)</label>
                  <input
                    type="text"
                    className="input-control"
                    value={editFormData.location}
                    onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-row-2col">
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    className="input-control"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="text"
                    className="input-control"
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                  />
                </div>
              </div>

              {/* Unlimited Header Profile Links (LinkedIn, GitHub, Portfolio, LeetCode, Blog, etc.) */}
              <div className="form-group">
                <label>Header Profile Links (LinkedIn, GitHub, Portfolio, LeetCode, Blog, etc.)</label>
                {(editFormData.customLinks || []).map((lnk, lIdx) => (
                  <div key={lIdx} className="custom-link-row">
                    <div className="link-field-small">
                      <label className="text-xs text-muted">Label For Link</label>
                      <input
                        type="text"
                        className="input-control"
                        placeholder="e.g. LinkedIn / Portfolio"
                        value={lnk.label}
                        onChange={(e) => {
                          const updated = [...editFormData.customLinks]
                          updated[lIdx].label = e.target.value
                          setEditFormData({ ...editFormData, customLinks: updated })
                        }}
                      />
                    </div>
                    <div className="link-field-large">
                      <label className="text-xs text-muted">Any Link (URL)</label>
                      <input
                        type="text"
                        className="input-control"
                        placeholder="e.g. linkedin.com/in/... or github.com/..."
                        value={lnk.url}
                        onChange={(e) => {
                          const updated = [...editFormData.customLinks]
                          updated[lIdx].url = e.target.value
                          setEditFormData({ ...editFormData, customLinks: updated })
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      className="btn-remove-link"
                      onClick={() => {
                        const updated = editFormData.customLinks.filter((_, i) => i !== lIdx)
                        setEditFormData({ ...editFormData, customLinks: updated })
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  className="btn-add-bullet"
                  onClick={() => {
                    const currentLinks = Array.isArray(editFormData.customLinks) ? [...editFormData.customLinks] : []
                    currentLinks.push({ label: 'Portfolio', url: '' })
                    setEditFormData({ ...editFormData, customLinks: currentLinks })
                  }}
                >
                  <Plus size={13} /> Add Header Link (Unlimited)
                </button>
              </div>
            </div>
            <div className="modal-form-actions">
              <button type="button" className="btn btn-secondary btn-sm" onClick={cancelEdit}>Cancel</button>
              <button type="button" className="btn btn-primary btn-sm" onClick={() => handleSave('contact')}>
                <Check size={14} /> Save Contact Info
              </button>
            </div>
          </div>
        )}

        {/* PROFESSIONAL SUMMARY */}
        <div className="sheet-section">
          <div className="section-title-bar">
            <h3 className="section-title-text">PROFESSIONAL SUMMARY</h3>
            <button
              type="button"
              className="btn-edit-section"
              onClick={() => startEditing('summary')}
              title="Edit Summary"
            >
              <Edit3 size={13} />
            </button>
          </div>

          {editingSection === 'summary' ? (
            <div className="human-editor-modal animate-fade-in">
              <div className="modal-form-header">
                <h4><Sparkles size={16} /> Edit Professional Summary</h4>
                <button type="button" className="btn-close-modal" onClick={cancelEdit}><X size={15} /></button>
              </div>
              <div className="modal-form-body">
                <textarea
                  className="textarea-control"
                  value={editFormData}
                  onChange={(e) => setEditFormData(e.target.value)}
                  rows={4}
                  placeholder="Summarize your engineering background, top tech stack, and key career achievements..."
                />
                <span className="text-xs text-muted">
                  Tip: Target 2-3 high-impact sentences highlighting your primary technologies and metrics.
                </span>
              </div>
              <div className="modal-form-actions">
                <button type="button" className="btn btn-secondary btn-sm" onClick={cancelEdit}>Cancel</button>
                <button type="button" className="btn btn-primary btn-sm" onClick={() => handleSave('summary')}>
                  <Check size={14} /> Save Summary
                </button>
              </div>
            </div>
          ) : (
            <p className="sheet-body-text">
              {resumeData.summary || 'Click edit to add a tailored professional summary.'}
            </p>
          )}
        </div>

        {/* TECHNICAL SKILLS */}
        <div className="sheet-section">
          <div className="section-title-bar">
            <h3 className="section-title-text">TECHNICAL SKILLS</h3>
            <button
              type="button"
              className="btn-edit-section"
              onClick={() => startEditing('skills')}
              title="Edit Skills"
            >
              <Edit3 size={13} />
            </button>
          </div>

          {editingSection === 'skills' && editFormData ? (
            <div className="human-editor-modal animate-fade-in">
              <div className="modal-form-header">
                <h4><Wrench size={16} /> Edit Technical Skills (Comma-Separated)</h4>
                <button type="button" className="btn-close-modal" onClick={cancelEdit}><X size={15} /></button>
              </div>
              <div className="modal-form-body">
                <div className="form-group">
                  <label>Programming Languages</label>
                  <input
                    type="text"
                    className="input-control"
                    placeholder="e.g. JavaScript (ES6+), TypeScript, Python, SQL, C++"
                    value={editFormData.languages}
                    onChange={(e) => setEditFormData({ ...editFormData, languages: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Frameworks &amp; Libraries</label>
                  <input
                    type="text"
                    className="input-control"
                    placeholder="e.g. React.js, Node.js, Express.js, Tailwind CSS"
                    value={editFormData.frameworks}
                    onChange={(e) => setEditFormData({ ...editFormData, frameworks: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Developer Tools &amp; Cloud</label>
                  <input
                    type="text"
                    className="input-control"
                    placeholder="e.g. Git, GitHub, Docker, AWS (S3, Lambda), Kubernetes"
                    value={editFormData.tools}
                    onChange={(e) => setEditFormData({ ...editFormData, tools: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Databases</label>
                  <input
                    type="text"
                    className="input-control"
                    placeholder="e.g. PostgreSQL, MongoDB, Redis, MySQL"
                    value={editFormData.databases}
                    onChange={(e) => setEditFormData({ ...editFormData, databases: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Concepts &amp; Methodologies</label>
                  <input
                    type="text"
                    className="input-control"
                    placeholder="e.g. REST APIs, CI/CD, Microservices, Agile/Scrum"
                    value={editFormData.concepts}
                    onChange={(e) => setEditFormData({ ...editFormData, concepts: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-form-actions">
                <button type="button" className="btn btn-secondary btn-sm" onClick={cancelEdit}>Cancel</button>
                <button type="button" className="btn btn-primary btn-sm" onClick={() => handleSave('skills')}>
                  <Check size={14} /> Save Technical Skills
                </button>
              </div>
            </div>
          ) : (
            <div className="sheet-skills-block">
              {skills.languages?.length > 0 && (
                <p className="skills-row">
                  <strong>Languages:</strong> {skills.languages.join(', ')}
                </p>
              )}
              {skills.frameworks?.length > 0 && (
                <p className="skills-row">
                  <strong>Frameworks &amp; Libraries:</strong> {skills.frameworks.join(', ')}
                </p>
              )}
              {skills.tools?.length > 0 && (
                <p className="skills-row">
                  <strong>Developer Tools &amp; Cloud:</strong> {skills.tools.join(', ')}
                </p>
              )}
              {skills.databases?.length > 0 && (
                <p className="skills-row">
                  <strong>Databases:</strong> {skills.databases.join(', ')}
                </p>
              )}
              {skills.concepts?.length > 0 && (
                <p className="skills-row">
                  <strong>Concepts &amp; Methodologies:</strong> {skills.concepts.join(', ')}
                </p>
              )}
            </div>
          )}
        </div>

        {/* EXPERIENCE */}
        <div className="sheet-section">
          <div className="section-title-bar">
            <h3 className="section-title-text">EXPERIENCE</h3>
            <button
              type="button"
              className="btn-edit-section"
              onClick={() => startEditing('experience')}
              title="Edit Experience"
            >
              <Edit3 size={13} />
            </button>
          </div>

          {editingSection === 'experience' && editFormData ? (
            <div className="human-editor-modal animate-fade-in">
              <div className="modal-form-header">
                <h4><Briefcase size={16} /> Edit Experience Entries</h4>
                <button type="button" className="btn-close-modal" onClick={cancelEdit}><X size={15} /></button>
              </div>

              <div className="modal-form-body">
                {editFormData.map((exp, expIdx) => (
                  <div key={expIdx} className="entry-form-card">
                    <div className="entry-card-header">
                      <strong>Experience #{expIdx + 1}</strong>
                      <button
                        type="button"
                        className="btn-delete-entry"
                        onClick={() => {
                          const updated = editFormData.filter((_, i) => i !== expIdx)
                          setEditFormData(updated)
                        }}
                      >
                        <Trash2 size={13} /> Remove Job
                      </button>
                    </div>

                    <div className="form-row-2col">
                      <div className="form-group">
                        <label>Job Title</label>
                        <input
                          type="text"
                          className="input-control"
                          value={exp.title}
                          onChange={(e) => {
                            const updated = [...editFormData]
                            updated[expIdx].title = e.target.value
                            setEditFormData(updated)
                          }}
                        />
                      </div>
                      <div className="form-group">
                        <label>Company Name</label>
                        <input
                          type="text"
                          className="input-control"
                          value={exp.company}
                          onChange={(e) => {
                            const updated = [...editFormData]
                            updated[expIdx].company = e.target.value
                            setEditFormData(updated)
                          }}
                        />
                      </div>
                    </div>

                    <div className="form-row-3col">
                      <div className="form-group">
                        <label>Location</label>
                        <input
                          type="text"
                          className="input-control"
                          value={exp.location}
                          onChange={(e) => {
                            const updated = [...editFormData]
                            updated[expIdx].location = e.target.value
                            setEditFormData(updated)
                          }}
                        />
                      </div>
                      <div className="form-group">
                        <label>Start Date</label>
                        <input
                          type="text"
                          className="input-control"
                          placeholder="e.g. Jun 2025"
                          value={exp.startDate}
                          onChange={(e) => {
                            const updated = [...editFormData]
                            updated[expIdx].startDate = e.target.value
                            setEditFormData(updated)
                          }}
                        />
                      </div>
                      <div className="form-group">
                        <label>End Date</label>
                        <input
                          type="text"
                          className="input-control"
                          placeholder="e.g. Present"
                          disabled={exp.isCurrentlyWorking}
                          value={exp.isCurrentlyWorking ? 'Present' : exp.endDate}
                          onChange={(e) => {
                            const updated = [...editFormData]
                            updated[expIdx].endDate = e.target.value
                            setEditFormData(updated)
                          }}
                        />
                      </div>
                    </div>

                    {/* Is Currently Working Checkbox */}
                    <div className="checkbox-row">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={exp.isCurrentlyWorking || false}
                          onChange={(e) => {
                            const updated = [...editFormData]
                            updated[expIdx].isCurrentlyWorking = e.target.checked
                            if (e.target.checked) updated[expIdx].endDate = 'Present'
                            setEditFormData(updated)
                          }}
                        />
                        <span>Is Currently Working Here</span>
                      </label>
                    </div>

                    {/* Proof / Verification Links */}
                    <div className="form-group">
                      <label>Verification / Proof Links (Certificate, Offer Letter, or Demo)</label>
                      {(exp.links || []).map((lnk, lIdx) => (
                        <div key={lIdx} className="custom-link-row">
                          <div className="link-field-small">
                            <label className="text-xs text-muted">Label For Link</label>
                            <input
                              type="text"
                              className="input-control"
                              placeholder="e.g. Certificate"
                              value={lnk.label}
                              onChange={(e) => {
                                const updated = [...editFormData]
                                updated[expIdx].links[lIdx].label = e.target.value
                                setEditFormData(updated)
                              }}
                            />
                          </div>
                          <div className="link-field-large">
                            <label className="text-xs text-muted">Any Link (URL)</label>
                            <input
                              type="text"
                              className="input-control"
                              placeholder="https://..."
                              value={lnk.url}
                              onChange={(e) => {
                                const updated = [...editFormData]
                                updated[expIdx].links[lIdx].url = e.target.value
                                setEditFormData(updated)
                              }}
                            />
                          </div>
                          <button
                            type="button"
                            className="btn-remove-link"
                            onClick={() => {
                              const updated = [...editFormData]
                              updated[expIdx].links = updated[expIdx].links.filter((_, i) => i !== lIdx)
                              setEditFormData(updated)
                            }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}

                      <button
                        type="button"
                        className="btn-add-bullet"
                        onClick={() => {
                          const updated = [...editFormData]
                          if (!Array.isArray(updated[expIdx].links)) updated[expIdx].links = []
                          updated[expIdx].links.push({ label: 'Certificate', url: '' })
                          setEditFormData(updated)
                        }}
                      >
                        <Link2 size={13} /> Add Verification Link
                      </button>
                    </div>

                    {/* Bullet points */}
                    <div className="form-group">
                      <label>Achievement Bullet Points (XYZ Formula)</label>
                      {exp.bullets.map((bullet, bIdx) => (
                        <div key={bIdx} className="bullet-input-row">
                          <span className="bullet-indicator">•</span>
                          <input
                            type="text"
                            className="input-control"
                            value={bullet}
                            onChange={(e) => {
                              const updated = [...editFormData]
                              updated[expIdx].bullets[bIdx] = e.target.value
                              setEditFormData(updated)
                            }}
                          />
                          <button
                            type="button"
                            className="btn-remove-bullet"
                            onClick={() => {
                              const updated = [...editFormData]
                              updated[expIdx].bullets = updated[expIdx].bullets.filter((_, i) => i !== bIdx)
                              setEditFormData(updated)
                            }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}

                      <button
                        type="button"
                        className="btn-add-bullet"
                        onClick={() => {
                          const updated = [...editFormData]
                          updated[expIdx].bullets.push('')
                          setEditFormData(updated)
                        }}
                      >
                        <Plus size={13} /> Add Bullet Point
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%' }}
                  onClick={() => {
                    setEditFormData([
                      ...editFormData,
                      {
                        title: 'Software Engineer',
                        company: 'Company Name',
                        location: 'City, Country',
                        startDate: 'Jun 2025',
                        endDate: 'Present',
                        isCurrentlyWorking: true,
                        links: [],
                        bullets: ['Architected scalable features improving performance.']
                      }
                    ])
                  }}
                >
                  <Plus size={14} /> Add Another Experience Entry
                </button>
              </div>

              <div className="modal-form-actions">
                <button type="button" className="btn btn-secondary btn-sm" onClick={cancelEdit}>Cancel</button>
                <button type="button" className="btn btn-primary btn-sm" onClick={() => handleSave('experience')}>
                  <Check size={14} /> Save Experience
                </button>
              </div>
            </div>
          ) : (
            <div className="sheet-exp-stack">
              {experience.map((exp, idx) => (
                <div key={idx} className="sheet-exp-entry">
                  <div className="exp-line-top">
                    <span className="exp-title-with-links">
                      <strong className="exp-job-title">{exp.title}</strong>
                      {(exp.links || []).map((l, lIdx) => (
                        l.url ? (
                          <a
                            key={lIdx}
                            href={l.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="live-preview-link-badge"
                            title={l.url}
                          >
                            {l.label || 'Proof'}
                          </a>
                        ) : null
                      ))}
                    </span>
                    <span className="exp-dates">{exp.startDate} – {exp.endDate}</span>
                  </div>
                  <div className="exp-line-sub">
                    {exp.company}{exp.location ? ` • ${exp.location}` : ''}
                  </div>
                  <ul className="exp-bullets-list">
                    {(exp.bullets || []).map((bullet, bIdx) => (
                      <li key={bIdx}>{bullet}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* PROJECTS */}
        {projects.length > 0 && (
          <div className="sheet-section">
            <div className="section-title-bar">
              <h3 className="section-title-text">PROJECTS</h3>
              <button
                type="button"
                className="btn-edit-section"
                onClick={() => startEditing('projects')}
                title="Edit Projects"
              >
                <Edit3 size={13} />
              </button>
            </div>

            {editingSection === 'projects' && editFormData ? (
              <div className="human-editor-modal animate-fade-in">
                <div className="modal-form-header">
                  <h4><FolderGit2 size={16} /> Edit Project Entries (With Unlimited Custom Links)</h4>
                  <button type="button" className="btn-close-modal" onClick={cancelEdit}><X size={15} /></button>
                </div>

                <div className="modal-form-body">
                  {editFormData.map((proj, pIdx) => (
                    <div key={pIdx} className="entry-form-card">
                      <div className="entry-card-header">
                        <strong>Project #{pIdx + 1}</strong>
                        <button
                          type="button"
                          className="btn-delete-entry"
                          onClick={() => {
                            const updated = editFormData.filter((_, i) => i !== pIdx)
                            setEditFormData(updated)
                          }}
                        >
                          <Trash2 size={13} /> Remove Project
                        </button>
                      </div>

                      <div className="form-row-2col">
                        <div className="form-group">
                          <label>Project Name</label>
                          <input
                            type="text"
                            className="input-control"
                            value={proj.name}
                            onChange={(e) => {
                              const updated = [...editFormData]
                              updated[pIdx].name = e.target.value
                              setEditFormData(updated)
                            }}
                          />
                        </div>
                        <div className="form-group">
                          <label>Technologies Used (Comma-separated)</label>
                          <input
                            type="text"
                            className="input-control"
                            placeholder="e.g. React.js, Node.js, Docker, AWS"
                            value={proj.technologies}
                            onChange={(e) => {
                              const updated = [...editFormData]
                              updated[pIdx].technologies = e.target.value
                              setEditFormData(updated)
                            }}
                          />
                        </div>
                      </div>

                      <div className="form-row-2col">
                        <div className="form-group">
                          <label>Date / Time Period</label>
                          <input
                            type="text"
                            className="input-control"
                            placeholder="e.g. Jan 2025"
                            value={proj.date}
                            onChange={(e) => {
                              const updated = [...editFormData]
                              updated[pIdx].date = e.target.value
                              setEditFormData(updated)
                            }}
                          />
                        </div>
                        <div className="checkbox-row" style={{ marginTop: '22px' }}>
                          <label className="checkbox-label">
                            <input
                              type="checkbox"
                              checked={proj.isCurrentlyWorking || false}
                              onChange={(e) => {
                                const updated = [...editFormData]
                                updated[pIdx].isCurrentlyWorking = e.target.checked
                                setEditFormData(updated)
                              }}
                            />
                            <span>Is Currently Active / Ongoing</span>
                          </label>
                        </div>
                      </div>

                      {/* Unlimited Project Links (GitHub, Live App, Devpost, Demo Video, etc.) */}
                      <div className="form-group">
                        <label>Project Links (GitHub, Live App, Devpost, Demo Video, etc.)</label>
                        {(proj.links || []).map((lnk, lIdx) => (
                          <div key={lIdx} className="custom-link-row">
                            <div className="link-field-small">
                              <label className="text-xs text-muted">Label For Link</label>
                              <input
                                type="text"
                                className="input-control"
                                placeholder="e.g. GitHub / Live App"
                                value={lnk.label}
                                onChange={(e) => {
                                  const updated = [...editFormData]
                                  updated[pIdx].links[lIdx].label = e.target.value
                                  setEditFormData(updated)
                                }}
                              />
                            </div>
                            <div className="link-field-large">
                              <label className="text-xs text-muted">Any Link (URL)</label>
                              <input
                                type="text"
                                className="input-control"
                                placeholder="https://github.com/..."
                                value={lnk.url}
                                onChange={(e) => {
                                  const updated = [...editFormData]
                                  updated[pIdx].links[lIdx].url = e.target.value
                                  setEditFormData(updated)
                                }}
                              />
                            </div>
                            <button
                              type="button"
                              className="btn-remove-link"
                              onClick={() => {
                                const updated = [...editFormData]
                                updated[pIdx].links = updated[pIdx].links.filter((_, i) => i !== lIdx)
                                setEditFormData(updated)
                              }}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        ))}

                        <button
                          type="button"
                          className="btn-add-bullet"
                          onClick={() => {
                            const updated = [...editFormData]
                            if (!Array.isArray(updated[pIdx].links)) updated[pIdx].links = []
                            updated[pIdx].links.push({ label: 'Live App', url: '' })
                            setEditFormData(updated)
                          }}
                        >
                          <Plus size={13} /> Add Another Link (Unlimited)
                        </button>
                      </div>

                      {/* Bullet points */}
                      <div className="form-group">
                        <label>Project Bullets (Architecture, Impact &amp; Metrics)</label>
                        {proj.bullets.map((bullet, bIdx) => (
                          <div key={bIdx} className="bullet-input-row">
                            <span className="bullet-indicator">•</span>
                            <input
                              type="text"
                              className="input-control"
                              value={bullet}
                              onChange={(e) => {
                                const updated = [...editFormData]
                                updated[pIdx].bullets[bIdx] = e.target.value
                                setEditFormData(updated)
                              }}
                            />
                            <button
                              type="button"
                              className="btn-remove-bullet"
                              onClick={() => {
                                const updated = [...editFormData]
                                updated[pIdx].bullets = updated[pIdx].bullets.filter((_, i) => i !== bIdx)
                                setEditFormData(updated)
                              }}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        ))}

                        <button
                          type="button"
                          className="btn-add-bullet"
                          onClick={() => {
                            const updated = [...editFormData]
                            updated[pIdx].bullets.push('')
                            setEditFormData(updated)
                          }}
                        >
                          <Plus size={13} /> Add Project Bullet Point
                        </button>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ width: '100%' }}
                    onClick={() => {
                      setEditFormData([
                        ...editFormData,
                        {
                          name: 'New Project Title',
                          technologies: 'React, Node.js, PostgreSQL',
                          date: '2025',
                          isCurrentlyWorking: false,
                          links: [{ label: 'GitHub', url: '' }, { label: 'Live App', url: '' }],
                          bullets: ['Engineered scalable full-stack web application.']
                        }
                      ])
                    }}
                  >
                    <Plus size={14} /> Add Another Project Entry
                  </button>
                </div>

                <div className="modal-form-actions">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={cancelEdit}>Cancel</button>
                  <button type="button" className="btn btn-primary btn-sm" onClick={() => handleSave('projects')}>
                    <Check size={14} /> Save Projects
                  </button>
                </div>
              </div>
            ) : (
              <div className="sheet-projects-stack">
                {projects.map((proj, idx) => {
                  const projLinks = Array.isArray(proj.links)
                    ? proj.links.filter(l => l && l.url)
                    : (proj.link ? [{ label: proj.linkLabel || 'Link', url: proj.link }] : [])

                  return (
                    <div key={idx} className="sheet-project-entry">
                      <div className="exp-line-top">
                        <span className="exp-title-with-links">
                          <strong>{proj.name}</strong>
                          {projLinks.map((l, lIdx) => (
                            <a
                              key={lIdx}
                              href={l.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="live-preview-link-badge"
                              title={l.url}
                            >
                              {l.label || 'Link'}
                            </a>
                          ))}
                          {proj.technologies?.length > 0 ? ` | ${proj.technologies.join(', ')}` : ''}
                        </span>
                        <span className="exp-dates">{proj.date}</span>
                      </div>
                      <ul className="exp-bullets-list">
                        {(proj.bullets || []).map((b, bIdx) => (
                          <li key={bIdx}>{b}</li>
                        ))}
                      </ul>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* EDUCATION */}
        {education.length > 0 && (
          <div className="sheet-section">
            <div className="section-title-bar">
              <h3 className="section-title-text">EDUCATION</h3>
              <button
                type="button"
                className="btn-edit-section"
                onClick={() => startEditing('education')}
                title="Edit Education"
              >
                <Edit3 size={13} />
              </button>
            </div>

            {editingSection === 'education' && editFormData ? (
              <div className="human-editor-modal animate-fade-in">
                <div className="modal-form-header">
                  <h4><GraduationCap size={16} /> Edit Education Entries</h4>
                  <button type="button" className="btn-close-modal" onClick={cancelEdit}><X size={15} /></button>
                </div>

                <div className="modal-form-body">
                  {editFormData.map((edu, eIdx) => (
                    <div key={eIdx} className="entry-form-card">
                      <div className="form-row-2col">
                        <div className="form-group">
                          <label>Degree</label>
                          <input
                            type="text"
                            className="input-control"
                            placeholder="e.g. Bachelor of Technology"
                            value={edu.degree}
                            onChange={(e) => {
                              const updated = [...editFormData]
                              updated[eIdx].degree = e.target.value
                              setEditFormData(updated)
                            }}
                          />
                        </div>
                        <div className="form-group">
                          <label>Major / Specialization</label>
                          <input
                            type="text"
                            className="input-control"
                            placeholder="e.g. Computer Science & Engineering"
                            value={edu.major}
                            onChange={(e) => {
                              const updated = [...editFormData]
                              updated[eIdx].major = e.target.value
                              setEditFormData(updated)
                            }}
                          />
                        </div>
                      </div>

                      <div className="form-row-2col">
                        <div className="form-group">
                          <label>Institution / University Name</label>
                          <input
                            type="text"
                            className="input-control"
                            value={edu.institution}
                            onChange={(e) => {
                              const updated = [...editFormData]
                              updated[eIdx].institution = e.target.value
                              setEditFormData(updated)
                            }}
                          />
                        </div>
                        <div className="form-group">
                          <label>Graduation Dates (e.g. 2022 - 2026)</label>
                          <input
                            type="text"
                            className="input-control"
                            value={edu.endDate}
                            onChange={(e) => {
                              const updated = [...editFormData]
                              updated[eIdx].endDate = e.target.value
                              setEditFormData(updated)
                            }}
                          />
                        </div>
                      </div>

                      <div className="form-row-2col">
                        <div className="form-group">
                          <label>GPA / CGPA (e.g. 8.7 / 10.0)</label>
                          <input
                            type="text"
                            className="input-control"
                            value={edu.gpa}
                            onChange={(e) => {
                              const updated = [...editFormData]
                              updated[eIdx].gpa = e.target.value
                              setEditFormData(updated)
                            }}
                          />
                        </div>
                        <div className="form-group">
                          <label>Relevant Coursework (Comma-separated)</label>
                          <input
                            type="text"
                            className="input-control"
                            value={edu.coursework}
                            onChange={(e) => {
                              const updated = [...editFormData]
                              updated[eIdx].coursework = e.target.value
                              setEditFormData(updated)
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="modal-form-actions">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={cancelEdit}>Cancel</button>
                  <button type="button" className="btn btn-primary btn-sm" onClick={() => handleSave('education')}>
                    <Check size={14} /> Save Education
                  </button>
                </div>
              </div>
            ) : (
              education.map((edu, idx) => (
                <div key={idx} className="sheet-edu-entry">
                  <div className="exp-line-top">
                    <strong>{edu.degree} — {edu.major}</strong>
                    <span className="exp-dates">{edu.startDate ? `${edu.startDate} – ${edu.endDate}` : edu.endDate}</span>
                  </div>
                  <div className="exp-line-sub">
                    {edu.institution}{edu.location ? `, ${edu.location}` : ''}
                    {edu.gpa ? ` • CGPA: ${edu.gpa}` : ''}
                  </div>
                  {edu.coursework?.length > 0 && (
                    <p className="skills-row" style={{ marginTop: '2px' }}>
                      <strong>Relevant Coursework:</strong> {edu.coursework.join(', ')}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* CERTIFICATIONS */}
        {certifications.length > 0 && (
          <div className="sheet-section">
            <div className="section-title-bar">
              <h3 className="section-title-text">CERTIFICATIONS</h3>
              <button
                type="button"
                className="btn-edit-section"
                onClick={() => startEditing('certifications')}
                title="Edit Certifications"
              >
                <Edit3 size={13} />
              </button>
            </div>

            {editingSection === 'certifications' && editFormData ? (
              <div className="human-editor-modal animate-fade-in">
                <div className="modal-form-header">
                  <h4><Award size={16} /> Edit Certifications &amp; Credentials</h4>
                  <button type="button" className="btn-close-modal" onClick={cancelEdit}><X size={15} /></button>
                </div>

                <div className="modal-form-body">
                  {editFormData.map((cert, cIdx) => (
                    <div key={cIdx} className="entry-form-card">
                      <div className="entry-card-header">
                        <strong>Certification #{cIdx + 1}</strong>
                        <button
                          type="button"
                          className="btn-delete-entry"
                          onClick={() => {
                            const updated = editFormData.filter((_, i) => i !== cIdx)
                            setEditFormData(updated)
                          }}
                        >
                          <Trash2 size={13} /> Remove
                        </button>
                      </div>

                      <div className="form-row-2col">
                        <div className="form-group">
                          <label>Certification Name</label>
                          <input
                            type="text"
                            className="input-control"
                            placeholder="e.g. AWS Certified Solutions Architect"
                            value={cert.name}
                            onChange={(e) => {
                              const updated = [...editFormData]
                              updated[cIdx].name = e.target.value
                              setEditFormData(updated)
                            }}
                          />
                        </div>
                        <div className="form-group">
                          <label>Issuer / Organization</label>
                          <input
                            type="text"
                            className="input-control"
                            placeholder="e.g. Amazon Web Services / Coursera"
                            value={cert.issuer}
                            onChange={(e) => {
                              const updated = [...editFormData]
                              updated[cIdx].issuer = e.target.value
                              setEditFormData(updated)
                            }}
                          />
                        </div>
                      </div>

                      <div className="form-row-3col">
                        <div className="form-group">
                          <label>Year / Date</label>
                          <input
                            type="text"
                            className="input-control"
                            placeholder="e.g. 2025"
                            value={cert.year}
                            onChange={(e) => {
                              const updated = [...editFormData]
                              updated[cIdx].year = e.target.value
                              setEditFormData(updated)
                            }}
                          />
                        </div>
                        <div className="form-group">
                          <label>Label For Link</label>
                          <input
                            type="text"
                            className="input-control"
                            placeholder="e.g. Credential"
                            value={cert.label || 'Credential'}
                            onChange={(e) => {
                              const updated = [...editFormData]
                              updated[cIdx].label = e.target.value
                              setEditFormData(updated)
                            }}
                          />
                        </div>
                        <div className="form-group">
                          <label>Credential Verification URL</label>
                          <input
                            type="text"
                            className="input-control"
                            placeholder="https://..."
                            value={cert.url}
                            onChange={(e) => {
                              const updated = [...editFormData]
                              updated[cIdx].url = e.target.value
                              setEditFormData(updated)
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ width: '100%' }}
                    onClick={() => {
                      setEditFormData([
                        ...editFormData,
                        {
                          name: 'New Certification Title',
                          issuer: 'Issuing Organization',
                          year: '2025',
                          label: 'Credential',
                          url: ''
                        }
                      ])
                    }}
                  >
                    <Plus size={14} /> Add Another Certification
                  </button>
                </div>

                <div className="modal-form-actions">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={cancelEdit}>Cancel</button>
                  <button type="button" className="btn btn-primary btn-sm" onClick={() => handleSave('certifications')}>
                    <Check size={14} /> Save Certifications
                  </button>
                </div>
              </div>
            ) : (
              <ul className="exp-bullets-list">
                {certifications.map((cert, idx) => (
                  <li key={idx}>
                    <strong>{cert.name}</strong> — {cert.issuer} {cert.year ? `(${cert.year})` : ''}
                    {cert.url ? (
                      <a
                        href={cert.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="live-preview-link-badge"
                        style={{ marginLeft: '6px' }}
                        title={cert.url}
                      >
                        {cert.label || 'Credential'}
                      </a>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
