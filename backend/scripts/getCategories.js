const fetch = require('node-fetch');

async function getCategories() {
  try {
    console.log('🔍 Obteniendo categorías de la base de datos...\n');
    
    const response = await fetch('http://localhost:3001/api/products/categories/all');
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    const data = await response.json();
    
    console.log('📋 Categorías encontradas:');
    console.log('========================');
    
    if (data.data && Array.isArray(data.data)) {
      data.data.forEach(category => {
        console.log(`ID: ${category.id} | Nombre: "${category.name}" | Descripción: "${category.description}"`);
      });
      
      console.log('\n🔧 Mapeo correcto para ProductModal:');
      console.log('const categoryMap = {');
      data.data.forEach(category => {
        console.log(`  '${category.name}': ${category.id},`);
      });
      console.log('};');
      
    } else {
      console.log('❌ No se encontraron categorías o formato incorrecto');
      console.log('Datos recibidos:', data);
    }
    
  } catch (error) {
    console.error('❌ Error obteniendo categorías:', error.message);
  }
}

getCategories();