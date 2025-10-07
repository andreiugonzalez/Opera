const { executeQuery } = require('../config/database');

async function checkProducts() {
  try {
    const products = await executeQuery('SELECT * FROM products WHERE is_available = true');
    console.log(`Productos disponibles: ${products.length}`);
    
    products.forEach(p => {
      console.log(`- ${p.name} (ID: ${p.id}) - Categoría: ${p.category_id}`);
    });
    
    if (products.length === 0) {
      console.log('No hay productos disponibles. Insertando productos de ejemplo...');
      
      // Insertar algunos productos de ejemplo
      await executeQuery(`
        INSERT INTO products (name, description, price, category_id, image_url, stock_quantity) VALUES
        ('Pan Francés', 'Pan francés tradicional, crujiente por fuera y suave por dentro', 2.50, 1, '/imagenes/pan1.jpg', 50),
        ('Torta de Chocolate', 'Deliciosa torta de chocolate con cobertura de ganache', 25.00, 2, '/imagenes/torta1.jpg', 10),
        ('Alfajores', 'Alfajores tradicionales con dulce de leche', 1.50, 3, '/imagenes/dulce1.jpg', 100)
      `);
      
      console.log('✅ Productos de ejemplo insertados');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
  
  process.exit(0);
}

checkProducts();