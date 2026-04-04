/**
 * Servicio de automatización para procesar recordatorios.
 * El runtime real debe invocarlo una vez por ejecución (por ejemplo, desde Netlify Scheduled Functions).
 */
import { getAdminDb } from "../utils/firebaseAdmin";
import { QuoteHelper } from "../utils/quoteHelpers";
import { RealEmailService } from "./RealEmailService";
import { UserManagementService } from "./UserManagementService";
import {
  SmtpConfigError,
  getSmtpRuntimeConfig,
  getSmtpRuntimeLogContext,
} from "./SmtpRuntimeConfig";

// Configurar email service una sola vez
let emailServiceConfigured = false;

const REMINDER_COLLECTION = "cotizaciones";
const REMINDER_CLEAR_PAYLOAD = {
  proximoSeguimiento: null,
  proximoSeguimientoTipo: null,
  proximoSeguimientoMensaje: null,
  proximoSeguimientoEmail: false,
  proximoSeguimientoPush: false,
  proximoSeguimientoUsuario: null,
  proximoSeguimientoDestinatarios: null,
};

function configureEmailService() {
  if (!emailServiceConfigured) {
    RealEmailService.configure(getSmtpRuntimeConfig());
    emailServiceConfigured = true;
    console.log(
      "📧 Email service configurado para automatización",
      getSmtpRuntimeLogContext(),
    );
  }

  return true;
}

function isSmtpConfigError(error: unknown): error is SmtpConfigError {
  return error instanceof SmtpConfigError;
}

function normalizeReminderDate(value: unknown): Date | null {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === "object") {
    const firestoreDate = value as {
      toDate?: () => Date;
      seconds?: number;
      _seconds?: number;
    };

    if (typeof firestoreDate.toDate === "function") {
      const resolvedDate = firestoreDate.toDate();
      return Number.isNaN(resolvedDate.getTime()) ? null : resolvedDate;
    }

    const seconds = firestoreDate.seconds ?? firestoreDate._seconds;
    if (typeof seconds === "number") {
      const resolvedDate = new Date(seconds * 1000);
      return Number.isNaN(resolvedDate.getTime()) ? null : resolvedDate;
    }
  }

  if (typeof value === "number" || typeof value === "string") {
    const resolvedDate = new Date(value);
    return Number.isNaN(resolvedDate.getTime()) ? null : resolvedDate;
  }

  return null;
}

function normalizeRecipients(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const uniqueEmails = new Set<string>();

  for (const recipient of value) {
    if (typeof recipient !== "string") {
      continue;
    }

    const normalized = recipient.trim().toLowerCase();
    if (!normalized) {
      continue;
    }

    uniqueEmails.add(normalized);
  }

  return [...uniqueEmails];
}

async function resolveReminderRecipients(data: Record<string, any>): Promise<{
  recipients: string[];
  source: "stored" | "fallback-active-users" | "none";
}> {
  const storedRecipients = normalizeRecipients(
    data.proximoSeguimientoDestinatarios,
  );

  if (storedRecipients.length > 0) {
    return {
      recipients: storedRecipients,
      source: "stored",
    };
  }

  const notificationUsers =
    await UserManagementService.getEmailNotificationUsers();
  const fallbackRecipients = normalizeRecipients(
    notificationUsers.map((user) => user.email),
  );

  if (fallbackRecipients.length > 0) {
    return {
      recipients: fallbackRecipients,
      source: "fallback-active-users",
    };
  }

  return {
    recipients: [],
    source: "none",
  };
}

async function resolveClientDisplayName(
  adminDb: ReturnType<typeof getAdminDb>,
  data: Record<string, any>,
): Promise<string> {
  if (typeof data.clienteNombre === "string" && data.clienteNombre.trim()) {
    return data.clienteNombre.trim();
  }

  const clientId = data.clienteId || data.cliente_id;
  if (!clientId) {
    return "Cliente";
  }

  try {
    const clientDoc = await adminDb
      .collection("clientes")
      .doc(String(clientId))
      .get();
    if (!clientDoc.exists) {
      return "Cliente";
    }

    const clientData = clientDoc.data() || {};
    if (typeof clientData.nombre === "string" && clientData.nombre.trim()) {
      return clientData.nombre.trim();
    }
  } catch (error) {
    console.warn("⚠️ [AUTO] No se pudo resolver el nombre del cliente:", error);
  }

  return "Cliente";
}

export interface ReminderProcessingSummary {
  status: "processed" | "skipped" | "error";
  checkedCount: number;
  dueCount: number;
  processedCount: number;
  skippedCount: number;
  failedCount: number;
  startedAt: string;
  finishedAt: string;
  reason?: string;
  smtp?: ReturnType<typeof getSmtpRuntimeLogContext>;
}

