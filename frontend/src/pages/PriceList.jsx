import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const PriceList = () => {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const fetchData = async (term = '') => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (term) params.set('search', term);

      const qs = params.toString();
      const url = `/api/reports/prices${qs ? '?' + qs : ''}`;
      const res = await api.get(url, token);

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || body.error || `Error ${res.status}`);
      }

      const data = await res.json();
      setItems(data.items);
    } catch (err) {
      console.error('Price list error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchData(search);
  };

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (val) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(val);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm print-hide">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-gray-400 hover:text-gray-600 transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-xl font-bold text-gray-800">Listado de Precios</h1>
          </div>
          <button
            onClick={handlePrint}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-xl transition flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Imprimir
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-sm p-6 mb-6 print-hide">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Buscar artículo</label>
              <input
                type="text"
                placeholder="Nombre o código de barras..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-xl transition"
            >
              Buscar
            </button>
          </div>
        </form>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-6 py-4 mb-6 text-sm">
            {error}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-400">Cargando...</div>
          ) : items.length === 0 && !error ? (
            <div className="p-8 text-center text-gray-400">No hay artículos para mostrar</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-6 py-3 font-medium text-gray-500">Código</th>
                    <th className="text-left px-6 py-3 font-medium text-gray-500">Artículo</th>
                    <th className="text-left px-6 py-3 font-medium text-gray-500">Marca</th>
                    <th className="text-right px-6 py-3 font-medium text-gray-500">Precio</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                      <td className="px-6 py-3 text-gray-600 font-mono text-xs">{item.codigo_barras}</td>
                      <td className="px-6 py-3 font-medium text-gray-800">{item.nombre}</td>
                      <td className="px-6 py-3 text-gray-600">{item.marca}</td>
                      <td className="px-6 py-3 text-right font-semibold text-gray-800">{formatCurrency(item.precio_venta)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PriceList;
