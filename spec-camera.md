# ESPECIFICACIÓN: Componente Reutilizable de Escaneo por Cámara

## 1. Visión General
El objetivo es crear un componente modal o sección flotante en React que acceda a la cámara del dispositivo (móvil, tablet o PC) para escanear códigos de barras (EAN-13, UPC, etc.) en tiempo real, sirviendo como alternativa a la pistola lectora física.

## 2. Requisitos del Componente (`CameraScanner.jsx`)
- **Librería recomendada:** Utilizar una librería estándar y liviana como `html5-qrcode` para la decodificación de la imagen a través del stream de la cámara.
- **Interfaz Visual (Modal Tailwind):**
  - Un botón con un ícono de cámara estético en las pantallas designadas.
  - Al presionarlo, abre un modal centrado con bordes `rounded-xl` y fondo oscuro donde se proyecta el video de la cámara en vivo.
  - Debe incluir un botón visible de "Cerrar / Cancelar" para apagar la cámara y cerrar el modal.
- **Flujo de Éxito:**
  - Cuando la cámara detecte y decodifique un código de barras válido, debe emitir un sonido corto de éxito (opcional/deseable), cerrar el modal automáticamente e **inyectar el código de barras en el campo de texto principal** de la pantalla que lo invocó, disparando el evento de confirmación de esa pantalla.

## 3. Integración en Pantallas Existentes
El botón de escaneo por cámara debe agregarse al lado del input de código de barras en las siguientes tres pantallas:
1. `Inventario.jsx` (Formulario de alta/edición de artículos).
2. `ConsumoRapido.jsx` (Pantalla de ventas rápidas).
3. `IngresoMercaderia.jsx` (Pantalla azul de reposición a proveedores).

## 5. Configuración de Decodificación Láser (Formatos)
- Se debe configurar la librería del escáner web para que admita de manera explícita y prioritaria los formatos de códigos de barras tradicionales: `Html5QrcodeSupportedFormats.EAN_13` y `Html5QrcodeSupportedFormats.UPC_A`.
- Se debe ajustar la propiedad `fps` (cuadros por segundo) a un mínimo de 20 y configurar un `qrbox` rectangular (por ejemplo, ancho 300px y alto 150px) para que coincida visualmente con la forma alargada de un código de barras, facilitando al usuario el encuadre.

