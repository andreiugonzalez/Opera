const fetch = require('node-fetch');

async function simulateBrowserFetch() {
  console.log('🌐 Simulando peticiones del navegador...\n');
  
  try {
    // 1. Simular carga inicial de productos (como lo hace useEffect)
    console.log('1️⃣ Cargando productos iniciales...');
    const loadResponse = await fetch('http://localhost:3001/api/products', {
      method: 'GET',
      headers: {
        'Origin': 'http://localhost:5173',
        'Referer': 'http://localhost:5173/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (!loadResponse.ok) {
      throw new Error(`Error cargando productos: ${loadResponse.status}`);
    }
    
    const productsData = await loadResponse.json();
    console.log(`   ✅ Productos cargados: ${productsData.data?.length || 0} productos`);
    
    // 2. Simular edición de producto (como lo hace editProduct)
    if (productsData.data && productsData.data.length > 0) {
      const firstProduct = productsData.data[0];
      console.log(`\n2️⃣ Editando producto ID: ${firstProduct.id}`);
      
      const editData = {
        name: firstProduct.name + ' (editado)',
        description: firstProduct.description,
        price: parseFloat(firstProduct.price) + 1,
        category_id: firstProduct.category_id,
        image_url: firstProduct.image_url,
        stock_quantity: (firstProduct.stock_quantity || 0) + 1
      };
      
      console.log('   📝 Datos a enviar:', {
        ...editData,
        image_url: editData.image_url ? '[imagen presente]' : 'null'
      });
      
      const editResponse = await fetch(`http://localhost:3001/api/products/${firstProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'http://localhost:5173',
          'Referer': 'http://localhost:5173/',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        body: JSON.stringify(editData)
      });
      
      console.log(`   📡 Status de respuesta: ${editResponse.status}`);
      
      if (!editResponse.ok) {
        const errorText = await editResponse.text();
        console.log(`   ❌ Error: ${errorText}`);
        throw new Error(`Error editando producto: ${editResponse.status}`);
      }
      
      const editResult = await editResponse.json();
      console.log('   ✅ Producto editado exitosamente');
      console.log('   📦 Resultado:', {
        id: editResult.data?.id,
        name: editResult.data?.name,
        price: editResult.data?.price
      });
      
      // 3. Verificar que el producto se actualizó
      console.log('\n3️⃣ Verificando actualización...');
      const verifyResponse = await fetch('http://localhost:3001/api/products', {
        method: 'GET',
        headers: {
          'Origin': 'http://localhost:5173',
          'Referer': 'http://localhost:5173/'
        }
      });
      
      if (verifyResponse.ok) {
        const verifyData = await verifyResponse.json();
        const updatedProduct = verifyData.data?.find(p => p.id === firstProduct.id);
        if (updatedProduct) {
          console.log('   ✅ Producto verificado en la lista');
          console.log('   📊 Nuevo nombre:', updatedProduct.name);
        }
      }
    }
    
    console.log('\n🎉 Simulación completada exitosamente');
    
  } catch (error) {
    console.log('\n❌ Error en la simulación:');
    console.log('   Mensaje:', error.message);
    console.log('   Código:', error.code || 'N/A');
    console.log('   Stack:', error.stack?.split('\n')[0]);
    
    // Información adicional para debugging
    if (error.message.includes('fetch')) {
      console.log('\n🔍 Posibles causas del "Failed to fetch":');
      console.log('   - Servidor backend no está corriendo');
      console.log('   - Puerto incorrecto (debería ser 3001)');
      console.log('   - Problema de CORS');
      console.log('   - Firewall bloqueando la conexión');
      console.log('   - Problema de red local');
    }
  }
}

simulateBrowserFetch();