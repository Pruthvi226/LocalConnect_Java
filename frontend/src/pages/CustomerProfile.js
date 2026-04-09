import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, MapPin, Heart, BookOpen, MessageCircle } from 'lucide-react';

const UserProfile = () => {
  const { user, loading } = useAuth();

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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
          My Profile
        </h1>

        <div className="card mb-8">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-600 to-secondary-600 flex items-center justify-center text-white text-3xl font-bold">
                {user.fullName?.charAt(0) || user.username?.charAt(0) || 'U'}
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-1">{user.fullName || user.username}</h2>
              <p className="text-gray-500 mb-4">@{user.username}</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-700">
                  <Mail className="w-5 h-5 text-primary-600" />
                  <span>{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Phone className="w-5 h-5 text-primary-600" />
                    <span>{user.phone}</span>
                  </div>
                )}
                {user.address && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <MapPin className="w-5 h-5 text-primary-600" />
                    <span>{user.address}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link to="/favorites" className="card flex items-center gap-3 hover:shadow-lg transition-shadow">
            <Heart className="w-8 h-8 text-rose-500" />
            <div>
              <p className="font-medium">Favorites</p>
              <p className="text-sm text-gray-500">Saved services</p>
            </div>
          </Link>
          <Link to="/bookings" className="card flex items-center gap-3 hover:shadow-lg transition-shadow">
            <BookOpen className="w-8 h-8 text-primary-600" />
            <div>
              <p className="font-medium">My Bookings</p>
              <p className="text-sm text-gray-500">Booking history</p>
            </div>
          </Link>
          <Link to="/messages" className="card flex items-center gap-3 hover:shadow-lg transition-shadow">
            <MessageCircle className="w-8 h-8 text-secondary-600" />
            <div>
              <p className="font-medium">Messages</p>
              <p className="text-sm text-gray-500">Chat with providers</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;

