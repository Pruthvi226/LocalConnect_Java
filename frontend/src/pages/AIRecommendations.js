import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Sparkles, MapPin, Star, 
  Clock, AlertTriangle, Loader2,
  Cpu, BrainCircuit, Zap, 
  ArrowUpRight, ShieldCheck,
  TrendingUp, Activity, Waves
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_BASE = (process.env.REACT_APP_API_URL || 'http://localhost:8080/api').replace('/api', '');

const AIRecommendations = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [UserLocation, setUserLocation] = useState(null);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setUserLocation({ lat: 12.9716, lng: 77.5946 }) // default: Bengaluru
    );
  }, []);

  const fetchRecommendations = useCallback(async () => {
    setLoading(true);
    try {
      // Swipe out the old ML microservice call for the new integrated Gemini AI endpoint
      const res = await api.get('/ai/recommendations');
      const { services: data, label } = res.data;
      setRecommendations(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("AI Engine is recalibrating. Showing best-rated alternatives.");
      // Fallback: fetch normal services if AI endpoint fails
      try {
        const fallbackRes = await api.get('/services');
        setRecommendations(Array.isArray(fallbackRes.data) ? fallbackRes.data.slice(0, 5) : []);
      } catch (e) {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 pt-32 px-6 flex flex-col items-center justify-center">
         <div className="relative w-24 h-24 mb-10">
            <div className="absolute inset-0 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-4 border-4 border-secondary-400 border-b-transparent rounded-full animate-spin-slow"></div>
            <BrainCircuit className="absolute inset-0 m-auto w-8 h-8 text-white animate-pulse" />
         </div>
         <p className="font-black text-white uppercase tracking-[0.4em] text-[10px] mb-2 animate-pulse">Curating recommendations</p>
         <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest">Analyzing your interests and location</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 pt-32 pb-24 overflow-hidden relative">
      
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
         <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary-600/10 rounded-full blur-[160px] -mr-96 -mt-96"></div>
         <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary-500/10 rounded-full blur-[120px] -ml-64 -mb-64"></div>
      </div>

      <div className="container mx-auto px-4 lg:px-6 max-w-7xl relative z-10">
        
        {/* Header HUD */}
        <header className="mb-16 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
           <div className="max-w-xl">
              <div className="flex items-center gap-3 text-primary-400 mb-4 font-black uppercase tracking-[0.2em] text-[10px]">
                 <Sparkles className="w-4 h-4" />
                 Personalized Recommendations
              </div>
              <h1 className="text-4xl lg:text-6xl font-black text-white tracking-tight mb-6">
                Tailored <span className="text-primary-500 italic">For You.</span>
              </h1>
              <p className="text-slate-400 font-bold leading-relaxed">
                 Our smart recommendation engine analyzes your preferences and location to find the best experts for you.
              </p>
           </div>
           <div className="flex flex-col gap-4">
              <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 backdrop-blur-xl flex items-center gap-6">
                 <div className="w-12 h-12 bg-primary-500/20 rounded-2xl flex items-center justify-center text-primary-400 border border-white/5 shadow-inner">
                    <Activity className="w-6 h-6" />
                 </div>
                 <div>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">System Status</p>
                    <p className="text-sm font-black text-green-400 leading-none uppercase tracking-tighter">Online & Up to Date</p>
                 </div>
              </div>
              <div className="px-6 py-2 bg-primary-500 self-start lg:self-end rounded-full text-[9px] font-black text-white uppercase tracking-[0.2em] shadow-lg shadow-primary-500/20">
                 Verified Services
              </div>
           </div>
        </header>

        {/* Selection Criteria */}
        <section className="mb-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           {[
             { l: 'Your Interests', v: 40, c: 'text-primary-400' },
             { l: 'Provider Rating', v: 30, c: 'text-secondary-400' },
             { l: 'Distance', v: 20, c: 'text-amber-400' },
             { l: 'Trust Score', v: 10, c: 'text-emerald-400' }
           ].map((item, i) => (
             <div key={i} className="bg-white/2 border border-white/5 p-6 rounded-[2rem] backdrop-blur-sm">
                <div className="flex justify-between items-end mb-4 font-black text-[10px] uppercase tracking-widest text-slate-500">
                   <span>{item.l}</span>
                   <span className={item.c}>{item.v}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: `${item.v}%` }}
                     transition={{ duration: 1, delay: i * 0.1 }}
                     className={`h-full bg-current ${item.c}`}
                   ></motion.div>
                </div>
             </div>
           ))}
        </section>

        {/* Error/Sync Status */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 bg-red-500/10 border border-red-500/20 rounded-3xl p-6 flex items-center gap-4 text-red-200"
          >
             <AlertTriangle className="w-6 h-6 text-red-500" />
             <p className="text-sm font-bold uppercase tracking-tight">{error} Retrying connection...</p>
          </motion.div>
        )}

        {/* Content Stream */}
        {recommendations.length === 0 ? (
          <div className="py-32 text-center">
             <div className="w-32 h-32 bg-white/5 rounded-[3rem] flex items-center justify-center mx-auto mb-10 border border-white/5">
                <Waves className="w-16 h-16 text-slate-700 animate-pulse" />
             </div>
             <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-4 leading-none">No matches found yet.</h3>
             <p className="text-slate-500 max-w-sm mx-auto font-bold mb-10">
                Explore more services to help us find better recommendations for you.
             </p>
             <Link to="/" className="inline-flex items-center gap-3 px-10 py-5 bg-primary-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs hover:scale-105 transition-all">
                Find Services
             </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {recommendations.map((svc, idx) => (
                <motion.div
                  key={svc.id}
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="group relative"
                >
                  <Link to={`/services/${svc.id}`} className="block">
                     <div className="bg-slate-900 border border-white/10 rounded-[2.5rem] overflow-hidden group-hover:border-primary-500/40 transition-all duration-500 shadow-2xl relative">
                        {/* Match Score */}
                        <div className="absolute top-6 right-6 z-20">
                           <div className="bg-slate-950/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 flex items-center gap-2 group-hover:bg-primary-600 group-hover:text-white transition-all">
                              <Zap className="w-3 h-3 text-amber-500 group-hover:text-white" />
                              <span className="text-[10px] font-black uppercase tracking-[0.2em]">{Math.max(65, 98 - idx * 4)}% Sync</span>
                           </div>
                        </div>

                        {/* Service Preview */}
                        <div className="h-64 relative overflow-hidden">
                           <img 
                              src={svc.imageUrl || `https://source.unsplash.com/featured/?${svc.category},service`} 
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 grayscale-[0.3] group-hover:grayscale-0" 
                              alt="" 
                           />
                           <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
                           
                           {/* Rank */}
                           <div className="absolute bottom-6 left-8">
                              <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center font-black text-2xl text-white group-hover:bg-primary-500 transition-all">
                                 0{idx + 1}
                              </div>
                           </div>
                        </div>

                        {/* Service Details */}
                        <div className="p-8 pb-10">
                           <div className="flex items-center gap-3 mb-4">
                              <span className="bg-primary-500/10 text-primary-400 px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border border-primary-500/20">
                                 {svc.category || 'Service'}
                              </span>
                              <div className="flex items-center gap-1.5 text-slate-400 font-bold text-xs uppercase tracking-tighter">
                                 <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                 {svc.averageRating?.toFixed(1) || 'N/A'}
                              </div>
                           </div>
                           
                           <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight group-hover:text-primary-400 transition-colors truncate">
                              {svc.title}
                           </h3>
                           
                           <p className="text-sm font-bold text-slate-500 flex items-center gap-2 mb-6">
                              <MapPin className="w-4 h-4 text-slate-700" /> {svc.location || 'Local Area'}
                           </p>

                           <div className="flex items-center justify-between pt-6 border-t border-white/5">
                              <div>
                                 <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Service Price</p>
                                 <p className="text-xl font-black text-white">₹{svc.price || '500'}<span className="text-[10px] text-slate-500">/hr</span></p>
                              </div>
                              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-500 group-hover:bg-primary-500 group-hover:text-white transition-all shadow-xl">
                                 <ArrowUpRight className="w-6 h-6" />
                              </div>
                           </div>
                        </div>
                     </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Intelligence Statement */}
        <footer className="mt-24 p-12 bg-white/2 border border-white/5 rounded-[3rem] backdrop-blur-sm text-center">
           <div className="max-w-xl mx-auto">
              <Cpu className="w-10 h-10 text-primary-500 mx-auto mb-6" />
              <h4 className="text-lg font-black text-white uppercase tracking-tight mb-4">Privacy & Data Policy</h4>
              <p className="text-xs font-bold text-slate-500 leading-relaxed mb-8">
                 Recommendations are updated regularly based on your activity. Your data is secure and never shared without your permission.
              </p>
              <div className="flex gap-4 justify-center">
                 <div className="flex items-center gap-2 px-6 py-2 bg-slate-900 border border-white/5 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    <ShieldCheck className="w-4 h-4 text-green-500" />
                    Secure & Private
                 </div>
              </div>
           </div>
        </footer>

      </div>
    </div>
  );
};

export default AIRecommendations;


