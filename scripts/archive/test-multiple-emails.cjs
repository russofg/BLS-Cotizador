/**
 * Script para crear un recordatorio de prueba y ejecutarlo inmediatamente
 */
const { initializeApp } = require("firebase/app");
const { getFirestore, collection, doc, setDoc } = require("firebase/firestore");
const { RealEmailService } = require("./RealEmailService.cjs");
const { UserManagementService } = require("./UserManagementService.cjs");

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

async function createAndTestReminder() {
  console.log("📅 Creando recordatorio de prueba...");

  try {
    // Crear recordatorio para AHORA (para probar inmediatamente)
    const ahora = new Date();

    const cotizacionRef = doc(db, "cotizaciones", "Qwg51VUooFHQ7yTbm7cr");
    await setDoc(
      cotizacionRef,
      {
        proximoSeguimiento: {
          seconds: Math.floor(ahora.getTime() / 1000),
          nanoseconds: 0,
        },
        proximoSeguimientoTipo: "seguimiento",
        proximoSeguimientoMensaje:
          "PRUEBA DE MÚLTIPLES DESTINATARIOS - Sistema funcionando correctamente",
        proximoSeguimientoEmail: true,
        proximoSeguimientoPush: true,
        proximoSeguimientoUsuario: "Sistema de Prueba",
        updatedAt: ahora,
      },
      { merge: true }
    );

    console.log(`✅ Recordatorio creado para: ${ahora.toLocaleString()}`);

    // Obtener usuarios para notificaciones
    console.log("\n👥 Obteniendo usuarios para notificaciones...");
    const usuariosNotificacion =
      await UserManagementService.getEmailNotificationUsers();

    if (usuariosNotificacion.length === 0) {
      console.log("❌ No hay usuarios configurados");
      return;
    }

    console.log(
      `📧 Enviando a ${usuariosNotificacion.length} destinatario(s):`
    );
    usuariosNotificacion.forEach((usuario, index) => {
      console.log(`   ${index + 1}. ${usuario.nombre} (${usuario.email})`);
    });

    // Enviar emails a todos los usuarios
    let emailsEnviados = 0;
    let emailsFallidos = 0;

    for (const usuario of usuariosNotificacion) {
      try {
        console.log(`\n📤 Enviando email a: ${usuario.email}`);

        const success = await RealEmailService.sendReminderEmail(
          usuario.email,
          "COT-1759102172719",
          "Candela",
          "PRUEBA DE MÚLTIPLES DESTINATARIOS - Sistema funcionando correctamente",
          ahora
        );

        if (success) {
          emailsEnviados++;
          console.log(`✅ Email enviado exitosamente a: ${usuario.email}`);
        } else {
          emailsFallidos++;
          console.log(`❌ Error enviando email a: ${usuario.email}`);
        }
      } catch (error) {
        emailsFallidos++;
        console.error(`❌ Error enviando email a ${usuario.email}:`, error);
      }
    }

    console.log(`\n📊 Resumen final:`);
    console.log(`   ✅ Emails enviados: ${emailsEnviados}`);
    console.log(`   ❌ Emails fallidos: ${emailsFallidos}`);
    console.log(`   📧 Total destinatarios: ${usuariosNotificacion.length}`);

    if (emailsEnviados > 0) {
      console.log(
        "\n🎉 ¡SISTEMA DE MÚLTIPLES DESTINATARIOS FUNCIONANDO CORRECTAMENTE!"
      );
      console.log("📧 Revisa las bandejas de entrada de todos los usuarios");
    } else {
      console.log("\n❌ No se pudo enviar ningún email");
    }
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

createAndTestReminder();
