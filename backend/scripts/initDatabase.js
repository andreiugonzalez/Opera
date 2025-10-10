const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function initializeDatabase() {
  let connection;
  
  try {
    // Configuración según el entorno
    const dbConfig = process.env.NODE_ENV === 'production' ? {
      // Configuración para Railway (Producción)
      host: process.env.RAILWAY_MYSQL_HOST,
      port: process.env.RAILWAY_MYSQL_PORT,
      user: process.env.RAILWAY_MYSQL_USER,
      password: process.env.RAILWAY_MYSQL_PASSWORD,
      database: process.env.RAILWAY_MYSQL_DATABASE,
      ssl: {
        rejectUnauthorized: false
      },
      multipleStatements: true
    } : {
      // Configuración para desarrollo local
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'andriu1472',
      port: process.env.DB_PORT || 3306,
      multipleStatements: true
    };

    // Conectar a MySQL (sin seleccionar base inicialmente)
    connection = await mysql.createConnection(dbConfig);

    console.log('🔌 Conectado a MySQL');

    // Crear y seleccionar la base de datos en desarrollo
    if (process.env.NODE_ENV !== 'production') {
      const dbName = process.env.DB_NAME || 'opera_panaderia';
      await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
      await connection.query(`USE \`${dbName}\``);
      console.log(`🏗️  Base de datos seleccionada: ${dbName}`);
    }

    // Leer el archivo SQL
    const sqlPath = path.join(__dirname, '../database/init.sql');
    const sqlScript = fs.readFileSync(sqlPath, 'utf8');

    // Dividir el script en declaraciones individuales
    console.log('📊 Ejecutando script de inicialización...');
    const statements = sqlScript
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    // Ejecutar cada declaración por separado
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await connection.execute(statement);
        } catch (error) {
          console.log(`⚠️  Advertencia en declaración: ${error.message}`);
        }
      }
    }

    console.log('✅ Base de datos inicializada correctamente');
    console.log('📋 Tablas creadas:');
    console.log('   - users (usuarios/administradores)');
    console.log('   - categories (categorías de productos)');
    console.log('   - products (productos)');
    console.log('   - orders (pedidos)');
    console.log('   - order_items (detalles de pedidos)');
    console.log('');
    console.log('👤 Usuario administrador creado:');
    console.log('   - Usuario: admin');
    console.log('   - Email: admin@opera.com');
    console.log('   - Contraseña: admin123');
    console.log('');
    console.log('🎯 Productos de ejemplo agregados');

  } catch (error) {
    console.error('❌ Error al inicializar la base de datos:', error.message);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('🔧 Verifica las credenciales en el archivo .env');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('🔧 Asegúrate de que MySQL esté ejecutándose');
    }
    
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Conexión cerrada');
    }
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  initializeDatabase();
}

module.exports = { initializeDatabase };