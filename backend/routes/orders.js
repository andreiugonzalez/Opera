const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const Order = require('../models/Order');

// GET /api/orders - Obtener todos los pedidos
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    
    let orders;
    if (status) {
      orders = await Order.getByStatus(status);
    } else {
      orders = await Order.getAll();
    }
    
    res.json({
      success: true,
      data: orders,
      count: orders.length
    });
  } catch (error) {
    console.error('Error al obtener pedidos:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener pedidos',
      message: error.message
    });
  }
});

// GET /api/orders/:id - Obtener pedido por ID con detalles
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.getById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Pedido no encontrado'
      });
    }
    
    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error al obtener pedido:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener pedido',
      message: error.message
    });
  }
});

// POST /api/orders - Crear nuevo pedido
router.post('/', async (req, res) => {
  try {
    const { customer_name, customer_email, customer_phone, customer_address, delivery_date, notes, items } = req.body;
    
    // Validaciones básicas
    if (!customer_name) {
      return res.status(400).json({
        success: false,
        error: 'El nombre del cliente es requerido'
      });
    }
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'El pedido debe tener al menos un producto'
      });
    }
    
    // Validar items
    for (const item of items) {
      if (!item.product_id || !item.quantity || !item.unit_price) {
        return res.status(400).json({
          success: false,
          error: 'Cada item debe tener product_id, quantity y unit_price'
        });
      }
      
      if (item.quantity <= 0 || item.unit_price <= 0) {
        return res.status(400).json({
          success: false,
          error: 'La cantidad y precio deben ser mayores a 0'
        });
      }
      
      // Calcular subtotal
      item.subtotal = item.quantity * item.unit_price;
    }
    
    // Calcular total
    const total_amount = items.reduce((sum, item) => sum + item.subtotal, 0);
    
    const orderId = await Order.create({
      customer_name,
      customer_email,
      customer_phone,
      customer_address,
      total_amount,
      delivery_date,
      notes,
      items
    });
    
    const newOrder = await Order.getById(orderId);
    
    res.status(201).json({
      success: true,
      data: newOrder,
      message: 'Pedido creado exitosamente'
    });
  } catch (error) {
    console.error('Error al crear pedido:', error);
    res.status(500).json({
      success: false,
      error: 'Error al crear pedido',
      message: error.message
    });
  }
});

// PUT /api/orders/:id/status - Actualizar estado del pedido
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Estado inválido. Estados válidos: ' + validStatuses.join(', ')
      });
    }
    
    // Verificar que el pedido existe
    const existingOrder = await Order.getById(req.params.id);
    if (!existingOrder) {
      return res.status(404).json({
        success: false,
        error: 'Pedido no encontrado'
      });
    }
    
    const updated = await Order.updateStatus(req.params.id, status);
    
    if (!updated) {
      return res.status(400).json({
        success: false,
        error: 'No se pudo actualizar el estado del pedido'
      });
    }
    
    const updatedOrder = await Order.getById(req.params.id);
    
    res.json({
      success: true,
      data: updatedOrder,
      message: `Estado del pedido actualizado a: ${status}`
    });
  } catch (error) {
    console.error('Error al actualizar estado del pedido:', error);
    res.status(500).json({
      success: false,
      error: 'Error al actualizar estado del pedido',
      message: error.message
    });
  }
});

// GET /api/orders/stats/summary - Obtener estadísticas de pedidos
router.get('/stats/summary', async (req, res) => {
  try {
    const stats = await Order.getStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener estadísticas',
      message: error.message
    });
  }
});

