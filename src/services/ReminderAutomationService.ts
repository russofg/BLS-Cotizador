/**
 * Servicio de automatización para procesar recordatorios
 * Se ejecuta automáticamente cada minuto
 */
import { adminDb } from '../utils/firebaseAdmin';
import { RealEmailService } from "./RealEmailService";
import {
  SmtpConfigError,
  getSmtpRuntimeConfig,
  getSmtpRuntimeLogContext,
} from "./SmtpRuntimeConfig";

// Configurar email service una sola vez
let emailServiceConfigured = false;

function configureEmailService() {
  if (!emailServiceConfigured) {
    RealEmailService.configure(getSmtpRuntimeConfig());
    emailServiceConfigured = true;
    console.log("📧 Email service configurado para automatización", getSmtpRuntimeLogContext());
  }

  return true;
}

function isSmtpConfigError(error: unknown): error is SmtpConfigError {
  return error instanceof SmtpConfigError;
}

export class ReminderAutomationService {
  private static isRunning = false;
  private static intervalId: NodeJS.Timeout | null = null;

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
    
    try {
      configureEmailService();
    } catch (error) {
      if (isSmtpConfigError(error)) {
        console.warn("⚠️ SMTP no configurado para automatización. Servicio no iniciado.", {
          missingKeys: error.missingKeys,
          invalidKeys: error.invalidKeys,
          smtp: getSmtpRuntimeLogContext(),
        });
        return;
      }

      throw error;
    }
    
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
  private static async processReminders() {
    const startTime = new Date();
    console.log(`\n🔍 [${startTime.toLocaleTimeString()}] Procesando recordatorios automáticamente...`);

    try {
      configureEmailService();
      const snapshot = await adminDb.collection("cotizaciones").get();

      let processedCount = 0;
      let checkedCount = 0;
      const now = new Date();

      for (const docSnapshot of snapshot.docs) {
        const data = docSnapshot.data() || {};

        // Verificar si hay un recordatorio programado
        if (data.proximoSeguimiento && data.proximoSeguimientoEmail) {
          checkedCount++;
          const reminderDate = new Date(data.proximoSeguimiento.seconds * 1000);

          // Si es hora de ejecutar el recordatorio
          if (reminderDate <= now) {
            console.log(`📅 [AUTO] Procesando recordatorio para ${data.numero}:`);
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
                console.log("✅ [AUTO] Email enviado exitosamente");
                processedCount++;

                // Limpiar el recordatorio después de enviarlo
                await adminDb.collection("cotizaciones").doc(docSnapshot.id).update({
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
                console.log("❌ [AUTO] Error enviando email");
              }
            } catch (emailError) {
              console.error("❌ [AUTO] Error enviando email:", emailError);
            }
          } else {
            // Solo mostrar este log cada 5 minutos para no saturar
            const minutesDiff = Math.floor((reminderDate.getTime() - now.getTime()) / (1000 * 60));
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
      console.log(`   ⏰ Próxima ejecución: ${new Date(Date.now() + 60000).toLocaleTimeString()}`);

    } catch (error) {
      if (isSmtpConfigError(error)) {
        console.warn("⚠️ Procesamiento detenido por configuración SMTP inválida.", {
          missingKeys: error.missingKeys,
          invalidKeys: error.invalidKeys,
          smtp: getSmtpRuntimeLogContext(),
        });
        return;
      }

      console.error("❌ [AUTO] Error procesando recordatorios:", error);
    }
  }

  /**
   * Obtiene el estado del servicio
   */
  static getStatus() {
    return {
      isRunning: this.isRunning,
      nextExecution: this.isRunning ? new Date(Date.now() + 60000).toLocaleTimeString() : null
    };
  }
}
