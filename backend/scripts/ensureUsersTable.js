const bcrypt = require('bcryptjs');
const { executeQuery } = require('../config/database');

async function ensureUsersTableAndAdmin() {
  try {
    console.log('🛠️  Verificando tabla users...');
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('admin', 'user') DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla users lista');

    const admins = await executeQuery('SELECT id, username FROM users WHERE role = "admin"');
    if (admins.length === 0) {
      console.log('👤 No había admin, creando OperaAdmin...');
      const password = 'Oper42025$';
      const hashedPassword = await bcrypt.hash(password, 10);
      await executeQuery(
        'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, "admin")',
        ['OperaAdmin', 'admin@opera.com', hashedPassword]
      );
      console.log('✅ Admin OperaAdmin creado con la nueva contraseña');
    } else {
      console.log('👤 Admin existente encontrado, no se crea uno nuevo');
    }
  } catch (error) {
    console.error('❌ Error asegurando tabla users/admin:', error.message);
  }
}

ensureUsersTableAndAdmin();