const fetch = require('node-fetch');

async function testEditProduct() {
  try {
    const productId = 1; // ID del primer producto
    const productData = {
      name: 'Torta de Chocolate Editada',
      description: 'Descripción actualizada de la torta de chocolate',
      price: 30.00,
      category_id: 2,
      image_url: '/imagenes/torta_editada.jpg',
      stock_quantity: 15
    };

    console.log('🧪 Probando edición de producto...');
    console.log('📝 Datos a enviar:', productData);

    const response = await fetch(`http://localhost:3001/api/products/${productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    });

    console.log('📡 Status de respuesta:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error en respuesta:', errorText);
      return;
    }

    const result = await response.json();
    console.log('✅ Resultado:', result);

    // Verificar que se actualizó en la base de datos
    const { executeQuery } = require('../config/database');
    const updatedProduct = await executeQuery('SELECT * FROM products WHERE id = ?', [productId]);
    console.log('🔍 Producto en BD después de actualizar:', updatedProduct[0]);

  } catch (error) {
    console.error('❌ Error:', error);
  }
  
  process.exit(0);
}

testEditProduct();