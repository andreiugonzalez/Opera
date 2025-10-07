const mysql = require('mysql2/promise');
require('dotenv').config();

async function initRailway() {
  let connection;
  
  try {
    // Configuración para Railway
    const dbConfig = {
      host: process.env.RAILWAY_MYSQL_HOST,
      port: process.env.RAILWAY_MYSQL_PORT,
      user: process.env.RAILWAY_MYSQL_USER,
      password: process.env.RAILWAY_MYSQL_PASSWORD,
      database: process.env.RAILWAY_MYSQL_DATABASE,
      ssl: {
        rejectUnauthorized: false
      }
    };

    console.log('🔌 Conectando a Railway...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conexión exitosa');

    // Crear tabla de categorías
    console.log('📋 Creando tabla categories...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Crear tabla de productos
    console.log('📦 Creando tabla products...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        category_id INT,
        image_url VARCHAR(500),
        stock_quantity INT DEFAULT 0,
        is_available BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
      )
    `);

    // Crear tabla de usuarios
    console.log('👤 Creando tabla users...');
    await connection.execute(`
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

    // Crear tabla de pedidos
    console.log('📋 Creando tabla orders...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customer_name VARCHAR(200) NOT NULL,
        customer_email VARCHAR(100),
        customer_phone VARCHAR(20),
        customer_address TEXT,
        total_amount DECIMAL(10, 2) NOT NULL,
        status ENUM('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled') DEFAULT 'pending',
        order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        delivery_date DATETIME,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Crear tabla de items de pedidos
    console.log('📦 Creando tabla order_items...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        product_id INT NOT NULL,
        quantity INT NOT NULL,
        unit_price DECIMAL(10, 2) NOT NULL,
        subtotal DECIMAL(10, 2) NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      )
    `);

    // Insertar categorías de ejemplo
    console.log('📂 Insertando categorías...');
    await connection.execute(`
      INSERT IGNORE INTO categories (name, description) VALUES
      ('Pasteles', 'Deliciosos pasteles para toda ocasión'),
      ('Tortas', 'Tortas personalizadas y tradicionales'),
      ('Panes', 'Pan fresco horneado diariamente'),
      ('Dulces', 'Dulces y postres variados')
    `);

    // Insertar usuario administrador
    console.log('👤 Creando usuario administrador...');
    await connection.execute(`
      INSERT IGNORE INTO users (username, email, password_hash, role) VALUES
      ('admin', 'admin@opera.com', '$2b$10$rQZ8kHWKtGkVQZ8kHWKtGOeKQZ8kHWKtGkVQZ8kHWKtGkVQZ8kHWKt', 'admin')
    `);

    // Insertar productos de ejemplo
    console.log('🎂 Insertando productos de ejemplo...');
    await connection.execute(`
      INSERT IGNORE INTO products (name, description, price, category_id, image_url, stock_quantity) VALUES
      ('Torta de Chocolate', 'Deliciosa torta de chocolate con cobertura', 25.00, 2, '/imagenes/torta1.jpg', 10),
      ('Pan Integral', 'Pan integral fresco del día', 3.50, 3, '/imagenes/pan1.jpg', 20),
      ('Pastel de Fresa', 'Pastel suave con fresas frescas', 18.00, 1, '/imagenes/pastel1.jpg', 8),
      ('Dulce de Leche', 'Tradicional dulce de leche casero', 5.00, 4, '/imagenes/dulce1.jpg', 15)
    `);

    // Verificar tablas creadas
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('✅ Tablas creadas exitosamente:');
    tables.forEach(table => {
      console.log(`   - ${Object.values(table)[0]}`);
    });

    console.log('🎉 ¡Railway inicializado correctamente!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Conexión cerrada');
    }
  }
}

initRailway();