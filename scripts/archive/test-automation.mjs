/**
 * Script de prueba para el servicio de automatización
 * NO afecta el sistema manual existente
 */
const {
  ReminderAutomationService,
} = require("./ReminderAutomationService.cjs");

console.log("🧪 Prueba del Servicio de Automatización");
console.log("=======================================");
console.log(
  "⚠️  Este script prueba la automatización SIN afectar el sistema manual"
);
console.log("");

// Mostrar estado inicial
console.log("📊 Estado inicial:", ReminderAutomationService.getStatus());

// Iniciar el servicio
console.log("\n🚀 Iniciando servicio de automatización...");
ReminderAutomationService.start();

// Mostrar estado después de iniciar
console.log(
  "\n📊 Estado después de iniciar:",
  ReminderAutomationService.getStatus()
);

// Simular ejecución por 2 minutos
console.log("\n⏰ Simulando ejecución por 2 minutos...");
console.log("💡 El servicio se ejecutará automáticamente cada minuto");
console.log("💡 Puedes ver los logs en tiempo real");
console.log("");

// Función para mostrar estado cada 30 segundos
let statusCount = 0;
const statusInterval = setInterval(() => {
  statusCount++;
  const status = ReminderAutomationService.getStatus();
  console.log(`📊 [${statusCount * 30}s] Estado:`, status);

  if (statusCount >= 4) {
    // 2 minutos
    console.log("\n🛑 Deteniendo servicio después de 2 minutos...");
    ReminderAutomationService.stop();
    console.log("✅ Prueba completada");
    console.log(
      "\n💡 Para usar en producción, inicia el servicio en tu servidor"
    );
    process.exit(0);
  }
}, 30000);

// Manejar Ctrl+C
process.on("SIGINT", () => {
  console.log("\n\n🛑 Deteniendo servicio...");
  ReminderAutomationService.stop();
  clearInterval(statusInterval);
  console.log("✅ Servicio detenido correctamente");
  process.exit(0);
});
