# ESPECIFICACIÓN: Sistema de Control de Stock y Consumo para Despensa

## 1. Visión General
El objetivo es construir una aplicación web segura para gestionar el inventario de una despensa. El sistema requiere autenticación previa, permitirá controlar artículos, marcas, rubros, alertas de stock mínimo y registrar consumos o ventas rápidas de forma ágil utilizando un lector de códigos de barras.

## 2. Stack Tecnológico & Convenciones
- **Frontend:** React (JavaScript) + Tailwind CSS (Diseño prolijo, estético, responsivo, componentes limpios).
- **Backend:** Express.js (Node.js) + JWT para autenticación.
- **Base de Datos:** PostgreSQL administrado mediante Sequelize ORM.

## 3. Modelo de Datos (Sequelize)
El sistema debe contar con las siguientes entidades y relaciones:
- **Usuario (User):** `id`, `username`, `password_hash`, `email`.
- **Rubro (Category):** `id`, `nombre`.
- **Marca (Brand):** `id`, `nombre`.
- **Articulo (Product):** `id`, `codigo_barras` (Obligatorio/Único), `nombre`, `descripcion`, `precio_costo`, `precio_venta`, `stock_actual`, `stock_minimo`, `rubro_id`, `marca_id`.
- **MovimientoStock (StockMovement):** `id`, `articulo_id`, `cantidad`, `tipo` ('entrada', 'salida_consumo'), `fecha`, `usuario_id`.

## 4. Requisitos Funcionales & Pantallas (UI)


### Módulo B: Gestión de Catálogo (Rubros y Marcas)
- Pantallas simples para listar, crear, editar y eliminar Marcas y Rubros. 

### Módulo C: Control de Inventario (Artículos)
- **Vista de Tabla Estética:** Listado de artículos con filtros avanzados y alertas en rojo/amarillo si `stock_actual <= stock_minimo`.
- **Formularios:** El campo `codigo_barras` debe permitir la entrada manual o mediante pistola lectora (foco automático al abrir el formulario).

## 5. Criterios de Aceptación (Definición de Hecho)
- Ninguna ruta de la aplicación (excepto `/login`) es accesible sin un token válido.
- El input de la pantalla de consumo rápido recupera el foco automáticamente después de procesar un código, permitiendo escaneos sucesivos sin usar el mouse.
- No se permiten registros de consumo si el stock queda en negativo.

## 6. Regresar a la pantalla previa
Con boton volver al lado del titulo y usar cabecera sinilar esteticamente al dashboard