// POST /api/orders/pdf - Generar PDF del pedido con imagen y datos
router.post('/pdf', async (req, res) => {
  try {
    const { selectedImageUrl, plantillaUrl, cake_title, centimeters, cake_quantity, customer_name, customer_phone, customer_full_name, order_for_name, pickup_ack, date_time, notes, minimal } = req.body;

    const sanitize = (s) => (s || '')
      .toString()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9-_ ]+/g, '')
      .trim().replace(/\s+/g, '_')
      .slice(0, 50);
    const baseName = `pedido-opera_${sanitize(cake_title) || 'torta'}_${sanitize(customer_full_name || customer_name) || 'cliente'}`;

    // Crear documento PDF y pipe a la respuesta
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${baseName}.pdf"`);
    doc.pipe(res);

    // Fondo de plantilla: PlantillaPedido.jpg
    {
      let plantillaCargada = false;
      // 0) Si viene plantillaUrl del frontend, intentar usarla primero
      if (plantillaUrl && !plantillaCargada) {
        try {
          const respTpl0 = await fetch(plantillaUrl);
          if (respTpl0.ok) {
            const bufferTpl0 = await respTpl0.buffer();
            doc.image(bufferTpl0, 0, 0, { width: doc.page.width, height: doc.page.height });
            plantillaCargada = true;
          }
        } catch {}
      }
      // 1) Buscar en backend/assets
      try {
        if (!plantillaCargada) {
          const plantillaPath1 = path.join(__dirname, '..', 'assets', 'PlantillaPedido.jpg');
          if (fs.existsSync(plantillaPath1)) {
            doc.image(plantillaPath1, 0, 0, { width: doc.page.width, height: doc.page.height });
            plantillaCargada = true;
          }
        }
      } catch {}

      // 2) Buscar en public/imagenes
      if (!plantillaCargada) {
        try {
          const plantillaPath2 = path.join(__dirname, '..', '..', 'public', 'imagenes', 'PlantillaPedido.jpg');
          if (fs.existsSync(plantillaPath2)) {
            doc.image(plantillaPath2, 0, 0, { width: doc.page.width, height: doc.page.height });
            plantillaCargada = true;
          }
        } catch {}
      }

      // 3) Intentar descargar desde el frontend
      if (!plantillaCargada) {
        try {
          const frontend = process.env.FRONTEND_URL || 'http://localhost:5173';
          const respTpl = await fetch(`${frontend}/imagenes/PlantillaPedido.jpg`);
          if (respTpl.ok) {
            const bufferTpl = await respTpl.buffer();
            doc.image(bufferTpl, 0, 0, { width: doc.page.width, height: doc.page.height });
            plantillaCargada = true;
          }
        } catch {}
      }
      // Si no se encuentra plantilla, continuar sin bloquear
    }

    // Encabezado (fecha/hora) y panel blanco con altura dinámica
    const headerDateStr = (() => {
      try {
        const base = date_time ? new Date(date_time) : new Date();
        return new Intl.DateTimeFormat('es-CL', {
          dateStyle: 'medium',
          timeStyle: 'short',
          hour12: true
        }).format(base);
      } catch {
        return new Date().toLocaleString('es-CL');
      }
    })();

    let panelX, panelY, panelW, panelH;
    const panelPadding = { top: 24, right: 24, bottom: 24, left: 24 };
    panelW = Math.round(doc.page.width * 0.8);
    const contentWMeasure = panelW - 260; // columna izquierda (texto)

    // Calcular alturas aproximadas del contenido
    const dateBoxW = 220;
    doc.fontSize(12);
    const dateBoxH = doc.heightOfString(headerDateStr, { width: dateBoxW });
    let titleH = 0;
    if (cake_title) {
      doc.fontSize(16);
      titleH = doc.heightOfString(`Torta: ${cake_title}`, { width: contentWMeasure });
    }
    doc.fontSize(14);
    const centH = doc.heightOfString(`Centímetros de torta: ${centimeters || '-' } cm`, { width: contentWMeasure });

    doc.fontSize(12);
    // Medir solo los campos que se renderizan (sin fecha/hora, ya va en el encabezado)
    const measureFields = [
      ['Nombre completo', customer_full_name || customer_name || '-'],
      ['Teléfono', customer_phone || '-'],
      ['A nombre de', order_for_name || '-'],
      ['Confirmación retiro en local', pickup_ack ? 'Sí' : 'No'],
      ['Notas', notes || '-'],
    ];
    const fieldsHeights = measureFields.map(([label, value]) => doc.heightOfString(`${label}: ${value}`, { width: contentWMeasure }));
    const fieldsTotalH = fieldsHeights.reduce((a, b) => a + b, 0);

    // Nota eliminada, no considerar su altura
    doc.fontSize(11);
    const reminderH = 0;

    const cakeBoxH = 140;
    const topOffset = panelPadding.top + dateBoxH + 12;
    const contentBlockH = (titleH ? titleH + 6 : 0) + centH + 6 + fieldsTotalH + 10 + reminderH;
    const panelContentH = topOffset + Math.max(contentBlockH, cakeBoxH + 8) + panelPadding.bottom;
    panelH = Math.ceil(panelContentH);

    // Posicionar panel centrado
    panelX = Math.round((doc.page.width - panelW) / 2);
    panelY = Math.round((doc.page.height - panelH) / 2);

    // Dibujar panel
    try {
      doc.save();
      if (typeof doc.opacity === 'function') doc.opacity(0.94);
      if (typeof doc.roundedRect === 'function') {
        doc.roundedRect(panelX, panelY, panelW, panelH, 16).fill('#FFFFFF');
      } else {
        doc.rect(panelX, panelY, panelW, panelH).fill('#FFFFFF');
      }
      if (typeof doc.opacity === 'function') doc.opacity(1);
      doc.restore();
    } catch {}

    // Fecha/hora arriba a la derecha dentro del panel
    const dateX = panelX + panelW - panelPadding.right - dateBoxW;
    const dateY = panelY + panelPadding.top;
    doc.fontSize(12).fillColor('#6b7280').text(headerDateStr, dateX, dateY, { width: dateBoxW, align: 'right' });

    // Contenido dentro del panel
    const contentX = panelX + panelPadding.left;
    let cursorY = panelY + panelPadding.top + dateBoxH + 12;

    // Colocar imagen de la torta elegida dentro del panel, en la parte superior derecha
    {
      const cakeBox = { x: panelX + panelW - panelPadding.right - 180, y: panelY + panelPadding.top + dateBoxH + 12, w: 180, h: 140 };
      let cakePlaced = false;
      if (selectedImageUrl) {
        // 1) Intentar descargar desde URL absoluta
        try {
          const respCake = await fetch(selectedImageUrl);
          if (respCake.ok) {
            const bufferCake = await respCake.buffer();
            doc.image(bufferCake, cakeBox.x, cakeBox.y, { fit: [cakeBox.w, cakeBox.h] });
            cakePlaced = true;
          }
        } catch {}

        // 2) Intentar leer local desde public (si selectedImageUrl es relativo)
        if (!cakePlaced) {
          try {
            const urlObj = (() => { try { return new URL(selectedImageUrl); } catch { return null; } })();
            const pathname = urlObj ? urlObj.pathname : selectedImageUrl;
            const sanitizedPath = decodeURIComponent(pathname || '').replace(/^\/+/, '');
            const publicDir = path.join(__dirname, '..', '..', 'public');
            const localPath = path.join(publicDir, sanitizedPath);
            if (fs.existsSync(localPath)) {
              doc.image(localPath, cakeBox.x, cakeBox.y, { fit: [cakeBox.w, cakeBox.h] });
              cakePlaced = true;
            }
          } catch {}
        }

        // 3) Intentar descargar desde el frontend usando ruta relativa
        if (!cakePlaced) {
          try {
            const frontend = process.env.FRONTEND_URL || 'http://localhost:5173';
            const urlObj = (() => { try { return new URL(selectedImageUrl); } catch { return null; } })();
            const pathname = urlObj ? urlObj.pathname : selectedImageUrl;
            const finalUrl = `${frontend}${pathname.startsWith('/') ? '' : '/'}${pathname}`;
            const respCake2 = await fetch(finalUrl);
            if (respCake2.ok) {
              const bufferCake2 = await respCake2.buffer();
              doc.image(bufferCake2, cakeBox.x, cakeBox.y, { fit: [cakeBox.w, cakeBox.h] });
              cakePlaced = true;
            }
          } catch {}
        }
      }
      // Si no se logra colocar, continuar sin bloquear el PDF
    }
    if (cake_title) {
      doc.fillColor('#111827').fontSize(16).text(`Torta: ${cake_title}`, contentX, cursorY, { width: panelW - 260 });
      cursorY += 22;
    }
    if (!minimal) {
      doc.fillColor('#111827').fontSize(14).text(`Centímetros de torta: ${centimeters || '-' } cm`, contentX, cursorY, { width: panelW - 260 });
      cursorY += 20;
      doc.fillColor('#111827').fontSize(14).text(`Cantidad de torta: ${cake_quantity || '1'}`, contentX, cursorY, { width: panelW - 260 });
      cursorY += 20;
    }

    // Datos del pedido
    const fields = minimal
      ? [['Nombre completo', customer_full_name || customer_name || '-']]
      : [
          ['Nombre completo', customer_full_name || customer_name || '-'],
          ['Teléfono', customer_phone || '-'],
          ['A nombre de', order_for_name || '-'],
          // La fecha/hora ya se muestra arriba a la derecha del panel
          ['Confirmación retiro en local', pickup_ack ? 'Sí' : 'No'],
          ['Notas', notes || '-'],
        ];

    fields.forEach(([label, value]) => {
      doc.fontSize(12).fillColor('#374151').text(`${label}: `, contentX, cursorY, { continued: true, width: panelW - 260 }).fillColor('#111827').text(value, { width: panelW - 260 });
      cursorY += 20; // más aire entre líneas para evitar cualquier superposición
    });

    // Nota de recordatorio eliminada para mantener diseño más limpio y evitar sobreposición
    // Ajustar un pequeño espacio final para que el panel respire
    cursorY += 8;

    // Finalizar documento (la respuesta enviará el archivo directamente)
    doc.end();
  } catch (error) {
    console.error('Error al generar PDF:', error);
    res.status(500).json({ success: false, error: 'Error al generar PDF', message: error.message });
  }
});

