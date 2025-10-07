const { executeQuery } = require('../config/database');

class Cake {
  // Obtener todas las tortas activas
  static async getAll() {
    const query = `
      SELECT id, name, image_url, price, is_active, created_at, updated_at
      FROM cakes
      WHERE is_active = true
      ORDER BY created_at DESC
    `;
    return await executeQuery(query);
  }

  // Actualizar torta
  static async update(id, cakeData) {
    const { name, image_url, price, is_active } = cakeData;
    const query = `
      UPDATE cakes
      SET 
        name = COALESCE(?, name),
        image_url = COALESCE(?, image_url),
        price = COALESCE(?, price),
        is_active = COALESCE(?, is_active),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    const result = await executeQuery(query, [
      name !== undefined ? name : null,
      image_url !== undefined ? image_url : null,
      price !== undefined ? price : null,
      typeof is_active === 'boolean' ? is_active : null,
      id
    ]);
    return result.affectedRows > 0;
  }

  // Crear nueva torta
  static async create(cakeData) {
    const { name, image_url, price = 0 } = cakeData;
    const query = `
      INSERT INTO cakes (name, image_url, price, is_active, created_at, updated_at)
      VALUES (?, ?, ?, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `;
    const result = await executeQuery(query, [name || null, image_url || null, price]);
    return result.insertId;
  }

  // Eliminar torta (soft delete)
  static async delete(id) {
    const query = `
      UPDATE cakes
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    const result = await executeQuery(query, [id]);
    return result.affectedRows > 0;
  }

  // Obtener por ID
  static async getById(id) {
    const query = `
      SELECT id, name, image_url, price, is_active, created_at, updated_at
      FROM cakes
      WHERE id = ?
    `;
    const rows = await executeQuery(query, [id]);
    return rows[0] || null;
  }
}

module.exports = Cake;