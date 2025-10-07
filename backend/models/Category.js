const { executeQuery } = require('../config/database');

class Category {
  // Obtener todas las categorías
  static async getAll() {
    const query = `
      SELECT c.*, COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id AND p.is_available = true
      GROUP BY c.id
      ORDER BY c.name
    `;
    return await executeQuery(query);
  }

  // Obtener categoría por ID
  static async getById(id) {
    const query = 'SELECT * FROM categories WHERE id = ?';
    const results = await executeQuery(query, [id]);
    return results[0];
  }

  // Crear nueva categoría
  static async create(categoryData) {
    const { name, description } = categoryData;
    const query = 'INSERT INTO categories (name, description) VALUES (?, ?)';
    const result = await executeQuery(query, [name, description]);
    return result.insertId;
  }

  // Actualizar categoría
  static async update(id, categoryData) {
    const { name, description } = categoryData;
    const query = 'UPDATE categories SET name = ?, description = ? WHERE id = ?';
    const result = await executeQuery(query, [name, description, id]);
    return result.affectedRows > 0;
  }

  // Eliminar categoría
  static async delete(id) {
    // Verificar si hay productos en esta categoría
    const checkQuery = 'SELECT COUNT(*) as count FROM products WHERE category_id = ? AND is_available = true';
    const [checkResult] = await executeQuery(checkQuery, [id]);
    
    if (checkResult.count > 0) {
      throw new Error('No se puede eliminar la categoría porque tiene productos asociados');
    }
    
    const query = 'DELETE FROM categories WHERE id = ?';
    const result = await executeQuery(query, [id]);
    return result.affectedRows > 0;
  }
}

module.exports = Category;