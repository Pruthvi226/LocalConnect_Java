import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { providerService } from '../services/providerService';
import { User, Mail, Phone, MapPin, Briefcase, CreditCard, ShieldCheck, Star } from 'lucide-react';
import ThreeDBackground from '../components/ThreeDBackground';

const ProviderProfile = () => {
  const { user, loading } = useAuth();
  const [services, setServices] = useState([]);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    if (user?.role === 'PROVIDER' || user?.role === 'ADMIN') {
      providerService.getSummary().then(setSummary).catch(() => {});
      providerService.getMyServices().then((s) => setServices(Array.isArray(s) ? s : [])).catch(() => {});
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-gray-600">Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-white to-primary-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-secondary-600 to-primary-600 bg-clip-text text-transparent">
            Provider Profile
          </h1>
          <div className="w-full md:w-40 h-28 rounded-xl overflow-hidden shadow-lg flex-shrink-0">
            <ThreeDBackground className="h-28" />
          </div>
        </div>

        <div className="card mb-8">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-secondary-600 to-primary-600 flex items-center justify-center text-white text-3xl font-bold">
              {user.fullName?.charAt(0) || user.username?.charAt(0) || 'P'}
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-1 flex items-center gap-3">
               {user.fullName || user.username}
                 {user.averageRating != null && (
                   <span className="bg-amber-100 text-amber-700 text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1 border border-amber-200">
                     <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                     {user.averageRating.toFixed(1)} ({user.totalReviews || 0} Reviews)
                   </span>
                 )}
                 {user.trustScore != null && (
                    <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1 border border-green-200">
                       <ShieldCheck className="w-3.5 h-3.5" />
                        Trust Score: {user.trustScore}
                    </span>
                 )}
              </h2>
              <p className="text-gray-500 mb-4">@{user.username}</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-700">
                  <Mail className="w-5 h-5 text-secondary-600" />
                  <span>{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Phone className="w-5 h-5 text-secondary-600" />
                    <span>{user.phone}</span>
                  </div>
                )}
                {user.address && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <MapPin className="w-5 h-5 text-secondary-600" />
                    <span>{user.address}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Briefcase className="w-6 h-6 text-secondary-600" />
              <h3 className="text-lg font-semibold">Services Summary</h3>
            </div>
            <p className="text-2xl font-bold text-primary-600">{summary?.totalServices ?? services.length}</p>
            <p className="text-sm text-gray-500">Active listings</p>
            <Link to="/provider/dashboard" className="text-secondary-600 hover:underline font-medium mt-2 inline-block">
              Manage services →
            </Link>
          </div>
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-6 h-6 text-secondary-600" />
              <h3 className="text-lg font-semibold">Earnings</h3>
            </div>
            <p className="text-2xl font-bold text-green-600">
              ${summary?.totalRevenue != null ? Number(summary.totalRevenue).toFixed(2) : '0.00'}
            </p>
            <p className="text-sm text-gray-500">Total revenue (completed payments)</p>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Payment & Payout Settings</h3>
          <p className="text-gray-600 text-sm">
            Payment methods and payout preferences can be configured from the dashboard when you receive payments through the platform.
          </p>
          <Link to="/provider/dashboard" className="btn-secondary mt-4 inline-block">
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProviderProfile;

