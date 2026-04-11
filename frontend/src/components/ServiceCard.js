import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  MapPin, Star, Heart, User, 
  Zap, MessageSquare, ArrowRight,
  ShieldCheck, Eye 
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
      whileHover={{ y: -6 }}
      className="group relative bg-white rounded-[2rem] border border-slate-100/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.12)] transition-all duration-500 overflow-hidden cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Quick Actions (Top Right) */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300">
        <button
          onClick={handleFavorite}
          className="w-10 h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-white shadow-lg active:scale-95 transition-all"
          title="Favorite"
        >
          <Heart className="w-5 h-5" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); navigate(`/services/${service.id}`); }}
          className="w-10 h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-white shadow-lg active:scale-95 transition-all outline-none"
          title="Quick View"
        >
          <Eye className="w-5 h-5" />
        </button>
      </div>

      {/* Badges Overlay (Top Left) */}
      <div className="absolute top-4 left-4 z-20 flex flex-col items-start gap-2">
        {service.isAvailableNow && (
           <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-500 text-white shadow-md">
             <Zap className="w-3 h-3 fill-white" />
             Fast Response
           </div>
        )}
        
        {service.averageRating >= 4.5 && (
           <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-500 text-white shadow-md">
             <Star className="w-3 h-3 fill-white" />
             Top Rated
           </div>
        )}
        
        {(!service.isAvailableNow && service.isAvailable) && (
           <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-slate-900/80 backdrop-blur-md text-white shadow-sm border border-white/20">
             Now Available
           </div>
        )}
      </div>

      {/* Card Image */}
      <div className="relative h-60 overflow-hidden bg-slate-100">
        {service.imageUrl ? (
          <img
            src={service.imageUrl}
            alt={service.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-50 to-purple-50 flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-white/60 backdrop-blur-md rounded-2xl flex items-center justify-center mb-2 shadow-sm">
               <Zap className="w-8 h-8 text-indigo-400" />
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
        
        {/* Dynamic Image Inner Info (Replacing bottom gradient text need) */}
        {(service.providerTrustScore || (service.provider && service.provider.trustScore)) && (
          <div className="absolute bottom-4 left-4 z-10 flex items-center gap-1.5 text-[10px] font-black text-white bg-indigo-500 px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
             <ShieldCheck className="w-3.5 h-3.5" /> 
             Verified Expert
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-6 relative bg-white">
        <div className="flex justify-between items-start mb-3">
           <div className="flex flex-col gap-1.5 flex-1 pr-2">
              <span className="text-[10px] w-fit font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2.5 py-1 rounded-md">
                {service.category || 'General'}
              </span>
           </div>
           
           <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg">
             <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
             <span className="text-sm font-black text-amber-700">{service.averageRating?.toFixed(1) || 'NEW'}</span>
             <span className="text-[10px] text-amber-600/70 font-bold hidden sm:inline-block">({service.reviewCount || service.totalReviews || 0})</span>
           </div>
        </div>

        <h3 className="text-xl font-black text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-1">
          {service.title}
        </h3>
        
        <p className="text-sm text-slate-500 font-medium line-clamp-2 mb-5 h-10 leading-relaxed">
          {service.description || 'Premium local service expert. Instant booking available.'}
        </p>

        {/* Info list */}
        <div className="space-y-2.5 mb-6">
           <div className="flex items-center gap-3 text-slate-600">
             <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                <MapPin className="w-3 h-3 text-indigo-500" />
             </div>
             <span className="text-xs font-bold truncate">
               {service.location || 'Local area'}
               {service.distanceKm && <span className="text-slate-400 font-medium ml-1">({service.distanceKm.toFixed(1)}km away)</span>}
             </span>
           </div>
           <div className="flex items-center gap-3 text-slate-600">
             <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                <User className="w-3 h-3 text-slate-400" />
             </div>
             <span className="text-xs font-bold truncate capitalize">
               {service.providerName || 'ProxiSense Partner'}
             </span>
           </div>
        </div>

        {/* Pricing & Actions */}
        <div className="pt-5 border-t border-slate-100 flex items-center justify-between">
           <div>
             <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-0.5">Starts at</p>
             <p className="text-2xl font-black text-slate-900 tracking-tight">₹{service.price}</p>
           </div>
           <div className="flex items-center gap-2 relative">
              <button 
                onClick={handleMessage}
                className="w-11 h-11 border border-slate-200 rounded-xl flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:border-indigo-200 transition-all hover:bg-indigo-50 z-10"
                title="Message Provider"
              >
                <MessageSquare className="w-5 h-5" />
              </button>
              
              {/* Dynamic Book CTA - reveals strictly on hover */}
              <button 
                onClick={(e) => { e.stopPropagation(); navigate(`/services/${service.id}`); }}
                className="absolute right-0 opacity-0 group-hover:opacity-100 group-hover:relative bg-indigo-600 text-white font-black py-2.5 px-6 rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-indigo-700 shadow-xl shadow-indigo-500/30 active:scale-95 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0 z-20"
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

