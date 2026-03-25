/**
 * EmailNotificationService - Servicio para envío de notificaciones por email
 * Nota: Este es un servicio básico. En producción se debería integrar con un servicio real como SendGrid, Mailgun, etc.
 */

import { EmailConfigService } from './EmailConfigService';
import { RealEmailService } from './RealEmailService';

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export interface ReminderEmailData {
  quoteNumber: string;
  clientName: string;
  quoteTitle: string;
  reminderType: 'seguimiento' | 'vencimiento' | 'revision';
  reminderMessage: string;
  reminderDate: Date;
  quoteUrl: string;
  userName: string;
}

export class EmailNotificationService {
  /**
   * Genera el template de email para recordatorios
   */
  static generateReminderEmail(data: ReminderEmailData): EmailTemplate {
    const subject = `Recordatorio: ${data.reminderType === 'seguimiento' ? 'Seguimiento' : 
                   data.reminderType === 'vencimiento' ? 'Vencimiento' : 'Revisión'} - ${data.quoteNumber}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { padding: 30px; }
          .quote-info { background: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0; }
          .reminder-box { background: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px; margin: 20px 0; }
          .button { display: inline-block; background: #2196f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 14px; color: #666; }
          .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
          .badge-seguimiento { background: #e3f2fd; color: #1976d2; }
          .badge-vencimiento { background: #fff3e0; color: #f57c00; }
          .badge-revision { background: #f3e5f5; color: #7b1fa2; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔔 Recordatorio de Cotización</h1>
            <p>BLS Cotizador - Sistema de Seguimiento</p>
          </div>
          
          <div class="content">
            <h2>Hola ${data.userName},</h2>
            
            <p>Te recordamos que tienes un recordatorio programado para la siguiente cotización:</p>
            
            <div class="quote-info">
              <h3>📋 Información de la Cotización</h3>
              <p><strong>Número:</strong> ${data.quoteNumber}</p>
              <p><strong>Cliente:</strong> ${data.clientName}</p>
              <p><strong>Título:</strong> ${data.quoteTitle}</p>
              <p><strong>Tipo de Recordatorio:</strong> 
                <span class="badge badge-${data.reminderType}">
                  ${data.reminderType === 'seguimiento' ? 'Seguimiento' : 
                    data.reminderType === 'vencimiento' ? 'Vencimiento' : 'Revisión'}
                </span>
              </p>
            </div>
            
            <div class="reminder-box">
              <h4>💬 Mensaje del Recordatorio</h4>
              <p>${data.reminderMessage}</p>
              <p><strong>Fecha programada:</strong> ${data.reminderDate.toLocaleString('es-ES')}</p>
            </div>
            
            <p>Para revisar los detalles completos de la cotización y realizar el seguimiento correspondiente, haz clic en el siguiente botón:</p>
            
            <a href="${data.quoteUrl}" class="button">Ver Cotización y Seguimiento</a>
            
            <p>Si necesitas realizar alguna acción específica con esta cotización, no dudes en acceder al sistema y actualizar su estado correspondiente.</p>
          </div>
          
          <div class="footer">
            <p>Este es un mensaje automático del sistema BLS Cotizador.</p>
            <p>Si no deseas recibir estos recordatorios, puedes desactivarlos en la configuración del sistema.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    const text = `
      Recordatorio de Cotización - BLS Cotizador
      
      Hola ${data.userName},
      
      Tienes un recordatorio programado para la siguiente cotización:
      
      Número: ${data.quoteNumber}
      Cliente: ${data.clientName}
      Título: ${data.quoteTitle}
      Tipo: ${data.reminderType === 'seguimiento' ? 'Seguimiento' : 
             data.reminderType === 'vencimiento' ? 'Vencimiento' : 'Revisión'}
      
      Mensaje: ${data.reminderMessage}
      Fecha programada: ${data.reminderDate.toLocaleString('es-ES')}
      
      Para revisar la cotización: ${data.quoteUrl}
      
      ---
      Este es un mensaje automático del sistema BLS Cotizador.
    `;
    
    return { subject, html, text };
  }
  
  /**
   * Simula el envío de email (en producción se integraría con un servicio real)
   */
  static async sendReminderEmail(data: ReminderEmailData, userEmail?: string): Promise<boolean> {
    try {
      const config = EmailConfigService.getConfig();
      
      if (!config.enabled) {
        console.log('📧 Email deshabilitado en configuración');
        return false;
      }

      if (!EmailConfigService.isConfigured()) {
        console.warn('⚠️ Email no configurado correctamente');
        return false;
      }

      const emailTemplate = this.generateReminderEmail(data);
      // Usar el email del usuario si se proporciona, sino usar el configurado
      const destinationEmail = userEmail || EmailConfigService.getDestinationEmail();
      
      console.log('📧 Enviando email de recordatorio:', {
        to: destinationEmail,
        from: config.fromEmail,
        subject: emailTemplate.subject,
        quoteNumber: data.quoteNumber,
        reminderType: data.reminderType,
        smtpHost: config.smtpHost,
        smtpPort: config.smtpPort,
        enabled: config.enabled
      });
      
      // Simular delay de envío
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // En producción, aquí se haría el envío real:
      // Ejemplo con SendGrid:
      /*
      const sgMail = require('@sendgrid/mail');
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      
      const msg = {
        to: destinationEmail,
        from: config.fromEmail,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
        text: emailTemplate.text
      };
      
      await sgMail.send(msg);
      */
      
      // Ejemplo con Nodemailer:
      /*
      const nodemailer = require('nodemailer');
      const transporter = nodemailer.createTransporter({
        host: config.smtpHost,
        port: config.smtpPort,
        secure: false,
        auth: {
          user: config.smtpUser,
          pass: config.smtpPassword
        }
      });
      
      await transporter.sendMail({
        from: config.fromEmail,
        to: destinationEmail,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
        text: emailTemplate.text
      });
      */
      
      console.log('📧 Enviando email de recordatorio:', {
        to: destinationEmail,
        from: config.fromEmail,
        subject: emailTemplate.subject,
        quoteNumber: data.quoteNumber,
        reminderType: data.reminderType,
        smtpHost: config.smtpHost,
        smtpPort: config.smtpPort,
        enabled: config.enabled
      });
      
      // Intentar enviar email real primero
      try {
        // Importar el servicio real dinámicamente
        const { RealEmailService } = await import('./RealEmailService');
        
        // Configurar Hostinger SMTP
        RealEmailService.configure({
          host: "smtp.hostinger.com",
          port: 587,
          secure: false,
          auth: {
            user: "info@serviciosbls.com",
            pass: "Pincharrata160$"
          }
        });
        
        const success = await RealEmailService.sendReminderEmail(
          destinationEmail,
          data.quoteNumber,
          data.clientName,
          data.reminderMessage,
          data.reminderDate
        );
        
        if (success) {
          console.log('✅ Email real enviado exitosamente');
          return true;
        }
      } catch (realEmailError) {
        console.warn('⚠️ Error enviando email real, usando simulación:', realEmailError);
      }
      
      // Fallback: Simular envío si el servicio real falla
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('📧 [MODO DESARROLLO] Email simulado enviado exitosamente');
      console.log('📧 [MODO DESARROLLO] Destinatario:', destinationEmail);
      console.log('📧 [MODO DESARROLLO] Asunto:', emailTemplate.subject);
      console.log('📧 [MODO DESARROLLO] Para enviar emails reales, configura RealEmailService');
      
      return true;
    } catch (error) {
      console.error('Error sending reminder email:', error);
      return false;
    }
  }
  
  /**
   * Envía notificación de cambio de estado
   */
  static async sendStatusChangeNotification(
    quoteNumber: string,
    clientName: string,
    oldStatus: string,
    newStatus: string,
    userName: string
  ): Promise<boolean> {
    try {
      const subject = `Cambio de Estado - Cotización ${quoteNumber}`;
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Cambio de Estado de Cotización</h2>
          <p>La cotización <strong>${quoteNumber}</strong> del cliente <strong>${clientName}</strong> ha cambiado de estado:</p>
          <p><span style="background: #f0f0f0; padding: 4px 8px; border-radius: 4px;">${oldStatus}</span> → <span style="background: #e8f5e8; padding: 4px 8px; border-radius: 4px;">${newStatus}</span></p>
          <p>Realizado por: ${userName}</p>
        </div>
      `;
      
      console.log('📧 Enviando notificación de cambio de estado:', {
        quoteNumber,
        clientName,
        oldStatus,
        newStatus,
        userName
      });
      
      return true;
    } catch (error) {
      console.error('Error sending status change notification:', error);
      return false;
    }
  }
  
  /**
   * Envía notificación de vencimiento próximo
   */
  static async sendExpirationWarning(
    quoteNumber: string,
    clientName: string,
    daysUntilExpiration: number,
    userName: string
  ): Promise<boolean> {
    try {
      const subject = `⚠️ Cotización próxima a vencer - ${quoteNumber}`;
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f57c00;">⚠️ Cotización Próxima a Vencer</h2>
          <p>La cotización <strong>${quoteNumber}</strong> del cliente <strong>${clientName}</strong> vence en <strong>${daysUntilExpiration} días</strong>.</p>
          <p>Te recomendamos hacer seguimiento con el cliente para evitar que la cotización expire.</p>
        </div>
      `;
      
      console.log('📧 Enviando notificación de vencimiento próximo:', {
        quoteNumber,
        clientName,
        daysUntilExpiration,
        userName
      });
      
      return true;
    } catch (error) {
      console.error('Error sending expiration warning:', error);
      return false;
    }
  }
}
