import { initializeApp, getApps, getApp } from 'firebase/app'
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  updatePassword,
  deleteUser
} from 'firebase/auth'
import {
  getFirestore,
  collection,
  doc,
  getDoc,
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
 * Send password reset email / OTP link
 */
export async function sendPasswordReset(email) {
  if (!email) throw new Error('Please provide a valid email address.')
  await sendPasswordResetEmail(auth, email)
}

/**
 * Update user account password
 */
export async function updateUserAccountPassword(newPassword) {
  if (!auth.currentUser) throw new Error('No user is currently signed in.')
  await updatePassword(auth.currentUser, newPassword)
}

/**
 * Update user display/profile name in Firebase Auth
 */
export async function updateUserProfileName(displayName) {
  if (auth.currentUser) {
    await updateProfile(auth.currentUser, { displayName })
  }
}

/**
 * Check if a unique @username is available across the platform
 */
export async function checkUsernameAvailability(username, currentUid = null) {
  if (!username) return false
  const clean = username.trim().toLowerCase().replace(/^@/, '').replace(/[^a-z0-9_.]/g, '')
  if (clean.length < 3) return false

  try {
    const userDocRef = doc(db, 'usernames', clean)
    const snap = await getDoc(userDocRef)
    if (!snap.exists()) return true
    // If it belongs to current user, it's available for them
    const data = snap.data()
    return currentUid && data.uid === currentUid
  } catch {
    // If offline/rules fallback, check local storage
    const localTaken = localStorage.getItem(`rf_username_${clean}`)
    return !localTaken || (currentUid && localTaken === currentUid)
  }
}

/**
 * Claim and reserve a unique username for a user
 */
export async function claimUsername(username, userId) {
  if (!username || !userId) return false
  const clean = username.trim().toLowerCase().replace(/^@/, '').replace(/[^a-z0-9_.]/g, '')
  if (clean.length < 3) return false

  try {
    const userDocRef = doc(db, 'usernames', clean)
    await setDoc(userDocRef, {
      uid: userId,
      claimedAt: serverTimestamp()
    }, { merge: true })
  } catch {
    // Local fallback
    localStorage.setItem(`rf_username_${clean}`, userId)
  }
  return true
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
 */
export async function deleteUserResume(userId, resumeId) {
  if (!userId || !resumeId) throw new Error('User ID and Resume ID are required.')
  const resumeRef = doc(db, 'users', userId, 'resumes', resumeId)
  await deleteDoc(resumeRef)
}

/**
 * Permanently delete user account, all saved resumes, claimed username, and user data
 */
export async function deleteUserAccountAndCloudData(userId, username = null) {
  if (userId) {
    try {
      // 1. Delete all resumes in users/{userId}/resumes
      const resumesRef = collection(db, 'users', userId, 'resumes')
      const querySnapshot = await getDocs(resumesRef)
      const deletePromises = []
      querySnapshot.forEach(docSnap => {
        deletePromises.push(deleteDoc(doc(db, 'users', userId, 'resumes', docSnap.id)))
      })
      await Promise.all(deletePromises)

      // 2. Delete user profile doc if exists
      try {
        await deleteDoc(doc(db, 'users', userId))
      } catch {}

      // 3. Delete claimed username if present
      if (username) {
        const clean = username.trim().toLowerCase().replace(/^@/, '').replace(/[^a-z0-9_.]/g, '')
        try {
          await deleteDoc(doc(db, 'usernames', clean))
        } catch {}
      }
    } catch (err) {
      console.warn('Firestore cleanup notice:', err)
    }
  }

  // 4. Delete Firebase Auth user account if signed in
  if (auth.currentUser) {
    try {
      await deleteUser(auth.currentUser)
    } catch (authErr) {
      console.warn('Auth account deletion notice (or requires re-auth):', authErr)
      await signOut(auth)
    }
  }
}
