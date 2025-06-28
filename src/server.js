import app from './app.js';
import { serverConfig } from './config/bedrock.js';

const PORT = serverConfig.port;

// Gestione graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM ricevuto, chiusura server...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT ricevuto, chiusura server...');
  process.exit(0);
});

// Avvio server
const server = app.listen(PORT, () => {
  console.log('');
  console.log('🚀 ================================');
  console.log('🏝️  TremitiBot Bedrock AVVIATO');
  console.log('🚀 ================================');
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log(`💬 Chat API: http://localhost:${PORT}/api/chat`);
  console.log(`📊 Health: http://localhost:${PORT}/api/health`);
  console.log(`🧪 Test UI: http://localhost:${PORT}`);
  console.log('');
  console.log('💡 Comandi test:');
  console.log(`   curl http://localhost:${PORT}/api/health`);
  console.log(`   curl -X POST http://localhost:${PORT}/api/chat \\`);
  console.log(`     -H "Content-Type: application/json" \\`);
  console.log(`     -d '{"message": "Ciao!"}'`);
  console.log('');
  console.log('🔧 Configurazione:');
  console.log(`   Ambiente: ${serverConfig.nodeEnv}`);
  console.log(`   Porta: ${PORT}`);
  console.log(`   Regione AWS: ${process.env.AWS_REGION || 'us-east-1'}`);
  console.log('');
  console.log('✨ Bot pronto per le domande sulle Isole Tremiti!');
  console.log('');
});

// Log degli errori non gestiti
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

export { server };