import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { subscribeToAuthChanges, getUserResumes } from '../services/firebase'

const AppContext = createContext(null)

const STORAGE_KEY = 'resumeforge_gemini_api_key'
const ENV_KEY = import.meta.env.VITE_GEMINI_API_KEY || ''

const initialState = {
  // API Authentication
  apiKey: localStorage.getItem(STORAGE_KEY) || ENV_KEY,
  showApiKeyModal: false,

  // Firebase User Authentication & Cloud Sync
  currentUser: null,
  isAuthLoading: true,
  showAuthModal: false,
  showDashboardModal: false,
  userResumes: [],
  activeCloudResumeId: null,

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

    // --- Firebase Auth & Cloud Actions ---
    case 'SET_CURRENT_USER':
      return {
        ...state,
        currentUser: action.payload,
        isAuthLoading: false
      }

    case 'TOGGLE_AUTH_MODAL':
      return {
        ...state,
        showAuthModal: action.payload !== undefined ? action.payload : !state.showAuthModal
      }

    case 'TOGGLE_DASHBOARD_MODAL':
      return {
        ...state,
        showDashboardModal: action.payload !== undefined ? action.payload : !state.showDashboardModal
      }

    case 'SET_USER_RESUMES':
      return {
        ...state,
        userResumes: action.payload || []
      }

    case 'SET_ACTIVE_CLOUD_RESUME_ID':
      return {
        ...state,
        activeCloudResumeId: action.payload
      }

    case 'LOAD_CLOUD_RESUME': {
      const cloudResume = action.payload
      const rData = cloudResume.resumeData || {}
      return {
        ...state,
        activeCloudResumeId: cloudResume.id,
        tailoredResume: rData,
        resumeParsed: rData,
        atsScore: cloudResume.atsScore || 90,
        atsGrade: cloudResume.atsGrade || 'A',
        showDashboardModal: false,
        completedSteps: { 1: true, 2: true, 3: true, 4: false },
        toast: { message: `Loaded "${cloudResume.title || 'Saved Resume'}" successfully!`, type: 'success' }
      }
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
        resumeParsed: null,
        activeCloudResumeId: null
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
        apiKey: state.apiKey,
        currentUser: state.currentUser,
        isAuthLoading: false
      }

    default:
      return state
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  // Listen to Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges(async (user) => {
      dispatch({ type: 'SET_CURRENT_USER', payload: user })
      if (user) {
        try {
          const resumes = await getUserResumes(user.uid)
          dispatch({ type: 'SET_USER_RESUMES', payload: resumes })
        } catch (err) {
          console.warn('Failed to load user resumes on login:', err)
        }
      } else {
        dispatch({ type: 'SET_USER_RESUMES', payload: [] })
      }
    })

    return () => unsubscribe()
  }, [])

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
