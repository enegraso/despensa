import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../api';
import Modal from '../components/Modal';
import StockBadge from '../components/StockBadge';
import CameraScanner from '../components/CameraScanner';

const Products = () => {
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    codigo_barras: '', nombre: '', descripcion: '', precio_costo: '', precio_venta: '',
    stock_actual: 0, stock_minimo: 0, rubro_id: '', marca_id: '',
  });
  const [cameraOpen, setCameraOpen] = useState(false);

  useEffect(() => {
    Promise.all([fetchProducts(), fetchCategories(), fetchBrands()]);
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/api/products', token);
      const data = await res.json();
      setProducts(data);
    } catch {
      console.error('Error fetching products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    const res = await api.get('/api/categories', token);
    setCategories(await res.json());
  };

  const fetchBrands = async () => {
    const res = await api.get('/api/brands', token);
    setBrands(await res.json());
  };

  const filteredProducts = products.filter((p) =>
    p.nombre.toLowerCase().includes(search.toLowerCase()) ||
    p.codigo_barras.includes(search)
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const body = {
        ...form,
        precio_costo: parseFloat(form.precio_costo) || 0,
        precio_venta: parseFloat(form.precio_venta) || 0,
        stock_actual: parseInt(form.stock_actual) || 0,
        stock_minimo: parseInt(form.stock_minimo) || 0,
        rubro_id: parseInt(form.rubro_id),
        marca_id: parseInt(form.marca_id),
      };
      const res = editing
        ? await api.put(`/api/products/${editing.id}`, body, token)
        : await api.post('/api/products', body, token);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      setModalOpen(false);
      setEditing(null);
      resetForm();
      fetchProducts();
    } catch (err) {
      setError(err.message);
    }
  };

  const resetForm = () => {
    setForm({
      codigo_barras: '', nombre: '', descripcion: '', precio_costo: '', precio_venta: '',
      stock_actual: 0, stock_minimo: 0, rubro_id: '', marca_id: '',
    });
  };

  const handleEdit = (prod) => {
    setEditing(prod);
    setForm({
      codigo_barras: prod.codigo_barras,
      nombre: prod.nombre,
      descripcion: prod.descripcion || '',
      precio_costo: prod.precio_costo,
      precio_venta: prod.precio_venta,
      stock_actual: prod.stock_actual,
      stock_minimo: prod.stock_minimo,
      rubro_id: prod.rubro_id,
      marca_id: prod.marca_id,
    });
    setModalOpen(true);
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

  const openNew = () => {
    setEditing(null);
    resetForm();
    setError('');
    setModalOpen(true);
  };

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
          <div>
            <p className="text-gray-500 text-sm">Inventario completo de productos</p>
          </div>
          <button onClick={openNew} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2.5 rounded-xl font-medium transition">
            + Nuevo Artículo
          </button>
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
                      <button onClick={() => handleEdit(prod)} className="text-blue-500 hover:text-blue-700 text-sm font-medium transition">Editar</button>
                      <button onClick={() => handleDelete(prod.id)} className="text-red-500 hover:text-red-700 text-sm font-medium transition">Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Artículo' : 'Nuevo Artículo'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Código de Barras *</label>
            <div className="flex gap-2">
              <input type="text" value={form.codigo_barras} onChange={(e) => setForm({ ...form, codigo_barras: e.target.value })}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                placeholder="Escanear o ingresar código" autoFocus />
              <button type="button" onClick={() => setCameraOpen(true)}
                className="px-4 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre *</label>
            <input type="text" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
              placeholder="Nombre del artículo" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Descripción</label>
            <textarea value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition resize-none"
              rows={2} placeholder="Descripción opcional" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Precio Costo</label>
              <input type="number" step="0.01" value={form.precio_costo} onChange={(e) => setForm({ ...form, precio_costo: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                placeholder="0.00" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Precio Venta</label>
              <input type="number" step="0.01" value={form.precio_venta} onChange={(e) => setForm({ ...form, precio_venta: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                placeholder="0.00" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Stock Actual</label>
              <input type="number" value={form.stock_actual} onChange={(e) => setForm({ ...form, stock_actual: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Stock Mínimo</label>
              <input type="number" value={form.stock_minimo} onChange={(e) => setForm({ ...form, stock_minimo: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Rubro *</label>
              <select value={form.rubro_id} onChange={(e) => setForm({ ...form, rubro_id: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition">
                <option value="">Seleccionar rubro</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Marca *</label>
              <select value={form.marca_id} onChange={(e) => setForm({ ...form, marca_id: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition">
                <option value="">Seleccionar marca</option>
                {brands.map((b) => <option key={b.id} value={b.id}>{b.nombre}</option>)}
              </select>
            </div>
          </div>

          <button type="submit" className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 rounded-xl transition">
            {editing ? 'Guardar Cambios' : 'Crear Artículo'}
          </button>
        </form>
      </Modal>

      <CameraScanner
        isOpen={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onScan={(code) => {
          setForm({ ...form, codigo_barras: code });
          setCameraOpen(false);
        }}
      />
      </main>
    </div>
  );
};

export default Products;
