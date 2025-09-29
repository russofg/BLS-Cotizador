/**
 * Servicio de automatización para procesar recordatorios
 * Se ejecuta automáticamente cada minuto
 */
const { initializeApp } = require("firebase/app");
const {
  getFirestore,
  collection,
  getDocs,
  updateDoc,
  doc,
} = require("firebase/firestore");
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

// Configurar email service una sola vez
let emailServiceConfigured = false;

function configureEmailService() {
  if (!emailServiceConfigured) {
    RealEmailService.configure({
      host: "smtp.hostinger.com",
      port: 587,
      secure: false,
      auth: {
        user: "info@serviciosbls.com",
        pass: "Pincharrata160$",
      },
    });
    emailServiceConfigured = true;
    console.log("📧 Email service configurado para automatización");
  }
}

class ReminderAutomationService {
  static isRunning = false;
  static intervalId = null;

  /**
   * Inicia el servicio de automatización
   * Se ejecuta cada minuto
   */
  static start() {
    if (this.isRunning) {
      console.log("⚠️ Servicio de automatización ya está ejecutándose");
      return;
    }

    console.log("🚀 Iniciando servicio de automatización de recordatorios...");
    console.log("⏰ Se ejecutará cada minuto");

    configureEmailService();

    // Ejecutar inmediatamente la primera vez
    this.processReminders();

    // Luego ejecutar cada minuto
    this.intervalId = setInterval(() => {
      this.processReminders();
    }, 60000); // 60 segundos

    this.isRunning = true;
    console.log("✅ Servicio de automatización iniciado correctamente");
  }

  /**
   * Detiene el servicio de automatización
   */
  static stop() {
    if (!this.isRunning) {
      console.log("⚠️ Servicio de automatización no está ejecutándose");
      return;
    }

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.isRunning = false;
    console.log("🛑 Servicio de automatización detenido");
  }

  /**
   * Procesa los recordatorios pendientes
   * Esta es la función principal que se ejecuta cada minuto
   */
  static async processReminders() {
    const startTime = new Date();
    console.log(
      `\n🔍 [${startTime.toLocaleTimeString()}] Procesando recordatorios automáticamente...`
    );

    try {
      const cotizacionesRef = collection(db, "cotizaciones");
      const snapshot = await getDocs(cotizacionesRef);

      let processedCount = 0;
      let checkedCount = 0;
      const now = new Date();

      for (const docSnapshot of snapshot.docs) {
        const data = docSnapshot.data();

        // Verificar si hay un recordatorio programado
        if (data.proximoSeguimiento && data.proximoSeguimientoEmail) {
          checkedCount++;
          const reminderDate = new Date(data.proximoSeguimiento.seconds * 1000);

          // Si es hora de ejecutar el recordatorio
          if (reminderDate <= now) {
            console.log(
              `📅 [AUTO] Procesando recordatorio para ${data.numero}:`
            );
            console.log(`   Tipo: ${data.proximoSeguimientoTipo}`);
            console.log(`   Mensaje: ${data.proximoSeguimientoMensaje}`);
            console.log(
              `   Fecha programada: ${reminderDate.toLocaleString()}`
            );
            console.log(`   Cliente: ${data.clienteNombre || "Sin cliente"}`);

            // Enviar email a múltiples destinatarios
            try {
              // Usar destinatarios específicos si están configurados, sino usar todos los usuarios
              let destinatarios = [];

              if (
                data.proximoSeguimientoDestinatarios &&
                data.proximoSeguimientoDestinatarios.length > 0
              ) {
                // Usar destinatarios específicos del recordatorio
                destinatarios = data.proximoSeguimientoDestinatarios;
                console.log(
                  `📧 [AUTO] Usando destinatarios específicos del recordatorio:`,
                  destinatarios
                );
              } else {
                // Fallback: usar todos los usuarios disponibles
                const usuariosNotificacion =
                  await UserManagementService.getEmailNotificationUsers();
                destinatarios =
                  usuariosNotificacion.length > 0
                    ? usuariosNotificacion.map((u) => u.email)
                    : ["russofg@gmail.com"];
                console.log(
                  `📧 [AUTO] Usando todos los usuarios disponibles:`,
                  destinatarios
                );
              }

              console.log(
                `📧 [AUTO] Enviando a ${destinatarios.length} destinatario(s):`,
                destinatarios
              );

              let emailsEnviados = 0;
              let emailsFallidos = 0;

              // Enviar email a cada destinatario
              for (const emailDestinatario of destinatarios) {
                try {
                  const success = await RealEmailService.sendReminderEmail(
                    emailDestinatario,
                    data.numero,
                    data.clienteNombre || "Cliente",
                    data.proximoSeguimientoMensaje || "Recordatorio programado",
                    reminderDate
                  );

                  if (success) {
                    emailsEnviados++;
                    console.log(
                      `✅ [AUTO] Email enviado a: ${emailDestinatario}`
                    );
                  } else {
                    emailsFallidos++;
                    console.log(
                      `❌ [AUTO] Error enviando a: ${emailDestinatario}`
                    );
                  }
                } catch (emailError) {
                  emailsFallidos++;
                  console.error(
                    `❌ [AUTO] Error enviando a ${emailDestinatario}:`,
                    emailError
                  );
                }
              }

              console.log(
                `📊 [AUTO] Resumen: ${emailsEnviados} enviados, ${emailsFallidos} fallidos`
              );

              // Solo limpiar el recordatorio si al menos un email se envió exitosamente
              if (emailsEnviados > 0) {
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
                  `✅ [AUTO] Recordatorio procesado y limpiado para ${data.numero}`
                );
              } else {
                console.log(
                  "❌ [AUTO] No se pudo enviar ningún email, recordatorio mantenido"
                );
              }
            } catch (emailError) {
              console.error("❌ [AUTO] Error procesando emails:", emailError);
            }
          } else {
            // Solo mostrar este log cada 5 minutos para no saturar
            const minutesDiff = Math.floor(
              (reminderDate.getTime() - now.getTime()) / (1000 * 60)
            );
            if (minutesDiff <= 5) {
              console.log(
                `⏰ [AUTO] Recordatorio para ${data.numero} en ${minutesDiff} minutos`
              );
            }
          }
        }
      }

      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();

      console.log(`🎉 [AUTO] Procesamiento completado en ${duration}ms`);
      console.log(`   📊 Cotizaciones verificadas: ${checkedCount}`);
      console.log(`   📧 Recordatorios procesados: ${processedCount}`);
      console.log(
        `   ⏰ Próxima ejecución: ${new Date(Date.now() + 60000).toLocaleTimeString()}`
      );
    } catch (error) {
      console.error("❌ [AUTO] Error procesando recordatorios:", error);
    }
  }

  /**
   * Obtiene el estado del servicio
   */
  static getStatus() {
    return {
      isRunning: this.isRunning,
      nextExecution: this.isRunning
        ? new Date(Date.now() + 60000).toLocaleTimeString()
        : null,
    };
  }
}

module.exports = { ReminderAutomationService };
