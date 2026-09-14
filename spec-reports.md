# ESPECIFICACIÓN: Módulo de Informes y Estadísticas

## 1. Visión General
Este módulo permite al dueño de la despensa analizar los movimientos históricos del negocio. Contará con un panel estético (Dashboard) protegido por login que consolidará métricas clave y listados descargables o visuales.
Respetar el estilo de los headers con el link haxia atrás

## 2. Reporte A: Informe de Consumos Rápido (Historial de Salidas)
- **Interfaz Visual:** Una pantalla con un filtro de fecha ("Desde" y "Hasta") y un buscador por producto.
- **Tabla de Tailwind:** Debe listar la fecha, hora, artículo, cantidad vendida, precio de venta cobrado y el total acumulado de ese movimiento.
- **Métrica Destacada:** Un contador arriba en grande que sume el **"Total Recaudado"** según el rango de fechas seleccionado.
- **Lógica Backend:** Una consulta a la tabla `StockMovement` filtrando por `tipo: 'salida_consumo'` y el rango de fechas.

## 3. Reporte B: Listado de Precios Limpio (Para Imprimir o Consultar)
- **Interfaz Visual:** Una vista optimizada y minimalista de solo lectura con buscador rápido.
- **Campos:** Código de barras, Nombre del Artículo, Marca y **Precio de Venta al Público**.
- **Criterio de Diseño:** Debe incluir un botón de "Imprimir" que oculte el menú lateral de la app usando CSS `@media print` para que el despensero pueda imprimir las hojas en papel de forma prolija si lo necesita.

## 4. Reporte C: Informe de Ingresos (Historial de Reposición / Compras)
- **Interfaz Visual:** Una pantalla espejo a la de consumos con filtros de fecha ("Desde" y "Hasta").
- **Tabla de Tailwind:** Debe listar la fecha, hora, artículo, cantidad ingresada, el precio de costo del momento y el total invertido.
- **Métrica Destacada:** Un contador arriba en grande (con diseño sutil en tonos azules o grises) que muestre el **"Total Invertido en Mercadería"** en ese período.
- **Lógica Backend:** Una consulta a `StockMovement` filtrando por `tipo: 'entrada'` y las fechas seleccionadas.

## 5. REporte D: Listado de Reposición de productos (para imprimir / consultar)
- **Interfaz Visual:** Una vista optimizada y minimalista de solo lectura con buscador rápido.
- **Campos:** Código de barras, Nombre del Artículo, Marca, **stock actual** y **stock minimo**. Cuando stock sea menor o igual a stoc minimo.
- **Criterio de Diseño:** Debe incluir un botón de "Imprimir" que oculte el menú lateral de la app usando CSS `@media print` para que el despensero pueda imprimir las hojas en papel de forma prolija si lo necesita.