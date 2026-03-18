import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  MapPin, Star, Heart, User, 
  Zap, MessageSquare, ArrowRight,
  ShieldCheck, Info
} from 'lucide-react';

const ServiceCard = ({ service }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/services/${service.id}`);
  };

  const handleMessage = (e) => {
    e.stopPropagation();
    if (service.providerId) {
      navigate('/messages', {
        state: {
          partnerId: service.providerId,
          partnerName: service.providerName || 'Provider',
        },
      });
    } else {
      navigate('/messages');
    }
  };

  const handleFavorite = (e) => {
    e.stopPropagation();
    // Logic for toggling favorite
  };

  const truncate = (str, n) => {
    return str?.length > n ? str.substr(0, n - 1) + '...' : str;
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      className="group relative bg-white rounded-2xl border border-slate-100 shadow-premium hover:shadow-premium-hover transition-all duration-300 overflow-hidden cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Favorite Button */}
      <button
        onClick={handleFavorite}
        className="absolute top-3 right-3 z-20 w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-white transition-all shadow-sm"
      >
        <Heart className="w-5 h-5 transition-transform active:scale-125" />
      </button>

      {/* Availability Badge */}
      <div className="absolute top-3 left-3 z-20">
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md border shadow-sm ${
          service.isAvailable 
            ? 'bg-green-500/10 text-green-600 border-green-500/20' 
            : 'bg-slate-500/10 text-slate-500 border-slate-500/20'
        }`}>
          <div className={`w-1.5 h-1.5 rounded-full ${service.isAvailable ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`}></div>
          {service.isAvailable ? 'Now Available' : 'Waitlist Only'}
        </div>
      </div>

      {/* Card Image */}
      <div className="relative h-56 overflow-hidden">
        {service.imageUrl ? (
          <img
            src={service.imageUrl}
            alt={service.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary-100 to-indigo-50 flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-white/50 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-2">
               <Zap className="w-8 h-8 text-primary-600" />
            </div>
            <p className="text-primary-400 font-bold text-xs uppercase tracking-widest">No Preview</p>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>

      {/* Card Content */}
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
           <span className="text-[10px] font-bold text-primary-600 uppercase tracking-widest bg-primary-50 px-2 py-1 rounded">
             {service.category || 'General'}
           </span>
           <div className="flex items-center gap-1">
             <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
             <span className="text-sm font-bold text-slate-700">{service.averageRating?.toFixed(1) || '0.0'}</span>
             <span className="text-[10px] text-slate-400 font-medium">({service.totalReviews || 0})</span>
           </div>
        </div>

        <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-primary-600 transition-colors line-clamp-1">
          {service.title}
        </h3>
        
        <p className="text-sm text-slate-500 font-medium line-clamp-2 mb-4 h-10">
          {service.description || 'No description provided by this service expert.'}
        </p>

        {/* Info list */}
        <div className="space-y-2 mb-6">
           <div className="flex items-center gap-2 text-slate-500">
             <MapPin className="w-4 h-4 text-primary-500" />
             <span className="text-xs font-semibold truncate">
               {service.location || 'Local area'}
               {service.distanceKm && <span className="text-slate-400 font-medium ml-1">({service.distanceKm.toFixed(1)}km away)</span>}
             </span>
           </div>
           <div className="flex items-center gap-2 text-slate-500">
             <User className="w-4 h-4 text-slate-400" />
             <span className="text-xs font-semibold truncate capitalize">
               {service.providerName || 'ProxiSense Expert'}
             </span>
           </div>
        </div>

        {/* Pricing & Actions */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
           <div>
             <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Starts at</p>
             <p className="text-2xl font-black text-slate-900">₹{service.price}</p>
           </div>
           <div className="flex gap-2">
              <button 
                onClick={handleMessage}
                className="w-10 h-10 border border-slate-200 rounded-xl flex items-center justify-center text-slate-500 hover:text-primary-600 hover:border-primary-200 transition-all hover:bg-primary-50"
                title="Message Provider"
              >
                <MessageSquare className="w-5 h-5" />
              </button>
              <button 
                className="bg-primary-600 text-white font-bold py-2.5 px-5 rounded-xl text-sm flex items-center gap-2 hover:bg-primary-700 shadow-lg shadow-primary-500/20 active:scale-95 transition-all"
              >
                Book
                <ArrowRight className="w-4 h-4" />
              </button>
           </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ServiceCard;
