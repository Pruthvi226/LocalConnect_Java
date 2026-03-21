import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { RealtimeProvider } from './context/RealtimeContext';
import Navbar from './components/Navbar';

const Landing = lazy(() => import('./pages/Landing'));
const RoleSelection = lazy(() => import('./pages/RoleSelection'));
const Home = lazy(() => import('./pages/Home'));
const NearbyServices = lazy(() => import('./pages/NearbyServices'));
const LoginCustomer = lazy(() => import('./pages/LoginCustomer'));
const LoginProvider = lazy(() => import('./pages/LoginProvider'));
const RegisterCustomer = lazy(() => import('./pages/RegisterCustomer'));
const RegisterProvider = lazy(() => import('./pages/RegisterProvider'));
const ServiceDetails = lazy(() => import('./pages/ServiceDetails'));
const Bookings = lazy(() => import('./pages/Bookings'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const Profile = lazy(() => import('./pages/Profile'));
const CustomerDashboard = lazy(() => import('./pages/CustomerDashboard'));
const ProviderDashboard = lazy(() => import('./pages/ProviderDashboard'));
const CustomerProfile = lazy(() => import('./pages/CustomerProfile'));
const ProviderProfile = lazy(() => import('./pages/ProviderProfile'));
const Favorites = lazy(() => import('./pages/Favorites'));
const Messages = lazy(() => import('./pages/Messages'));
const Checkout = lazy(() => import('./pages/Checkout'));
const AIRecommendations = lazy(() => import('./pages/AIRecommendations'));


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

const LoadingFallback = () => (
   <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center">
         <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mb-4"></div>
         <p className="font-black text-slate-400 tracking-widest text-xs uppercase">Loading Module</p>
      </div>
   </div>
);

function AppRoutes() {
  return (
    <Suspense fallback={<LoadingFallback />}>
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
    </Suspense>
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
