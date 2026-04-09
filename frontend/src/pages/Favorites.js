import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Heart, Bookmark, Search, 
  ArrowUpRight, Trash2, ShieldCheck,
  Star, MapPin, Sparkles, Navigation
} from 'lucide-react';
import { favoriteService } from '../services/favoriteService';
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
      setError('Failed to load favorites.');
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
      <div className="min-h-screen bg-slate-900 pt-32 px-6 flex flex-col items-center justify-center">
         <div className="w-20 h-20 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-6"></div>
         <p className="font-black text-white uppercase tracking-[0.3em] text-xs">Loading favorites...</p>
      </div>
    );
  }

  const services = favorites.map((f) => f.service).filter(Boolean);

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20">
      <div className="container mx-auto px-4 lg:px-6 max-w-7xl">
        
        {/* Vault Header */}
        <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
           <div>
              <div className="flex items-center gap-3 text-rose-600 mb-2 font-black uppercase tracking-[0.2em] text-[10px]">
                 <Bookmark className="w-4 h-4" />
                 My Saved Services
              </div>
              <h1 className="text-4xl lg:text-6xl font-black text-slate-900 tracking-tight">
                My <span className="text-rose-600">Curations.</span>
              </h1>
           </div>
           <div className="flex items-center gap-3">
              <div className="px-6 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total Saved</p>
                 <p className="text-xl font-black text-slate-900 leading-none">{services.length}</p>
              </div>
              <Link to="/" className="p-4 bg-slate-900 rounded-2xl text-white hover:scale-105 active:scale-95 transition-all shadow-xl shadow-slate-950/20">
                 <Search className="w-6 h-6" />
              </Link>
           </div>
        </header>

        {services.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative bg-white rounded-[3rem] p-16 text-center border-2 border-dashed border-slate-100 overflow-hidden shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-rose-50/50 to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10 max-w-md mx-auto">
               <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 border border-slate-100 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-sm">
                  <Heart className="w-10 h-10 text-slate-200 group-hover:text-rose-400 group-hover:fill-rose-400 transition-colors" />
               </div>
               <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-4 uppercase leading-none">No Favorites Yet</h2>
               <p className="text-slate-500 font-bold mb-10 leading-relaxed text-sm">
                  Start saving your favorite local experts. Your saved services will appear here.
               </p>
               <Link to="/" className="inline-flex items-center gap-3 px-10 py-5 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs hover:bg-primary-600 hover:shadow-2xl hover:shadow-primary-500/30 transition-all active:scale-95">
                  Find Services
                  <Navigation className="w-4 h-4" />
               </Link>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            <AnimatePresence>
              {services.map((service, idx) => (
                <motion.div 
                  key={service.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group relative"
                >
                  <ServiceCard service={service} />
                  
                  {/* Premium Remove Action */}
                  <button
                    type="button"
                    onClick={() => handleRemove(service.id)}
                    className="absolute -top-3 -right-3 w-12 h-12 bg-white rounded-2xl shadow-2xl flex items-center justify-center text-slate-300 hover:text-rose-500 hover:scale-110 active:scale-90 transition-all z-20 border border-slate-50 hover:border-rose-100 group-hover:rotate-6"
                    title="Remove Favorite"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>

                  <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                     <div className="flex flex-col gap-2">
                        <div className="px-4 py-2 bg-slate-900/90 backdrop-blur-md text-white rounded-xl text-[9px] font-black uppercase tracking-widest border border-white/10 shadow-2xl flex items-center gap-2">
                           <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                           Top Choice
                        </div>
                     </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Curation Guide */}
        {services.length > 0 && (
           <footer className="mt-20 pt-10 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-8 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500 cursor-default">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center border border-slate-200">
                    <ShieldCheck className="w-6 h-6 text-slate-400" />
                 </div>
                 <div>
                    <p className="text-xs font-black text-slate-800 uppercase tracking-widest leading-none mb-1">Saved Everywhere</p>
                    <p className="text-[10px] font-bold text-slate-400 leading-none">Your favorite services are synced across all your devices.</p>
                 </div>
              </div>
              <div className="flex gap-2">
                 {[1,2,3].map(i => <div key={i} className="w-2 h-2 bg-slate-200 rounded-full"></div>)}
              </div>
           </footer>
        )}

      </div>
    </div>
  );
};

export default Favorites;


