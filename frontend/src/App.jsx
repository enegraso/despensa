import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Home from './pages/Home';
import Categories from './pages/Categories';
import Brands from './pages/Brands';
import Products from './pages/Products';
import Scanner from './pages/Scanner';
import StockEntry from './pages/StockEntry';
import ConsumptionReport from './pages/ConsumptionReport';
import PurchasesReport from './pages/PurchasesReport';
import PriceList from './pages/PriceList';
import ReplenishmentList from './pages/ReplenishmentList';
import './index.css';

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/categories" element={<ProtectedRoute><Categories /></ProtectedRoute>} />
      <Route path="/brands" element={<ProtectedRoute><Brands /></ProtectedRoute>} />
      <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
      <Route path="/scanner" element={<ProtectedRoute><Scanner /></ProtectedRoute>} />
      <Route path="/stock-entry" element={<ProtectedRoute><StockEntry /></ProtectedRoute>} />
      <Route path="/reports/consumption" element={<ProtectedRoute><ConsumptionReport /></ProtectedRoute>} />
      <Route path="/reports/purchases" element={<ProtectedRoute><PurchasesReport /></ProtectedRoute>} />
      <Route path="/reports/prices" element={<ProtectedRoute><PriceList /></ProtectedRoute>} />
      <Route path="/reports/replenishment" element={<ProtectedRoute><ReplenishmentList /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter basename="/despensa">
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
