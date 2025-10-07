const { executeQuery } = require('../config/database');

class Product {
  // Obtener todos los productos
  static async getAll() {
    const query = `
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE p.is_available = true
      ORDER BY p.created_at DESC
    `;
    return await executeQuery(query);
  }

  // Obtener producto por ID
  static async getById(id) {
    const query = `
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE p.id = ?
    `;
    const results = await executeQuery(query, [id]);
    return results[0];
  }

  // Crear nuevo producto
  static async create(productData) {
    const { name, description, price, category_id, image_url, stock_quantity } = productData;
    const query = `
      INSERT INTO products (name, description, price, category_id, image_url, stock_quantity)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const result = await executeQuery(query, [
      name || null,
      description || null,
      price || 0,
      category_id || null,
      image_url || null,
      stock_quantity || 0
    ]);
    return result.insertId;
  }

  // Actualizar producto
  static async update(id, productData) {
    const { name, description, price, category_id, image_url, stock_quantity, is_available } = productData;
    const query = `
      UPDATE products 
      SET name = ?, description = ?, price = ?, category_id = ?, 
          image_url = ?, stock_quantity = ?, is_available = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    const result = await executeQuery(query, [
      name || null,
      description || null,
      price || 0,
      category_id || null,
      image_url || null,
      stock_quantity || 0,
      is_available !== undefined ? is_available : true,
      id
    ]);
    return result.affectedRows > 0;
  }

  // Eliminar producto
  static async delete(id) {
    const query = 'UPDATE products SET is_available = false WHERE id = ?';
    const result = await executeQuery(query, [id]);
    return result.affectedRows > 0;
  }

  // Buscar productos
  static async search(searchTerm) {
    const query = `
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE p.is_available = true 
      AND (p.name LIKE ? OR p.description LIKE ? OR c.name LIKE ?)
      ORDER BY p.created_at DESC
    `;
    const searchPattern = `%${searchTerm}%`;
    return await executeQuery(query, [searchPattern, searchPattern, searchPattern]);
  }

  // Obtener productos por categoría
  static async getByCategory(categoryId) {
    const query = `
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE p.category_id = ? AND p.is_available = true
      ORDER BY p.created_at DESC
    `;
    return await executeQuery(query, [categoryId]);
  }
}

module.exports = Product;