import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { RealtimeProvider } from './context/RealtimeContext';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import RoleSelection from './pages/RoleSelection';
import Home from './pages/Home';
import NearbyServices from './pages/NearbyServices';
import LoginCustomer from './pages/LoginCustomer';
import LoginProvider from './pages/LoginProvider';
import RegisterCustomer from './pages/RegisterCustomer';
import RegisterProvider from './pages/RegisterProvider';
import ServiceDetails from './pages/ServiceDetails';
import Bookings from './pages/Bookings';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import CustomerDashboard from './pages/CustomerDashboard';
import ProviderDashboard from './pages/ProviderDashboard';
import CustomerProfile from './pages/CustomerProfile';
import ProviderProfile from './pages/ProviderProfile';
import Favorites from './pages/Favorites';
import Messages from './pages/Messages';
import Checkout from './pages/Checkout';
import AIRecommendations from './pages/AIRecommendations';


const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
  return isAuthenticated ? children : <Navigate to="/login/customer" />;
};

const AdminRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
  if (!isAuthenticated) return <Navigate to="/login/customer" />;
  if (user?.role !== 'ADMIN') return <Navigate to="/" />;
  return children;
};

const ProviderRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
  if (!isAuthenticated) return <Navigate to="/login/provider" />;
  if (user?.role !== 'PROVIDER' && user?.role !== 'ADMIN') return <Navigate to="/" />;
  return children;
};

const CustomerRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
  if (!isAuthenticated) return <Navigate to="/login/customer" />;
  if (user?.role !== 'USER') return <Navigate to="/" />;
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/role-selection" element={<RoleSelection />} />
      <Route path="/search" element={<Home />} />
      <Route path="/nearby" element={<NearbyServices />} />
      <Route path="/login" element={<RoleSelection />} />
      <Route path="/register" element={<RoleSelection />} />
      <Route path="/login/customer" element={<LoginCustomer />} />
      <Route path="/login/provider" element={<LoginProvider />} />
      <Route path="/register/customer" element={<RegisterCustomer />} />
      <Route path="/register/provider" element={<RegisterProvider />} />
      <Route path="/services/:id" element={<ServiceDetails />} />
      <Route
        path="/bookings"
        element={
          <PrivateRoute>
            <Bookings />
          </PrivateRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        }
      />
      <Route
        path="/customer/dashboard"
        element={
          <CustomerRoute>
            <CustomerDashboard />
          </CustomerRoute>
        }
      />
      <Route
        path="/customer/profile"
        element={
          <CustomerRoute>
            <CustomerProfile />
          </CustomerRoute>
        }
      />
      <Route
        path="/provider/dashboard"
        element={
          <ProviderRoute>
            <ProviderDashboard />
          </ProviderRoute>
        }
      />
      <Route
        path="/provider/profile"
        element={
          <ProviderRoute>
            <ProviderProfile />
          </ProviderRoute>
        }
      />
      <Route
        path="/favorites"
        element={
          <PrivateRoute>
            <Favorites />
          </PrivateRoute>
        }
      />
      <Route
        path="/messages"
        element={
          <PrivateRoute>
            <Messages />
          </PrivateRoute>
        }
      />
      <Route
        path="/checkout/:bookingId"
        element={
          <PrivateRoute>
            <Checkout />
          </PrivateRoute>
        }
      />
      <Route
        path="/recommendations"
        element={
          <PrivateRoute>
            <AIRecommendations />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <RealtimeProvider>
        <Router>
          <Navbar />
          <AppRoutes />
        </Router>
      </RealtimeProvider>
    </AuthProvider>
  );
}

export default App;
