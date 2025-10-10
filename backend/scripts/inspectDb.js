const { executeQuery } = require('../config/database');

async function inspectDb() {
  try {
    console.log('🔎 Inspeccionando base de datos...');

    const [{ db }] = await executeQuery('SELECT DATABASE() AS db');
    console.log(`🗄️  Base seleccionada por el pool: ${db}`);

    const tables = await executeQuery('SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE()');
    console.log('📋 Tablas en la base de datos:');
    tables.forEach(row => {
      const tableName = row.table_name || Object.values(row)[0];
      console.log(`   - ${tableName}`);
    });

    try {
      const admins = await executeQuery('SELECT id, username, email, role FROM users WHERE role = "admin"');
      if (admins.length === 0) {
        console.log('⚠️  No hay usuarios admin en la tabla users');
      } else {
        console.log('👤 Usuarios admin:');
        admins.forEach(u => console.log(`   - ${u.id}: ${u.username} (${u.email})`));
      }
    } catch (err) {
      console.log('⚠️  Error consultando usuarios admin:', err.message);
    }
  } catch (error) {
    console.error('❌ Error inspeccionando BD:', error);
  }
}

inspectDb();