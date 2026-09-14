import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user, logout } = useAuth();

  const modules = [
    { name: 'Rubros', description: 'Gestionar categorías de productos', path: '/categories', color: 'bg-blue-500', icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z' },
    { name: 'Marcas', description: 'Gestionar marcas de productos', path: '/brands', color: 'bg-purple-500', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
    { name: 'Artículos', description: 'Control de inventario y stock', path: '/products', color: 'bg-green-500', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
    { name: 'Consumo Rápido', description: 'Escanear y descontar stock', path: '/scanner', color: 'bg-amber-500', icon: 'M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z' },
    { name: 'Ingreso Mercadería', description: 'Reponer stock de proveedores', path: '/stock-entry', color: 'bg-indigo-500', icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6' },
    { name: 'Informe Consumos', description: 'Historial de salidas y recaudación', path: '/reports/consumption', color: 'bg-green-500', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { name: 'Informe Ingresos', description: 'Historial de compras a proveedores', path: '/reports/purchases', color: 'bg-blue-500', icon: 'M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z' },
    { name: 'Listado Precios', description: 'Consultar e imprimir precios', path: '/reports/prices', color: 'bg-teal-500', icon: 'M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z' },
    { name: 'Listado Reposición', description: 'Artículos por debajo del stock mínimo', path: '/reports/replenishment', color: 'bg-orange-500', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">Despensa</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Hola, {user?.username}</span>
            <button onClick={logout} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition">
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-1">Panel de Control</h2>
          <p className="text-gray-500">Seleccioná un módulo para comenzar</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((mod) => (
            <Link key={mod.path} to={mod.path}
              className="bg-white rounded-2xl shadow-sm hover:shadow-md transition p-6 group">
              <div className={`w-12 h-12 ${mod.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition`}>
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mod.icon} />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">{mod.name}</h3>
              <p className="text-gray-500 text-sm">{mod.description}</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Home;
