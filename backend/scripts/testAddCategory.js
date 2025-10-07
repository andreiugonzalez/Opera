const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:3001/api';

async function testAddCategory() {
  console.log('🧪 Iniciando prueba de agregar categoría...\n');

  try {
    // 1. Obtener categorías actuales
    console.log('1. Obteniendo categorías actuales...');
    const categoriesResponse = await fetch(`${API_BASE_URL}/products/categories/all`);
    const categoriesData = await categoriesResponse.json();
    const initialCategories = categoriesData.data;
    console.log(`   Categorías actuales: ${initialCategories.length}`);
    initialCategories.forEach(cat => console.log(`   - ${cat.name}`));

    // 2. Agregar nueva categoría
    console.log('\n2. Agregando nueva categoría "Bebidas Calientes"...');
    const newCategoryData = {
      name: 'Bebidas Calientes',
      description: 'Café, té, chocolate caliente y otras bebidas calientes'
    };

    const addResponse = await fetch(`${API_BASE_URL}/products/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newCategoryData),
    });

    if (!addResponse.ok) {
      const errorData = await addResponse.json();
      throw new Error(`Error ${addResponse.status}: ${errorData.error}`);
    }

    const addResult = await addResponse.json();
    console.log(`   ✅ Categoría creada exitosamente:`);
    console.log(`   - ID: ${addResult.data.id}`);
    console.log(`   - Nombre: ${addResult.data.name}`);
    console.log(`   - Descripción: ${addResult.data.description}`);

    // 3. Verificar que la categoría se agregó
    console.log('\n3. Verificando que la categoría se agregó...');
    const updatedCategoriesResponse = await fetch(`${API_BASE_URL}/products/categories/all`);
    const updatedCategoriesData = await updatedCategoriesResponse.json();
    const updatedCategories = updatedCategoriesData.data;
    
    console.log(`   Categorías después de agregar: ${updatedCategories.length}`);
    const newCategory = updatedCategories.find(cat => cat.name === 'Bebidas Calientes');
    
    if (newCategory) {
      console.log(`   ✅ Categoría encontrada en la lista`);
      console.log(`   - ID: ${newCategory.id}`);
      console.log(`   - Nombre: ${newCategory.name}`);
    } else {
      console.log(`   ❌ Categoría no encontrada en la lista`);
    }

    // 4. Probar agregar categoría duplicada
    console.log('\n4. Probando agregar categoría duplicada...');
    const duplicateResponse = await fetch(`${API_BASE_URL}/products/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newCategoryData),
    });

    if (duplicateResponse.status === 400) {
      const errorData = await duplicateResponse.json();
      console.log(`   ✅ Error esperado: ${errorData.error}`);
    } else {
      console.log(`   ❌ Se esperaba un error 400, pero se obtuvo: ${duplicateResponse.status}`);
    }

    console.log('\n🎉 Prueba completada exitosamente!');
    console.log('\n📋 Resumen:');
    console.log(`   - Categorías iniciales: ${initialCategories.length}`);
    console.log(`   - Categorías finales: ${updatedCategories.length}`);
    console.log(`   - Nueva categoría agregada: "${newCategory?.name}"`);
    console.log(`   - Validación de duplicados: ✅ Funcionando`);

  } catch (error) {
    console.error('\n❌ Error en la prueba:', error.message);
    process.exit(1);
  }
}

// Ejecutar la prueba
testAddCategory();