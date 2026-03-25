import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

if (!getApps().length) {
  try {
    // Para el entorno de Astro, usamos import.meta.env
    // En producción/build, Vite inyectará estas variables si están en .env
    const projectId = import.meta.env.FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
    const clientEmail = import.meta.env.FIREBASE_CLIENT_EMAIL || process.env.FIREBASE_CLIENT_EMAIL;
    // Manejar saltos de línea escapados en la variable de entorno
    let privateKey = import.meta.env.FIREBASE_PRIVATE_KEY || process.env.FIREBASE_PRIVATE_KEY;
    
    if (privateKey) {
      privateKey = privateKey.replace(/\\n/g, '\n');
    }

    if (!projectId || !clientEmail || !privateKey) {
      console.warn('Firebase Admin SDK no está inicializado completamente. Faltan variables de entorno (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY).');
    } else {
      initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
      console.log('Firebase Admin inicializado correctamente.');
    }
  } catch (error) {
    console.error('Error inicializando Firebase Admin SDK:', error);
  }
}

export const adminDb = getFirestore();
export const adminAuth = getAuth();
