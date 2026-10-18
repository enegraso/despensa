# ESPECIFICACIÓN: Pruebas Automatizadas (Testing de Filtros y CRUDs)

## 1. Entorno de Pruebas
- **Librería Backend:** Jest + Supertest (para probar los endpoints de Express sin levantar el servidor manualmente).
- **Librería Frontend:** React Testing Library (para simular los clics, el tipeo y los filtros en la interfaz).

## 2. Casos de Prueba Obligatorios (Casos de Test)

### Módulo A: Filtros de Fecha (Informes)
- **Test de Rango Válido:** El script debe simular que se ingresa "Desde: 2026-09-01" y "Hasta: 2026-09-14". Debe verificar que la API del backend devuelva únicamente los movimientos que caigan dentro de ese rango y que el frontend sume el totalizador correctamente.
- **Test de Rango Vacío:** Si no hay movimientos en las fechas seleccionadas, debe comprobar que la tabla no rompa la pantalla y muestre un mensaje estético de "No hay datos para este período".

### Módulo B: Operaciones CRUD (Artículos)
- **Test de Creación Correcta:** Debe simular el envío de un nuevo producto con código de barras único. Verificar que Sequelize lo guarde en PostgreSQL y devuelva un estado `201 Created`.
- **Test de Validación de Duplicados:** Debe intentar crear un producto con un código de barras que ya existe. El test debe comprobar que el backend rechaza la operación con un error `400` y que el modal de React muestra la alerta roja sin cerrarse.
