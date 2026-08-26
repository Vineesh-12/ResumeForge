import { db } from './firebase'
import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore'

const LOCAL_STORAGE_KEY = 'resumeforge_job_applications'

export const APPLICATION_STAGES = [
  { id: 'wishlist', label: 'Saved / Wishlist', color: '#64748b' },
  { id: 'applied', label: 'Applied', color: '#3b82f6' },
  { id: 'interview', label: 'Interview Scheduled', color: '#f59e0b' },
  { id: 'offer', label: 'Offer Received', color: '#10b981' },
  { id: 'rejected', label: 'Archived / Rejected', color: '#ef4444' }
]

function getLocalApplications() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveLocalApplications(apps) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(apps))
  } catch (err) {
    console.warn('Failed to save to localStorage:', err)
  }
}

/**
 * Fetch all job applications for a user (or local storage if logged out)
 */
export async function getJobApplications(userId) {
  if (!userId) {
    return getLocalApplications()
  }

  try {
    const appsRef = collection(db, 'users', userId, 'applications')
    const q = query(appsRef, orderBy('updatedAt', 'desc'))
    const querySnapshot = await getDocs(q)
    const list = []
    querySnapshot.forEach(docSnap => {
      list.push({ id: docSnap.id, ...docSnap.data() })
    })
    return list
  } catch {
    // Fallback to unordered fetch
    try {
      const appsRef = collection(db, 'users', userId, 'applications')
      const querySnapshot = await getDocs(appsRef)
      const list = []
      querySnapshot.forEach(docSnap => {
        list.push({ id: docSnap.id, ...docSnap.data() })
      })
      return list
    } catch {
      return getLocalApplications()
    }
  }
}

/**
 * Save or update a job application
 */
export async function saveJobApplication(userId, applicationData) {
  const appId = applicationData.id || `app_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
  const payload = {
    ...applicationData,
    id: appId,
    updatedAt: new Date().toISOString()
  }

  if (!userId) {
    const local = getLocalApplications()
    const existingIdx = local.findIndex(a => a.id === appId)
    if (existingIdx >= 0) {
      local[existingIdx] = payload
    } else {
      local.unshift(payload)
    }
    saveLocalApplications(local)
    return appId
  }

  const appRef = doc(db, 'users', userId, 'applications', appId)
  await setDoc(appRef, {
    ...payload,
    updatedAt: serverTimestamp()
  }, { merge: true })

  return appId
}

/**
 * Update application stage
 */
export async function updateApplicationStage(userId, appId, newStage) {
  if (!userId) {
    const local = getLocalApplications()
    const app = local.find(a => a.id === appId)
    if (app) {
      app.stage = newStage
      app.updatedAt = new Date().toISOString()
      saveLocalApplications(local)
    }
    return
  }

  const appRef = doc(db, 'users', userId, 'applications', appId)
  await setDoc(appRef, {
    stage: newStage,
    updatedAt: serverTimestamp()
  }, { merge: true })
}

/**
 * Delete job application
 */
export async function deleteJobApplication(userId, appId) {
  if (!userId) {
    const local = getLocalApplications().filter(a => a.id !== appId)
    saveLocalApplications(local)
    return
  }

  const appRef = doc(db, 'users', userId, 'applications', appId)
  await deleteDoc(appRef)
}
