import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  X,
  FileText,
  Trash2,
  ExternalLink,
  Cloud,
  Check,
  Calendar,
  Sparkles,
  RotateCw,
  Award
} from 'lucide-react'
import {
  getUserResumes,
  saveResumeToCloud,
  deleteUserResume
} from '../../services/firebase'
import { useApp } from '../../context/AppContext'
import './DashboardModal.css'

export default function DashboardModal() {
  const { state, dispatch } = useApp()
  const navigate = useNavigate()
  const [saveTitle, setSaveTitle] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isLoadingResumes, setIsLoadingResumes] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState(null)

  const activeResume = state.tailoredResume || state.resumeParsed

  const loadResumes = async () => {
    if (!state.currentUser) return
    setIsLoadingResumes(true)
    try {
      const list = await getUserResumes(state.currentUser.uid)
      dispatch({ type: 'SET_USER_RESUMES', payload: list })
    } catch (err) {
      console.error('Failed to load user resumes:', err)
    } finally {
      setIsLoadingResumes(false)
    }
  }

  useEffect(() => {
    if (state.showDashboardModal && state.currentUser) {
      loadResumes()
      if (activeResume) {
        setSaveTitle(
          state.jdParsed?.jobTitle
            ? `${activeResume.name || 'Resume'} - ${state.jdParsed.jobTitle}`
            : `${activeResume.name || 'Resume'} - Optimized`
        )
      }
    }
  }, [state.showDashboardModal, state.currentUser])

  if (!state.showDashboardModal) return null

  const handleClose = () => {
    setDeleteConfirmId(null)
    dispatch({ type: 'TOGGLE_DASHBOARD_MODAL', payload: false })
  }



  const handleSaveCurrent = async (e) => {
    e?.preventDefault()
    if (!state.currentUser) {
      dispatch({ type: 'TOGGLE_AUTH_MODAL', payload: true })
      return
    }
    if (!activeResume) {
      dispatch({
        type: 'SET_ERROR',
        payload: 'No resume is currently loaded to save.'
      })
      return
    }

    setIsSaving(true)
    try {
      const docId = await saveResumeToCloud(
        state.currentUser.uid,
        activeResume,
        {
          title: saveTitle.trim() || activeResume.name || 'Tailored Resume',
          targetRole: state.jdParsed?.jobTitle || 'Software Engineer',
          atsScore: state.atsScore || 90,
          atsGrade: state.atsGrade || 'A'
        },
        state.activeCloudResumeId
      )

      dispatch({ type: 'SET_ACTIVE_CLOUD_RESUME_ID', payload: docId })
      dispatch({
        type: 'SET_TOAST',
        payload: {
          message: `Saved "${saveTitle.trim() || 'Resume'}" to cloud!`,
          type: 'success'
        }
      })
      await loadResumes()
    } catch (err) {
      console.error('Error saving resume to cloud:', err)
      dispatch({
        type: 'SET_ERROR',
        payload: 'Failed to save resume: ' + err.message
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleLoadResume = (resumeDoc) => {
    dispatch({ type: 'LOAD_CLOUD_RESUME', payload: resumeDoc })
    navigate('/tailor')
  }

  const handleDeleteResume = async (resumeId) => {
    if (!state.currentUser) return
    try {
      await deleteUserResume(state.currentUser.uid, resumeId)
      const updatedList = state.userResumes.filter(r => r.id !== resumeId)
      dispatch({ type: 'SET_USER_RESUMES', payload: updatedList })
      dispatch({
        type: 'SET_TOAST',
        payload: {
          message: 'Resume deleted from cloud storage.',
          type: 'info'
        }
      })
      setDeleteConfirmId(null)
    } catch (err) {
      console.error('Error deleting resume:', err)
      dispatch({
        type: 'SET_ERROR',
        payload: 'Failed to delete resume: ' + err.message
      })
    }
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Recently'
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    } catch {
      return 'Recently'
    }
  }

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div
        className="modal-content dashboard-modal-card glass-card animate-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="dashboard-avatar">
              <Cloud size={20} />
            </div>
            <div>
              <h3>My Saved Resumes</h3>
              <p className="text-xs text-muted">
                {state.currentUser?.email} • Cloud Synchronized
              </p>
            </div>
          </div>
          <button
            type="button"
            className="btn-close"
            onClick={handleClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Save Current Draft Banner */}
        {activeResume && (
          <div className="save-current-panel">
            <div className="save-panel-header">
              <Sparkles size={16} className="text-purple" />
              <span>Save Current Active Draft to Cloud</span>
            </div>
            <form onSubmit={handleSaveCurrent} className="save-current-form">
              <input
                type="text"
                className="input-control save-title-input"
                placeholder="Give this resume a title (e.g. Google - Full Stack)"
                value={saveTitle}
                onChange={(e) => setSaveTitle(e.target.value)}
              />
              <button
                type="submit"
                className="btn btn-primary btn-save-cloud"
                disabled={isSaving}
              >
                {isSaving ? (
                  <span>Saving...</span>
                ) : (
                  <>
                    <Cloud size={15} />
                    <span>{state.activeCloudResumeId ? 'Update in Cloud' : 'Save to Cloud'}</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Resumes Grid / List */}
        <div className="dashboard-resumes-container">
          <div className="resumes-header-bar">
            <h4>Saved Versions ({state.userResumes.length})</h4>
            <button
              type="button"
              className="btn-refresh-resumes"
              onClick={loadResumes}
              title="Refresh list"
            >
              <RotateCw size={13} className={isLoadingResumes ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>

          {isLoadingResumes ? (
            <div className="dashboard-empty-state">
              <RotateCw size={24} className="animate-spin text-purple" />
              <p className="text-sm text-muted">Loading your cloud resumes...</p>
            </div>
          ) : state.userResumes.length === 0 ? (
            <div className="dashboard-empty-state">
              <FileText size={32} className="text-muted" />
              <h5>No Saved Resumes Yet</h5>
              <p className="text-xs text-muted">
                Tailor a resume and click &quot;Save to Cloud&quot; to preserve your versions here.
              </p>
            </div>
          ) : (
            <div className="resumes-grid">
              {state.userResumes.map((item) => {
                const isConfirmingDelete = deleteConfirmId === item.id

                return (
                  <div
                    key={item.id}
                    className={`resume-card-glass ${state.activeCloudResumeId === item.id ? 'active-cloud-card' : ''}`}
                  >
                    <div className="resume-card-top">
                      <div className="resume-card-title-group">
                        <h5>{item.title || 'Untitled Resume'}</h5>
                        <span className="text-xs text-muted">
                          {item.resumeData?.name || 'Candidate'} • {item.targetRole || 'Software Engineer'}
                        </span>
                      </div>
                      <div className="ats-mini-chip">
                        <Award size={13} className="text-success" />
                        <span>ATS {item.atsScore || 90}%</span>
                      </div>
                    </div>

                    <div className="resume-card-meta">
                      <span className="card-date">
                        <Calendar size={12} />
                        {formatDate(item.updatedAt)}
                      </span>
                      {state.activeCloudResumeId === item.id && (
                        <span className="badge badge-success badge-sm">
                          <Check size={10} /> Active
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="resume-card-actions">
                      <button
                        type="button"
                        className="btn btn-sm btn-primary btn-load-editor"
                        onClick={() => handleLoadResume(item)}
                      >
                        <ExternalLink size={13} />
                        <span>Open in Live Editor</span>
                      </button>

                      {isConfirmingDelete ? (
                        <div className="delete-confirm-group animate-fade-in">
                          <button
                            type="button"
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDeleteResume(item.id)}
                          >
                            Confirm Delete
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-ghost"
                            onClick={() => setDeleteConfirmId(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="btn-trash-resume"
                          onClick={() => setDeleteConfirmId(item.id)}
                          title="Delete this resume"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
