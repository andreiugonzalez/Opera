const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const Cake = require('../models/Cake');
const { authenticateToken, requireAdmin } = require('./auth');

// Configuración de almacenamiento para subir imágenes de tortas
const uploadsDir = path.join(__dirname, '..', 'uploads', 'cakes');
try { fs.mkdirSync(uploadsDir, { recursive: true }); } catch {}
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, '_');
    cb(null, `${Date.now()}-${safeName}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// GET /api/cakes - listar tortas activas
router.get('/', async (req, res) => {
  try {
    const cakes = await Cake.getAll();
    res.json({ success: true, data: cakes, count: cakes.length });
  } catch (error) {
    console.error('Error al obtener tortas:', error);
    res.status(500).json({ success: false, error: 'Error al obtener tortas', message: error.message });
  }
});

// POST /api/cakes - crear nueva torta (admin)
router.post('/', authenticateToken, requireAdmin, upload.single('image'), async (req, res) => {
  try {
    // Diagnóstico: registrar contenido recibido
    try {
      console.log('📥 POST /api/cakes recibido:', {
        contentType: req.headers['content-type'],
        body: req.body,
        hasFile: !!req.file,
        file: req.file ? { originalname: req.file.originalname, filename: req.file.filename, size: req.file.size } : null
      });
    } catch (logErr) {
      // Evitar romper flujo por errores de logging
      console.warn('⚠️ Error registrando diagnóstico en /api/cakes:', logErr?.message);
    }
    const { name, image_url, price } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'El nombre de la torta es requerido' });
    }
    // Validar precio (obligatorio y numérico positivo). Tratar '.' y ',' como separadores de miles
    const numericPrice = price !== undefined ? parseInt(String(price).replace(/\D/g, ''), 10) : NaN;
    if (Number.isNaN(numericPrice) || numericPrice <= 0) {
      return res.status(400).json({ success: false, error: 'El precio es requerido y debe ser mayor a 0' });
    }
    // Priorizar archivo subido; si no, permitir image_url como fallback
    let finalImageUrl = image_url && image_url.trim() ? image_url.trim() : null;
    if (req.file) {
      finalImageUrl = `/uploads/cakes/${req.file.filename}`;
    }
    if (!finalImageUrl) {
      return res.status(400).json({ success: false, error: 'La imagen de la torta es requerida' });
    }
    const id = await Cake.create({ name: name.trim(), image_url: finalImageUrl, price: numericPrice });
    const cake = await Cake.getById(id);
    res.status(201).json({ success: true, data: cake, message: 'Torta creada exitosamente' });
  } catch (error) {
    console.error('Error al crear torta:', error);
    res.status(500).json({ success: false, error: 'Error al crear torta', message: error.message });
  }
});

// PUT /api/cakes/:id - actualizar torta (admin)
router.put('/:id', authenticateToken, requireAdmin, upload.single('image'), async (req, res) => {
  try {
    const existing = await Cake.getById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Torta no encontrada' });
    }
    const { name, image_url, price, is_active } = req.body || {};
    let finalImageUrl = image_url;
    if (req.file) {
      finalImageUrl = `/uploads/cakes/${req.file.filename}`;
    }
    // Tratar '.' y ',' como separadores de miles en actualización
    const normalizedPrice = price !== undefined && price !== null ? parseInt(String(price).replace(/\D/g, ''), 10) : undefined;
    const updated = await Cake.update(req.params.id, { name, image_url: finalImageUrl, price: normalizedPrice, is_active });
    if (!updated) {
      return res.status(400).json({ success: false, error: 'No se pudo actualizar la torta' });
    }
    const cake = await Cake.getById(req.params.id);
    res.json({ success: true, data: cake, message: 'Torta actualizada exitosamente' });
  } catch (error) {
    console.error('Error al actualizar torta:', error);
    res.status(500).json({ success: false, error: 'Error al actualizar torta', message: error.message });
  }
});

// DELETE /api/cakes/:id - eliminar torta (soft delete) (admin)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const cake = await Cake.getById(req.params.id);
    if (!cake) {
      return res.status(404).json({ success: false, error: 'Torta no encontrada' });
    }
    const deleted = await Cake.delete(req.params.id);
    if (!deleted) {
      return res.status(400).json({ success: false, error: 'No se pudo eliminar la torta' });
    }
    res.json({ success: true, message: 'Torta eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar torta:', error);
    res.status(500).json({ success: false, error: 'Error al eliminar torta', message: error.message });
  }
});

module.exports = router;