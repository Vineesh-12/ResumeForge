import React, { useState, useEffect } from 'react'
import {
  Briefcase,
  Plus,
  Trash2,
  ExternalLink,
  Building,
  DollarSign,
  Calendar,
  FileText,
  Clock,
  Sparkles,
  RotateCw,
  X,
  CheckCircle2,
  TrendingUp,
  ArrowRight
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import {
  APPLICATION_STAGES,
  getJobApplications,
  saveJobApplication,
  updateApplicationStage,
  deleteJobApplication
} from '../services/trackerService'
import './TrackerPage.css'

export default function TrackerPage() {
  const { state, dispatch } = useApp()
  const navigate = useNavigate()

  const [applications, setApplications] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingApp, setEditingApp] = useState(null)

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    company: '',
    role: '',
    salary: '',
    location: '',
    jobUrl: '',
    stage: 'applied',
    linkedResumeTitle: '',
    notes: '',
    appliedDate: new Date().toISOString().split('T')[0]
  })

  const loadData = async () => {
    setIsLoading(true)
    try {
      const list = await getJobApplications(state.currentUser?.uid)
      setApplications(list)
    } catch (err) {
      console.error('Failed to load applications:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [state.currentUser])

  const handleOpenAdd = () => {
    setEditingApp(null)
    setFormData({
      company: '',
      role: state.jdParsed?.jobTitle || '',
      salary: '',
      location: '',
      jobUrl: '',
      stage: 'applied',
      linkedResumeTitle: state.tailoredResume?.name ? `${state.tailoredResume.name} - Version` : '',
      notes: '',
      appliedDate: new Date().toISOString().split('T')[0]
    })
    setShowAddModal(true)
  }

  const handleSaveApp = async (e) => {
    e.preventDefault()
    if (!formData.company.trim() || !formData.role.trim()) {
      dispatch({ type: 'SET_ERROR', payload: 'Company and Job Title are required.' })
      return
    }

    try {
      await saveJobApplication(state.currentUser?.uid, {
        ...(editingApp ? { id: editingApp.id } : {}),
        ...formData
      })
      dispatch({
        type: 'SET_TOAST',
        payload: {
          message: editingApp ? 'Application updated!' : `Added ${formData.company} to job tracker!`,
          type: 'success'
        }
      })
      setShowAddModal(false)
      await loadData()
    } catch (err) {
      console.error('Save app error:', err)
      dispatch({ type: 'SET_ERROR', payload: err.message || 'Failed to save application.' })
    }
  }

  const handleStageChange = async (appId, newStage) => {
    try {
      await updateApplicationStage(state.currentUser?.uid, appId, newStage)
      setApplications(prev => prev.map(a => a.id === appId ? { ...a, stage: newStage } : a))
      dispatch({
        type: 'SET_TOAST',
        payload: { message: `Moved application to ${APPLICATION_STAGES.find(s => s.id === newStage)?.label}!`, type: 'info' }
      })
    } catch (err) {
      console.error('Stage change error:', err)
    }
  }

  const handleDelete = async (appId) => {
    if (window.confirm('Delete this job application from your tracker?')) {
      try {
        await deleteJobApplication(state.currentUser?.uid, appId)
        setApplications(prev => prev.map(a => a.id !== appId))
        await loadData()
      } catch (err) {
        console.error('Delete error:', err)
      }
    }
  }

  // Metrics
  const totalApps = applications.length
  const activeInterviews = applications.filter(a => a.stage === 'interview').length
  const offersReceived = applications.filter(a => a.stage === 'offer').length
  const inPipeline = applications.filter(a => a.stage === 'applied' || a.stage === 'interview').length

  return (
    <div className="page-container tracker-page animate-fade-up">
      {/* Header & Stats Bar */}
      <div className="tracker-top-bar">
        <div>
          <div className="hero-badge">
            <Briefcase size={14} />
            <span>Career Cockpit &amp; Pipeline</span>
          </div>
          <h1 className="page-title" style={{ fontSize: '2rem', marginTop: 'var(--space-2)' }}>
            Job Application <span className="text-gradient">Tracker</span>
          </h1>
          <p className="text-sm text-muted">
            Track which tailored resume version was sent to which company and monitor your interview progress.
          </p>
        </div>

        <div className="tracker-header-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleOpenAdd}
          >
            <Plus size={16} />
            <span>Add Application</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="tracker-metrics-grid">
        <div className="metric-card glass-card">
          <div className="metric-icon-wrap" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
            <Briefcase size={18} />
          </div>
          <div>
            <span className="metric-val">{totalApps}</span>
            <span className="metric-lbl">Total Tracked</span>
          </div>
        </div>

        <div className="metric-card glass-card">
          <div className="metric-icon-wrap" style={{ background: 'rgba(37, 99, 235, 0.12)', color: '#93C5FD' }}>
            <TrendingUp size={18} />
          </div>
          <div>
            <span className="metric-val">{inPipeline}</span>
            <span className="metric-lbl">Active Pipeline</span>
          </div>
        </div>

        <div className="metric-card glass-card">
          <div className="metric-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
            <Clock size={18} />
          </div>
          <div>
            <span className="metric-val">{activeInterviews}</span>
            <span className="metric-lbl">Interviews Scheduled</span>
          </div>
        </div>

        <div className="metric-card glass-card">
          <div className="metric-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
            <CheckCircle2 size={18} />
          </div>
          <div>
            <span className="metric-val">{offersReceived}</span>
            <span className="metric-lbl">Offers Received</span>
          </div>
        </div>
      </div>

      {/* Kanban Board Columns */}
      <div className="kanban-board-container">
        {APPLICATION_STAGES.map((stage) => {
          const stageApps = applications.filter(a => a.stage === stage.id)

          return (
            <div key={stage.id} className="kanban-column glass-card">
              <div className="kanban-column-header" style={{ borderTopColor: stage.color }}>
                <div className="column-title-wrap">
                  <span className="column-dot" style={{ backgroundColor: stage.color }} />
                  <h4>{stage.label}</h4>
                </div>
                <span className="column-count-badge">{stageApps.length}</span>
              </div>

              <div className="kanban-cards-stack">
                {stageApps.length === 0 ? (
                  <div className="kanban-empty-drop">
                    <span className="text-xs text-muted">No applications</span>
                  </div>
                ) : (
                  stageApps.map((app) => (
                    <div key={app.id} className="application-card glass-card">
                      <div className="app-card-top">
                        <div className="app-company-info">
                          <h5>{app.company}</h5>
                          <span className="app-role-text">{app.role}</span>
                        </div>
                        <button
                          type="button"
                          className="btn-card-trash"
                          onClick={() => handleDelete(app.id)}
                          title="Delete application"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>

                      {/* Meta Tags */}
                      <div className="app-tags-row">
                        {app.salary && (
                          <span className="app-tag tag-salary">
                            <DollarSign size={11} /> {app.salary}
                          </span>
                        )}
                        {app.appliedDate && (
                          <span className="app-tag tag-date">
                            <Calendar size={11} /> {app.appliedDate}
                          </span>
                        )}
                        {app.jobUrl && (
                          <a
                            href={app.jobUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="app-tag tag-link"
                          >
                            <ExternalLink size={11} /> Job Post
                          </a>
                        )}
                      </div>

                      {app.linkedResumeTitle && (
                        <div className="app-resume-chip" title="Linked Resume Version">
                          <FileText size={12} className="text-purple" />
                          <span>{app.linkedResumeTitle}</span>
                        </div>
                      )}

                      {app.notes && (
                        <p className="app-notes-preview">{app.notes}</p>
                      )}

                      {/* Stage Selector Dropdown */}
                      <div className="app-card-footer">
                        <select
                          className="stage-select-control"
                          value={app.stage}
                          onChange={(e) => handleStageChange(app.id, e.target.value)}
                        >
                          {APPLICATION_STAGES.map((s) => (
                            <option key={s.id} value={s.id}>
                              Move to: {s.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Add / Edit Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div
            className="modal-content add-app-modal glass-card animate-fade-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div className="modal-title-group">
                <div className="metric-icon-wrap" style={{ width: 34, height: 34, background: 'var(--accent-gradient-primary)', color: '#fff' }}>
                  <Briefcase size={16} />
                </div>
                <div>
                  <h3>Add Job Application</h3>
                  <p className="text-xs text-muted">Track company, role, salary &amp; resume version</p>
                </div>
              </div>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowAddModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveApp} className="add-app-form">
              <div className="form-row-2col">
                <div className="form-group">
                  <label className="form-label">Company Name *</label>
                  <input
                    type="text"
                    className="input-control"
                    placeholder="e.g. Google, Stripe, Microsoft"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    required
                    autoFocus
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Job Title / Role *</label>
                  <input
                    type="text"
                    className="input-control"
                    placeholder="e.g. Senior Software Engineer"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-row-2col">
                <div className="form-group">
                  <label className="form-label">Salary / Compensation</label>
                  <input
                    type="text"
                    className="input-control"
                    placeholder="e.g. $140,000 / yr"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Initial Stage</label>
                  <select
                    className="input-control"
                    value={formData.stage}
                    onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                  >
                    {APPLICATION_STAGES.map((s) => (
                      <option key={s.id} value={s.id}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Job Posting URL</label>
                <input
                  type="url"
                  className="input-control"
                  placeholder="https://linkedin.com/jobs/view/..."
                  value={formData.jobUrl}
                  onChange={(e) => setFormData({ ...formData, jobUrl: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Linked Resume Version</label>
                <input
                  type="text"
                  className="input-control"
                  placeholder="e.g. Resume_Vineesh_FullStack_Google"
                  value={formData.linkedResumeTitle}
                  onChange={(e) => setFormData({ ...formData, linkedResumeTitle: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Interview Notes &amp; Highlights</label>
                <textarea
                  className="textarea-control"
                  placeholder="Recruiter contact, referral names, interview rounds, prep notes..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="modal-actions" style={{ marginTop: 'var(--space-2)' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <Plus size={16} />
                  <span>Save Application</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
