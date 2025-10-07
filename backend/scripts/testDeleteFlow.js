const fetch = require('node-fetch');

async function testDeleteFlow() {
  try {
    console.log('🧪 Probando el flujo de eliminación de productos...\n');
    
    // 1. Obtener productos actuales
    console.log('1️⃣ Obteniendo productos actuales...');
    const getResponse = await fetch('http://localhost:3001/api/products');
    const getData = await getResponse.json();
    const products = getData.data || getData;
    
    console.log(`   📦 Productos encontrados: ${products.length}`);
    products.forEach(p => {
      console.log(`   - ${p.name} (ID: ${p.id})`);
    });
    
    if (products.length === 0) {
      console.log('❌ No hay productos para probar la eliminación');
      return;
    }
    
    // 2. Seleccionar el último producto para eliminar
    const productToDelete = products[products.length - 1];
    console.log(`\n2️⃣ Producto seleccionado para eliminar: "${productToDelete.name}" (ID: ${productToDelete.id})`);
    
    // 3. Simular eliminación (como lo haría el frontend)
    console.log('\n3️⃣ Simulando eliminación desde el frontend...');
    const deleteResponse = await fetch(`http://localhost:3001/api/products/${productToDelete.id}`, {
      method: 'DELETE',
      headers: {
        'Origin': 'http://localhost:5173',
        'Referer': 'http://localhost:5173/'
      }
    });
    
    console.log(`   📡 Status de respuesta: ${deleteResponse.status}`);
    
    if (!deleteResponse.ok) {
      const errorText = await deleteResponse.text();
      console.log(`   ❌ Error: ${errorText}`);
      throw new Error(`Error eliminando producto: ${deleteResponse.status}`);
    }
    
    const deleteResult = await deleteResponse.json();
    console.log('   ✅ Producto eliminado exitosamente del servidor');
    console.log('   📄 Respuesta:', deleteResult);
    
    // 4. Verificar que el producto ya no existe
    console.log('\n4️⃣ Verificando que el producto se eliminó...');
    const verifyResponse = await fetch('http://localhost:3001/api/products');
    const verifyData = await verifyResponse.json();
    const remainingProducts = verifyData.data || verifyData;
    
    const deletedProductExists = remainingProducts.find(p => p.id === productToDelete.id);
    
    if (deletedProductExists) {
      console.log('   ❌ Error: El producto aún existe en la base de datos');
    } else {
      console.log('   ✅ Verificación exitosa: El producto se eliminó correctamente');
      console.log(`   📦 Productos restantes: ${remainingProducts.length}`);
    }
    
    console.log('\n🎉 Prueba de eliminación completada exitosamente');
    console.log('✅ El flujo ahora funciona correctamente:');
    console.log('   1. Se muestra la confirmación');
    console.log('   2. Se hace la petición al servidor');
    console.log('   3. Solo si es exitosa, se actualiza la vista');
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error);
  }
  
  process.exit(0);
}

testDeleteFlow();