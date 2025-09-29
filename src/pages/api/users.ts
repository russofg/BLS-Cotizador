import type { APIRoute } from 'astro';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, orderBy } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBJiXU5fV9hMnntRQ-Tw-W4OpoL3ofXioU",
  authDomain: "cotizador-bls.firebaseapp.com",
  projectId: "cotizador-bls",
  storageBucket: "cotizador-bls.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456",
};

// Crear una instancia única de Firebase para esta API
let app: any = null;
let db: any = null;

function getFirebaseInstance() {
  if (!app) {
    try {
      app = initializeApp(firebaseConfig);
      db = getFirestore(app);
    } catch (error) {
      console.error('Error inicializando Firebase:', error);
      // Si ya existe una app, usar la existente
      app = initializeApp(firebaseConfig, 'users-api');
      db = getFirestore(app);
    }
  }
  return { app, db };
}

export const GET: APIRoute = async ({ request }) => {
  try {
    console.log('📡 API: Obteniendo usuarios para notificaciones...');
    
    const { db } = getFirebaseInstance();
    
    const usuariosRef = collection(db, 'usuarios');
    const q = query(usuariosRef, orderBy('nombre'));
    const snapshot = await getDocs(q);

    const usuarios = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.activo !== false && data.notificacionesEmail !== false && data.email) {
        usuarios.push({
          id: doc.id,
          nombre: data.nombre || '',
          email: data.email || '',
          rol: data.rol || 'usuario',
          departamento: data.departamento || '',
          telefono: data.telefono || ''
        });
      }
    });
    
    console.log(`✅ API: ${usuarios.length} usuarios encontrados`);
    
    return new Response(JSON.stringify({
      success: true,
      usuarios: usuarios
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
  } catch (error) {
    console.error('❌ API Error obteniendo usuarios:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Error obteniendo usuarios',
      usuarios: []
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  }
};
