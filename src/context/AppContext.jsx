import React, { createContext, useContext, useReducer, useEffect } from 'react'

const AppContext = createContext(null)

const STORAGE_KEY = 'resumeforge_gemini_api_key'
const ENV_KEY = import.meta.env.VITE_GEMINI_API_KEY || ''

const initialState = {
  // API Authentication
  apiKey: localStorage.getItem(STORAGE_KEY) || ENV_KEY,
  showApiKeyModal: false,

  // Resume Data
  resumeFile: null,
  resumeFileName: '',
  resumeFileSize: 0,
  resumeRawText: '',
  resumeParsed: null,

  // Job Description Data
  jobDescription: '',
  jdParsed: null,

  // Gap Analysis & Scoring
  gapAnalysis: null,
  atsScore: 0,
  atsGrade: 'N/A',
  atsBreakdown: null,

  // Tailored Resume & Output
  tailoredResume: null,
  changesLog: [],
  skillSuggestions: [],

  // Navigation & Step Tracking
  currentStep: 1, // 1: Input, 2: Analyze, 3: Tailor, 4: Export
  completedSteps: {
    1: false,
    2: false,
    3: false,
    4: false
  },

  // Async UI State
  isLoading: false,
  loadingMessage: '',
  loadingProgress: 0,
  error: null,
  toast: null // { message, type: 'success' | 'error' | 'info' }
}

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_API_KEY': {
      const key = action.payload
      if (key) {
        localStorage.setItem(STORAGE_KEY, key)
      } else {
        localStorage.removeItem(STORAGE_KEY)
      }
      return {
        ...state,
        apiKey: key,
        showApiKeyModal: false,
        toast: { message: 'API key saved successfully!', type: 'success' }
      }
    }

    case 'TOGGLE_API_KEY_MODAL':
      return {
        ...state,
        showApiKeyModal: action.payload !== undefined ? action.payload : !state.showApiKeyModal
      }

    case 'SET_RESUME_DATA':
      return {
        ...state,
        resumeFile: action.payload.file || state.resumeFile,
        resumeFileName: action.payload.fileName || state.resumeFileName,
        resumeFileSize: action.payload.fileSize || state.resumeFileSize,
        resumeRawText: action.payload.rawText !== undefined ? action.payload.rawText : state.resumeRawText,
        resumeParsed: action.payload.parsed !== undefined ? action.payload.parsed : state.resumeParsed
      }

    case 'CLEAR_RESUME':
      return {
        ...state,
        resumeFile: null,
        resumeFileName: '',
        resumeFileSize: 0,
        resumeRawText: '',
        resumeParsed: null
      }

    case 'SET_JOB_DESCRIPTION':
      return {
        ...state,
        jobDescription: action.payload
      }

    case 'SET_JD_PARSED':
      return {
        ...state,
        jdParsed: action.payload
      }

    case 'SET_GAP_ANALYSIS':
      return {
        ...state,
        gapAnalysis: action.payload.gapAnalysis,
        atsScore: action.payload.atsScore,
        atsGrade: action.payload.atsGrade,
        atsBreakdown: action.payload.atsBreakdown,
        completedSteps: { ...state.completedSteps, 1: true, 2: true }
      }

    case 'SET_TAILORED_RESUME':
      return {
        ...state,
        tailoredResume: action.payload.tailoredResume,
        changesLog: action.payload.changesLog || [],
        skillSuggestions: action.payload.skillSuggestions || [],
        completedSteps: { ...state.completedSteps, 3: true }
      }

    case 'UPDATE_TAILORED_SECTION': {
      const { section, data } = action.payload
      return {
        ...state,
        tailoredResume: {
          ...state.tailoredResume,
          [section]: data
        }
      }
    }

    case 'SET_STEP':
      return {
        ...state,
        currentStep: action.payload
      }

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload.loading,
        loadingMessage: action.payload.message || '',
        loadingProgress: action.payload.progress || 0
      }

    case 'SET_ERROR':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
        toast: action.payload ? { message: action.payload, type: 'error' } : null
      }

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      }

    case 'SET_TOAST':
      return {
        ...state,
        toast: action.payload
      }

    case 'CLEAR_TOAST':
      return {
        ...state,
        toast: null
      }

    case 'RESET_ALL':
      return {
        ...initialState,
        apiKey: state.apiKey
      }

    default:
      return state
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
