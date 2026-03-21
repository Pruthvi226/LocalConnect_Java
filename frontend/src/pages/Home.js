import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Search, MapPin, Star, Sparkles, 
  SlidersHorizontal, X, ArrowRight,
  Navigation, Zap, Filter, Info,
  BrainCircuit, Camera, ChevronRight, ShieldCheck
} from 'lucide-react';
import ServiceCard from '../components/ServiceCard';
import { serviceService } from '../services/serviceService';
import { ServiceCardSkeleton } from '../components/Skeleton';
import api from '../services/api';

const Home = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [minRating, setMinRating] = useState(null);
  const [maxDistance, setMaxDistance] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  // AI Diagnosis State
  const [showDiagnosis, setShowDiagnosis] = useState(false);
  const [diagnosisDesc, setDiagnosisDesc] = useState('');
  const [diagnosisImageUrl, setDiagnosisImageUrl] = useState('');
  const [diagnosisLoading, setDiagnosisLoading] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState(null);

  const handleAIDiagnose = async () => {
    if (!diagnosisDesc.trim()) return;
    setDiagnosisLoading(true);
    setDiagnosisResult(null);
    try {
      const res = await api.post('/ai/diagnose', { description: diagnosisDesc, imageUrl: diagnosisImageUrl });
      setDiagnosisResult(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setDiagnosisLoading(false);
    }
  };

  const handleDiagnosisSearch = () => {
    if (diagnosisResult?.category) {
      setShowDiagnosis(false);
      setSelectedCategory(diagnosisResult.category);
      setDiagnosisDesc('');
      setDiagnosisResult(null);
    }
  };

  useEffect(() => {
    loadCategories();
    detectLocation();
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      loadServices({
        category: selectedCategory,
        minRating: minRating,
        maxDistanceKm: maxDistance,
        userLat: userLocation?.latitude,
        userLng: userLocation?.longitude
      });
    }, 500);
    return () => clearTimeout(handler);
  }, [selectedCategory, minRating, maxDistance, userLocation]);

  useEffect(() => {
    filterServices();
  }, [searchQuery, services]);

  const loadServices = async (filters = {}) => {
    try {
      setLoading(true);
      const data = await serviceService.getAllWithFilters(filters);
      setServices(data);
      setFilteredServices(data);
    } catch (err) {
      setError('Services could not be retrieved. Please check your connection.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const detectLocation = () => {
    if (!navigator.geolocation) return loadServices();
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = { latitude: position.coords.latitude, longitude: position.coords.longitude };
        setUserLocation(coords);
        loadServices({ userLat: coords.latitude, userLng: coords.longitude });
      },
      () => loadServices(),
      { enableHighAccuracy: false, timeout: 5000 }
    );
  };

  const loadCategories = async () => {
    try {
      const data = await serviceService.getCategories();
      setCategories(data);
    } catch (err) { console.error(err); }
  };

  const filterServices = () => {
    let filtered = [...services];
    if (searchQuery) {
      filtered = filtered.filter(s => 
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (selectedCategory) filtered = filtered.filter(s => s.category === selectedCategory);
    if (minRating) filtered = filtered.filter(s => (s.averageRating || 0) >= minRating);
    if (maxDistance) filtered = filtered.filter(s => (s.distanceKm || 0) <= maxDistance);
    
    setFilteredServices(filtered);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setMinRating(null);
    setMaxDistance(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20">
      <div className="container mx-auto px-4 lg:px-6">
        
        {/* Search & Discover Header */}
        <div className="max-w-5xl mx-auto mb-12">
           <header className="mb-10 text-center lg:text-left">
              <h1 className="text-4xl lg:text-6xl font-black text-slate-900 tracking-tight mb-4">
                Find your next <br className="hidden lg:block" />
                <span className="text-primary-600">Local Expert.</span>
              </h1>
              <p className="text-lg text-slate-500 font-medium max-w-2xl">
                The cleverest way to connect with service professionals in your area. 
                Sourced locally, verified personally.
              </p>
           </header>

           {/* Smart Search Bar */}
           <div className="relative group">
              <div className="absolute inset-0 bg-primary-500/10 blur-[60px] opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
              <div className="relative glass-card p-2 rounded-[2.5rem] border-white/60 shadow- premium flex flex-col lg:flex-row gap-2">
                 <div className="flex-1 relative flex items-center">
                    <Search className="absolute left-6 text-slate-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search for repair, cleaning, tech..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-transparent pl-14 pr-6 py-5 text-lg font-bold text-slate-800 focus:outline-none placeholder:text-slate-300"
                    />
                 </div>
                 <div className="h-12 w-px bg-slate-100 hidden lg:block self-center"></div>
                 <div className="flex items-center px-4 lg:w-64">
                    <MapPin className="text-primary-500 w-5 h-5 mr-3" />
                    <span className="text-sm font-bold text-slate-500 truncate">
                      {userLocation ? 'Broadcasting near you' : 'Detecting area...'}
                    </span>
                 </div>
                 <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-8 py-4 rounded-3xl font-black text-sm flex items-center justify-center gap-2 transition-all ${
                    showFilters ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                 >
                    <SlidersHorizontal className="w-4 h-4" />
                    Filters
                 </button>
                 <button className="bg-primary-600 hover:bg-primary-700 text-white px-10 py-4 rounded-3xl font-black shadow-xl shadow-primary-500/20 active:scale-95 transition-all">
                    Search
                 </button>
              </div>

              {/* Advanced Filter Panel */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, y: -20, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -20, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 p-8 bg-white rounded-[2rem] border border-slate-100 shadow-xl grid md:grid-cols-3 gap-8">
                       <div>
                          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Category Focus</p>
                          <div className="flex flex-wrap gap-2">
                             {categories.map(cat => (
                               <button 
                                 key={cat}
                                 onClick={() => setSelectedCategory(selectedCategory === cat ? '' : cat)}
                                 className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                                   selectedCategory === cat ? 'bg-primary-600 border-primary-600 text-white shadow-lg shadow-primary-500/20' : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-primary-200'
                                 }`}
                               >
                                 {cat}
                               </button>
                             ))}
                          </div>
                       </div>
                       <div>
                          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Quality Threshold</p>
                          <div className="flex gap-2">
                             {[3, 4, 4.5].map(rating => (
                               <button 
                                 key={rating}
                                 onClick={() => setMinRating(minRating === rating ? null : rating)}
                                 className={`flex-1 py-3 rounded-xl text-xs font-bold border flex flex-col items-center gap-1 transition-all ${
                                   minRating === rating ? 'bg-amber-500 border-amber-500 text-white shadow-lg' : 'bg-slate-50 border-slate-100 text-slate-500'
                                 }`}
                               >
                                 <Star className={`w-4 h-4 ${minRating === rating ? 'fill-white' : 'fill-amber-400 text-amber-400'}`} />
                                 {rating}+ Stars
                               </button>
                             ))}
                          </div>
                       </div>
                       <div>
                          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Maximum Distance</p>
                          <div className="grid grid-cols-3 gap-2">
                             {[5, 15, 30].map(dist => (
                               <button 
                                 key={dist}
                                 onClick={() => setMaxDistance(maxDistance === dist ? null : dist)}
                                 className={`py-3 rounded-xl text-xs font-bold border transition-all ${
                                   maxDistance === dist ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-slate-50 border-slate-100 text-slate-500'
                                 }`}
                               >
                                 {dist}km
                               </button>
                             ))}
                          </div>
                       </div>
                       <div className="md:col-span-3 pt-4 border-t border-slate-100 flex justify-end gap-3">
                          <button onClick={resetFilters} className="px-6 py-2 text-sm font-bold text-slate-400 hover:text-slate-600">Clear All</button>
                          <button onClick={() => setShowFilters(false)} className="bg-slate-900 text-white px-8 py-2 rounded-xl text-sm font-bold">Apply Filters</button>
                       </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
           </div>
        </div>

        {/* Results Section */}
        <section className="max-w-7xl mx-auto">
           <div className="flex items-center justify-between mb-8 px-2">
              <div className="flex items-center gap-3">
                 <h2 className="text-2xl font-black text-slate-800">
                    {searchQuery ? 'Search Results' : 'Recommended Nearby'}
                 </h2>
                 <span className="bg-slate-200 text-slate-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                   {filteredServices.length} Total
                 </span>
              </div>
              <div className="flex items-center gap-2 text-slate-400 text-sm font-bold">
                 Sort by: <span className="text-primary-600 cursor-pointer">Distance</span>
              </div>
           </div>

           {loading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map(i => <ServiceCardSkeleton key={i} />)}
             </div>
           ) : error ? (
             <div className="py-20 text-center bg-white rounded-[2.5rem] border border-red-50 shadow-xl max-w-2xl mx-auto p-12">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500 mx-auto mb-6">
                   <Info className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-slate-800 mb-2">Service Outage</h3>
                <p className="text-slate-500 font-medium mb-8">{error}</p>
                <button onClick={() => window.location.reload()} className="btn-primary py-3 px-10">Retry Connection</button>
             </div>
           ) : filteredServices.length === 0 ? (
             <div className="py-24 text-center">
                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-8">
                   <Zap className="w-12 h-12 text-slate-300" />
                </div>
                <h3 className="text-3xl font-black text-slate-800 mb-4">No experts in this radius</h3>
                <p className="text-slate-500 font-medium max-w-md mx-auto mb-10 text-lg">
                  Try adjusting your filters or searching for something else. 
                  Our network is growing every day!
                </p>
                <button onClick={resetFilters} className="bg-slate-900 text-white font-black py-4 px-12 rounded-2xl shadow-xl active:scale-95 transition-all">
                  Reset Discovery
                </button>
             </div>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
               <AnimatePresence mode="popLayout">
                 {filteredServices.map((service) => (
                   <motion.div
                     key={service.id}
                     layout
                     initial={{ opacity: 0, scale: 0.9 }}
                     animate={{ opacity: 1, scale: 1 }}
                     exit={{ opacity: 0, scale: 0.9 }}
                   >
                     <ServiceCard service={service} />
                   </motion.div>
                 ))}
               </AnimatePresence>
             </div>
           )}
        </section>

        {/* ProxiSense Guarantee */}
        <section className="mt-32 relative">
           <div className="absolute inset-0 bg-primary-600 rounded-[3rem] -rotate-1"></div>
           <div className="relative bg-slate-900 text-white rounded-[3rem] p-12 lg:p-20 overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/20 rounded-full blur-[100px] -mr-32 -mt-32"></div>
              <div className="grid lg:grid-cols-2 gap-16 items-center relative z-10">
                 <div>
                    <h2 className="text-4xl lg:text-5xl font-black mb-8 leading-[1.1]">
                       The ProxiSense <br />
                       <span className="text-primary-400 font-serif italic">Verified Expert</span> <br />
                       Standard.
                    </h2>
                    <ul className="space-y-6">
                       <li className="flex gap-4">
                          <div className="w-8 h-8 bg-primary-500 rounded-lg flex-shrink-0 flex items-center justify-center">✔</div>
                          <div>
                             <p className="font-bold text-lg">Background Audits</p>
                             <p className="text-slate-400 font-medium text-sm">Every partner goes through a 12-point identity and history check.</p>
                          </div>
                       </li>
                       <li className="flex gap-4">
                          <div className="w-8 h-8 bg-primary-500 rounded-lg flex-shrink-0 flex items-center justify-center">✔</div>
                          <div>
                             <p className="font-bold text-lg">Quality Assurance</p>
                             <p className="text-slate-400 font-medium text-sm">Continuous monitoring of service ratings and customer feedback.</p>
                          </div>
                       </li>
                    </ul>
                 </div>
                 <div className="bg-white/5 backdrop-blur-md rounded-[2.5rem] border border-white/10 p-10">
                    <div className="flex items-center gap-4 mb-8 text-indigo-300">
                       <Sparkles className="w-10 h-10" />
                       <p className="text-sm font-black uppercase tracking-[0.2em]">New: Smart Match AI</p>
                    </div>
                    <p className="text-xl font-medium mb-10 leading-relaxed text-slate-300">
                       "ProxiSense AI analyzed 50+ local providers and matched me with an electrician arriving in 20 minutes. Extraordinary service."
                    </p>
                    <div className="flex items-center gap-4">
                       <img src="https://i.pravatar.cc/100?u=dev" className="w-12 h-12 rounded-full border-2 border-primary-500" alt="Testimonial" />
                       <div>
                          <p className="font-black">David Miller</p>
                          <p className="text-xs text-primary-400 font-bold uppercase tracking-wider">Early Adopter</p>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </section>
      </div>

      {/* AI Diagnose Floating Button */}
      <motion.button
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        onClick={() => setShowDiagnosis(true)}
        className="fixed bottom-8 right-8 z-50 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-4 rounded-3xl shadow-2xl shadow-indigo-500/30 flex items-center gap-3 font-black text-sm active:scale-95 transition-all group"
      >
        <BrainCircuit className="w-6 h-6 group-hover:animate-pulse" />
        <span className="hidden sm:block">Diagnose My Problem</span>
      </motion.button>

      {/* AI Diagnosis Modal */}
      <AnimatePresence>
        {showDiagnosis && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-end sm:items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setShowDiagnosis(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="bg-white rounded-[2.5rem] w-full max-w-lg p-8 shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center">
                    <BrainCircuit className="w-7 h-7 text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900">AI Problem Diagnosis</h2>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Powered by ProxiSense AI</p>
                  </div>
                </div>
                <button onClick={() => { setShowDiagnosis(false); setDiagnosisResult(null); setDiagnosisDesc(''); }}
                  className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {!diagnosisResult ? (
                <div className="space-y-4">
                  <textarea
                    rows={4}
                    placeholder="Describe your problem... e.g. 'My kitchen pipe is leaking under the sink' or 'AC not cooling properly'"
                    value={diagnosisDesc}
                    onChange={e => setDiagnosisDesc(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-slate-700 font-medium text-sm focus:outline-none focus:border-indigo-300 resize-none"
                  />
                  <input
                    type="url"
                    placeholder="Image URL (optional) — helps AI identify the problem"
                    value={diagnosisImageUrl}
                    onChange={e => setDiagnosisImageUrl(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-sm font-medium text-slate-600 focus:outline-none focus:border-indigo-300"
                  />
                  <button
                    onClick={handleAIDiagnose}
                    disabled={diagnosisLoading || !diagnosisDesc.trim()}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {diagnosisLoading ? (
                      <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Analyzing...</>
                    ) : (
                      <><BrainCircuit className="w-5 h-5" /> Diagnose Problem</>
                    )}
                  </button>
                </div>
              ) : (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                  {/* Result */}
                  <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6">
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Diagnosis Result</p>
                    <h3 className="text-xl font-black text-slate-900 mb-1">{diagnosisResult.problemTitle}</h3>
                    <p className="text-sm text-slate-500 font-medium mb-4">{diagnosisResult.explanation}</p>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-white rounded-xl p-3 text-center border border-indigo-50">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Category</p>
                        <p className="font-black text-indigo-600 text-sm mt-1">{diagnosisResult.category}</p>
                      </div>
                      <div className="bg-white rounded-xl p-3 text-center border border-indigo-50">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Est. Cost</p>
                        <p className="font-black text-emerald-600 text-sm mt-1">₹{diagnosisResult.minPrice}–{diagnosisResult.maxPrice}</p>
                      </div>
                      <div className="bg-white rounded-xl p-3 text-center border border-indigo-50">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Confidence</p>
                        <p className="font-black text-slate-700 text-sm mt-1">{(diagnosisResult.confidence * 100).toFixed(0)}%</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => { setDiagnosisResult(null); setDiagnosisDesc(''); }}
                      className="flex-1 py-3 border border-slate-200 rounded-2xl text-sm font-bold text-slate-500 hover:bg-slate-50"
                    >
                      Retry
                    </button>
                    <button
                      onClick={handleDiagnosisSearch}
                      className="flex-2 flex-grow bg-indigo-600 text-white font-black py-3 px-6 rounded-2xl flex items-center justify-center gap-2 hover:bg-indigo-700 active:scale-95 shadow-lg shadow-indigo-500/20 transition-all"
                    >
                      Find {diagnosisResult.category} Experts <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;

