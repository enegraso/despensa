# ESPECIFICACIÓN: Sistema de Copias de Seguridad (Backup) Automático

## 1. Visión General
El objetivo es automatizar la creación de copias de seguridad de la base de datos `despensa_db` en PostgreSQL para prevenir la pérdida de información por fallos de hardware, cortes de energía o errores humanos.

## 2. Requisitos Técnicos del Backend (Express / Node.js)
- **Script de Respaldo (`backend/scripts/db-backup.js`):**
  - Debe ser un script independiente de Node.js que ejecute el comando nativo de PostgreSQL `pg_dump`.
  - Debe leer las credenciales de conexión directamente del archivo `.env` de forma segura.
  - El archivo generado debe ser un `.sql` comprimido (o texto plano) y guardarse en una carpeta local llamada `backend/backups/`.
  - **Nomenclatura del archivo:** `backup-despensa-YYYY-MM-DD_HH-mm.sql` (para identificar fácilmente el día y la hora exacta del respaldo).

## 3. Automatización (Tareas Programadas)
- **Librería recomendada:** Utilizar `node-cron` dentro del servidor Express.
- **Frecuencia:** El sistema debe ejecutar el script de respaldo de forma automática **todos los días a las 23:59hs** (o a la hora de cierre de la despensa), sin interrumpir el funcionamiento del servidor.
- **Mantenimiento:** Para no llenar el disco de la computadora, el script debe revisar la carpeta de backups y **eliminar automáticamente las copias que tengan más de 15 días de antigüedad**.

## 4. Criterios de Aceptación (Definición de Hecho)
- El proceso de backup debe ejecutarse en segundo plano sin colgar la API.
- Si el backup falla (por ejemplo, Postgres está apagado), el sistema debe capturar el error y registrarlo en un archivo `backup-error.log` en lugar de romper el servidor Express.