// POST /api/orders/pdf/save - Generar y guardar PDF del pedido, devolviendo URL pública
router.post('/pdf/save', async (req, res) => {
  try {
    const { selectedImageUrl, plantillaUrl, cake_title, centimeters, cake_quantity, customer_name, customer_phone, customer_full_name, order_for_name, pickup_ack, date_time, notes, minimal } = req.body;

    const sanitize = (s) => (s || '')
      .toString()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9-_ ]+/g, '')
      .trim().replace(/\s+/g, '_')
      .slice(0, 50);
    const baseName = `pedido-opera_${sanitize(cake_title) || 'torta'}_${sanitize(customer_full_name || customer_name) || 'cliente'}`;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `${baseName}-${timestamp}.pdf`;

    const uploadsDir = path.join(__dirname, '..', 'uploads', 'pedidos');
    try { fs.mkdirSync(uploadsDir, { recursive: true }); } catch {}
    const filePath = path.join(uploadsDir, fileName);

    // Crear documento PDF y pipe al sistema de archivos
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const writeStream = fs.createWriteStream(filePath);
    doc.pipe(writeStream);

    // Fondo de plantilla: igual lógica que en /pdf
    {
      let plantillaCargada = false;
      if (plantillaUrl && !plantillaCargada) {
        try {
          const respTpl0 = await fetch(plantillaUrl);
          if (respTpl0.ok) {
            const bufferTpl0 = await respTpl0.buffer();
            doc.image(bufferTpl0, 0, 0, { width: doc.page.width, height: doc.page.height });
            plantillaCargada = true;
          }
        } catch {}
      }
      try {
        if (!plantillaCargada) {
          const plantillaPath1 = path.join(__dirname, '..', 'assets', 'PlantillaPedido.jpg');
          if (fs.existsSync(plantillaPath1)) {
            doc.image(plantillaPath1, 0, 0, { width: doc.page.width, height: doc.page.height });
            plantillaCargada = true;
          }
        }
      } catch {}
      if (!plantillaCargada) {
        try {
          const plantillaPath2 = path.join(__dirname, '..', '..', 'public', 'imagenes', 'PlantillaPedido.jpg');
          if (fs.existsSync(plantillaPath2)) {
            doc.image(plantillaPath2, 0, 0, { width: doc.page.width, height: doc.page.height });
            plantillaCargada = true;
          }
        } catch {}
      }
      if (!plantillaCargada) {
        try {
          const frontend = process.env.FRONTEND_URL || 'http://localhost:5173';
          const respTpl = await fetch(`${frontend}/imagenes/PlantillaPedido.jpg`);
          if (respTpl.ok) {
            const bufferTpl = await respTpl.buffer();
            doc.image(bufferTpl, 0, 0, { width: doc.page.width, height: doc.page.height });
            plantillaCargada = true;
          }
        } catch {}
      }
    }

    // Encabezado y panel (copiado de /pdf)
    const headerDateStr = (() => {
      try {
        const base = date_time ? new Date(date_time) : new Date();
        return new Intl.DateTimeFormat('es-CL', { dateStyle: 'medium', timeStyle: 'short', hour12: true }).format(base);
      } catch {
        return new Date().toLocaleString('es-CL');
      }
    })();

    let panelX, panelY, panelW, panelH;
    const panelPadding = { top: 24, right: 24, bottom: 24, left: 24 };
    panelW = Math.round(doc.page.width * 0.8);
    const contentWMeasure = panelW - 260;

    // Medidas aproximadas para panel
    const dateBoxW = 220;
    doc.fontSize(12);
    const dateBoxH = doc.heightOfString(headerDateStr, { width: dateBoxW });
    let titleH = 0;
    if (cake_title) {
      doc.fontSize(16);
      titleH = doc.heightOfString(`Torta: ${cake_title}`, { width: contentWMeasure });
    }
    let fieldsCount = minimal ? 1 : 5; // aproximación similar a /pdf
    let panelContentH = dateBoxH + 12 + titleH + (minimal ? 0 : 40) + fieldsCount * 20 + 8 + 140; // incluye cuadro de imagen

    panelX = Math.round((doc.page.width - panelW) / 2);
    panelY = 110; // bajo la cabecera
    panelH = Math.max(panelContentH + panelPadding.top + panelPadding.bottom, 280);

    // Dibujo del panel
    try {
      doc.save();
      if (typeof doc.opacity === 'function') doc.opacity(0.94);
      if (typeof doc.roundedRect === 'function') {
        doc.roundedRect(panelX, panelY, panelW, panelH, 16).fill('#FFFFFF');
      } else {
        doc.rect(panelX, panelY, panelW, panelH).fill('#FFFFFF');
      }
      if (typeof doc.opacity === 'function') doc.opacity(1);
      doc.restore();
    } catch {}

    // Fecha/hora
    const dateX = panelX + panelW - panelPadding.right - dateBoxW;
    const dateY = panelY + panelPadding.top;
    doc.fontSize(12).fillColor('#6b7280').text(headerDateStr, dateX, dateY, { width: dateBoxW, align: 'right' });

    // Contenido dentro del panel
    const contentX = panelX + panelPadding.left;
    let cursorY = panelY + panelPadding.top + dateBoxH + 12;

    // Imagen de torta
    {
      const cakeBox = { x: panelX + panelW - panelPadding.right - 180, y: panelY + panelPadding.top + dateBoxH + 12, w: 180, h: 140 };
      let cakePlaced = false;
      if (selectedImageUrl) {
        try {
          const respCake = await fetch(selectedImageUrl);
          if (respCake.ok) {
            const bufferCake = await respCake.buffer();
            doc.image(bufferCake, cakeBox.x, cakeBox.y, { fit: [cakeBox.w, cakeBox.h] });
            cakePlaced = true;
          }
        } catch {}
        if (!cakePlaced) {
          try {
            const urlObj = (() => { try { return new URL(selectedImageUrl); } catch { return null; } })();
            const pathname = urlObj ? urlObj.pathname : selectedImageUrl;
            const sanitizedPath = decodeURIComponent(pathname || '').replace(/^\/+/, '');
            const publicDir = path.join(__dirname, '..', '..', 'public');
            const localPath = path.join(publicDir, sanitizedPath);
            if (fs.existsSync(localPath)) {
              doc.image(localPath, cakeBox.x, cakeBox.y, { fit: [cakeBox.w, cakeBox.h] });
              cakePlaced = true;
            }
          } catch {}
        }
        if (!cakePlaced) {
          try {
            const frontend = process.env.FRONTEND_URL || 'http://localhost:5173';
            const urlObj = (() => { try { return new URL(selectedImageUrl); } catch { return null; } })();
            const pathname = urlObj ? urlObj.pathname : selectedImageUrl;
            const finalUrl = `${frontend}${pathname.startsWith('/') ? '' : '/'}${pathname}`;
            const respCake2 = await fetch(finalUrl);
            if (respCake2.ok) {
              const bufferCake2 = await respCake2.buffer();
              doc.image(bufferCake2, cakeBox.x, cakeBox.y, { fit: [cakeBox.w, cakeBox.h] });
              cakePlaced = true;
            }
          } catch {}
        }
      }
    }
    if (cake_title) {
      doc.fillColor('#111827').fontSize(16).text(`Torta: ${cake_title}`, contentX, cursorY, { width: panelW - 260 });
      cursorY += 22;
    }
    if (!minimal) {
      doc.fillColor('#111827').fontSize(14).text(`Centímetros de torta: ${centimeters || '-' } cm`, contentX, cursorY, { width: panelW - 260 });
      cursorY += 20;
      doc.fillColor('#111827').fontSize(14).text(`Cantidad de torta: ${cake_quantity || '1'}`, contentX, cursorY, { width: panelW - 260 });
      cursorY += 20;
    }
    const fields = minimal
      ? [['Nombre completo', customer_full_name || customer_name || '-']]
      : [
          ['Nombre completo', customer_full_name || customer_name || '-'],
          ['Teléfono', customer_phone || '-'],
          ['A nombre de', order_for_name || '-'],
          ['Confirmación retiro en local', pickup_ack ? 'Sí' : 'No'],
          ['Notas', notes || '-'],
        ];
    fields.forEach(([label, value]) => {
      doc.fontSize(12).fillColor('#374151').text(`${label}: `, contentX, cursorY, { continued: true, width: panelW - 260 }).fillColor('#111827').text(value, { width: panelW - 260 });
      cursorY += 20;
    });
    cursorY += 8;

    // Finalizar y responder cuando el archivo esté listo
    await new Promise((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
      doc.end();
    });

    const scheme = (req.headers['x-forwarded-proto'] || req.protocol || 'http').split(',')[0];
    const host = req.get('host') || 'localhost:3001';
    const publicUrl = `${scheme}://${host}/uploads/pedidos/${fileName}`;

    res.json({ success: true, url: publicUrl, filename: fileName });
  } catch (error) {
    console.error('Error al generar/guardar PDF:', error);
    res.status(500).json({ success: false, error: 'Error al generar/guardar PDF', message: error.message });
  }
});

module.exports = router;