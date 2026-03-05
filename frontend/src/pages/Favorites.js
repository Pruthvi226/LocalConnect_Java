import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { favoriteService } from '../services/favoriteService';
import { Heart } from 'lucide-react';
import ServiceCard from '../components/ServiceCard';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const data = await favoriteService.getAll();
      setFavorites(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Failed to load favorites');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (serviceId) => {
    try {
      await favoriteService.remove(serviceId);
      setFavorites((prev) => prev.filter((f) => f.service?.id !== serviceId));
    } catch (err) {
      console.error(err);
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

  const services = favorites.map((f) => f.service).filter(Boolean);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
          <Heart className="w-8 h-8 text-rose-500" />
          My Favorites
        </h1>

        {services.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-500 mb-4">You haven't saved any favorites yet.</p>
            <Link to="/" className="btn-primary">
              Browse Services
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div key={service.id} className="relative">
                <ServiceCard service={service} />
                <button
                  type="button"
                  onClick={() => handleRemove(service.id)}
                  className="absolute top-2 right-2 p-2 bg-white rounded-full shadow hover:bg-rose-50 text-rose-500"
                  aria-label="Remove from favorites"
                >
                  <Heart className="w-5 h-5 fill-current" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;
