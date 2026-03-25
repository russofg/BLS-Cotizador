#!/usr/bin/env node

/**
 * Script de inicio del servidor con automatización
 * Inicia tanto el servidor de desarrollo como el servicio de recordatorios
 */

const { spawn } = require('child_process');
const { ReminderAutomationService } = require('./ReminderAutomationService.cjs');

console.log("🚀 Iniciando Servidor BLS Cotizador con Automatización");
console.log("=====================================================");

// Iniciar el servicio de automatización
console.log("📧 Iniciando servicio de automatización de recordatorios...");
ReminderAutomationService.start();

// Iniciar el servidor de desarrollo
console.log("🌐 Iniciando servidor de desarrollo...");
const devServer = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true
});

// Manejar cierre del servidor
devServer.on('close', (code) => {
  console.log(`\n🛑 Servidor de desarrollo cerrado con código ${code}`);
  console.log("🛑 Deteniendo servicio de automatización...");
  ReminderAutomationService.stop();
  process.exit(code);
});

// Manejar errores del servidor
devServer.on('error', (error) => {
  console.error("❌ Error iniciando servidor:", error);
  console.log("🛑 Deteniendo servicio de automatización...");
  ReminderAutomationService.stop();
  process.exit(1);
});

// Manejar Ctrl+C
process.on('SIGINT', () => {
  console.log("\n\n🛑 Cerrando servidor...");
  devServer.kill('SIGINT');
  ReminderAutomationService.stop();
  process.exit(0);
});

// Mostrar estado cada 5 minutos
setInterval(() => {
  const status = ReminderAutomationService.getStatus();
  console.log(`\n📊 [${new Date().toLocaleTimeString()}] Estado de automatización:`, status);
}, 300000); // 5 minutos

console.log("✅ Servidor iniciado correctamente");
console.log("💡 El servicio de recordatorios se ejecutará automáticamente cada minuto");
console.log("💡 Presiona Ctrl+C para detener todo");
