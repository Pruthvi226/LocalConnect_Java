import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Star, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

const ServiceCard = ({ service }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/services/${service.id}`);
  };

  return (
    <motion.div
      whileHover={{ y: -8 }}
      className="card cursor-pointer overflow-hidden group"
      onClick={handleClick}
    >
      {service.imageUrl ? (
        <div className="relative h-48 overflow-hidden">
          <img
            src={service.imageUrl}
            alt={service.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
          <div className="absolute top-2 right-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                // Handle favorite
              }}
              className="bg-white/90 hover:bg-white p-2 rounded-full transition-colors"
            >
              <Heart className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      ) : (
        <div className="h-48 bg-gradient-to-br from-primary-200 to-secondary-200 flex items-center justify-center">
          <span className="text-4xl">🔧</span>
        </div>
      )}

      <div className="p-4">
        <h3 className="text-xl font-bold mb-2 line-clamp-1">{service.title}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {service.description?.substring(0, 100)}...
        </p>

        <div className="flex items-center text-gray-500 text-sm mb-3">
          <MapPin className="w-4 h-4 mr-1" />
          <span className="truncate">{service.location || 'Location not specified'}</span>
        </div>

        <div className="flex items-center justify-between mb-3">
          <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-xs font-semibold">
            {service.category}
          </span>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold">{service.averageRating?.toFixed(1) || '0.0'}</span>
            <span className="text-gray-500 text-xs">({service.totalReviews || 0})</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t">
          <span className="text-2xl font-bold text-primary-600">
            ${service.price}
          </span>
          {service.isAvailable ? (
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
              Available
            </span>
          ) : (
            <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold">
              Unavailable
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ServiceCard;
