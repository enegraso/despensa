### Módulo D: Pantalla de Consumo/Venta Rápida (Optimizado para Lector)
- **Campo de Entrada Principal:** Un input de texto que simula la búsqueda por código de barras (`autofocus` activo por defecto).
- **Flujo de Escaneo e Información:**
  1. Al escanear un código de barras, el sistema debe buscar el producto en el backend y **mostrar inmediatamente en pantalla su Nombre y Precio de Venta en un tamaño de letra grande y legible**.
  2. Debe habilitar un **campo numérico secundario de "Cantidad"** (que por defecto venga en 1) por si se desea modificar el multiplicador (ej. llevar 10 unidades del mismo producto).
  3. Al presionar `Enter` en el teclado o hacer clic en un botón de confirmación, se procesará la baja masiva restando la cantidad indicada de una sola vez del `stock_actual` y registrando el movimiento.
  4. Al finalizar, el sistema limpia la pantalla, muestra el cartel de éxito y devuelve el foco automáticamente al input del código de barras para el siguiente producto.
