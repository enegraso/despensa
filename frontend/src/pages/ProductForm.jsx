import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';
import CameraScanner from '../components/CameraScanner';

const ProductForm = () => {
  const { token } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const editing = Boolean(id);

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);

  const [form, setForm] = useState({
    codigo_barras: '', nombre: '', descripcion: '', imagen_url: '',
    precio_costo: '', precio_venta: '', stock_actual: 0, stock_minimo: 0,
    rubro_id: '', marca_id: '',
  });
  const [productId, setProductId] = useState(null);

  const nombreInputRef = useRef(null);
  const barcodeInputRef = useRef(null);
  const lookupTimerRef = useRef(null);

  useEffect(() => {
    Promise.all([fetchCategories(), fetchBrands()]).then(() => {
      if (editing) fetchProduct();
      else setLoading(false);
    });
  }, [id]);

  const fetchCategories = async () => {
    const res = await api.get('/api/categories', token);
    setCategories(await res.json());
  };

  const fetchBrands = async () => {
    const res = await api.get('/api/brands', token);
    setBrands(await res.json());
  };

  const fetchProduct = async () => {
    try {
      const res = await api.get(`/api/products/barcode/${id}`, token);
      if (!res.ok) throw new Error('Artículo no encontrado');
      const prod = await res.json();
      setProductId(prod.id);
      setForm({
        codigo_barras: prod.codigo_barras,
        nombre: prod.nombre,
        descripcion: prod.descripcion || '',
        imagen_url: prod.imagen_url || '',
        precio_costo: prod.precio_costo,
        precio_venta: prod.precio_venta,
        stock_actual: prod.stock_actual,
        stock_minimo: prod.stock_minimo,
        rubro_id: prod.rubro_id,
        marca_id: prod.marca_id,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBarcodeLookup = async (codigo) => {
    if (!codigo || codigo.length < 3) return;
    setLookupLoading(true);
    try {
      const res = await api.get(`/api/products/escanear/${codigo}`, token);
      const data = await res.json();
      if (data.success && data.data) {
        const d = data.data;
        let marcaId = '';
        if (d.marca_nombre) {
          const currentBrands = await api.get('/api/brands', token);
          const allBrands = await currentBrands.json();
          setBrands(allBrands);
          const existing = allBrands.find(b => b.nombre.toLowerCase() === d.marca_nombre.toLowerCase());
          if (existing) {
            marcaId = existing.id;
          } else {
            const newBrandRes = await api.post('/api/brands', { nombre: d.marca_nombre }, token);
            if (newBrandRes.ok) {
              const newBrand = await newBrandRes.json();
              setBrands(prev => [...prev, newBrand]);
              marcaId = newBrand.id;
            }
          }
        }
        setForm(prev => ({
          ...prev,
          nombre: d.nombre || prev.nombre,
          descripcion: d.descripcion || prev.descripcion,
          imagen_url: d.imagen_url || prev.imagen_url,
          marca_id: marcaId || prev.marca_id,
        }));
        setTimeout(() => nombreInputRef.current?.focus(), 100);
      }
    } catch { /* silenciar */ }
    finally { setLookupLoading(false); }
  };

  const handleBarcodeChange = (value) => {
    setForm(prev => ({ ...prev, codigo_barras: value }));
    if (lookupTimerRef.current) clearTimeout(lookupTimerRef.current);
    lookupTimerRef.current = setTimeout(() => handleBarcodeLookup(value), 300);
  };

  const handleNativeCapture = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm(prev => ({ ...prev, imagen_url: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
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
        ? await api.put(`/api/products/${productId}`, body, token)
        : await api.post('/api/products', body, token);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      navigate('/products');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
            <Link to="/products" className="text-gray-500 hover:text-gray-700 transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-xl font-bold text-gray-800">{editing ? 'Editar Artículo' : 'Nuevo Artículo'}</h1>
          </div>
        </header>
        <main className="max-w-3xl mx-auto px-4 py-8"><p className="text-gray-500 text-center">Cargando...</p></main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/products" className="text-gray-500 hover:text-gray-700 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-xl font-bold text-gray-800">{editing ? 'Editar Artículo' : 'Nuevo Artículo'}</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm">{error}</div>}

            {/* Código de Barras */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Código de Barras *</label>
              <div className="flex gap-2">
                <input type="text" value={form.codigo_barras}
                  onChange={(e) => handleBarcodeChange(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                  placeholder="Escanear o ingresar código" autoFocus ref={barcodeInputRef} />
                <button type="button" onClick={() => setCameraOpen(true)}
                  className="px-4 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>
              {lookupLoading && (
                <div className="flex items-center gap-2 mt-2 text-sm text-green-600">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  Buscando información del producto...
                </div>
              )}
            </div>

            {/* Nombre */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre *</label>
              <input type="text" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                placeholder="Nombre del artículo" disabled={lookupLoading} ref={nombreInputRef} />
              {lookupLoading && <div className="absolute inset-0 bg-white/40 rounded-xl pointer-events-none" />}
            </div>

            {/* Descripción + Imagen lado a lado */}
            <div className="flex gap-4">
              {/* Imagen (25%) */}
              <div className="w-1/4 flex-shrink-0">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Imagen</label>
                {form.imagen_url ? (
                  <div className="relative h-full">
                    <img src={form.imagen_url} alt="Vista previa" className="w-full h-full max-h-[300px] object-contain rounded-xl border border-gray-200 bg-gray-50" />
                    <button type="button" onClick={() => setForm({ ...form, imagen_url: '' })}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-xs transition">
                      ✕
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center gap-2 h-full max-h-[300px] rounded-xl border-2 border-dashed border-gray-300 hover:border-green-400 bg-gray-50 hover:bg-green-50 cursor-pointer transition text-gray-500 hover:text-green-600 text-xs text-center px-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Tomar foto
                    <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleNativeCapture} />
                  </label>
                )}
              </div>

              {/* Descripción (75%) */}
              <div className="w-3/4 relative">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Descripción</label>
                <textarea value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  className="w-full h-full min-h-[300px] px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition resize-none"
                  placeholder="Descripción opcional" disabled={lookupLoading} />
                {lookupLoading && <div className="absolute inset-0 bg-white/40 rounded-xl pointer-events-none" />}
              </div>
            </div>

            {/* Precios */}
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

            {/* Stock */}
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

            {/* Rubro y Marca */}
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

            {/* Botones */}
            <div className="flex gap-3 pt-2">
              <Link to="/products" className="flex-1 text-center bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-xl transition">
                Cancelar
              </Link>
              <button type="submit" disabled={saving}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-medium py-3 rounded-xl transition disabled:opacity-50">
                {saving ? 'Guardando...' : editing ? 'Guardar Cambios' : 'Crear Artículo'}
              </button>
            </div>
          </form>
        </div>
      </main>

      <CameraScanner
        isOpen={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onScan={(code) => {
          setCameraOpen(false);
          handleBarcodeChange(code);
        }}
      />
    </div>
  );
};

export default ProductForm;
