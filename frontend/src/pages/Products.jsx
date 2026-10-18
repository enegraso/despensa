import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../api';
import StockBadge from '../components/StockBadge';

const Products = () => {
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/api/products', token);
      setProducts(await res.json());
    } catch {
      console.error('Error fetching products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este artículo?')) return;
    try {
      await api.delete(`/api/products/${id}`, token);
      fetchProducts();
    } catch {
      console.error('Error deleting product');
    }
  };

  const filteredProducts = products.filter((p) =>
    p.nombre.toLowerCase().includes(search.toLowerCase()) ||
    p.codigo_barras.includes(search)
  );

  const getRowClass = (prod) => {
    if (prod.stock_actual <= 0) return 'bg-red-50';
    if (prod.stock_actual <= prod.stock_minimo) return 'bg-amber-50';
    return '';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/" className="text-gray-500 hover:text-gray-700 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-xl font-bold text-gray-800">Artículos</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-gray-500 text-sm">Inventario completo de productos</p>
          <Link to="/products/new" className="bg-green-500 hover:bg-green-600 text-white px-4 py-2.5 rounded-xl font-medium transition">
            + Nuevo Artículo
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-4">
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
            placeholder="Buscar por nombre o código de barras..." />
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Cargando...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-8 text-center text-gray-400">No hay artículos registrados</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Código</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Nombre</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Rubro</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Marca</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">P. Venta</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Stock</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Estado</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredProducts.map((prod) => (
                    <tr key={prod.id} className={`hover:bg-gray-50 transition ${getRowClass(prod)}`}>
                      <td className="px-4 py-3 text-sm text-gray-500 font-mono">{prod.codigo_barras}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-800">{prod.nombre}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{prod.rubro?.nombre}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{prod.marca?.nombre}</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-800">${parseFloat(prod.precio_venta).toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm text-right font-medium text-gray-800">{prod.stock_actual}</td>
                      <td className="px-4 py-3 text-center">
                        <StockBadge stockActual={prod.stock_actual} stockMinimo={prod.stock_minimo} />
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <Link to={`/products/${prod.codigo_barras}/edit`} className="text-blue-500 hover:text-blue-700 text-sm font-medium transition">Editar</Link>
                        <button onClick={() => handleDelete(prod.id)} className="text-red-500 hover:text-red-700 text-sm font-medium transition">Eliminar</button>
                      </td>
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

export default Products;
