import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Zap, ShieldCheck, MapPin, 
  Clock, ArrowRight, Star,
  Search, AlertCircle
} from 'lucide-react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const FlashAssistModal = ({ isOpen, onClose, userLocation }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState('category'); // 'category', 'scanning', 'results'
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [scanning, setScanning] = useState(false);

  const categories = [
    { id: 'Plumber', icon: '🔧', color: 'bg-blue-500' },
    { id: 'Electrician', icon: '⚡', color: 'bg-amber-500' },
    { id: 'AC Repair', icon: '❄️', color: 'bg-cyan-500' },
    { id: 'Cleaning', icon: '🧹', color: 'bg-emerald-500' },
    { id: 'Carpenter', icon: '🪚', color: 'bg-orange-500' },
    { id: 'Pest Control', icon: '🐜', color: 'bg-rose-500' }
  ];

  const handleStartScan = async (category) => {
    setSelectedCategory(category);
    setStep('scanning');
    setScanning(true);

    try {
      // Small artificial delay for "scanning" feel
      await new Promise(r => setTimeout(r, 2500));
      
      const res = await api.post('/ai/flash-assist', {
        category,
        lat: userLocation?.lat || 17.3850, // Default to demo location if missing
        lng: userLocation?.lng || 78.4867
      });
      
      setCandidates(res.data.candidates || []);
      setStep('results');
    } catch (err) {
      console.error(err);
      setStep('results'); // Show empty state if error
    } finally {
      setScanning(false);
    }
  };

  const handleFlashBook = (serviceId) => {
    onClose();
    navigate(`/services/${serviceId}`);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 40 }}
          className="relative bg-white rounded-[3rem] shadow-2xl max-w-lg w-full overflow-hidden"
        >
          {/* Header */}
          <div className="bg-rose-600 p-8 text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
             <button 
               onClick={onClose}
               className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
             >
                <X className="w-5 h-5" />
             </button>
             <div className="flex items-center gap-4 mb-2">
                <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
                   <Zap className="w-6 h-6 fill-white" />
                </div>
                <h2 className="text-2xl font-black tracking-tight">Flash Assist SOS</h2>
             </div>
             <p className="text-rose-100 font-bold text-sm">Instant 60s matching for emergencies.</p>
          </div>

          <div className="p-8 max-h-[70vh] overflow-y-auto">
             {step === 'category' && (
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Select Emergency Category</p>
                  <div className="grid grid-cols-2 gap-4">
                     {categories.map((cat) => (
                       <button
                         key={cat.id}
                         onClick={() => handleStartScan(cat.id)}
                         className="flex flex-col items-center gap-3 p-6 bg-slate-50 border border-slate-100 rounded-3xl hover:bg-white hover:border-rose-200 hover:shadow-xl hover:shadow-rose-100 transition-all group"
                       >
                          <span className="text-3xl grayscale group-hover:grayscale-0 transition-all">{cat.icon}</span>
                          <span className="text-xs font-black text-slate-700 uppercase tracking-widest">{cat.id}</span>
                       </button>
                     ))}
                  </div>
               </motion.div>
             )}

             {step === 'scanning' && (
               <div className="py-12 flex flex-col items-center justify-center text-center">
                  <div className="relative w-48 h-48 mb-8">
                     {/* Radar Animation */}
                     <motion.div 
                       animate={{ 
                         scale: [1, 1.5],
                         opacity: [0.5, 0]
                       }}
                       transition={{ 
                         repeat: Infinity,
                         duration: 2,
                         ease: "easeOut"
                       }}
                       className="absolute inset-0 bg-rose-500/20 rounded-full"
                     />
                     <motion.div 
                       animate={{ 
                         scale: [1, 1.3],
                         opacity: [0.3, 0]
                       }}
                       transition={{ 
                         repeat: Infinity,
                         duration: 2,
                         delay: 0.5,
                         ease: "easeOut"
                       }}
                       className="absolute inset-0 bg-rose-500/10 rounded-full"
                     />
                     <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-24 h-24 bg-rose-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-rose-200 animate-pulse">
                           <MapPin className="w-12 h-12 text-white" />
                        </div>
                     </div>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-2">Scanning for {selectedCategory}</h3>
                  <p className="text-slate-500 font-bold text-sm tracking-tight">Locating nearest verified experts within 10km...</p>
               </div>
             )}

             {step === 'results' && (
               <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                  <div className="flex items-center justify-between">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Flash Results: {candidates.length} Found</p>
                     <button onClick={() => setStep('category')} className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Rescan</button>
                  </div>

                  {candidates.length > 0 ? (
                    <div className="space-y-4">
                       {candidates.map((cand, i) => (
                         <div 
                           key={cand.id}
                           className="flex items-center gap-6 p-5 bg-white border border-slate-100 rounded-3xl hover:border-rose-200 transition-all shadow-sm"
                         >
                            <div className="w-16 h-16 bg-slate-100 rounded-2xl overflow-hidden shadow-inner border border-slate-200/50">
                               <img src={`https://i.pravatar.cc/150?u=${cand.providerId}`} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                               <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-black text-slate-900 text-sm truncate">{cand.providerName}</h4>
                                  <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                               </div>
                               <div className="flex items-center gap-3">
                                  <div className="flex items-center gap-1 text-xs font-black text-amber-500">
                                     <Star className="w-3 h-3 fill-amber-500" />
                                     {cand.averageRating?.toFixed(1)}
                                  </div>
                                  <div className="flex items-center gap-1 text-[10px] font-black text-rose-500 uppercase">
                                     <Clock className="w-3 h-3" />
                                     {cand.distanceKm < 2 ? '5-10m arrival' : '15-20m arrival'}
                                  </div>
                               </div>
                            </div>
                            <button 
                              onClick={() => handleFlashBook(cand.id)}
                              className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center hover:bg-rose-600 transition-all shadow-lg active:scale-95"
                            >
                               <ArrowRight className="w-5 h-5" />
                            </button>
                         </div>
                       ))}
                    </div>
                  ) : (
                    <div className="p-10 text-center bg-slate-50 rounded-3xl border border-slate-100">
                       <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                       <h4 className="font-black text-slate-900 mb-2">No SOS Experts Nearby</h4>
                       <p className="text-xs font-bold text-slate-400">Try a broader search or wait a few minutes while we alert local partners.</p>
                    </div>
                  )}
                  <p className="text-center text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] pt-4">Emergency Dispatch Engine v1.0</p>
               </motion.div>
             )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default FlashAssistModal;
