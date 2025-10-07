const { executeQuery } = require('../config/database');

async function updateImageUrlField() {
  try {
    console.log('🔧 Actualizando el campo image_url en la tabla products...');
    
    // Aumentar el tamaño del campo image_url para soportar URLs más largas (incluyendo data URLs)
    const alterQuery = `
      ALTER TABLE products 
      MODIFY COLUMN image_url TEXT
    `;
    
    await executeQuery(alterQuery);
    
    console.log('✅ Campo image_url actualizado exitosamente');
    console.log('📝 El campo ahora soporta URLs de cualquier longitud');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al actualizar el campo image_url:', error);
    process.exit(1);
  }
}

updateImageUrlField();