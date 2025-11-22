# Manual de Usuario — Administrador (Opera)
Este documento explica, de forma concreta y paso a paso, cómo ingresar como administrador, cerrar sesión y usar las funciones principales de administración en la aplicación Opera.

## Ingresar como Administrador
Credenciales:
- Producción: usa las credenciales que te entregó el responsable técnico.
-Usuario:OperaAdmin
-Contraseña:Oper42025$

Método recomendado (pantalla de inicio):
- Paso 1: En la pantalla de inicio, toca dos veces (doble clic) el logo redondo de Opera situado en la esquina superior izquierda.
- Paso 2: Se abrirá el formulario "Acceso Administrador". Ingresa tu usuario y contraseña.
  - Puedes alternar la visibilidad de la contraseña con el ícono de ojo.
  - Presiona Enter o el botón "Ingresar".
- Resultado: Al autenticarse correctamente, la aplicación entra en modo administrador.


## Cerrar Sesión

Método directo (recomendado):
- Ubica el botón circular con el logo de Opera en la esquina inferior izquierda (visible cuando eres administrador).
- Haz clic y confirma el mensaje para cerrar sesión.
- La app te redirige a la pantalla de inicio.

Notas:
- Al cerrar sesión se borra la cookie de autenticación y se limpia la sesión local.
- La sesión de administrador se cierra automáticamente tras 15 minutos de inactividad.

## Funciones de Administración

### Gestión de Productos
- Accede a la sección "Productos" desde el menú o la portada.
- En la parte superior verás botones de administración (solo si eres admin):
  - "Agregar Producto": abre un modal para crear un nuevo producto.
    - Completa nombre, descripción, precio, categoría e imagen.
    - Guarda para publicar el producto.
  - "Agregar Categoría": abre un modal para crear una categoría.
- En cada tarjeta de producto (vista de grilla):
  - Editar: botón con ícono de lápiz. Abre el modal con los datos para modificar.
  - Eliminar: botón con ícono de basurero. Pide confirmación antes de marcar el producto como no disponible.
- Filtros: usa los chips de categoría (arriba) para filtrar los productos.

### Gestión de Pedidos
- Acceso: desde la portada, pulsa el botón "Solicitar pedido" o navega a la ruta `/pedido`.
- Flujo del formulario:
  - Paso 1: Selección de torta.
    - Como admin, puedes "Añadir torta" y ver/ocultar la tabla de tortas disponibles para editar nombre, imagen y precio.
    - Selecciona la torta y avanza con "Siguiente".
  - Paso 2: Datos del pedido.
    - Completa: nombre del cliente, teléfono, a nombre de quién va el pedido, centímetros (tamaño), cantidad, fecha y hora.
    - Marca las casillas obligatorias: "Retiro en local" y "Abono del pedido".
    - Opcional: escribe notas.
  - Paso 3: Confirmación y envío.
    - Pulsa "Enviar pedido" para abrir WhatsApp con el mensaje preformateado al número oficial (+56 9 8619 3142).
    
### Gestión de Noticias
- Botón "+" (junto al botón circular de Opera abajo a la izquierda): abre el modal para añadir una noticia.
- Alternativa: desde el menú de usuario en el encabezado, opción "Añadir noticia" (visible para administradores).
- Publica noticias que se mostrarán a los espectadores en la portada.


