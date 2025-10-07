const bcrypt = require('bcryptjs');
const { executeQuery } = require('../config/database');

async function updateAdminCredentials() {
  try {
    console.log('🔐 Actualizando credenciales del administrador...');
    
    // Hashear la nueva contraseña
    const password = 'opera2025';
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Actualizar el usuario admin
    const updateQuery = `
      UPDATE users 
      SET username = ?, password_hash = ?, email = ?
      WHERE role = 'admin'
    `;
    
    const result = await executeQuery(updateQuery, ['OperaAdmin', hashedPassword, 'admin@opera.com']);
    
    if (result.affectedRows > 0) {
      console.log('✅ Credenciales del administrador actualizadas correctamente');
      console.log('   Usuario: OperaAdmin');
      console.log('   Contraseña: opera2025');
    } else {
      console.log('❌ No se encontró usuario administrador para actualizar');
    }
    
    // Verificar que el usuario existe
    const verifyQuery = 'SELECT username, email, role FROM users WHERE role = "admin"';
    const adminUsers = await executeQuery(verifyQuery);
    
    console.log('👤 Usuarios administradores en la base de datos:');
    adminUsers.forEach(user => {
      console.log(`   - ${user.username} (${user.email}) - ${user.role}`);
    });
    
  } catch (error) {
    console.error('❌ Error actualizando credenciales:', error);
  }
}

updateAdminCredentials();