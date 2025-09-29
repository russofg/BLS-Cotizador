/**
 * Script para verificar el estado de los recordatorios
 */
const { initializeApp } = require("firebase/app");
const {
  getFirestore,
  collection,
  doc,
  getDoc,
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

async function checkReminders() {
  console.log("🔍 Verificando estado de recordatorios...");

  try {
    const cotizacionesRef = collection(db, "cotizaciones");
    const snapshot = await getDocs(cotizacionesRef);

    const ahora = new Date();
    console.log(`⏰ Hora actual: ${ahora.toLocaleString()}`);

    snapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      console.log(`\n📄 Cotización: ${data.numero}`);

      if (data.proximoSeguimiento) {
        const fechaRecordatorio = new Date(
          data.proximoSeguimiento.seconds * 1000
        );
        const minutosRestantes = Math.floor(
          (fechaRecordatorio.getTime() - ahora.getTime()) / (1000 * 60)
        );

        console.log(
          `   📅 Recordatorio programado: ${fechaRecordatorio.toLocaleString()}`
        );
        console.log(`   ⏰ Minutos restantes: ${minutosRestantes}`);
        console.log(`   📧 Email habilitado: ${data.proximoSeguimientoEmail}`);
        console.log(`   💬 Mensaje: ${data.proximoSeguimientoMensaje}`);
        console.log(`   🔔 Push habilitado: ${data.proximoSeguimientoPush}`);

        if (minutosRestantes <= 0) {
          console.log(`   ⚠️ ¡DEBERÍA EJECUTARSE AHORA!`);
        } else {
          console.log(`   ✅ Programado correctamente`);
        }
      } else {
        console.log(`   ❌ Sin recordatorio programado`);
      }
    });
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

checkReminders();
