const { pool } = require('../config/database');

async function resetConnections() {
  try {
    console.log('🔄 Cerrando todas las conexiones del pool...');
    
    // Cerrar todas las conexiones del pool
    await pool.end();
    console.log('✅ Pool de conexiones cerrado');
    
    console.log('🔄 Las conexiones se renovarán automáticamente en el próximo reinicio del servidor');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al cerrar conexiones:', error);
    process.exit(1);
  }
}

resetConnections();