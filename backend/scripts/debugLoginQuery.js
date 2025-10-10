const bcrypt = require('bcryptjs');
const { executeQuery } = require('../config/database');

async function debugLogin(username, password) {
  try {
    console.log('🔎 Ejecutando query de login...');
    const users = await executeQuery('SELECT * FROM users WHERE username = ? OR email = ?', [username, username]);
    console.log('Resultados:', users.length);
    if (users.length === 0) {
      console.log('❌ No se encontró usuario');
      return;
    }
    const user = users[0];
    console.log('Usuario:', { id: user.id, username: user.username, email: user.email, role: user.role });
    const ok = await bcrypt.compare(password, user.password_hash);
    console.log('Comparación bcrypt:', ok);
  } catch (e) {
    console.error('❌ Error en debugLogin:', e);
  }
}

const [,, argUser, argPass] = process.argv;
const user = argUser || 'OperaAdmin';
const pass = argPass || 'Oper42025$';
debugLogin(user, pass);