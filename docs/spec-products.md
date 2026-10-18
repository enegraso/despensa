# ESPECIFICACIÓN: Sistema de Control de Stock y Consumo para Despensa

## 1. Visión General
El objetivo es construir una aplicación web segura para gestionar el inventario de una despensa. El sistema requiere autenticación previa, permitirá controlar artículos, marcas, rubros, alertas de stock mínimo y registrar consumos o ventas rápidas de forma ágil utilizando un lector de códigos de barras o escáner integrado.

## 2. Stack Tecnológico & Convenciones
- **Frontend:** React (JavaScript) + Tailwind CSS (Diseño prolijo, estético, responsivo, componentes limpios).
- **Backend:** Express.js (Node.js) + JWT para autenticación.
- **Base de Datos:** PostgreSQL administrado mediante Sequelize ORM.
- **Estrategia de Almacenamiento de Imágenes:** Las imágenes se manejarán **estrictamente como URLs de texto**. No se implementará lógica de subida de archivos (*file uploads*) en el servidor Express. Si la imagen proviene de una API externa se guardará su URL pública, y si es tomada por el dispositivo se procesará localmente como una cadena Base64 (Data URL).

## 3. Modelo de Datos (Sequelize)
El sistema debe contar con las siguientes entidades y relaciones:
- **Usuario (User):** `id`, `username`, `password_hash`, `email`.
- **Rubro (Category):** `id`, `nombre`.
- **Marca (Brand):** `id`, `nombre`.
- **Articulo (Product):** `id`, `codigo_barras` (Obligatorio/Único), `nombre`, `descripcion`, `imagen_url` (TEXT / Opcional), `precio_costo`, `precio_venta`, `stock_actual`, `stock_minimo`, `rubro_id`, `marca_id`.
- **MovimientoStock (StockMovement):** `id`, `articulo_id`, `cantidad`, `tipo` ('entrada', 'salida_consumo'), `fecha`, `usuario_id`.

## 4. Requisitos Funcionales & Pantallas (UI)

### Módulo B: Gestión de Catálogo (Rubros y Marcas)
- Pantallas simples para listar, crear, editar y eliminar Marcas y Rubros. 

### Módulo C: Control de Inventario (Artículos)
- **Vista de Tabla Estética:** Listado de artículos con filtros avanzados y alertas en rojo/amarillo si `stock_actual <= stock_minimo`.
- **Formulario de Alta / Edición Dinámico:** 
  - El formulario siempre mostrará todos los campos de gestión de inventario y comerciales (`precio_costo`, `precio_venta`, `stock_actual`, `stock_minimo`).
  - El campo `codigo_barras` tendrá foco automático al abrirse. Al ingresar o escanear un código, se activará un estado visual de carga sobre los campos descriptivos y se disparará la lógica de autocompletado en cascada.

#### 4.1 Lógica de Búsqueda y Autocompletado (Cascada en Backend)
El backend expondrá el endpoint protegido `GET /api/productos/escanear/:codigo` configurando un header `User-Agent` de navegación simulada para mitigar bloqueos de red. Consultará de forma secuencial:

1. **Fase 1 (Open Food Facts):** `https://openfoodfacts.org{codigo}.json`
   El backend debe buscar los datos dentro del objeto `data.product` usando estrictamente este mapeo de campos:
   * **Nombre:** `product_name_es` o en su defecto `product_name`.
   * **Marca:** `brands` (tomar el primer elemento de la cadena si viene separado por comas).
   * **Descripción:** `generic_name_es` o en su defecto `generic_name`. Si no existen, usar el campo `categories`.
   * **Presentación / Medida:** `quantity` (aquí se guarda el peso/volumen como "400 ml" o "1 kg"). El backend debe concatenar este valor al final del Nombre del producto (Ej: "Nombre del Producto - 400 ml") si el campo no está vacío.
   * **Imagen:** `image_front_url` o en su defecto `image_url`.

2. **Fase 2 (Supermercados VTEX Argentina):** Itera sobre las APIs de Carrefour y Día.
   La API de VTEX devuelve un Array. El backend debe tomar la posición `[0]` y mapear de la siguiente manera:
   * **Nombre:** `productName`.
   * **Marca:** `brand`.
   * **Descripción:** Extraer el texto limpio de `description` (eliminar etiquetas HTML si las hubiera).
   * **Presentación / Medida:** Buscar dentro de `items[0].nameComplete` o calcular la diferencia mediante el nombre del SKU en `items[0].name`. Concatenar al nombre si es necesario.
   * **Imagen:** `items[0].images[0].imageUrl`.

**Respuestas del Servidor:**
- **Éxito (200):** Retornar siempre un JSON estandarizado y plano:
  `{ nombre, marca, descripcion, imagen_url }` (donde `nombre` ya incluye la presentación o tamaño si fue hallada).
- **Fallo (404):** Retornar `{ encontrado: false }`.
