const bcrypt = require('bcryptjs');
const { executeQuery } = require('../config/database');

async function setAdminPassword(username, newPassword) {
  try {
    console.log('🔐 Configurando nueva contraseña de admin...');
    const saltRounds = 10;
    const hashed = await bcrypt.hash(newPassword, saltRounds);
    const result = await executeQuery(
      'UPDATE users SET password_hash = ? WHERE (username = ? OR email = ?) AND role = "admin"',
      [hashed, username, username]
    );
    console.log('Resultado UPDATE:', result.affectedRows);
    const verify = await executeQuery('SELECT id, username, email, role FROM users WHERE role = "admin"');
    console.log('Admins:', verify);
  } catch (e) {
    console.error('❌ Error al establecer contraseña:', e);
  }
}

const [,, userArg, passArg] = process.argv;
setAdminPassword(userArg || 'OperaAdmin', passArg || 'opera2025');