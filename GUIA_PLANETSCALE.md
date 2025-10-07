# 🚀 Guía: Configurar Railway para Producción (GRATIS)

## ¿Qué es Railway?
- Base de datos MySQL en la nube
- Compatible con tu código actual
- Plan gratuito: 500 horas/mes (suficiente para tu proyecto)
- Perfecto para Vercel

## 📋 Pasos para configurar:

### 1. Crear cuenta en Railway
1. Ve a: https://railway.app/
2. Regístrate con GitHub (recomendado)
3. Crea un nuevo proyecto
4. Selecciona "Add MySQL" desde el dashboard

### 2. Obtener credenciales de conexión
1. En tu dashboard de Railway
2. Haz clic en tu servicio MySQL
3. Ve a la pestaña "Variables"
4. **GUARDA ESTOS DATOS:**
   - MYSQL_HOST
   - MYSQL_USER  
   - MYSQL_PASSWORD
   - MYSQL_DATABASE
   - MYSQL_PORT

### 3. Configurar variables de entorno

#### Para desarrollo local (.env):
```
# Desarrollo local
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=andriu1472
DB_NAME=opera_panaderia

# Producción (Railway)
RAILWAY_MYSQL_HOST=tu-host-de-railway
RAILWAY_MYSQL_USER=tu-username
RAILWAY_MYSQL_PASSWORD=tu-password
RAILWAY_MYSQL_DATABASE=railway
RAILWAY_MYSQL_PORT=tu-puerto
```

#### Para Vercel (variables de entorno):
```
RAILWAY_MYSQL_HOST=tu-host-de-railway
RAILWAY_MYSQL_USER=tu-username
RAILWAY_MYSQL_PASSWORD=tu-password
RAILWAY_MYSQL_DATABASE=railway
RAILWAY_MYSQL_PORT=tu-puerto
NODE_ENV=production
```

### 4. Modificar configuración de base de datos
El archivo `backend/config/database.js` detectará automáticamente si está en desarrollo o producción.

### 5. Inicializar base de datos en Railway
1. Conectarte a Railway desde tu app local
2. Ejecutar el script de inicialización
3. Verificar que las tablas se crearon correctamente

## 🎯 Beneficios:
- ✅ Los dueños pueden editar desde cualquier lugar
- ✅ Datos persistentes y seguros
- ✅ 500 horas gratis al mes (más que suficiente)
- ✅ Respaldos automáticos
- ✅ Compatible con tu código actual
- ✅ Setup súper fácil

## 🔄 Flujo de trabajo:
1. **Desarrollo** → MySQL local
2. **Testing** → Railway staging
3. **Producción** → Railway + Vercel

## 💡 Alternativas si se acaban las horas:
- Crear otra cuenta (permitido)
- Migrar a otro servicio gratuito
- Upgrade a plan pago ($5/mes)