# ESPECIFICACIÓN: Módulo de Informes y Estadísticas

## 1. Visión General
Este módulo permite al dueño de la despensa analizar los movimientos históricos del negocio. Contará con un panel estético (Dashboard) protegido por login que consolidará métricas clave y listados descargables o visuales.
Respetar el estilo de los headers con el link haxia atrás

## 2. Reporte A: Informe de Consumos Rápido (Historial de Salidas)
- **Interfaz Visual:** Una pantalla con un filtro de fecha ("Desde" y "Hasta") y un buscador por producto.
- **Tabla de Tailwind:** Debe listar la fecha, hora, artículo, cantidad vendida, precio de venta cobrado y el total acumulado de ese movimiento.
- **Métrica Destacada:** Un contador arriba en grande que sume el **"Total Recaudado"** según el rango de fechas seleccionado.
- **Lógica Backend:** Una consulta a la tabla `StockMovement` filtrando por `tipo: 'salida_consumo'` y el rango de fechas.
- ... (mantener lo que ya tenías de los filtros de fecha y buscador)
- **Modos de Visualización (Tabs o Switch):**
  - **Vista Detallada:** El listado lineal actual que muestra cada venta individual con su fecha y hora exacta.
  - **Vista Agrupada (Ranking de Más Vendidos):** Al activar este modo, el sistema debe agrupar los resultados por el `articuloId`. En la tabla se consolidará cada producto en una sola fila sumando el total de sus cantidades vendidas (ej: "queso new | Cant. Total: 3 | Total Recaudado: $45.00") y ordenando el listado automáticamente de mayor a menor cantidad vendida. En esta vista se omitirá la columna de fecha y hora individual.
  - **Boton para enviar a imprimir:** En la cabecera, del lado derecho del usuario colocar el boton de imprimir el reporte que se haya generado


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

## 6. Notas Técnicas y Manejo de Fechas (Zonas Horarias)
- **Control de Zona Horaria (Crucial):** El backend y el frontend deben procesar las fechas de los filtros utilizando la hora local de Argentina (UTC-3). 
- Se debe evitar el uso directo de `new Date("YYYY-MM-DD")` ya que inicializa la fecha en UTC medianoche y causa desfases en los filtros de los informes. 
- En su lugar, se debe utilizar la función `parseLocalDate()` para descomponer año/mes/día y forzar la creación del objeto `Date` en la hora local del servidor/dispositivo.

