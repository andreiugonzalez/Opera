const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:3001/api';

async function debugDeleteEndpoint() {
  try {
    console.log('🔍 Debug del endpoint DELETE...\n');

    // 1. Verificar que el servidor esté funcionando
    console.log('1. Verificando servidor...');
    const testResponse = await fetch(`${API_BASE_URL}/test`);
    const testResult = await testResponse.json();
    console.log(`   ✅ Servidor funcionando: ${testResult.message}`);

    // 2. Verificar endpoint GET de categorías
    console.log('\n2. Verificando GET /categories/all...');
    const getResponse = await fetch(`${API_BASE_URL}/products/categories/all`);
    console.log(`   Status: ${getResponse.status}`);
    if (getResponse.ok) {
      const getResult = await getResponse.json();
      console.log(`   ✅ GET funciona: ${getResult.data.length} categorías`);
    } else {
      console.log(`   ❌ GET falló: ${getResponse.statusText}`);
    }

    // 3. Verificar endpoint POST de categorías
    console.log('\n3. Verificando POST /categories...');
    const timestamp = Date.now();
    const testCategory = {
      name: `Debug DELETE ${timestamp}`,
      description: 'Categoría para debug'
    };

    const postResponse = await fetch(`${API_BASE_URL}/products/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testCategory),
    });

    console.log(`   Status: ${postResponse.status}`);
    if (postResponse.ok) {
      const postResult = await postResponse.json();
      console.log(`   ✅ POST funciona: Categoría creada con ID ${postResult.data.id}`);
      
      const categoryId = postResult.data.id;

      // 4. Probar diferentes variaciones del DELETE
      console.log('\n4. Probando DELETE con diferentes URLs...');
      
      const deleteUrls = [
        `${API_BASE_URL}/products/categories/${categoryId}`,
        `http://localhost:3001/api/products/categories/${categoryId}`,
        `http://localhost:3001/products/categories/${categoryId}`,
      ];

      for (const url of deleteUrls) {
        console.log(`\n   Probando: ${url}`);
        try {
          const deleteResponse = await fetch(url, {
            method: 'DELETE',
          });
          
          console.log(`   Status: ${deleteResponse.status}`);
          console.log(`   Status Text: ${deleteResponse.statusText}`);
          
          const deleteResult = await deleteResponse.json();
          console.log(`   Response:`, deleteResult);
          
          if (deleteResponse.ok) {
            console.log(`   ✅ DELETE exitoso con esta URL!`);
            return;
          }
        } catch (error) {
          console.log(`   ❌ Error con esta URL: ${error.message}`);
        }
      }

      console.log('\n❌ Ninguna URL funcionó para DELETE');

    } else {
      const postResult = await postResponse.json();
      console.log(`   ❌ POST falló: ${postResult.error}`);
    }

  } catch (error) {
    console.error('\n❌ Error en debug:', error.message);
    console.error('Stack:', error.stack);
  }
}

debugDeleteEndpoint();