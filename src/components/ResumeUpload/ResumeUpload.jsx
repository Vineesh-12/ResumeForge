import React, { useState, useRef } from 'react'
import { FileUp, FileText, CheckCircle2, AlertCircle, X, Shield, Zap, RefreshCw, Sparkles } from 'lucide-react'
import { extractTextFromPDF, SAMPLE_RESUMES } from '../../services/pdfParser'
import { useApp } from '../../context/AppContext'
import './ResumeUpload.css'

export default function ResumeUpload() {
  const { state, dispatch } = useApp()
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadError, setUploadError] = useState(null)
  const fileInputRef = useRef(null)

  const handleFileProcess = async (file) => {
    setUploadError(null)
    setIsProcessing(true)

    try {
      const result = await extractTextFromPDF(file)
      
      dispatch({
        type: 'SET_RESUME_DATA',
        payload: {
          file,
          fileName: file.name,
          fileSize: file.size,
          rawText: result.text,
          parsed: null // Will be parsed by Gemini in Phase 4
        }
      })
    } catch (err) {
      setUploadError(err.message || 'Failed to read PDF. Please check if the file is valid.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      handleFileProcess(files[0])
    }
  }

  const handleFileInputChange = (e) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileProcess(files[0])
    }
  }

  const handleRemoveResume = () => {
    dispatch({ type: 'CLEAR_RESUME' })
    setUploadError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleLoadSample = () => {
    setUploadError(null)
    const sample = SAMPLE_RESUMES.softwareEngineer
    dispatch({
      type: 'SET_RESUME_DATA',
      payload: {
        file: null,
        fileName: sample.fileName,
        fileSize: sample.fileSize,
        rawText: sample.text,
        parsed: null
      }
    })
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 KB'
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const wordCount = state.resumeRawText
    ? (state.resumeRawText.match(/\b\S+\b/g) || []).length
    : 0

  return (
    <div className="resume-upload-component">
      {/* Hidden Native File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept=".pdf,application/pdf"
        style={{ display: 'none' }}
      />

      {/* Error Banner */}
      {uploadError && (
        <div className="upload-error-banner animate-fade-in">
          <AlertCircle size={16} className="error-icon" />
          <div className="error-text">
            <strong>Upload Error:</strong> {uploadError}
          </div>
          <button
            type="button"
            className="btn-dismiss-error"
            onClick={() => setUploadError(null)}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* STATE 1: Processing / Loading */}
      {isProcessing && (
        <div className="upload-state-card state-processing animate-fade-in">
          <div className="processing-spinner">
            <RefreshCw size={28} className="animate-spin text-purple" />
          </div>
          <h4>Extracting Resume Text...</h4>
          <p className="text-xs text-muted">Parsing client-side with zero data leaks</p>
          <div className="progress-bar-track">
            <div className="progress-bar-shimmer" />
          </div>
        </div>
      )}

      {/* STATE 2: File Successfully Extracted */}
      {!isProcessing && state.resumeRawText && (
        <div className="upload-state-card state-success animate-fade-in">
          {/* File Header Bar */}
          <div className="extracted-file-header">
            <div className="file-info-group">
              <div className="file-icon-badge">
                <FileText size={20} />
              </div>
              <div className="file-details">
                <span className="file-name" title={state.resumeFileName}>
                  {state.resumeFileName || 'Resume.pdf'}
                </span>
                <span className="file-meta text-xs text-muted">
                  {formatFileSize(state.resumeFileSize)} • {wordCount} words extracted
                </span>
              </div>
            </div>

            <div className="file-actions">
              <span className="badge badge-success">
                <CheckCircle2 size={12} /> Ready
              </span>
              <button
                type="button"
                className="btn-remove-file"
                onClick={handleRemoveResume}
                title="Remove and upload different resume"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Scrollable Text Preview Box */}
          <div className="extracted-text-preview-box">
            <div className="preview-box-header">
              <span className="text-xs text-muted">Extracted Text Preview</span>
              <button
                type="button"
                className="btn-reupload-link"
                onClick={() => fileInputRef.current?.click()}
              >
                Change PDF
              </button>
            </div>
            <pre className="extracted-text-content">
              {state.resumeRawText}
            </pre>
          </div>
        </div>
      )}

      {/* STATE 3: Empty Upload Dropzone */}
      {!isProcessing && !state.resumeRawText && (
        <div className="dropzone-container">
          <div
            className={`upload-dropzone ${isDragging ? 'dropzone-active' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="dropzone-icon-circle">
              <FileUp size={32} />
            </div>

            <h4 className="dropzone-heading">
              {isDragging ? 'Drop your PDF right here' : 'Drag & Drop Resume PDF here'}
            </h4>
            <p className="dropzone-subtext text-sm text-muted">
              or <span className="text-highlight">click to browse</span> from your files
            </p>

            <div className="dropzone-pills">
              <span className="pill"><Shield size={12} /> Client-Side Only</span>
              <span className="pill"><Zap size={12} /> Max 5MB PDF</span>
            </div>
          </div>

          {/* Quick Sample Resume Loader */}
          <div className="sample-resume-trigger">
            <span className="text-xs text-muted">Don&apos;t have a PDF right now?</span>
            <button
              type="button"
              className="btn btn-sm btn-ghost btn-sample"
              onClick={handleLoadSample}
            >
              <Sparkles size={13} className="text-cyan" />
              <span>Load Sample Tech Resume</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