export class ReminderAutomationService {
  /**
   * Procesa recordatorios vencidos una sola vez.
   * Diseñado para invocaciones puntuales desde runtimes serverless.
   */
  static async processDueRemindersOnce(
    now: Date = new Date(),
  ): Promise<ReminderProcessingSummary> {
    const startTime = new Date();
    console.log(
      `\n🔍 [${startTime.toLocaleTimeString()}] Procesando recordatorios programados...`,
    );

    try {
      configureEmailService();
    } catch (error) {
      if (isSmtpConfigError(error)) {
        const smtp = getSmtpRuntimeLogContext();
        console.warn(
          "⚠️ Procesamiento detenido por configuración SMTP inválida.",
          {
            missingKeys: error.missingKeys,
            invalidKeys: error.invalidKeys,
            smtp,
          },
        );

        return {
          status: "skipped",
          checkedCount: 0,
          dueCount: 0,
          processedCount: 0,
          skippedCount: 0,
          failedCount: 0,
          startedAt: startTime.toISOString(),
          finishedAt: new Date().toISOString(),
          reason: "smtp_not_configured",
          smtp,
        };
      }

      throw error;
    }

    try {
      const adminDb = getAdminDb();
      const snapshot = await adminDb
        .collection(REMINDER_COLLECTION)
        .where("proximoSeguimientoEmail", "==", true)
        .get();

      let dueCount = 0;
      let processedCount = 0;
      let checkedCount = 0;
      let skippedCount = 0;
      let failedCount = 0;

      for (const docSnapshot of snapshot.docs) {
        const data = docSnapshot.data() || {};
        const reminderDate = normalizeReminderDate(data.proximoSeguimiento);
        const quoteNumber = QuoteHelper.getDisplayQuoteNumber({
          id: docSnapshot.id,
          ...data,
        });

        if (!reminderDate) {
          console.warn(
            `⚠️ [AUTO] Recordatorio inválido en ${docSnapshot.id}; se mantiene pendiente.`,
          );
          skippedCount++;
          continue;
        }

        checkedCount++;

        if (reminderDate > now) {
          continue;
        }

        dueCount++;
        console.log(`📅 [AUTO] Procesando recordatorio para ${quoteNumber}:`);
        console.log(`   Tipo: ${data.proximoSeguimientoTipo}`);
        console.log(`   Mensaje: ${data.proximoSeguimientoMensaje}`);
        console.log(`   Fecha programada: ${reminderDate.toLocaleString()}`);
        const clientDisplayName = await resolveClientDisplayName(adminDb, data);
        console.log(`   Cliente: ${clientDisplayName}`);

        try {
          const { recipients, source } = await resolveReminderRecipients(data);

          if (recipients.length === 0) {
            skippedCount++;
            console.warn(
              `⚠️ [AUTO] Sin destinatarios para ${quoteNumber}. Se mantiene pendiente.`,
            );
            continue;
          }

          console.log(
            `📧 [AUTO] Enviando a ${recipients.length} destinatario(s) [${source}]:`,
            recipients,
          );

          let sentEmails = 0;

          for (const recipient of recipients) {
            try {
              const success = await RealEmailService.sendReminderEmail(
                recipient,
                quoteNumber,
                clientDisplayName,
                data.proximoSeguimientoMensaje || "Recordatorio programado",
                reminderDate,
              );

              if (success) {
                sentEmails++;
                console.log(`✅ [AUTO] Email enviado a: ${recipient}`);
              } else {
                console.warn(`❌ [AUTO] Falló el envío a: ${recipient}`);
              }
            } catch (emailError) {
              console.error(
                `❌ [AUTO] Error enviando a ${recipient}:`,
                emailError,
              );
            }
          }

          if (sentEmails > 0) {
            processedCount++;
            await adminDb
              .collection(REMINDER_COLLECTION)
              .doc(docSnapshot.id)
              .update({
                ...REMINDER_CLEAR_PAYLOAD,
                updatedAt: new Date(),
              });

            console.log(
              `✅ [AUTO] Recordatorio procesado y limpiado para ${quoteNumber}`,
            );
            continue;
          }

          failedCount++;
          console.warn(
            `⚠️ [AUTO] No se pudo enviar ningún email para ${quoteNumber}. Se mantiene pendiente.`,
          );
        } catch (emailError) {
          failedCount++;
          console.error(
            "❌ [AUTO] Error procesando emails del recordatorio:",
            emailError,
          );
        }
      }

      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();

      console.log(`🎉 [AUTO] Procesamiento completado en ${duration}ms`);
      console.log(`   📊 Cotizaciones verificadas: ${checkedCount}`);
      console.log(`   🕒 Recordatorios vencidos: ${dueCount}`);
      console.log(`   📧 Recordatorios procesados: ${processedCount}`);
      console.log(`   ⏭️ Recordatorios omitidos: ${skippedCount}`);
      console.log(`   ❌ Recordatorios fallidos: ${failedCount}`);

      return {
        status: "processed",
        checkedCount,
        dueCount,
        processedCount,
        skippedCount,
        failedCount,
        startedAt: startTime.toISOString(),
        finishedAt: endTime.toISOString(),
      };
    } catch (error) {
      console.error("❌ [AUTO] Error procesando recordatorios:", error);

      return {
        status: "error",
        checkedCount: 0,
        dueCount: 0,
        processedCount: 0,
        skippedCount: 0,
        failedCount: 0,
        startedAt: startTime.toISOString(),
        finishedAt: new Date().toISOString(),
        reason: error instanceof Error ? error.message : "unexpected_error",
      };
    }
  }
}
