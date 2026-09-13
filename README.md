# Sistema de Control de Stock y Consumo para Despensa

Sistema full-stack para la gestión de inventario de una despensa: alta de artículos, escaneo de código de barras (pistola o cámara), consumo rápido y reposición a proveedores.

## Stack

- **Frontend:** React 19, Tailwind CSS 4, Vite 8
- **Backend:** Express 5, Sequelize 6, PostgreSQL
- **Auth:** JWT (bcrypt + jsonwebtoken)
- **Escaneo:** html5-qrcode (EAN-13, UPC-A)

## Estructura

```
despensa/
├── backend/
│   ├── config/        # Database config
│   ├── controllers/   # Auth, products, categories, brands, stock movements
│   ├── models/        # Sequelize models
│   ├── routes/        # Express routes
│   ├── server.js      # Entry point
│   ├── init-db.js     # DB creation script
│   └── seed.js        # Admin user seed
├── frontend/
│   ├── src/
│   │   ├── components/  # CameraScanner, Modal, StockBadge, ProtectedRoute
│   │   ├── context/     # AuthContext
│   │   ├── pages/       # Login, Home, Products, Categories, Brands, Scanner, StockEntry
│   │   ├── api.js       # Centralized fetch helper
│   │   └── App.jsx      # Router
│   └── vite.config.js
└── spec-*.md           # Specifications (SDD)
```

## Requisitos

- Node.js >= 18
- PostgreSQL

## Instalación

```bash
# Backend
cd backend
npm install
cp .env.example .env   # configurar DB y JWT_SECRET
node init-db.js        # crear base de datos
node seed.js           # crear usuario admin (admin / admin123)
npm run dev

# Frontend (otra terminal)
cd frontend
npm install
cp .env.example .env   # configurar VITE_API_URL
npm run dev
```

## Variables de entorno

### Backend (`.env`)

| Variable | Descripción |
|---|---|
| `PORT` | Puerto del servidor (default: 4000) |
| `DB_HOST` | Host de PostgreSQL |
| `DB_PORT` | Puerto de PostgreSQL |
| `DB_NAME` | Nombre de la base de datos |
| `DB_USER` | Usuario de PostgreSQL |
| `DB_PASS` | Contraseña de PostgreSQL |
| `JWT_SECRET` | Secreto para firmar tokens JWT |
| `CORS_ORIGIN` | URL del frontend permitida |

### Frontend (`.env`)

| Variable | Descripción |
|---|---|
| `VITE_API_URL` | URL del backend (ej: `http://localhost:4000`) |

## Funcionalidades

- **Auth:** Login, registro, token JWT
- **Dashboard:** Resumen de stock bajo, alertas
- **Artículos:** CRUD con categorías y marcas, código de barras
- **Inventario:** Tabla con búsqueda, badges de stock (rojo/amarillo/verde)
- **Consumo Rápido:** Escaneo 2-step (escanear → confirmar cantidad), descuenta -1 unidad
- **Ingreso Mercadería:** Escaneo 2-step con edición de precios (costo/venta), suma stock
- **Cámara:** Botón de cámara en los 3 formularios, modal con decodificación EAN-13/UPC-A

## Deploy

- Frontend: Vía FTP a `sib-2000.com.ar/despensa/`
- Backend: pm2 en puerto 4000, proxy reverso Caddy en `backend.sib-2000.com.ar/backdespen`
