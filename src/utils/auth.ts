import { auth, db } from './firebase'
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateEmail,
  sendEmailVerification,
  type User
} from 'firebase/auth'
import { 
  doc, 
  getDoc, 
  setDoc
} from 'firebase/firestore'

export interface AuthUser {
  id: string
  email: string
  nombre: string
  rol: string
  activo: boolean
  avatar?: string // Base64 image data
  emailVerificado?: boolean
  emailPendienteVerificacion?: string
}

export const authService = {
  // Get current user with auth state wait
  async getCurrentUser(): Promise<AuthUser | null> {
    return new Promise((resolve) => {
      // If already authenticated, get user immediately
      if (auth.currentUser) {
        this.getUserData(auth.currentUser).then(resolve)
        return
      }

      // Wait for auth state to initialize
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        unsubscribe()
        if (!user) {
          resolve(null)
          return
        }
        
        const userData = await this.getUserData(user)
        resolve(userData)
      })
    })
  },

  // Helper to get user data from Firestore
  async getUserData(firebaseUser: User): Promise<AuthUser | null> {
    try {
      const userDoc = await getDoc(doc(db, 'usuarios', firebaseUser.uid))
      if (!userDoc.exists()) {
        console.warn('User document not found in Firestore:', firebaseUser.uid)
        return null
      }

      const userData = userDoc.data()
      
      const finalEmail = userData.emailPendienteVerificacion || userData.email || firebaseUser.email!
      
      return {
        id: firebaseUser.uid,
        email: finalEmail,
        nombre: userData.nombre || '',
        rol: userData.rol || 'usuario',
        activo: userData.activo !== false,
        avatar: userData.avatar || undefined,
        emailVerificado: userData.emailVerificado !== false,
        emailPendienteVerificacion: userData.emailPendienteVerificacion || undefined
      }
    } catch (error) {
      console.error('Error getting user data:', error)
      return null
    }
  },

  // Sign in with email and password
  async signIn(email: string, password: string): Promise<{ user: User | null; error: any }> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      
      // Check if user exists in usuarios collection and is active
      const userDoc = await getDoc(doc(db, 'usuarios', userCredential.user.uid))
      if (!userDoc.exists()) {
        await signOut(auth)
        return { 
          user: null, 
          error: { message: 'Usuario no encontrado en la base de datos' } 
        }
      }

      const userData = userDoc.data()
      if (!userData?.activo) {
        await signOut(auth)
        return { 
          user: null, 
          error: { message: 'Usuario inactivo' } 
        }
      }

      return { user: userCredential.user, error: null }
    } catch (error: any) {
      return { user: null, error }
    }
  },

  // Sign up new user
  async signUp(email: string, password: string, nombre: string): Promise<{ user: User | null; error: any }> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      
      // Create user record in usuarios collection
      await setDoc(doc(db, 'usuarios', userCredential.user.uid), {
        email: userCredential.user.email,
        nombre,
        rol: 'usuario',
        activo: true,
        createdAt: new Date()
      })

      return { user: userCredential.user, error: null }
    } catch (error: any) {
      return { user: null, error }
    }
  },

  // Reset password
  async resetPassword(email: string): Promise<{ success: boolean; error: any }> {
    try {
      await sendPasswordResetEmail(auth, email)
      return { success: true, error: null }
    } catch (error: any) {
      return { success: false, error }
    }
  },

  // Update user email
  async updateUserEmail(newEmail: string): Promise<{ success: boolean; error: any }> {
    try {
      const user = auth.currentUser
      if (!user) {
        throw new Error('No hay usuario autenticado')
      }

      await updateEmail(user, newEmail)
      return { success: true, error: null }
    } catch (error: any) {
      console.error('Email update error:', error)
      return { success: false, error }
    }
  },

  // Send email verification
  async sendEmailVerification(): Promise<{ success: boolean; error: any }> {
    try {
      const user = auth.currentUser
      if (!user) {
        throw new Error('No hay usuario autenticado')
      }

      await sendEmailVerification(user)
      return { success: true, error: null }
    } catch (error: any) {
      console.error('Email verification error:', error)
      return { success: false, error }
    }
  },

  // Sign out
  async signOut(): Promise<void> {
    await signOut(auth)
  },

  // Listen to auth changes
  onAuthStateChange(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback)
  },

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    return new Promise((resolve) => {
      // If already have currentUser, resolve immediately
      if (auth.currentUser) {
        resolve(true)
        return
      }

      // Wait for auth state to initialize
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe()
        resolve(!!user)
      })
      
      // Timeout after 5 seconds
      setTimeout(() => {
        unsubscribe()
        resolve(false)
      }, 5000)
    })
  },

  // Check if user has role
  async hasRole(role: string): Promise<boolean> {
    const user = await this.getCurrentUser()
    return user?.rol === role || user?.rol === 'admin'
  }
}

// Auth context for client-side components
export class AuthContext {
  private static instance: AuthContext
  private user: AuthUser | null = null
  private firebaseUser: User | null = null
  private listeners: Array<(user: AuthUser | null) => void> = []

  static getInstance(): AuthContext {
    if (!AuthContext.instance) {
      AuthContext.instance = new AuthContext()
    }
    return AuthContext.instance
  }

  async initialize(): Promise<void> {
    // Get initial user
    this.firebaseUser = auth.currentUser
    this.user = await authService.getCurrentUser()

    // Listen for auth changes
    authService.onAuthStateChange(async (firebaseUser) => {
      this.firebaseUser = firebaseUser
      this.user = firebaseUser ? await authService.getCurrentUser() : null
      this.notifyListeners()
    })
  }

  getUser(): AuthUser | null {
    return this.user
  }

  getFirebaseUser(): User | null {
    return this.firebaseUser
  }

  isAuthenticated(): boolean {
    return !!this.firebaseUser && !!this.user
  }

  hasRole(role: string): boolean {
    return this.user?.rol === role || this.user?.rol === 'admin'
  }

  subscribe(listener: (user: AuthUser | null) => void): () => void {
    this.listeners.push(listener)
    return () => {
      const index = this.listeners.indexOf(listener)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.user))
  }
}
