# ESPECIFICACIÓN: Pantalla de Ingreso de Mercadería (Repone Stock)

## 1. Visión General
El objetivo es construir una pantalla espejo a la de Consumo Rápido, pero orientada exclusivamente a la recepción de mercadería (compras a proveedores). El sistema permitirá escanear productos para sumar unidades al inventario de forma rápida y segura, evitando confusiones con el módulo de ventas.

## 2. Requisitos Funcionales & Pantallas (UI)

### Interfaz Visual ("Ingreso de Mercadería")
- **Buscador Principal:** Un input con `autofocus` por defecto mediante `useRef` para leer el código de barras con la pistola.
- **Tarjeta de Información del Producto:** Al escanear un código válido, la pantalla debe mutar para mostrar la información del artículo:
  - Nombre del producto, Rubro y Marca.
  - **Precio de Costo** en tamaño grande y destacado (en lugar del precio de venta).
  - Stock actual disponible entre paréntesis como referencia.
- **Selector de Cantidad:** Un campo numérico para ingresar cuántas unidades ingresan del proveedor (por defecto inicia en 1).
- **Acciones:** 
  - Botón "Confirmar Ingreso" (o presionar `Enter` en el teclado) para procesar la carga.
  - Botón "Cancelar" para limpiar la pantalla y volver a esperar un escaneo.
  - Botón "Volver al Panel" en la esquina superior para regresar al menú de control.

## 3. Lógica del Backend (Express + Sequelize)
- Debe utilizar o extender el endpoint de movimientos para generar un registro en la tabla `StockMovement`.
- Parámetros esperados: `articuloId`, `cantidad`, `tipo: 'entrada'`.
- **Efecto en Base de Datos:** Debe **sumar** la `cantidad` indicada al `stock_actual` del producto correspondiente dentro de una transacción segura de Sequelize.

## 4. Criterios de Aceptación (Definición de Hecho)
- No se permiten ingresos de cantidades menores o iguales a cero.
- Al confirmar el ingreso, el input principal debe recuperar el foco automáticamente para el siguiente escaneo.
- El color de énfasis de los botones de confirmación de esta pantalla debe ser distinto al de consumo rápido (ej: usar tonos Azules/Indigo `bg-indigo-600`) para que el despensero distinga visualmente de un vistazo que está en modo "Ingreso" y no en "Venta".

- **Campos de Edición de Precios (Opcional en Caliente):**
  - Al escanear el producto, debajo del precio de costo actual, deben aparecer dos campos numéricos editables (inputs): **"Nuevo Precio Costo"** y **"Nuevo Precio Venta"**.
  - Por defecto, estos campos deben venir precargados con los valores actuales del producto.
  - Si el despensero modifica alguno de estos valores antes de confirmar el ingreso, el sistema debe tomar el nuevo precio.
- **Acciones y Efecto en Base de Datos:**
  - Al presionar "Confirmar Ingreso", el backend no solo sumará la cantidad al `stock_actual`, sino que también hará un `update` de los campos `precioCosto` y `precioVenta` del artículo en la base de datos si sufrieron variaciones.
