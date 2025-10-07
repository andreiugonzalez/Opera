// 🔍 Script de diagnóstico para ejecutar en la consola del navegador
// Copia y pega este código en la consola del navegador (F12 -> Console)

console.log('🔍 Iniciando diagnóstico del error "Failed to fetch"...\n');

async function diagnosticoBrowser() {
  try {
    // Test 1: Verificar conectividad básica
    console.log('1️⃣ Test de conectividad básica...');
    const testResponse = await fetch('http://localhost:3001/api/test');
    console.log('✅ Conectividad básica OK:', testResponse.status);
    
    // Test 2: Cargar productos
    console.log('\n2️⃣ Test de carga de productos...');
    const productsResponse = await fetch('http://localhost:3001/api/products');
    console.log('✅ Carga de productos OK:', productsResponse.status);
    const products = await productsResponse.json();
    console.log('📦 Productos cargados:', products.data?.length || 0);
    
    // Test 3: Editar un producto (simulando el error)
    if (products.data && products.data.length > 0) {
      console.log('\n3️⃣ Test de edición de producto...');
      const product = products.data[0];
      console.log('📝 Editando producto:', product.id, product.name);
      
      const editData = {
        name: product.name + ' (test)',
        description: product.description,
        price: parseFloat(product.price) + 0.01,
        category_id: product.category_id,
        image_url: product.image_url,
        stock_quantity: (product.stock_quantity || 0) + 1
      };
      
      const editResponse = await fetch(`http://localhost:3001/api/products/${product.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editData)
      });
      
      console.log('✅ Edición OK:', editResponse.status);
      const result = await editResponse.json();
      console.log('📊 Resultado:', result);
    }
    
    console.log('\n🎉 Todos los tests pasaron correctamente');
    console.log('💡 Si ves este mensaje, el problema puede estar en:');
    console.log('   - Una petición específica que no estamos probando');
    console.log('   - Un timing issue en el frontend');
    console.log('   - Un problema con el estado de React');
    
  } catch (error) {
    console.log('\n❌ ERROR ENCONTRADO:');
    console.log('Mensaje:', error.message);
    console.log('Tipo:', error.name);
    console.log('Stack:', error.stack);
    
    // Análisis específico del error
    if (error.message.includes('Failed to fetch')) {
      console.log('\n🔍 Análisis del "Failed to fetch":');
      console.log('Este error puede indicar:');
      console.log('1. El servidor backend no está corriendo');
      console.log('2. Problema de CORS');
      console.log('3. URL incorrecta');
      console.log('4. Problema de red/firewall');
      console.log('5. El navegador está bloqueando la petición');
    }
  }
}

// Ejecutar el diagnóstico
diagnosticoBrowser();

// También proporcionar funciones individuales para testing manual
window.testAPI = {
  async testConnection() {
    try {
      const response = await fetch('http://localhost:3001/api/test');
      console.log('Test connection:', response.status, await response.json());
    } catch (e) {
      console.error('Connection failed:', e);
    }
  },
  
  async testProducts() {
    try {
      const response = await fetch('http://localhost:3001/api/products');
      console.log('Test products:', response.status);
      const data = await response.json();
      console.log('Products count:', data.data?.length);
      return data;
    } catch (e) {
      console.error('Products failed:', e);
    }
  },
  
  async testEdit(productId, changes = {}) {
    try {
      const response = await fetch(`http://localhost:3001/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(changes)
      });
      console.log('Test edit:', response.status);
      return await response.json();
    } catch (e) {
      console.error('Edit failed:', e);
    }
  }
};

console.log('\n💡 También puedes usar:');
console.log('testAPI.testConnection() - Para probar conexión');
console.log('testAPI.testProducts() - Para probar carga de productos');
console.log('testAPI.testEdit(7, {name: "test"}) - Para probar edición');