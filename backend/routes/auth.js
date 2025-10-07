const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { executeQuery } = require('../config/database');

// POST /api/auth/login - Iniciar sesión
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Usuario y contraseña son requeridos'
      });
    }
    
    // Buscar usuario en la base de datos
    const query = 'SELECT * FROM users WHERE username = ? OR email = ?';
    const users = await executeQuery(query, [username, username]);
    
    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas'
      });
    }
    
    const user = users[0];
    
    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas'
      });
    }
    
    // Generar token JWT
    const token = jwt.sign(
      { 
        userId: user.id, 
        username: user.username, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Establecer cookie HTTPOnly con el token
    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('token', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000,
      path: '/',
    });

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      },
      message: 'Inicio de sesión exitoso'
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      error: 'Error en el servidor',
      message: error.message
    });
  }
});

// POST /api/auth/register - Registrar nuevo usuario (solo admin puede crear usuarios)
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role = 'user' } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Usuario, email y contraseña son requeridos'
      });
    }
    
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'La contraseña debe tener al menos 6 caracteres'
      });
    }
    
    // Verificar si el usuario ya existe
    const checkQuery = 'SELECT id FROM users WHERE username = ? OR email = ?';
    const existingUsers = await executeQuery(checkQuery, [username, email]);
    
    if (existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'El usuario o email ya existe'
      });
    }
    
    // Encriptar contraseña
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);
    
    // Crear usuario
    const insertQuery = 'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)';
    const result = await executeQuery(insertQuery, [username, email, password_hash, role]);
    
    res.status(201).json({
      success: true,
      data: {
        id: result.insertId,
        username,
        email,
        role
      },
      message: 'Usuario creado exitosamente'
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({
      success: false,
      error: 'Error en el servidor',
      message: error.message
    });
  }
});

// Middleware para verificar token JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const bearerToken = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  const cookieToken = req.cookies && req.cookies.token; // Token desde cookie
  const token = cookieToken || bearerToken;
  
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Token de acceso requerido'
    });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        error: 'Token inválido'
      });
    }
    
    req.user = user;
    next();
  });
};

// Middleware para verificar rol de administrador
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Acceso denegado. Se requieren permisos de administrador'
    });
  }
  next();
};

// GET /api/auth/profile - Obtener perfil del usuario autenticado
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const query = 'SELECT id, username, email, role, created_at FROM users WHERE id = ?';
    const users = await executeQuery(query, [req.user.userId]);
    
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }
    
    res.json({
      success: true,
      data: users[0]
    });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({
      success: false,
      error: 'Error en el servidor',
      message: error.message
    });
  }
});

// POST /api/auth/verify - Verificar si el token es válido
router.post('/verify', authenticateToken, (req, res) => {
  res.json({
    success: true,
    data: {
      valid: true,
      user: req.user
    },
    message: 'Token válido'
  });
});

// POST /api/auth/logout - Cerrar sesión (borrar cookie)
router.post('/logout', (req, res) => {
  try {
    res.clearCookie('token', { path: '/' });
    res.json({
      success: true,
      message: 'Sesión cerrada correctamente'
    });
  } catch (error) {
    console.error('Error en logout:', error);
    res.status(500).json({
      success: false,
      error: 'Error al cerrar sesión',
      message: error.message
    });
  }
});

module.exports = { 
  router, 
  authenticateToken, 
  requireAdmin 
};