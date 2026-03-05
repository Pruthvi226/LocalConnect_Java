import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { customerService } from '../services/customerService';
import { bookingService } from '../services/bookingService';
import { favoriteService } from '../services/favoriteService';
import { Calendar, Heart, MessageCircle, Bell, BookOpen } from 'lucide-react';
import ThreeDBackground from '../components/ThreeDBackground';

const CustomerDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [summaryData, bookingsData, favoritesData] = await Promise.all([
        customerService.getSummary(),
        bookingService.getAll(),
        favoriteService.getAll(),
      ]);
      setSummary(summaryData);
      setBookings(Array.isArray(bookingsData) ? bookingsData : []);
      setFavorites(Array.isArray(favoritesData) ? favoritesData : []);
    } catch (err) {
      setError('Failed to load dashboard');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>
      </div>
    );
  }

  const cards = [
    { label: 'Total Bookings', value: summary?.totalBookings ?? 0, icon: BookOpen, iconClass: 'bg-primary-100 text-primary-600' },
    { label: 'Pending', value: summary?.pendingBookings ?? 0, icon: Calendar, iconClass: 'bg-amber-100 text-amber-600' },
    { label: 'Favorites', value: summary?.favoritesCount ?? 0, icon: Heart, iconClass: 'bg-rose-100 text-rose-600' },
    { label: 'Unread Messages', value: summary?.unreadMessages ?? 0, icon: MessageCircle, iconClass: 'bg-blue-100 text-blue-600' },
    { label: 'Notifications', value: summary?.unreadNotifications ?? 0, icon: Bell, iconClass: 'bg-violet-100 text-violet-600' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              Customer Dashboard
            </h1>
          </div>
          <div className="w-full md:w-48 h-32 rounded-xl overflow-hidden shadow-lg">
            <ThreeDBackground className="h-32" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
          {cards.map(({ label, value, icon: Icon, iconClass }) => (
            <div key={label} className="card flex items-center gap-4">
              <div className={`p-3 rounded-xl ${iconClass}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{label}</p>
                <p className="text-2xl font-bold">{value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <section className="card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Recent Bookings</h2>
              <Link to="/bookings" className="text-primary-600 hover:underline font-medium">
                View all
              </Link>
            </div>
            {bookings.length === 0 ? (
              <p className="text-gray-500">No bookings yet.</p>
            ) : (
              <ul className="space-y-3">
                {bookings.slice(0, 5).map((b) => (
                  <li key={b.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                    <span className="font-medium">{b.service?.title ?? 'Service'}</span>
                    <span className={`px-2 py-0.5 rounded text-sm ${b.status === 'PENDING' ? 'bg-amber-100' : b.status === 'CONFIRMED' ? 'bg-green-100' : 'bg-gray-100'}`}>
                      {b.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Favorites</h2>
              <Link to="/favorites" className="text-primary-600 hover:underline font-medium">
                View all
              </Link>
            </div>
            {favorites.length === 0 ? (
              <p className="text-gray-500">No favorites yet.</p>
            ) : (
              <ul className="space-y-3">
                {favorites.slice(0, 5).map((f) => (
                  <li key={f.id}>
                    <Link to={`/services/${f.service?.id}`} className="font-medium text-primary-600 hover:underline">
                      {f.service?.title ?? 'Service'}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <div className="mt-8">
          <Link to="/messages" className="btn-primary inline-flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Open Messages
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
