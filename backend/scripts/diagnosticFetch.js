const fetch = require('node-fetch');

async function diagnosticFetch() {
  console.log('🔍 Iniciando diagnóstico de conectividad...\n');
  
  const tests = [
    {
      name: 'Test básico de conexión',
      url: 'http://localhost:3001/api/test',
      method: 'GET'
    },
    {
      name: 'Test de productos (GET)',
      url: 'http://localhost:3001/api/products',
      method: 'GET'
    },
    {
      name: 'Test con headers de frontend',
      url: 'http://localhost:3001/api/products',
      method: 'GET',
      headers: {
        'Origin': 'http://localhost:5173',
        'Content-Type': 'application/json'
      }
    }
  ];

  for (const test of tests) {
    try {
      console.log(`\n📡 ${test.name}:`);
      console.log(`   URL: ${test.url}`);
      console.log(`   Método: ${test.method}`);
      
      const options = {
        method: test.method,
        headers: test.headers || {}
      };
      
      const response = await fetch(test.url, options);
      
      console.log(`   ✅ Status: ${response.status} ${response.statusText}`);
      console.log(`   📋 Headers:`, Object.fromEntries(response.headers.entries()));
      
      if (response.ok) {
        const data = await response.json();
        console.log(`   📦 Datos recibidos: ${JSON.stringify(data).substring(0, 100)}...`);
      } else {
        console.log(`   ❌ Error en respuesta`);
      }
      
    } catch (error) {
      console.log(`   ❌ Error de conexión: ${error.message}`);
      console.log(`   🔍 Tipo de error: ${error.code || 'UNKNOWN'}`);
    }
  }
  
  console.log('\n🏁 Diagnóstico completado');
}

diagnosticFetch().catch(console.error);