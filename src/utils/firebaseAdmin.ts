import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

let firebaseAdminInitialized = false;
let firebaseAdminInitError: string | null = null;

function initializeFirebaseAdmin() {
  if (firebaseAdminInitialized || getApps().length) {
    firebaseAdminInitialized = true;
    return;
  }

  try {
    // En serverless usamos process.env; import.meta.env puede no existir en runtime.
    const projectId = process.env.FIREBASE_PROJECT_ID || import.meta.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || import.meta.env.FIREBASE_CLIENT_EMAIL;
    let privateKey = process.env.FIREBASE_PRIVATE_KEY || import.meta.env.FIREBASE_PRIVATE_KEY;

    if (privateKey) {
      privateKey = privateKey.replace(/\\n/g, '\n');
    }

    if (!projectId || !clientEmail || !privateKey) {
      firebaseAdminInitError =
        'Firebase Admin SDK no esta inicializado: faltan FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL o FIREBASE_PRIVATE_KEY.';
      console.warn(firebaseAdminInitError);
      return;
    }

    initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });

    firebaseAdminInitialized = true;
    firebaseAdminInitError = null;
    console.log('Firebase Admin inicializado correctamente.');
  } catch (error) {
    firebaseAdminInitError =
      error instanceof Error ? error.message : 'Error inesperado inicializando Firebase Admin SDK.';
    console.error('Error inicializando Firebase Admin SDK:', error);
  }
}

function ensureFirebaseAdminInitialized() {
  initializeFirebaseAdmin();

  if (!getApps().length) {
    throw new Error(
      firebaseAdminInitError ||
        'Firebase Admin SDK no esta inicializado. Configura FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL y FIREBASE_PRIVATE_KEY.'
    );
  }
}

export function getAdminDb() {
  ensureFirebaseAdminInitialized();
  return getFirestore();
}

export function getAdminAuth() {
  ensureFirebaseAdminInitialized();
  return getAuth();
}

// Compatibilidad hacia atras: permite seguir usando adminDb/adminAuth sin crash en carga de modulo.
export const adminDb = new Proxy({} as ReturnType<typeof getFirestore>, {
  get(_target, prop) {
    const db = getAdminDb() as any;
    const value = db[prop as keyof typeof db];
    return typeof value === 'function' ? value.bind(db) : value;
  },
});

export const adminAuth = new Proxy({} as ReturnType<typeof getAuth>, {
  get(_target, prop) {
    const auth = getAdminAuth() as any;
    const value = auth[prop as keyof typeof auth];
    return typeof value === 'function' ? value.bind(auth) : value;
  },
});
