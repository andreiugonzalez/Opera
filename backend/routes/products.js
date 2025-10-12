const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Category = require('../models/Category');
const { authenticateToken, requireAdmin } = require('./auth');

// GET /api/products - Obtener todos los productos
router.get('/', async (req, res) => {
  try {
    const { search, category } = req.query;
    
    let products;
    if (search) {
      products = await Product.search(search);
    } else if (category) {
      products = await Product.getByCategory(category);
    } else {
      products = await Product.getAll();
    }
    
    res.json({
      success: true,
      data: products,
      count: products.length
    });
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener productos',
      message: error.message
    });
  }
});

// RUTAS DE CATEGORÍAS (deben ir antes de la ruta dinámica '/:id')
// GET /api/products/categories/all - Obtener todas las categorías
router.get('/categories/all', async (req, res) => {
  try {
    const categories = await Category.getAll();
    
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener categorías',
      message: error.message
    });
  }
});

// POST /api/products/categories - Crear nueva categoría
router.post('/categories', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, description } = req.body;
    
    // Validaciones básicas
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        error: 'El nombre de la categoría es requerido'
      });
    }
    
    // Verificar si ya existe una categoría con ese nombre
    const categories = await Category.getAll();
    const existingCategory = categories.find(cat => 
      cat.name.toLowerCase() === name.trim().toLowerCase()
    );
    
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        error: 'Ya existe una categoría con ese nombre'
      });
    }
    
    const categoryId = await Category.create({
      name: name.trim(),
      description: description?.trim() || ''
    });
    
    const newCategory = await Category.getById(categoryId);
    
    res.status(201).json({
      success: true,
      data: newCategory,
      message: 'Categoría creada exitosamente'
    });
  } catch (error) {
    console.error('Error al crear categoría:', error);
    res.status(500).json({
      success: false,
      error: 'Error al crear categoría',
      message: error.message
    });
  }
});

// GET /api/products/:id - Obtener producto por ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.getById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Producto no encontrado'
      });
    }
    
    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Error al obtener producto:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener producto',
      message: error.message
    });
  }
});

// POST /api/products - Crear nuevo producto
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, description, price, category_id, image_url, stock_quantity } = req.body;
    
    // Validaciones básicas
    if (!name || !price) {
      return res.status(400).json({
        success: false,
        error: 'Nombre y precio son requeridos'
      });
    }
    
    if (price <= 0) {
      return res.status(400).json({
        success: false,
        error: 'El precio debe ser mayor a 0'
      });
    }
    
    const productId = await Product.create({
      name,
      description,
      price: parseFloat(price),
      category_id: category_id || null,
      image_url,
      stock_quantity: parseInt(stock_quantity) || 0
    });
    
    const newProduct = await Product.getById(productId);
    
    res.status(201).json({
      success: true,
      data: newProduct,
      message: 'Producto creado exitosamente'
    });
  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).json({
      success: false,
      error: 'Error al crear producto',
      message: error.message
    });
  }
});

// PUT /api/products/:id - Actualizar producto
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    console.log('🔄 PUT /api/products/:id - Datos recibidos:', {
      id: req.params.id,
      body: req.body
    });
    
    const { name, description, price, category_id, image_url, stock_quantity, is_available } = req.body;
    
    // Verificar que el producto existe
    const existingProduct = await Product.getById(req.params.id);
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        error: 'Producto no encontrado'
      });
    }
    
    // Validaciones
    if (price && price <= 0) {
      return res.status(400).json({
        success: false,
        error: 'El precio debe ser mayor a 0'
      });
    }
    
    // Log detallado del precio
    console.log('💰 Procesando precio:', {
      priceOriginal: price,
      priceType: typeof price,
      priceFloat: price ? parseFloat(price) : null,
      existingPrice: existingProduct.price
    });

    const processedPrice = price ? parseFloat(price) : existingProduct.price;
    
    // Validar que el precio esté en el rango válido para DECIMAL(10,2)
    if (processedPrice && (processedPrice < 0 || processedPrice > 99999999.99)) {
      console.log('❌ Precio fuera de rango:', processedPrice);
      return res.status(400).json({
        success: false,
        error: 'Precio fuera de rango válido',
        message: `El precio ${processedPrice} está fuera del rango permitido (0 - 99,999,999.99)`
      });
    }

    const updated = await Product.update(req.params.id, {
      name: name || existingProduct.name,
      description: description || existingProduct.description,
      price: processedPrice,
      category_id: category_id !== undefined ? category_id : existingProduct.category_id,
      image_url: image_url !== undefined ? image_url : existingProduct.image_url,
      stock_quantity: stock_quantity !== undefined ? parseInt(stock_quantity) : existingProduct.stock_quantity,
      is_available: is_available !== undefined ? is_available : existingProduct.is_available
    });
    
    if (!updated) {
      return res.status(400).json({
        success: false,
        error: 'No se pudo actualizar el producto'
      });
    }
    
    const updatedProduct = await Product.getById(req.params.id);
    
    res.json({
      success: true,
      data: updatedProduct,
      message: 'Producto actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(500).json({
      success: false,
      error: 'Error al actualizar producto',
      message: error.message
    });
  }
});

// DELETE /api/products/:id - Eliminar producto (soft delete)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const product = await Product.getById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Producto no encontrado'
      });
    }
    
    const deleted = await Product.delete(req.params.id);
    
    if (!deleted) {
      return res.status(400).json({
        success: false,
        error: 'No se pudo eliminar el producto'
      });
    }
    
    res.json({
      success: true,
      message: 'Producto eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({
      success: false,
      error: 'Error al eliminar producto',
      message: error.message
    });
  }
});

// (Rutas de categorías reubicadas arriba)

// DELETE /api/products/categories/:id - Eliminar categoría
router.delete('/categories/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validar que el ID sea un número válido
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        error: 'ID de categoría inválido'
      });
    }
    
    // Verificar que la categoría existe
    const category = await Category.getById(parseInt(id));
    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Categoría no encontrada'
      });
    }
    
    // Intentar eliminar la categoría (el modelo ya valida productos asociados)
    const deleted = await Category.delete(parseInt(id));
    
    if (deleted) {
      res.json({
        success: true,
        message: 'Categoría eliminada exitosamente'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'No se pudo eliminar la categoría'
      });
    }
  } catch (error) {
    console.error('Error al eliminar categoría:', error);
    
    // Si el error es por productos asociados, devolver error 400
    if (error.message.includes('productos asociados')) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Error al eliminar categoría',
      message: error.message
    });
  }
});

module.exports = router;