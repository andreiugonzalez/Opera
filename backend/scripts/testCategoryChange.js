const fetch = require('node-fetch');

async function testCategoryChange() {
  try {
    console.log('🧪 Probando cambio de categorías...\n');
    
    // 1. Obtener un producto existente
    console.log('1️⃣ Obteniendo productos...');
    const productsResponse = await fetch('http://localhost:3001/api/products');
    const productsData = await productsResponse.json();
    
    if (!productsData.data || productsData.data.length === 0) {
      console.log('❌ No hay productos para probar');
      return;
    }
    
    const testProduct = productsData.data[0];
    console.log(`   📦 Producto seleccionado: "${testProduct.name}" (ID: ${testProduct.id})`);
    console.log(`   📂 Categoría actual: "${testProduct.category_name}" (ID: ${testProduct.category_id})`);
    
    // 2. Obtener categorías disponibles
    console.log('\n2️⃣ Obteniendo categorías disponibles...');
    const categoriesResponse = await fetch('http://localhost:3001/api/products/categories/all');
    const categoriesData = await categoriesResponse.json();
    
    const availableCategories = categoriesData.data;
    console.log('   📋 Categorías disponibles:');
    availableCategories.forEach(cat => {
      console.log(`      - ${cat.name} (ID: ${cat.id})`);
    });
    
    // 3. Seleccionar una categoría diferente
    const newCategory = availableCategories.find(cat => cat.id !== testProduct.category_id);
    if (!newCategory) {
      console.log('❌ No hay otra categoría disponible para probar');
      return;
    }
    
    console.log(`\n3️⃣ Cambiando categoría a: "${newCategory.name}" (ID: ${newCategory.id})`);
    
    // 4. Actualizar el producto
    const updateData = {
      name: testProduct.name,
      description: testProduct.description,
      price: testProduct.price,
      category_id: newCategory.id,
      image_url: testProduct.image_url,
      stock_quantity: testProduct.stock_quantity || 0
    };
    
    const updateResponse = await fetch(`http://localhost:3001/api/products/${testProduct.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });
    
    if (!updateResponse.ok) {
      throw new Error(`Error al actualizar: ${updateResponse.status}`);
    }
    
    const updateResult = await updateResponse.json();
    console.log('   ✅ Producto actualizado exitosamente');
    
    // 5. Verificar el cambio
    console.log('\n4️⃣ Verificando el cambio...');
    const verifyResponse = await fetch(`http://localhost:3001/api/products/${testProduct.id}`);
    const verifyData = await verifyResponse.json();
    
    if (verifyData.data.category_id === newCategory.id) {
      console.log(`   ✅ ¡Éxito! Categoría cambiada correctamente a "${verifyData.data.category_name}"`);
    } else {
      console.log(`   ❌ Error: La categoría no se cambió. Actual: ${verifyData.data.category_name}`);
    }
    
    // 6. Restaurar categoría original
    console.log('\n5️⃣ Restaurando categoría original...');
    const restoreData = { ...updateData, category_id: testProduct.category_id };
    
    await fetch(`http://localhost:3001/api/products/${testProduct.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(restoreData)
    });
    
    console.log('   ✅ Categoría original restaurada');
    console.log('\n🎉 Prueba completada exitosamente');
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
  }
}

testCategoryChange();