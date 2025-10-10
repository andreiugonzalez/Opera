const mysql = require('mysql2/promise');
require('dotenv').config();

// Configuración para desarrollo y producción
const dbConfig = process.env.NODE_ENV === 'production' ? {
  // Configuración para Railway (Producción) - usando variables individuales
  host: process.env.RAILWAY_MYSQL_HOST,
  port: process.env.RAILWAY_MYSQL_PORT,
  user: process.env.RAILWAY_MYSQL_USER,
  password: process.env.RAILWAY_MYSQL_PASSWORD,
  database: process.env.RAILWAY_MYSQL_DATABASE,
  ssl: {
    rejectUnauthorized: false
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
} : {
  // Configuración para MySQL local (Desarrollo)
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'andriu1472',
  database: process.env.DB_NAME || 'opera_panaderia',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};
// Nota de despliegue:
// - En producción, TODAS las variables RAILWAY_MYSQL_* deben estar definidas.
// - Si falta alguna, `mysql2` fallará y el backend responderá 500,
//   which el frontend verá como "Failed to fetch".
// - Verifica también `JWT_SECRET` y `FRONTEND_URL`.

// Crear el pool de conexiones
const pool = mysql.createPool(dbConfig);

// Función para probar la conexión
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Conexión a MySQL establecida correctamente');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Error al conectar con MySQL:', error.message);
    // Sugerencias:
    // - Revisa credenciales y accesos de red (Railway -> Networking -> Allow external connections).
    // - En entornos serverless, habilita `ssl` si el proveedor lo requiere.
    return false;
  }
}

// Función para ejecutar queries
async function executeQuery(query, params = []) {
  try {
    const [results] = await pool.execute(query, params);
    return results;
  } catch (error) {
    console.error('Error ejecutando query:', error);
    throw error;
  }
}

module.exports = {
  pool,
  testConnection,
  executeQuery
};