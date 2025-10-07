const fetch = require('node-fetch');

async function testFrontendEdit() {
  try {
    // Primero obtener la lista de productos
    console.log('📋 Obteniendo lista de productos...');
    const getResponse = await fetch('http://localhost:3001/api/products');
    const productsData = await getResponse.json();
    const products = productsData.data || productsData;
    
    console.log(`📦 Productos encontrados: ${products.length}`);
    products.forEach(p => {
      console.log(`- ${p.name} (ID: ${p.id})`);
    });

    // Seleccionar el primer producto para editar
    const productToEdit = products[0];
    console.log(`\n🎯 Editando producto: ${productToEdit.name} (ID: ${productToEdit.id})`);

    // Simular los datos que envía el frontend
    const productData = {
      name: productToEdit.name + ' - EDITADO DESDE FRONTEND',
      description: productToEdit.description + ' - Descripción actualizada',
      price: parseFloat(productToEdit.price) + 5,
      category_id: productToEdit.category_id,
      image_url: productToEdit.image_url,
      stock_quantity: productToEdit.stock_quantity
    };

    console.log('📝 Datos a enviar:', productData);

    // Hacer la petición PUT
    const editResponse = await fetch(`http://localhost:3001/api/products/${productToEdit.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    });

    console.log('📡 Status de respuesta:', editResponse.status);

    if (!editResponse.ok) {
      const errorText = await editResponse.text();
      console.error('❌ Error en respuesta:', errorText);
      return;
    }

    const result = await editResponse.json();
    console.log('✅ Resultado de edición:', result);

    // Obtener la lista actualizada
    console.log('\n🔄 Obteniendo lista actualizada...');
    const updatedResponse = await fetch('http://localhost:3001/api/products');
    const updatedData = await updatedResponse.json();
    const updatedProducts = updatedData.data || updatedData;
    
    console.log(`📦 Productos después de editar: ${updatedProducts.length}`);
    updatedProducts.forEach(p => {
      console.log(`- ${p.name} (ID: ${p.id})`);
    });

    // Verificar que el producto se actualizó
    const editedProduct = updatedProducts.find(p => p.id === productToEdit.id);
    if (editedProduct && editedProduct.name.includes('EDITADO DESDE FRONTEND')) {
      console.log('\n✅ ¡Edición exitosa! El producto se actualizó correctamente.');
    } else {
      console.log('\n❌ Error: El producto no se actualizó en la lista.');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
  
  process.exit(0);
}

testFrontendEdit();