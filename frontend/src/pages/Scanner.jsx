import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../api';
import CameraScanner from '../components/CameraScanner';

const Scanner = () => {
  const { token } = useAuth();
  const inputRef = useRef(null);
  const qtyRef = useRef(null);

  const [code, setCode] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('scan');
  const [cameraOpen, setCameraOpen] = useState(false);

  useEffect(() => {
    if (step === 'scan') {
      inputRef.current?.focus();
    } else if (step === 'confirm') {
      qtyRef.current?.focus();
      qtyRef.current?.select();
    }
  }, [step]);

  const focusScanInput = () => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  const handleScan = async (e) => {
    e.preventDefault();
    const scannedCode = code.trim();
    if (!scannedCode) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await api.get(`/api/stock-movements/lookup/${scannedCode}`, token);

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        focusScanInput();
        return;
      }

      setSelectedProduct(data);
      setQuantity(1);
      setStep('confirm');
    } catch {
      setError('Error de conexión');
      focusScanInput();
    } finally {
      setCode('');
      setLoading(false);
    }
  };

  const handleConfirm = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return;

    if (quantity <= 0) {
      setError('La cantidad debe ser mayor a 0');
      qtyRef.current?.focus();
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.post('/api/stock-movements/confirm', { product_id: selectedProduct.id, cantidad: quantity }, token);

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        if (data.product) {
          setSelectedProduct({ ...selectedProduct, stock_actual: data.product.stock_actual });
        }
        qtyRef.current?.focus();
        return;
      }

      setSuccess(`${quantity}x "${data.product.nombre}" — Stock restante: ${data.product.stock_actual}`);
      setHistory((prev) => [
        { ...data.product, cantidad: quantity, precio_total: (parseFloat(data.product.precio_venta) * quantity).toFixed(2), fecha: new Date().toLocaleTimeString() },
        ...prev.slice(0, 9),
      ]);

      setSelectedProduct(null);
      setQuantity(1);
      setStep('scan');
      focusScanInput();
    } catch {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setSelectedProduct(null);
    setQuantity(1);
    setError('');
    setStep('scan');
    focusScanInput();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-gray-500 hover:text-gray-700 transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-xl font-bold text-gray-800">Consumo Rápido</h1>
          </div>
          <Link to="/" className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition">
            Volver al Panel
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">

        {step === 'scan' && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
              </div>
              <p className="text-gray-500">Escanee o ingrese el código de barras</p>
            </div>

            <form onSubmit={handleScan}>
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="flex-1 px-6 py-4 text-center text-2xl font-mono rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                  placeholder="Esperando escaneo..."
                  autoComplete="off"
                  disabled={loading}
                />
                <button type="button" onClick={() => setCameraOpen(true)}
                  className="px-4 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>
            </form>
          </div>
        )}

        {step === 'confirm' && selectedProduct && (
          <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
            <div className="text-center border-b border-gray-100 pb-6">
              <p className="text-sm text-gray-500 mb-2">Producto escaneado</p>
              <h2 className="text-3xl font-bold text-gray-800 mb-1">{selectedProduct.nombre}</h2>
              <p className="text-sm text-gray-500">{selectedProduct.rubro?.nombre} — {selectedProduct.marca?.nombre}</p>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-500 mb-1">Precio unitario</p>
              <p className="text-5xl font-bold text-green-600">${parseFloat(selectedProduct.precio_venta).toFixed(2)}</p>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-500 mb-2">Stock disponible: <span className="font-medium text-gray-700">{selectedProduct.stock_actual}</span></p>
            </div>

            <form onSubmit={handleConfirm} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 text-center">Cantidad a llevar</label>
                <input
                  ref={qtyRef}
                  type="number"
                  min="1"
                  max={selectedProduct.stock_actual}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-full px-6 py-4 text-center text-3xl font-bold rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                />
              </div>

              <div className="text-center bg-gray-50 rounded-xl py-3">
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-2xl font-bold text-gray-800">
                  ${(parseFloat(selectedProduct.precio_venta) * quantity).toFixed(2)}
                </p>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm border border-red-100 text-center">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={handleCancel}
                  className="py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition">
                  Cancelar
                </button>
                <button type="submit" disabled={loading || quantity <= 0}
                  className="py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-medium transition disabled:opacity-50">
                  {loading ? 'Procesando...' : 'Confirmar Baja'}
                </button>
              </div>
            </form>
          </div>
        )}

        {success && (
          <div className="bg-green-50 text-green-600 px-4 py-3 rounded-xl text-sm border border-green-100 flex items-center gap-2">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {success}
          </div>
        )}

        {error && step === 'scan' && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm border border-red-100 flex items-center gap-2">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        {history.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-500 uppercase">Últimos consumos</h3>
            </div>
            <div className="divide-y divide-gray-50">
              {history.map((item, i) => (
                <div key={i} className="px-6 py-3 flex items-center justify-between hover:bg-gray-50 transition">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{item.nombre}</p>
                    <p className="text-xs text-gray-400">{item.codigo_barras}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-red-600">-{item.cantidad} u.</p>
                    <p className="text-xs text-gray-400">${item.precio_total} — {item.fecha}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <CameraScanner
        isOpen={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onScan={(scannedCode) => {
          setCode(scannedCode);
          setCameraOpen(false);
          setTimeout(() => {
            const event = { preventDefault: () => {} };
            handleScan(event);
          }, 100);
        }}
      />
    </div>
  );
};

export default Scanner;
