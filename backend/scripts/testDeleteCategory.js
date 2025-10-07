const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:3001';

async function testDeleteCategory() {
  try {
    console.log('🧪 Iniciando pruebas de eliminación de categorías...\n');

    // 1. Obtener categorías actuales
    console.log('1. Obteniendo categorías actuales...');
    const categoriesResponse = await fetch(`${API_BASE_URL}/api/products/categories/all`);
    const categoriesResult = await categoriesResponse.json();
    
    if (!categoriesResponse.ok) {
      throw new Error(`Error al obtener categorías: ${categoriesResult.error}`);
    }
    
    const categories = categoriesResult.data;
    console.log(`   ✅ Categorías encontradas: ${categories.length}`);
    categories.forEach(cat => console.log(`      - ${cat.name} (ID: ${cat.id})`));

    // 2. Crear una categoría de prueba para eliminar
    console.log('\n2. Creando categoría de prueba...');
    const timestamp = Date.now();
    const testCategory = {
      name: `Categoría de Prueba DELETE ${timestamp}`,
      description: 'Esta categoría será eliminada en la prueba'
    };

    const createResponse = await fetch(`${API_BASE_URL}/api/products/categories`, {
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
    console.log('\n3. Eliminando categoría de prueba...');
    const deleteResponse = await fetch(`${API_BASE_URL}/api/products/categories/${createdCategory.id}`, {
      method: 'DELETE',
    });

    const deleteResult = await deleteResponse.json();
    
    if (!deleteResponse.ok) {
      throw new Error(`Error al eliminar categoría: ${deleteResult.error}`);
    }

    console.log(`   ✅ Categoría eliminada exitosamente: ${deleteResult.message}`);

    // 4. Verificar que la categoría ya no existe
    console.log('\n4. Verificando que la categoría fue eliminada...');
    const finalCategoriesResponse = await fetch(`${API_BASE_URL}/api/products/categories/all`);
    const finalCategoriesResult = await finalCategoriesResponse.json();
    
    const finalCategories = finalCategoriesResult.data;
    const deletedCategoryExists = finalCategories.find(cat => cat.id === createdCategory.id);
    
    if (deletedCategoryExists) {
      throw new Error('❌ La categoría aún existe después de ser eliminada');
    }

    console.log(`   ✅ Verificación exitosa: la categoría ya no existe`);
    console.log(`   📊 Categorías restantes: ${finalCategories.length}`);

    // 5. Probar eliminación de categoría inexistente
    console.log('\n5. Probando eliminación de categoría inexistente...');
    const nonExistentId = 99999;
    const notFoundResponse = await fetch(`${API_BASE_URL}/api/products/categories/${nonExistentId}`, {
      method: 'DELETE',
    });

    if (notFoundResponse.status === 404) {
      console.log('   ✅ Error 404 correcto para categoría inexistente');
    } else {
      console.log('   ⚠️  Respuesta inesperada para categoría inexistente:', notFoundResponse.status);
    }

    // 6. Probar eliminación con ID inválido
    console.log('\n6. Probando eliminación con ID inválido...');
    const invalidIdResponse = await fetch(`${API_BASE_URL}/api/products/categories/abc`, {
      method: 'DELETE',
    });

    if (invalidIdResponse.status === 400) {
      console.log('   ✅ Error 400 correcto para ID inválido');
    } else {
      console.log('   ⚠️  Respuesta inesperada para ID inválido:', invalidIdResponse.status);
    }

    console.log('\n🎉 ¡Todas las pruebas de eliminación completadas exitosamente!');

  } catch (error) {
    console.error('\n❌ Error en las pruebas:', error.message);
    process.exit(1);
  }
}

// Ejecutar las pruebas
testDeleteCategory();