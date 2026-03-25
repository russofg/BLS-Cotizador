/**
 * Script para limpiar usuarios duplicados y crear un recordatorio de prueba
 */
const { initializeApp } = require("firebase/app");
const {
  getFirestore,
  collection,
  doc,
  deleteDoc,
  setDoc,
  getDocs,
} = require("firebase/firestore");

const firebaseConfig = {
  apiKey: "AIzaSyBJiXU5fV9hMnntRQ-Tw-W4OpoL3ofXioU",
  authDomain: "cotizador-bls.firebaseapp.com",
  projectId: "cotizador-bls",
  storageBucket: "cotizador-bls.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function cleanupAndCreateTestReminder() {
  console.log("🧹 Limpiando usuarios duplicados...");

  try {
    // Obtener todos los usuarios
    const usuariosRef = collection(db, "usuarios");
    const snapshot = await getDocs(usuariosRef);

    // Eliminar usuarios duplicados (mantener solo el primero de cada email)
    const emailsVistos = new Set();
    let eliminados = 0;

    for (const docSnapshot of snapshot.docs) {
      const data = docSnapshot.data();
      const email = data.email;

      if (emailsVistos.has(email)) {
        console.log(
          `🗑️ Eliminando usuario duplicado: ${data.nombre} (${email})`
        );
        await deleteDoc(doc(db, "usuarios", docSnapshot.id));
        eliminados++;
      } else {
        emailsVistos.add(email);
        console.log(`✅ Manteniendo usuario: ${data.nombre} (${email})`);
      }
    }

    console.log(`\n📊 Usuarios eliminados: ${eliminados}`);

    // Crear un recordatorio de prueba para dentro de 2 minutos
    console.log("\n📅 Creando recordatorio de prueba...");
    const ahora = new Date();
    const fechaRecordatorio = new Date(ahora.getTime() + 2 * 60 * 1000); // 2 minutos

    const cotizacionRef = doc(db, "cotizaciones", "Qwg51VUooFHQ7yTbm7cr");
    await setDoc(
      cotizacionRef,
      {
        proximoSeguimiento: {
          seconds: Math.floor(fechaRecordatorio.getTime() / 1000),
          nanoseconds: 0,
        },
        proximoSeguimientoTipo: "seguimiento",
        proximoSeguimientoMensaje:
          "Prueba de múltiples destinatarios - Recordatorio automático",
        proximoSeguimientoEmail: true,
        proximoSeguimientoPush: true,
        proximoSeguimientoUsuario: "Sistema de Prueba",
        updatedAt: new Date(),
      },
      { merge: true }
    );

    console.log(
      `✅ Recordatorio creado para: ${fechaRecordatorio.toLocaleString()}`
    );
    console.log("📧 Se enviará a todos los usuarios configurados");

    // Mostrar usuarios finales
    console.log("\n👥 Usuarios finales:");
    const usuariosFinales = await getDocs(usuariosRef);
    usuariosFinales.forEach((docSnapshot, index) => {
      const data = docSnapshot.data();
      console.log(`   ${index + 1}. ${data.nombre} (${data.email})`);
    });
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

cleanupAndCreateTestReminder();
