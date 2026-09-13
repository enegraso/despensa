# ARQUITECTURA TÉCNICA: Estructura de Carpetas del Sistema de Despensa

## 1. Organización del Repositorio
El proyecto utilizará una arquitectura desacoplada en dos directorios principales al mismo nivel de la raíz:

```text
despensa/
├── backend/            # Servidor Express.js y Sequelize ORM
│   ├── config/         # Conexión a la base de datos PostgreSQL
│   ├── models/         # Modelos de datos (User, Product, Category, Brand, Movement)
│   ├── controllers/    # Lógica de negocio de los endpoints
│   ├── routes/         # Definición de rutas de la API (/api/products, etc.)
│   └── server.js       # Punto de entrada del servidor
└── frontend/           # Aplicación Single Page Application (SPA) en React
    ├── src/
    │   ├── components/ # Componentes UI reutilizables (Botones, inputs con Tailwind)
    │   ├── context/    # Estado global (AuthContext para el manejo de sesión)
    │   └── pages/      # Vistas principales (Login, Inventario, ConsumoRapido)
    ├── package.json
    └── tailwind.config.js
```

## 2. Flujo de Comunicación
- El Frontend se comunicará con el Backend mediante peticiones HTTP asincrónicas (fetch/axios) enviando y recibiendo datos en formato JSON.
- Todas las rutas protegidas del Backend requerirán un token JWT válido enviado en la cabecera `Authorization: Bearer <token>`.
