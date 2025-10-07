const { executeQuery } = require('../config/database');

async function checkImageUrlField() {
  try {
    console.log('🔍 Verificando la estructura del campo image_url...');
    
    // Consultar la estructura de la tabla products
    const describeQuery = 'DESCRIBE products';
    const tableStructure = await executeQuery(describeQuery);
    
    // Buscar el campo image_url
    const imageUrlField = tableStructure.find(field => field.Field === 'image_url');
    
    if (imageUrlField) {
      console.log('✅ Campo image_url encontrado:');
      console.log(`   Tipo: ${imageUrlField.Type}`);
      console.log(`   Null: ${imageUrlField.Null}`);
      console.log(`   Default: ${imageUrlField.Default}`);
      
      if (imageUrlField.Type.toLowerCase().includes('text')) {
        console.log('✅ El campo image_url está correctamente configurado como TEXT');
      } else {
        console.log('⚠️  El campo image_url NO es de tipo TEXT');
        console.log('   Esto puede causar problemas con URLs largas');
      }
    } else {
      console.log('❌ Campo image_url no encontrado');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al verificar el campo image_url:', error);
    process.exit(1);
  }
}

checkImageUrlField();