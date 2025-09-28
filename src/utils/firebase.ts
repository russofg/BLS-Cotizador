import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

// Configuración de Firebase
const firebaseConfig = {
  apiKey: import.meta.env.PUBLIC_FIREBASE_API_KEY,
  authDomain: import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.PUBLIC_FIREBASE_APP_ID
}

// Validar que las variables de entorno estén configuradas
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error('Firebase configuration missing:', {
    apiKey: !!firebaseConfig.apiKey,
    projectId: !!firebaseConfig.projectId,
    authDomain: !!firebaseConfig.authDomain
  })
  throw new Error('Firebase configuration is incomplete. Please check environment variables.')
}

// Inicializar Firebase
const app = initializeApp(firebaseConfig)

// Inicializar servicios
export const db = getFirestore(app)
export const auth = getAuth(app)

export default app

export type { Firestore } from 'firebase/firestore'
export type { Auth, User } from 'firebase/auth'
