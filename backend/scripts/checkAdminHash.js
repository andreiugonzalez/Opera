const bcrypt = require('bcryptjs');
const { executeQuery } = require('../config/database');

async function checkAdminHash() {
  try {
    console.log('🔎 Verificando hash del administrador...');
    const admins = await executeQuery('SELECT id, username, email, role, password_hash FROM users WHERE role = "admin"');
    if (admins.length === 0) {
      console.log('⚠️  No hay usuarios admin en la tabla users');
      process.exit(1);
    }
    for (const admin of admins) {
      const ok = await bcrypt.compare('Oper42025$', admin.password_hash);
      console.log(`👤 ${admin.id}: ${admin.username} (${admin.email}) -> contraseña coincide: ${ok}`);
    }
    process.exit(0);
  } catch (error) {
    console.error('❌ Error verificando hash:', error);
    process.exit(1);
  }
}

checkAdminHash();