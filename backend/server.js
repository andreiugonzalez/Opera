const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config();

const { testConnection, pool } = require('./config/database');

// Importar rutas
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const { router: authRoutes } = require('./routes/auth');
const cakeRoutes = require('./routes/cakes');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Parseo de cookies
app.use(cookieParser());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir archivos estáticos (imágenes subidas)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rutas de la API
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/cakes', cakeRoutes);

// Ruta de prueba
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Algo salió mal en el servidor',
    message: err.message 
  });
});

// Ruta 404
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Iniciar servidor
async function startServer() {
  try {
    // Probar conexión a la base de datos
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.log('⚠️  Iniciando servidor sin conexión a la base de datos');
      console.log('📝 Asegúrate de configurar MySQL y actualizar el archivo .env');
    }

    // Intentar crear la tabla cakes si no existe (auto-bootstrap)
    if (dbConnected) {
      try {
        const createSql = `
          CREATE TABLE IF NOT EXISTS cakes (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            image_url VARCHAR(1024) NOT NULL,
            price DECIMAL(10,2) NOT NULL DEFAULT 0,
            is_active TINYINT(1) NOT NULL DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
          )
        `;
        await pool.execute(createSql);
        console.log('✅ Tabla "cakes" verificada/creada correctamente');
        // Asegurar columna price existe en instalaciones previas (compatibilidad MySQL < 8.0)
        try {
          const [cols] = await pool.execute("SHOW COLUMNS FROM cakes LIKE 'price'");
          if (!cols || cols.length === 0) {
            await pool.execute('ALTER TABLE cakes ADD COLUMN price DECIMAL(10,2) NOT NULL DEFAULT 0');
            console.log('✅ Columna "price" añadida a tabla cakes');
          } else {
            console.log('ℹ️ Columna "price" ya existe en tabla cakes');
          }
        } catch (e2) {
          console.log('⚠️  No se pudo verificar/añadir la columna price:', e2.message);
        }
      } catch (e) {
        console.log('⚠️  No se pudo verificar/crear la tabla "cakes":', e.message);
      }
    }

    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
      console.log(`📊 API disponible en http://localhost:${PORT}/api`);
      console.log(`🔧 Frontend URL configurado: ${process.env.FRONTEND_URL}`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

startServer();