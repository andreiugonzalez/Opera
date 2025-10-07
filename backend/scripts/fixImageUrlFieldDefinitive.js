const { executeQuery } = require('../config/database');

async function fixImageUrlField() {
  try {
    console.log('🔧 Iniciando corrección definitiva del campo image_url...');
    
    // 1. Verificar conexión
    console.log('\n1. Verificando conexión...');
    await executeQuery('SELECT 1');
    console.log('✅ Conexión exitosa');
    
    // 2. Verificar base de datos actual
    console.log('\n2. Verificando base de datos actual...');
    const currentDb = await executeQuery('SELECT DATABASE() as current_db');
    console.log(`📊 Base de datos actual: ${currentDb[0].current_db}`);
    
    // 3. Verificar estructura actual
    console.log('\n3. Verificando estructura actual...');
    const currentStructure = await executeQuery('DESCRIBE products');
    const imageUrlField = currentStructure.find(field => field.Field === 'image_url');
    
    if (imageUrlField) {
      console.log(`📋 Campo image_url actual: ${imageUrlField.Type}`);
    } else {
      console.log('❌ Campo image_url no encontrado');
      return;
    }
    
    // 4. Forzar actualización del campo
    console.log('\n4. Forzando actualización del campo...');
    
    // Primero, intentar con LONGTEXT para asegurar que sea suficientemente grande
    try {
      await executeQuery('ALTER TABLE products MODIFY COLUMN image_url LONGTEXT');
      console.log('✅ Campo actualizado a LONGTEXT');
    } catch (error) {
      console.log('⚠️  Error con LONGTEXT, intentando con TEXT...');
      await executeQuery('ALTER TABLE products MODIFY COLUMN image_url TEXT');
      console.log('✅ Campo actualizado a TEXT');
    }
    
    // 5. Verificar el cambio
    console.log('\n5. Verificando el cambio...');
    const newStructure = await executeQuery('DESCRIBE products');
    const newImageUrlField = newStructure.find(field => field.Field === 'image_url');
    console.log(`📝 Campo image_url actualizado: ${newImageUrlField.Type}`);
    
    // 6. Probar inserción con datos largos
    console.log('\n6. Probando inserción con datos largos...');
    const testImageUrl = 'data:image/jpeg;base64,' + 'A'.repeat(100000); // 100KB de datos de prueba
    
    try {
      const testResult = await executeQuery(
        'INSERT INTO products (name, description, price, category_id, image_url, stock_quantity) VALUES (?, ?, ?, ?, ?, ?)',
        ['TEST_PRODUCT', 'Producto de prueba', 10.00, 1, testImageUrl, 0]
      );
      
      console.log('✅ Inserción de prueba exitosa');
      
      // Eliminar el producto de prueba
      await executeQuery('DELETE FROM products WHERE id = ?', [testResult.insertId]);
      console.log('🗑️  Producto de prueba eliminado');
      
    } catch (error) {
      console.log('❌ Error en inserción de prueba:', error.message);
      
      // Si aún falla, intentar con MEDIUMTEXT
      console.log('\n7. Intentando con MEDIUMTEXT...');
      await executeQuery('ALTER TABLE products MODIFY COLUMN image_url MEDIUMTEXT');
      console.log('✅ Campo actualizado a MEDIUMTEXT');
      
      // Verificar nuevamente
      const finalStructure = await executeQuery('DESCRIBE products');
      const finalImageUrlField = finalStructure.find(field => field.Field === 'image_url');
      console.log(`📝 Campo image_url final: ${finalImageUrlField.Type}`);
    }
    
    console.log('\n🎉 Corrección completada exitosamente');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error en la corrección:', error);
    process.exit(1);
  }
}

fixImageUrlField();