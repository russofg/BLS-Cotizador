/**
 * Script de prueba para múltiples destinatarios
 * NO afecta el sistema existente
 */
const {
  ReminderAutomationService,
} = require("./ReminderAutomationService.cjs");
const { UserManagementService } = require("./UserManagementService.cjs");

console.log("🧪 Prueba de Múltiples Destinatarios");
console.log("====================================");
console.log(
  "⚠️  Este script prueba el sistema SIN afectar el sistema existente"
);
console.log("");

async function testMultipleRecipients() {
  try {
    // Mostrar usuarios disponibles
    console.log("👥 Usuarios disponibles para notificaciones:");
    const usuarios = await UserManagementService.getEmailNotificationUsers();

    if (usuarios.length === 0) {
      console.log("❌ No hay usuarios configurados");
      console.log("💡 Ejecuta: node setup-test-users.cjs");
      return;
    }

    usuarios.forEach((usuario, index) => {
      console.log(`   ${index + 1}. ${usuario.nombre} (${usuario.email})`);
      console.log(
        `      Rol: ${usuario.rol} | Departamento: ${usuario.departamento}`
      );
    });

    console.log(`\n📊 Total usuarios: ${usuarios.length}`);
    console.log(
      `📧 Emails que recibirán notificaciones: ${usuarios.map((u) => u.email).join(", ")}`
    );

    // Iniciar el servicio de automatización por 1 minuto
    console.log("\n🚀 Iniciando servicio de automatización por 1 minuto...");
    ReminderAutomationService.start();

    // Esperar 1 minuto
    console.log("⏰ Esperando 1 minuto para ver la ejecución automática...");

    setTimeout(() => {
      console.log("\n🛑 Deteniendo servicio después de 1 minuto...");
      ReminderAutomationService.stop();
      console.log("✅ Prueba completada");
      console.log(
        "\n💡 Si hay recordatorios pendientes, se habrán enviado a todos los usuarios"
      );
      process.exit(0);
    }, 60000);
  } catch (error) {
    console.error("❌ Error en la prueba:", error);
  }
}

// Manejar Ctrl+C
process.on("SIGINT", () => {
  console.log("\n\n🛑 Deteniendo servicio...");
  ReminderAutomationService.stop();
  console.log("✅ Servicio detenido correctamente");
  process.exit(0);
});

testMultipleRecipients();
