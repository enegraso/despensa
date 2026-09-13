import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../api';
import Modal from '../components/Modal';

const Categories = () => {
  const { token } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [nombre, setNombre] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/api/categories', token);
      const data = await res.json();
      setCategories(data);
    } catch {
      console.error('Error fetching categories');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = editing
        ? await api.put(`/api/categories/${editing.id}`, { nombre }, token)
        : await api.post('/api/categories', { nombre }, token);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      setModalOpen(false);
      setEditing(null);
      setNombre('');
      fetchCategories();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (cat) => {
    setEditing(cat);
    setNombre(cat.nombre);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este rubro?')) return;
    try {
      await api.delete(`/api/categories/${id}`, token);
      fetchCategories();
    } catch {
      console.error('Error deleting category');
    }
  };

  const openNew = () => {
    setEditing(null);
    setNombre('');
    setError('');
    setModalOpen(true);
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
          <h1 className="text-xl font-bold text-gray-800">Rubros</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Gestiona las categorías de productos</p>
          </div>
          <button onClick={openNew} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2.5 rounded-xl font-medium transition">
            + Nuevo Rubro
          </button>
        </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Cargando...</div>
        ) : categories.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No hay rubros registrados</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">ID</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Nombre</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-sm text-gray-500">{cat.id}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-800">{cat.nombre}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button onClick={() => handleEdit(cat)} className="text-blue-500 hover:text-blue-700 text-sm font-medium transition">Editar</button>
                    <button onClick={() => handleDelete(cat.id)} className="text-red-500 hover:text-red-700 text-sm font-medium transition">Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Rubro' : 'Nuevo Rubro'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre</label>
            <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
              placeholder="Nombre del rubro" autoFocus />
          </div>
          <button type="submit" className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 rounded-xl transition">
            {editing ? 'Guardar Cambios' : 'Crear Rubro'}
          </button>
        </form>
      </Modal>
      </main>
    </div>
  );
};

export default Categories;
