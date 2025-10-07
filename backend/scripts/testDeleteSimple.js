const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:3001/api';

async function testDeleteEndpoint() {
  try {
    console.log('🧪 Probando endpoint DELETE...\n');

    // 1. Primero obtener categorías para ver cuáles están disponibles
    console.log('1. Obteniendo categorías disponibles...');
    const categoriesResponse = await fetch(`${API_BASE_URL}/products/categories/all`);
    const categoriesResult = await categoriesResponse.json();
    
    if (!categoriesResponse.ok) {
      throw new Error(`Error al obtener categorías: ${categoriesResult.error}`);
    }

    const categories = categoriesResult.data;
    console.log(`   ✅ Categorías encontradas: ${categories.length}`);
    categories.forEach(cat => {
      console.log(`      - ${cat.name} (ID: ${cat.id})`);
    });

    // 2. Crear una categoría de prueba
    console.log('\n2. Creando categoría de prueba...');
    const timestamp = Date.now();
    const testCategory = {
      name: `Test DELETE ${timestamp}`,
      description: 'Categoría para probar eliminación'
    };

    const createResponse = await fetch(`${API_BASE_URL}/products/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testCategory),
    });

    const createResult = await createResponse.json();
    
    if (!createResponse.ok) {
      throw new Error(`Error al crear categoría: ${createResult.error}`);
    }

    const createdCategory = createResult.data;
    console.log(`   ✅ Categoría creada: ${createdCategory.name} (ID: ${createdCategory.id})`);

    // 3. Intentar eliminar la categoría
    console.log('\n3. Probando eliminación...');
    console.log(`   URL: ${API_BASE_URL}/products/categories/${createdCategory.id}`);
    
    const deleteResponse = await fetch(`${API_BASE_URL}/products/categories/${createdCategory.id}`, {
      method: 'DELETE',
    });

    console.log(`   Status: ${deleteResponse.status}`);
    console.log(`   Status Text: ${deleteResponse.statusText}`);

    const deleteResult = await deleteResponse.json();
    console.log(`   Response:`, deleteResult);
    
    if (!deleteResponse.ok) {
      throw new Error(`Error al eliminar categoría: ${deleteResult.error}`);
    }

    console.log(`   ✅ Categoría eliminada exitosamente: ${deleteResult.message}`);

    console.log('\n🎉 Prueba completada exitosamente!');

  } catch (error) {
    console.error('\n❌ Error en la prueba:', error.message);
    console.error('Stack:', error.stack);
  }
}

testDeleteEndpoint();