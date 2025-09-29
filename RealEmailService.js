const nodemailer = require("nodemailer");

class RealEmailService {
  static transporter = null;

  /**
   * Configurar el transporter de Nodemailer
   */
  static configure(config) {
    this.transporter = nodemailer.createTransporter({
      host: config.host,
      port: config.port,
      secure: config.secure, // true para puerto 465, false para otros puertos
      auth: {
        user: config.auth.user,
        pass: config.auth.pass,
      },
    });

    console.log("📧 Email service configured with:", {
      host: config.host,
      port: config.port,
      user: config.auth.user,
    });
  }

  /**
   * Configurar con Gmail (más fácil)
   */
  static configureGmail(email, appPassword) {
    this.transporter = nodemailer.createTransporter({
      service: "gmail",
      auth: {
        user: email,
        pass: appPassword, // App Password de Gmail, no la contraseña normal
      },
    });

    console.log("📧 Gmail service configured for:", email);
  }

  /**
   * Enviar email real
   */
  static async sendEmail(emailData) {
    if (!this.transporter) {
      console.error("❌ Email service not configured");
      return false;
    }

    try {
      console.log("📧 Sending real email to:", emailData.to);

      const info = await this.transporter.sendMail({
        from: this.transporter.options.auth?.user,
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text,
      });

      console.log("✅ Email sent successfully:", info.messageId);
      return true;
    } catch (error) {
      console.error("❌ Error sending email:", error);
      return false;
    }
  }

  /**
   * Verificar configuración
   */
  static async verifyConnection() {
    if (!this.transporter) {
      console.error("❌ Email service not configured");
      return false;
    }

    try {
      await this.transporter.verify();
      console.log("✅ Email service connection verified");
      return true;
    } catch (error) {
      console.error("❌ Email service connection failed:", error);
      return false;
    }
  }

  /**
   * Enviar email de recordatorio
   */
  static async sendReminderEmail(
    to,
    quoteNumber,
    clientName,
    reminderMessage,
    reminderDate
  ) {
    const subject = `Recordatorio: Seguimiento - ${quoteNumber}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Recordatorio de Cotización</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { padding: 30px; }
          .quote-info { background: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0; }
          .reminder-box { background: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px; margin: 20px 0; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 14px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔔 Recordatorio de Cotización</h1>
            <p>BLS Cotizador - Sistema de Seguimiento</p>
          </div>
          
          <div class="content">
            <h2>Hola,</h2>
            
            <p>Te recordamos que tienes un recordatorio programado para la siguiente cotización:</p>
            
            <div class="quote-info">
              <h3>📋 Información de la Cotización</h3>
              <p><strong>Número:</strong> ${quoteNumber}</p>
              <p><strong>Cliente:</strong> ${clientName}</p>
              <p><strong>Tipo:</strong> Seguimiento</p>
            </div>
            
            <div class="reminder-box">
              <h4>💬 Mensaje del Recordatorio</h4>
              <p>${reminderMessage}</p>
              <p><strong>Fecha programada:</strong> ${reminderDate.toLocaleString("es-ES")}</p>
            </div>
            
            <p>Por favor, revisa el estado de esta cotización y realiza el seguimiento correspondiente.</p>
          </div>
          
          <div class="footer">
            <p>Este es un mensaje automático del sistema BLS Cotizador.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Recordatorio de Cotización - BLS Cotizador
      
      Tienes un recordatorio programado para la siguiente cotización:
      
      Número: ${quoteNumber}
      Cliente: ${clientName}
      Tipo: Seguimiento
      
      Mensaje: ${reminderMessage}
      Fecha programada: ${reminderDate.toLocaleString("es-ES")}
      
      Por favor, revisa el estado de esta cotización y realiza el seguimiento correspondiente.
      
      ---
      Este es un mensaje automático del sistema BLS Cotizador.
    `;

    return await this.sendEmail({
      to,
      subject,
      html,
      text,
    });
  }
}

module.exports = { RealEmailService };
