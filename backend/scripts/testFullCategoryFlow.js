const fetch = require('node-fetch');

async function testFullCategoryFlow() {
  try {
    console.log('🧪 Probando flujo completo de cambio de categorías...\n');
    
    // 1. Obtener productos iniciales
    console.log('1️⃣ Obteniendo productos iniciales...');
    const initialResponse = await fetch('http://localhost:3001/api/products');
    const initialData = await initialResponse.json();
    const products = initialData.data;
    
    if (products.length === 0) {
      console.log('❌ No hay productos para probar');
      return;
    }
    
    const testProduct = products[0];
    console.log(`   📦 Producto seleccionado: "${testProduct.name}" (ID: ${testProduct.id})`);
    console.log(`   📂 Categoría inicial: "${testProduct.category_name}" (ID: ${testProduct.category_id})`);
    
    // 2. Obtener categorías disponibles
    console.log('\n2️⃣ Obteniendo categorías disponibles...');
    const categoriesResponse = await fetch('http://localhost:3001/api/products/categories/all');
    const categoriesData = await categoriesResponse.json();
    const categories = categoriesData.data;
    
    console.log('   📋 Categorías disponibles:');
    categories.forEach(cat => {
      console.log(`      - ${cat.name} (ID: ${cat.id})`);
    });
    
    // 3. Simular el mapeo del frontend (CORREGIDO)
    const getCategoryId = (categoryName) => {
      const categoryMap = {
        'Pasteles': 1,
        'Tortas': 2,
        'Panes': 3,
        'Dulces': 4
      };
      return categoryMap[categoryName] || 1;
    };
    
    // 4. Seleccionar una categoría diferente
    const newCategoryName = categories.find(cat => cat.id !== testProduct.category_id)?.name;
    if (!newCategoryName) {
      console.log('❌ No hay otra categoría disponible para probar');
      return;
    }
    
    const newCategoryId = getCategoryId(newCategoryName);
    console.log(`\n3️⃣ Simulando cambio de categoría a: "${newCategoryName}" (ID: ${newCategoryId})`);
    
    // 5. Simular datos del formulario (como ProductModal)
    const formData = {
      titulo: testProduct.name,
      categoria: newCategoryName,
      ingredientes: testProduct.description,
      precio: testProduct.price.toString(),
      imagen: testProduct.image_url
    };
    
    console.log('   📝 Datos del formulario simulado:');
    console.log(`      - Título: ${formData.titulo}`);
    console.log(`      - Categoría: ${formData.categoria}`);
    console.log(`      - Precio: ${formData.precio}`);
    
    // 6. Convertir a formato de API (como hace ProductModal)
    const productData = {
      name: formData.titulo,
      description: formData.ingredientes,
      price: Number(formData.precio),
      category_id: getCategoryId(formData.categoria),
      image_url: formData.imagen,
      stock_quantity: testProduct.stock_quantity || 0
    };
    
    console.log('\n4️⃣ Enviando actualización al servidor...');
    console.log('   📡 Datos enviados:', JSON.stringify(productData, null, 2));
    
    // 7. Hacer la actualización
    const updateResponse = await fetch(`http://localhost:3001/api/products/${testProduct.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(productData)
    });
    
    if (!updateResponse.ok) {
      throw new Error(`Error al actualizar: ${updateResponse.status}`);
    }
    
    const updateResult = await updateResponse.json();
    console.log('   ✅ Respuesta del servidor:', JSON.stringify(updateResult.data, null, 2));
    
    // 8. Verificar que el cambio se reflejó correctamente
    console.log('\n5️⃣ Verificando el cambio...');
    const verifyResponse = await fetch(`http://localhost:3001/api/products/${testProduct.id}`);
    const verifyData = await verifyResponse.json();
    const updatedProduct = verifyData.data;
    
    console.log(`   📦 Producto después de actualizar:`);
    console.log(`      - Nombre: ${updatedProduct.name}`);
    console.log(`      - Categoría: ${updatedProduct.category_name} (ID: ${updatedProduct.category_id})`);
    
    if (updatedProduct.category_id === newCategoryId && updatedProduct.category_name === newCategoryName) {
      console.log('   ✅ ¡Éxito! La categoría se cambió correctamente');
    } else {
      console.log('   ❌ Error: La categoría no se cambió como se esperaba');
      console.log(`      Esperado: ${newCategoryName} (ID: ${newCategoryId})`);
      console.log(`      Actual: ${updatedProduct.category_name} (ID: ${updatedProduct.category_id})`);
    }
    
    // 9. Probar filtrado por categoría
    console.log('\n6️⃣ Probando filtrado por categoría...');
    const filterResponse = await fetch('http://localhost:3001/api/products');
    const filterData = await filterResponse.json();
    const allProducts = filterData.data;
    
    // Simular filtrado del frontend
    const getProductsByCategory = (category) => {
      if (category === "Todos") {
        return allProducts;
      }
      return allProducts.filter(product => product.category_name === category);
    };
    
    const filteredProducts = getProductsByCategory(newCategoryName);
    const productInFilter = filteredProducts.find(p => p.id === testProduct.id);
    
    if (productInFilter) {
      console.log(`   ✅ El producto aparece correctamente en el filtro "${newCategoryName}"`);
      console.log(`   📊 Productos en categoría "${newCategoryName}": ${filteredProducts.length}`);
    } else {
      console.log(`   ❌ El producto NO aparece en el filtro "${newCategoryName}"`);
    }
    
    // 10. Restaurar categoría original
    console.log('\n7️⃣ Restaurando categoría original...');
    const restoreData = { ...productData, category_id: testProduct.category_id };
    
    await fetch(`http://localhost:3001/api/products/${testProduct.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(restoreData)
    });
    
    console.log('   ✅ Categoría original restaurada');
    console.log('\n🎉 Prueba del flujo completo terminada exitosamente');
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
  }
}

testFullCategoryFlow();