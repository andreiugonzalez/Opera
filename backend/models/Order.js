const { executeQuery } = require('../config/database');

class Order {
  // Crear nuevo pedido
  static async create(orderData) {
    const { customer_name, customer_email, customer_phone, customer_address, total_amount, delivery_date, notes, items } = orderData;
    
    try {
      // Iniciar transacción
      await executeQuery('START TRANSACTION');
      
      // Insertar pedido
      const orderQuery = `
        INSERT INTO orders (customer_name, customer_email, customer_phone, customer_address, total_amount, delivery_date, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      const orderResult = await executeQuery(orderQuery, [customer_name, customer_email, customer_phone, customer_address, total_amount, delivery_date, notes]);
      const orderId = orderResult.insertId;
      
      // Insertar items del pedido
      for (const item of items) {
        const itemQuery = `
          INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal)
          VALUES (?, ?, ?, ?, ?)
        `;
        await executeQuery(itemQuery, [orderId, item.product_id, item.quantity, item.unit_price, item.subtotal]);
      }
      
      // Confirmar transacción
      await executeQuery('COMMIT');
      
      return orderId;
    } catch (error) {
      // Revertir transacción en caso de error
      await executeQuery('ROLLBACK');
      throw error;
    }
  }

  // Obtener todos los pedidos
  static async getAll() {
    const query = `
      SELECT o.*, 
             COUNT(oi.id) as total_items,
             GROUP_CONCAT(CONCAT(p.name, ' (', oi.quantity, ')') SEPARATOR ', ') as items_summary
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `;
    return await executeQuery(query);
  }

  // Obtener pedido por ID con detalles
  static async getById(id) {
    const orderQuery = 'SELECT * FROM orders WHERE id = ?';
    const itemsQuery = `
      SELECT oi.*, p.name as product_name, p.image_url
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `;
    
    const [order] = await executeQuery(orderQuery, [id]);
    if (!order) return null;
    
    const items = await executeQuery(itemsQuery, [id]);
    
    return {
      ...order,
      items
    };
  }

  // Actualizar estado del pedido
  static async updateStatus(id, status) {
    const query = 'UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    const result = await executeQuery(query, [status, id]);
    return result.affectedRows > 0;
  }

  // Obtener pedidos por estado
  static async getByStatus(status) {
    const query = `
      SELECT o.*, 
             COUNT(oi.id) as total_items,
             GROUP_CONCAT(CONCAT(p.name, ' (', oi.quantity, ')') SEPARATOR ', ') as items_summary
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE o.status = ?
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `;
    return await executeQuery(query, [status]);
  }

  // Obtener estadísticas de pedidos
  static async getStats() {
    const queries = {
      total: 'SELECT COUNT(*) as count FROM orders',
      pending: 'SELECT COUNT(*) as count FROM orders WHERE status = "pending"',
      confirmed: 'SELECT COUNT(*) as count FROM orders WHERE status = "confirmed"',
      delivered: 'SELECT COUNT(*) as count FROM orders WHERE status = "delivered"',
      totalRevenue: 'SELECT SUM(total_amount) as total FROM orders WHERE status = "delivered"',
      todayOrders: 'SELECT COUNT(*) as count FROM orders WHERE DATE(created_at) = CURDATE()'
    };

    const stats = {};
    for (const [key, query] of Object.entries(queries)) {
      const [result] = await executeQuery(query);
      stats[key] = result.count || result.total || 0;
    }

    return stats;
  }
}

module.exports = Order;