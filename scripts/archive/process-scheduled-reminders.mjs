import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { RealEmailService } from "./RealEmailService.cjs";

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

// Configurar email service
RealEmailService.configure({
  host: "smtp.hostinger.com",
  port: 587,
  secure: false,
  auth: {
    user: "info@serviciosbls.com",
    pass: "Pincharrata160$",
  },
});

async function processScheduledReminders() {
  console.log("🔍 Procesando recordatorios programados...");

  try {
    const cotizacionesRef = collection(db, "cotizaciones");
    const snapshot = await getDocs(cotizacionesRef);

    let processedCount = 0;
    const now = new Date();

    for (const docSnapshot of snapshot.docs) {
      const data = docSnapshot.data();

      // Verificar si hay un recordatorio programado
      if (data.proximoSeguimiento && data.proximoSeguimientoEmail) {
        const reminderDate = new Date(data.proximoSeguimiento.seconds * 1000);

        // Si es hora de ejecutar el recordatorio
        if (reminderDate <= now) {
          console.log(`📅 Procesando recordatorio para ${data.numero}:`);
          console.log(`   Tipo: ${data.proximoSeguimientoTipo}`);
          console.log(`   Mensaje: ${data.proximoSeguimientoMensaje}`);
          console.log(`   Fecha programada: ${reminderDate.toLocaleString()}`);
          console.log(`   Cliente: ${data.clienteNombre || "Sin cliente"}`);

          // Enviar email
          try {
            const success = await RealEmailService.sendReminderEmail(
              "russofg@gmail.com", // Email del usuario
              data.numero,
              data.clienteNombre || "Cliente",
              data.proximoSeguimientoMensaje || "Recordatorio programado",
              reminderDate
            );

            if (success) {
              console.log("✅ Email enviado exitosamente");
              processedCount++;

              // Limpiar el recordatorio después de enviarlo
              await updateDoc(doc(db, "cotizaciones", docSnapshot.id), {
                proximoSeguimiento: null,
                proximoSeguimientoTipo: null,
                proximoSeguimientoMensaje: null,
                proximoSeguimientoEmail: false,
                proximoSeguimientoPush: false,
                proximoSeguimientoUsuario: null,
                updatedAt: new Date(),
              });

              console.log(
                `✅ Recordatorio procesado y limpiado para ${data.numero}`
              );
            } else {
              console.log("❌ Error enviando email");
            }
          } catch (emailError) {
            console.error("❌ Error enviando email:", emailError);
          }
        } else {
          console.log(
            `⏰ Recordatorio para ${data.numero} aún no es hora: ${reminderDate.toLocaleString()}`
          );
        }
      }
    }

    console.log(
      `🎉 Procesamiento completado. ${processedCount} recordatorios procesados.`
    );
  } catch (error) {
    console.error("❌ Error procesando recordatorios:", error);
  }
}

// Ejecutar el procesamiento
processScheduledReminders();
