const { RealEmailService } = require("./RealEmailService.js");

console.log("📧 Prueba de Email con Hostinger");
console.log("================================");

// Configuración para Hostinger
const email = "info@serviciosbls.com";
const password = "Pincharrata160$"; // Tu contraseña real

console.log("🔧 Configurando Hostinger SMTP...");
console.log("📧 Email:", email);
console.log("🔑 Host:", "smtp.hostinger.com");
console.log("🔌 Puerto:", "587");

RealEmailService.configure({
  host: "smtp.hostinger.com",
  port: 587,
  secure: false, // TLS
  auth: {
    user: email,
    pass: password,
  },
});

console.log("🔍 Verificando conexión...");
RealEmailService.verifyConnection().then((success) => {
  if (success) {
    console.log("✅ ¡Conexión exitosa!");
    console.log("📧 Ahora puedes enviar emails reales");

    // Probar envío de email
    console.log("📤 Enviando email de prueba...");
    RealEmailService.sendReminderEmail(
      email, // Enviar a ti mismo
      "COT-TEST-001",
      "Cliente de Prueba",
      "Este es un email de prueba del sistema BLS Cotizador usando Hostinger SMTP",
      new Date()
    ).then((sent) => {
      if (sent) {
        console.log("✅ Email de prueba enviado exitosamente");
        console.log("📧 Revisa tu bandeja de entrada en", email);
        console.log("📧 También revisa la carpeta de spam");
      } else {
        console.log("❌ Error enviando email de prueba");
      }
    });
  } else {
    console.log("❌ Error en la conexión");
    console.log("💡 Verifica:");
    console.log("   - Tu contraseña del email");
    console.log("   - Que el email esté activo");
    console.log("   - La configuración SMTP de Hostinger");
    console.log("");
    console.log("🔧 Configuraciones alternativas a probar:");
    console.log("   Puerto 465 con SSL:");
    console.log("   - host: smtp.hostinger.com");
    console.log("   - port: 465");
    console.log("   - secure: true");
  }
});
