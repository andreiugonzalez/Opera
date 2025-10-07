const fetch = require('node-fetch');

// Simular exactamente lo que hace el frontend
async function simulateFrontendEdit() {
  try {
    console.log('🎭 Simulando edición desde el frontend...');
    
    // 1. Obtener productos (como hace el frontend al cargar)
    console.log('📋 1. Obteniendo productos...');
    const getResponse = await fetch('http://localhost:3001/api/products');
    const productsData = await getResponse.json();
    const products = productsData.data || productsData;
    
    console.log(`✅ ${products.length} productos obtenidos`);
    
    // 2. Seleccionar un producto para editar
    const productToEdit = products[0];
    console.log(`🎯 2. Producto seleccionado: ${productToEdit.name} (ID: ${productToEdit.id})`);
    
    // 3. Simular los datos del formulario (como ProductModal)
    const formData = {
      titulo: productToEdit.name + ' - EDITADO FRONTEND',
      categoria: productToEdit.category_name || 'Pasteles',
      ingredientes: (productToEdit.description || 'Sin descripción') + ' - Actualizado',
      precio: (parseFloat(productToEdit.price) + 2).toString(),
      imagen: productToEdit.image_url
    };
    
    console.log('📝 3. Datos del formulario:', formData);
    
    // 4. Convertir a formato de API (como hace handleSubmit)
    const getCategoryId = (categoryName) => {
      const categoryMap = {
        'Pasteles': 2,
        'Tortas': 2,
        'Panes': 1,
        'Dulces': 3,
        'Bebidas': 4
      };
      return categoryMap[categoryName] || 2;
    };

    const productData = {
      name: formData.titulo,
      description: formData.ingredientes,
      price: Number(formData.precio),
      category_id: getCategoryId(formData.categoria),
      image_url: formData.imagen,
      stock_quantity: productToEdit.stock_quantity || 0
    };
    
    console.log('🔄 4. Datos para API:', productData);
    
    // 5. Llamar a editProduct (como hace el contexto)
    console.log('📡 5. Enviando petición PUT...');
    const editResponse = await fetch(`http://localhost:3001/api/products/${productToEdit.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    });
    
    console.log(`📊 Status: ${editResponse.status}`);
    
    if (!editResponse.ok) {
      const errorText = await editResponse.text();
      console.error('❌ Error en respuesta:', errorText);
      return;
    }
    
    const result = await editResponse.json();
    console.log('✅ 6. Resultado de edición:', result);
    
    // 6. Verificar que la lista se actualiza correctamente
    console.log('🔍 7. Verificando actualización...');
    const verifyResponse = await fetch('http://localhost:3001/api/products');
    const verifyData = await verifyResponse.json();
    const updatedProducts = verifyData.data || verifyData;
    
    const updatedProduct = updatedProducts.find(p => p.id === productToEdit.id);
    
    if (updatedProduct) {
      console.log('✅ Producto encontrado en lista actualizada:');
      console.log(`   - Nombre: ${updatedProduct.name}`);
      console.log(`   - Descripción: ${updatedProduct.description}`);
      console.log(`   - Precio: ${updatedProduct.price}`);
      
      if (updatedProduct.name.includes('EDITADO FRONTEND')) {
        console.log('🎉 ¡ÉXITO! La edición funcionó correctamente');
      } else {
        console.log('⚠️  El producto no tiene los cambios esperados');
      }
    } else {
      console.log('❌ Producto no encontrado en la lista actualizada');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
  
  process.exit(0);
}

simulateFrontendEdit();