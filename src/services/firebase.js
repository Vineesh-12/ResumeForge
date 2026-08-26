import { initializeApp, getApps, getApp } from 'firebase/app'
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth'
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyBPFVf30tSAysXVgAz5q0ZU0KpjU4DeDF4',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'resumeforge-67c03.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'resumeforge-67c03',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'resumeforge-67c03.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '1017773297221',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:1017773297221:web:26fb567ee819c5372bdd2c',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-B500NNF6VF'
}

// Initialize Firebase App singleton
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()

export const auth = getAuth(app)
export const db = getFirestore(app)
export const googleProvider = new GoogleAuthProvider()

// --- Authentication Helpers ---

/**
 * Register a new user with email and password
 */
export async function signUpWithEmail(email, password, displayName = '') {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password)
  if (displayName && userCredential.user) {
    await updateProfile(userCredential.user, { displayName })
  }
  return userCredential.user
}

/**
 * Sign in with email and password
 */
export async function signInWithEmail(email, password) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password)
  return userCredential.user
}

/**
 * Sign in with Google (1-Click OAuth)
 */
export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider)
  return result.user
}

/**
 * Sign out current user
 */
export async function signOutUser() {
  await signOut(auth)
}

/**
 * Subscribe to auth state changes
 */
export function subscribeToAuthChanges(callback) {
  return onAuthStateChanged(auth, callback)
}

// --- Cloud Resume Storage Helpers ---

/**
 * Save or update a resume in Firestore for the given user
 * @param {string} userId - Current user UID
 * @param {object} resumeData - Full resume object
 * @param {object} metadata - { title, targetRole, atsScore, atsGrade }
 * @param {string} [existingId] - Optional existing document ID
 * @returns {Promise<string>} Document ID
 */
export async function saveResumeToCloud(userId, resumeData, metadata = {}, existingId = null) {
  if (!userId) throw new Error('User must be logged in to save resumes to cloud.')
  if (!resumeData) throw new Error('No resume data provided to save.')

  const resumeId = existingId || `resume_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
  const resumeRef = doc(db, 'users', userId, 'resumes', resumeId)

  const payload = {
    id: resumeId,
    title: metadata.title || resumeData.name || 'Tailored Resume',
    targetRole: metadata.targetRole || 'Software Engineer',
    atsScore: metadata.atsScore ?? 0,
    atsGrade: metadata.atsGrade || 'A',
    resumeData,
    updatedAt: serverTimestamp()
  }

  if (!existingId) {
    payload.createdAt = serverTimestamp()
  }

  await setDoc(resumeRef, payload, { merge: true })
  return resumeId
}

/**
 * Fetch all saved resumes for a user
 * @param {string} userId 
 * @returns {Promise<Array>}
 */
export async function getUserResumes(userId) {
  if (!userId) return []

  const resumesRef = collection(db, 'users', userId, 'resumes')
  const q = query(resumesRef, orderBy('updatedAt', 'desc'))
  
  try {
    const querySnapshot = await getDocs(q)
    const resumes = []
    querySnapshot.forEach(docSnap => {
      resumes.push({
        id: docSnap.id,
        ...docSnap.data()
      })
    })
    return resumes
  } catch (err) {
    // If index or orderBy fails on new collections, fallback to unsorted getDocs
    console.warn('Ordered query failed, falling back to simple collection fetch:', err)
    const querySnapshot = await getDocs(resumesRef)
    const resumes = []
    querySnapshot.forEach(docSnap => {
      resumes.push({
        id: docSnap.id,
        ...docSnap.data()
      })
    })
    return resumes
  }
}

/**
 * Delete a specific resume for a user
 * @param {string} userId 
 * @param {string} resumeId 
 */
export async function deleteUserResume(userId, resumeId) {
  if (!userId || !resumeId) throw new Error('User ID and Resume ID are required.')
  const resumeRef = doc(db, 'users', userId, 'resumes', resumeId)
  await deleteDoc(resumeRef)
}
