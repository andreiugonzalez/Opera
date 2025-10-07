const { executeQuery } = require('../config/database');

async function verifyDatabase() {
  try {
    console.log('🔍 Verificando conexión y estructura de la base de datos...');
    
    // Verificar conexión
    console.log('\n1. Verificando conexión...');
    const connectionTest = await executeQuery('SELECT 1 as test');
    console.log('✅ Conexión exitosa');
    
    // Verificar base de datos actual
    console.log('\n2. Verificando base de datos actual...');
    const currentDb = await executeQuery('SELECT DATABASE() as current_db');
    console.log(`📊 Base de datos actual: ${currentDb[0].current_db}`);
    
    // Verificar si la tabla products existe
    console.log('\n3. Verificando tabla products...');
    const tables = await executeQuery("SHOW TABLES LIKE 'products'");
    if (tables.length > 0) {
      console.log('✅ Tabla products encontrada');
    } else {
      console.log('❌ Tabla products NO encontrada');
      return;
    }
    
    // Verificar estructura de la tabla products
    console.log('\n4. Verificando estructura de la tabla products...');
    const tableStructure = await executeQuery('DESCRIBE products');
    
    console.log('📋 Estructura de la tabla products:');
    tableStructure.forEach(field => {
      console.log(`   ${field.Field}: ${field.Type} (Null: ${field.Null}, Default: ${field.Default})`);
    });
    
    // Verificar específicamente el campo image_url
    console.log('\n5. Verificando campo image_url...');
    const imageUrlField = tableStructure.find(field => field.Field === 'image_url');
    
    if (imageUrlField) {
      console.log(`✅ Campo image_url encontrado: ${imageUrlField.Type}`);
      
      if (imageUrlField.Type.toLowerCase().includes('text')) {
        console.log('✅ El campo es de tipo TEXT - debería soportar URLs largas');
      } else {
        console.log(`⚠️  El campo es de tipo ${imageUrlField.Type} - puede ser demasiado pequeño`);
        
        // Intentar actualizar el campo
        console.log('\n6. Intentando actualizar el campo image_url...');
        await executeQuery('ALTER TABLE products MODIFY COLUMN image_url TEXT');
        console.log('✅ Campo image_url actualizado a TEXT');
      }
    } else {
      console.log('❌ Campo image_url NO encontrado');
    }
    
    // Verificar nuevamente después de la actualización
    console.log('\n7. Verificación final...');
    const finalStructure = await executeQuery('DESCRIBE products');
    const finalImageUrlField = finalStructure.find(field => field.Field === 'image_url');
    console.log(`📝 Campo image_url final: ${finalImageUrlField.Type}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en la verificación:', error);
    process.exit(1);
  }
}

verifyDatabase();