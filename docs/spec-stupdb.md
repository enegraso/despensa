## 4. Inicialización Automatizada del Entorno
- El sistema debe contar con un script `npm run db:init` en el `/backend`.
- Este script debe conectarse a PostgreSQL, verificar si la base de datos definida en el `.env` existe, y crearla automáticamente mediante SQL si no se encuentra.
- Debe ejecutarse de manera obligatoria antes de correr las migraciones o los seeds de prueba.
