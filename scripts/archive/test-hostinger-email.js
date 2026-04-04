const { RealEmailService } = require("./RealEmailService.js");

console.log("📧 Prueba de Email con Hostinger");
console.log("================================");

function getRequiredEnv(name) {
  const value = process.env[name] && process.env[name].trim();

  if (!value) {
    throw new Error(`Missing required SMTP env: ${name}`);
  }

  return value;
}

function getSmtpConfig() {
  const port = Number(process.env.SMTP_PORT || 587);

  if (!Number.isInteger(port) || port <= 0) {
    throw new Error("Invalid SMTP_PORT. Expected a positive integer.");
  }

  const secureRaw =
    process.env.SMTP_SECURE && process.env.SMTP_SECURE.trim().toLowerCase();
  let secure;

  if (!secureRaw) {
    secure = port === 465;
  } else if (["1", "true", "yes", "on"].includes(secureRaw)) {
    secure = true;
  } else if (["0", "false", "no", "off"].includes(secureRaw)) {
    secure = false;
  } else {
    throw new Error("Invalid SMTP_SECURE. Expected true/false.");
  }

  return {
    host: getRequiredEnv("SMTP_HOST"),
    port,
    secure,
    auth: {
      user: getRequiredEnv("SMTP_USER"),
      pass: getRequiredEnv("SMTP_PASSWORD"),
    },
  };
}

const smtpConfig = getSmtpConfig();
const email = process.env.SMTP_TEST_RECIPIENT || smtpConfig.auth.user;

console.log("🔧 Configurando Hostinger SMTP...");
console.log("📧 Destinatario de prueba:", email);
console.log("🔑 Host:", smtpConfig.host);
console.log("🔌 Puerto:", String(smtpConfig.port));

RealEmailService.configure(smtpConfig);

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
    console.log("   - host:", smtpConfig.host);
    console.log("   - port: 465");
    console.log("   - secure: true");
  }
});
