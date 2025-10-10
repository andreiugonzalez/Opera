const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function updateAdminRailway(newPassword) {
  try {
    const dbConfig = {
      host: process.env.RAILWAY_MYSQL_HOST,
      port: process.env.RAILWAY_MYSQL_PORT,
      user: process.env.RAILWAY_MYSQL_USER,
      password: process.env.RAILWAY_MYSQL_PASSWORD,
      database: process.env.RAILWAY_MYSQL_DATABASE,
      ssl: { rejectUnauthorized: false }
    };

    console.log('🚂 Conectando a Railway para actualizar admin...');
    const conn = await mysql.createConnection(dbConfig);
    console.log('✅ Conectado a Railway');

    const hashed = await bcrypt.hash(newPassword, 10);
    const [result] = await conn.execute(
      'UPDATE users SET password_hash = ? WHERE (username = ? OR email = ?) AND role = "admin"',
      [hashed, 'OperaAdmin', 'admin@opera.com']
    );
    console.log('🔧 Filas afectadas:', result.affectedRows);

    const [rows] = await conn.execute('SELECT id, username, email, role FROM users WHERE role = "admin"');
    console.log('👤 Admins Railway:', rows);

    await conn.end();
    console.log('🏁 Finalizado');
  } catch (e) {
    console.error('❌ Error actualizando admin en Railway:', e.message);
    process.exit(1);
  }
}

const [, , passArg] = process.argv;
updateAdminRailway(passArg || 'Oper42025$');