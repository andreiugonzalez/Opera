const mysql = require('mysql2/promise');
require('dotenv').config();

async function testRailwayConnection() {
  console.log('🚂 Probando conexión a Railway...');
  
  try {
    // Configuración para Railway usando variables individuales
    const connection = await mysql.createConnection({
      host: process.env.RAILWAY_MYSQL_HOST,
      port: process.env.RAILWAY_MYSQL_PORT,
      user: process.env.RAILWAY_MYSQL_USER,
      password: process.env.RAILWAY_MYSQL_PASSWORD,
      database: process.env.RAILWAY_MYSQL_DATABASE,
      ssl: {
        rejectUnauthorized: false
      }
    });

    console.log('✅ Conexión exitosa a Railway!');
    
    // Probar una consulta simple
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('✅ Consulta de prueba exitosa:', rows);
    
    // Verificar si existen las tablas
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('📋 Tablas existentes:', tables);
    
    await connection.end();
    console.log('🎉 ¡Railway está listo para usar!');
    
  } catch (error) {
    console.error('❌ Error conectando a Railway:', error.message);
    console.log('\n💡 Asegúrate de que:');
    console.log('1. La variable MYSQL_URL esté configurada en tu .env');
    console.log('2. Railway esté funcionando correctamente');
    console.log('3. Las credenciales sean correctas');
  }
}

testRailwayConnection();