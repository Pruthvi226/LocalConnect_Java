import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Search, MapPin, Star, Sparkles, 
  SlidersHorizontal, X, ArrowRight,
  Navigation, Zap, Filter, Info,
  BrainCircuit, Camera, ChevronRight
} from 'lucide-react';
import ServiceCard from '../components/ServiceCard';
import { serviceService } from '../services/serviceService';
import { ServiceCardSkeleton } from '../components/Skeleton';
import api from '../services/api';
import FlashAssistButton from '../components/FlashAssistButton';
import FlashAssistModal from '../components/FlashAssistModal';

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
  const [UserLocation, setUserLocation] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({ page: 0, size: 9, totalPages: 0, totalElements: 0 });
  const [sortType, setSortType] = useState('distance');
  const [isSorting, setIsSorting] = useState(false);

  // AI features state
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [isAiSearch, setIsAiSearch] = useState(false);
  const [aiSearching, setAiSearching] = useState(false);
  const [aiFallback, setAiFallback] = useState(false);

  // Typewriter effect state
  const placeholders = ["Plumber near me", "AC Repair in Hyderabad", "Electrician under ₹500"];
  const [placeholderText, setPlaceholderText] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  // AI Diagnosis State
  const [showDiagnosis, setShowDiagnosis] = useState(false);
  const [diagnosisDesc, setDiagnosisDesc] = useState('');
  const [diagnosisImageUrl, setDiagnosisImageUrl] = useState('');
  const [diagnosisLoading, setDiagnosisLoading] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState(null);

  // Phase 2: SOS State
  const [showFlashAssist, setShowFlashAssist] = useState(false);

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

  // Typewriter hook
  useEffect(() => {
    let timer;
    const currentFullText = placeholders[placeholderIndex];
    if (isDeleting) {
      if (placeholderText === '') {
        setIsDeleting(false);
        setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
        timer = setTimeout(() => {}, 500);
      } else {
        timer = setTimeout(() => {
          setPlaceholderText(currentFullText.substring(0, placeholderText.length - 1));
        }, 50);
      }
    } else {
      if (placeholderText === currentFullText) {
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, 3000); 
      } else {
        timer = setTimeout(() => {
          setPlaceholderText(currentFullText.substring(0, placeholderText.length + 1));
        }, Math.random() * 40 + 40); 
      }
    }
    return () => clearTimeout(timer);
  }, [placeholderText, isDeleting, placeholderIndex]);

  // Sorting hook
  useEffect(() => {
    if (services.length === 0) return;
    setIsSorting(true);
    const handler = setTimeout(() => {
      let sorted = [...services];
      if (sortType === 'distance') {
        sorted.sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
      } else if (sortType === 'rating') {
        sorted.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
      } else if (sortType === 'price_low') {
        sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
      } else if (sortType === 'price_high') {
        sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
      }
      setFilteredServices(sorted);
      setIsSorting(false);
    }, 400); 
    return () => clearTimeout(handler);
  }, [services, sortType]);

  useEffect(() => {
    loadAiRecommendations();
  }, []);

  const loadAiRecommendations = async () => {
    try {
      const res = await api.get('/ai/recommendations');
      setAiRecommendations(res.data.services || []);
    } catch (e) {
      console.error("AI Recommendations failed", e);
    }
  };

  const handleAiSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) {
      setIsAiSearch(false);
      loadServices();
      return;
    }

    setAiSearching(true);
    try {
      const res = await api.post('/ai/search', { query: searchQuery });
      const { services: aiResults, isAiPowered, fallbackUsed } = res.data;
      setFilteredServices(aiResults || []);
      setServices(aiResults || []); // Sync both for compatibility
      setIsAiSearch(isAiPowered);
      setAiFallback(fallbackUsed);
      setLoading(false);
    } catch {
      setIsAiSearch(false);
      setAiFallback(true);
      loadServices({ search: searchQuery });
    } finally {
      setAiSearching(false);
    }
  };

  useEffect(() => {
    // If not doing an AI search, use the standard throttled loading
    if (!aiSearching && !isAiSearch) {
      const handler = setTimeout(() => {
        loadServices({
          category: selectedCategory,
          minRating: minRating,
          maxDistanceKm: maxDistance,
          UserLat: UserLocation?.latitude,
          UserLng: UserLocation?.longitude,
          search: searchQuery,
          page: pagination.page,
          size: pagination.size
        });
      }, 300);
      return () => clearTimeout(handler);
    }
  }, [selectedCategory, minRating, maxDistance, UserLocation, searchQuery, pagination.page]);

  const loadServices = async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      let data;
      
      // If we have a text search query, use the explicit search endpoint
      if (filters.search) {
        const res = await api.get(`/services/search?q=${encodeURIComponent(filters.search)}&page=${filters.page || 0}&size=${filters.size || 9}`);
        data = res.data;
      } else {
        data = await serviceService.getAllPaginated(filters);
      }

      setServices(data.content || []);
      // filteredServices will be updated by the sorting effect
      setPagination(prev => ({ 
        ...prev, 
        totalPages: data.totalPages || 0,
        totalElements: data.totalElements || 0
      }));
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
        loadServices({ UserLat: coords.latitude, UserLng: coords.longitude });
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

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setMinRating(null);
    setMaxDistance(null);
    setSortType('distance');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8f9ff] to-[#ffffff] pt-24 pb-20 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-200/20 rounded-full blur-[100px] pointer-events-none -z-10"></div>
      <div className="absolute top-40 right-1/4 w-80 h-80 bg-indigo-200/20 rounded-full blur-[100px] pointer-events-none -z-10"></div>

      <div className="container mx-auto px-4 lg:px-6">
        
        {/* Search & Discover Header - Added Framer Motion */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-5xl mx-auto mb-12"
        >
           <header className="mb-10 text-center lg:text-left">
              <h1 className="text-4xl lg:text-6xl font-black text-slate-900 tracking-tight mb-4">
                <span className="font-medium text-slate-800 tracking-normal">Find your next</span> <br className="hidden lg:block" />
                <span style={{ backgroundImage: 'linear-gradient(90deg, #5B5FEF, #7C3AED)' }} className="text-transparent bg-clip-text">Local Expert.</span>
              </h1>
              <p className="text-lg text-slate-500 font-medium max-w-2xl">
                The cleverest way to connect with service professionals in your area. 
                Sourced locally, verified personally.
              </p>
           </header>

        {/* Premium Search Bar */}        <div className="search-container mb-16 px-4">
          <form 
            onSubmit={handleAiSearch} 
            className="sticky top-20 z-40 relative flex items-center w-full bg-white/70 backdrop-blur-xl border border-indigo-500/20 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-[2rem] transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] focus-within:shadow-[0_8px_30px_rgb(0,0,0,0.12)] focus-within:ring-4 focus-within:ring-indigo-500/30"
          >
            <div className="pl-6 pr-3 py-4 text-slate-400 flex items-center justify-center">
              {aiSearching ? (
                <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Sparkles className="w-6 h-6 text-primary-500" />
              )}
            </div>
            <input
              type="text"
              className="search-input flex-1 bg-transparent border-none outline-none text-slate-700 font-medium placeholder-slate-400 w-full"
              placeholder={aiSearching ? "AI is thinking..." : 'Try: "Fix my AC urgently" or "cheap plumber"'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
            <AnimatePresence>
              {searchQuery && (
                <motion.button 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  type="button" 
                  onClick={() => { setSearchQuery(''); setIsAiSearch(false); loadServices(); }}
                  className="p-2 mr-2 bg-slate-100 rounded-full text-slate-500 hover:text-slate-700 hover:bg-slate-200 transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              )}
            </AnimatePresence>
            <div className="pr-3 py-3">
              <button 
                type="submit"
                className="search-btn bg-slate-900 hover:bg-slate-800 text-white rounded-full font-black transition-all active:scale-95 shadow-lg shadow-slate-900/20"
              >
                {aiSearching ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Search className="w-5 h-5 sm:mr-2" />}
                <span className="hidden sm:block">AI Search</span>
              </button>
            </div>
          </form>

          {/* Smart Location Badge */}
          <div className="mt-4 flex justify-center w-full">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100/50 shadow-sm">
                <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                <span className="text-xs font-bold text-indigo-700">
                  {UserLocation ? "Searching near your location 📍" : "Using general marketplace 📍 (Allow location for better results)"}
                </span>
            </div>
          </div>
        </div>
        </motion.div>

        {/* AI Recommendations Section */}
        {aiRecommendations.length > 0 && !searchQuery && (
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto mb-20"
          >
            <div className="flex items-center justify-between mb-8 px-2">
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-violet-500 animate-pulse" />
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">AI Recommended <span className="text-violet-500">Top Picks</span></h2>
              </div>
              <button onClick={() => navigate('/recommendations')} className="text-sm font-black text-violet-600 hover:underline flex items-center gap-1">
                View All <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {aiRecommendations.map((svc) => (
                <div key={svc.id} className="relative group">
                  <div className="absolute -top-3 -right-3 z-20 bg-violet-600 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg shadow-violet-500/20">
                    AI Choice
                  </div>
                  <ServiceCard service={svc} />
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Results Section */}
        <section className="max-w-7xl mx-auto">
           <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 px-2 gap-4">
              <div className="flex items-center gap-3">
                 <h2 className="text-2xl font-black text-slate-800">
                    {isAiSearch ? 'AI Suggested Results ?' : searchQuery ? 'Search Results' : 'General Marketplace'}
                 </h2>
                 <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isAiSearch ? "bg-violet-100 text-violet-600 ring-1 ring-violet-200" : "bg-slate-200 text-slate-600"}`}>
                   {filteredServices.length} Total
                 </span>
                 <AnimatePresence>
                   {isSorting && (
                     <motion.span 
                        initial={{ opacity: 0, x: -10 }} 
                        animate={{ opacity: 1, x: 0 }} 
                        exit={{ opacity: 0 }}
                        className="text-xs text-indigo-500 font-bold flex items-center"
                     >
                       <div className="w-3 h-3 mr-1.5 border-[1.5px] border-indigo-500 border-t-transparent rounded-full animate-spin" />
                       Sorting...
                     </motion.span>
                   )}
                 </AnimatePresence>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                 <div className="flex items-center gap-2 text-slate-600 text-sm font-bold bg-white px-3 py-2 rounded-xl shadow-sm border border-slate-100">
                    <span className="text-slate-400">Sort by:</span>
                    <select 
                      value={sortType} 
                      onChange={(e) => setSortType(e.target.value)}
                      className="bg-transparent font-bold text-primary-600 outline-none cursor-pointer placeholder-gray-500"
                    >
                      <option value="distance">Distance</option>
                      <option value="rating">Top Rated</option>
                      <option value="price_low">Price: Low to High</option>
                      <option value="price_high">Price: High to Low</option>
                    </select>
                 </div>
                 <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 text-sm font-bold text-slate-600 bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm hover:bg-slate-50 transition-colors">
                    <Filter className="w-4 h-4" /> Filters ⚙️
                 </button>
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

            {/* Pagination Controls */}
            {!loading && filteredServices.length > 0 && pagination.totalPages > 1 && (
               <div className="flex justify-center mt-16 gap-3">
                  <button 
                    disabled={pagination.page === 0}
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    className="w-14 h-14 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:text-primary-600 hover:border-primary-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                  >
                     <ChevronRight className="w-6 h-6 rotate-180" />
                  </button>
                  <div className="flex items-center px-8 bg-white border border-slate-100 rounded-2xl font-black text-slate-400 shadow-sm">
                     <span className="text-slate-900 mr-2">{pagination.page + 1}</span> / {pagination.totalPages}
                  </div>
                  <button 
                    disabled={pagination.page >= pagination.totalPages - 1}
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    className="w-14 h-14 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:text-primary-600 hover:border-primary-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                  >
                     <ChevronRight className="w-6 h-6" />
                  </button>
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
                             <p className="text-slate-400 font-medium text-sm">Continuous monitoring of service ratings and Customer feedback.</p>
                          </div>
                       </li>
                    </ul>
                 </div>
                 <div className="bg-white/5 backdrop-blur-md rounded-[2.5rem] border border-white/10 p-10">
                    <div className="flex items-center gap-4 mb-8 text-indigo-300">
                       <Sparkles className="w-10 h-10" />
                       <p className="text-sm font-black uppercase tracking-[0.2em]">New: Expert Finder</p>
                    </div>
                    <p className="text-xl font-medium mb-10 leading-relaxed text-slate-300">
                       "ProxiSense analyzed 50+ local providers and matched me with an electrician arriving in 20 minutes. Extraordinary service."
                    </p>
                    <div className="flex items-center gap-4">
                       <img src="https://i.pravatar.cc/100?u=dev" className="w-12 h-12 rounded-full border-2 border-primary-500" alt="Satisfied Client" />
                       <div>
                          <p className="font-black">David Miller</p>
                          <p className="text-xs text-primary-400 font-bold uppercase tracking-wider">Verified Customer</p>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </section>
      </div>

      <motion.button
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        onClick={() => setShowDiagnosis(true)}
        className="fixed bottom-8 right-8 z-50 bg-slate-900 hover:bg-black text-white px-6 py-4 rounded-3xl shadow-2xl flex items-center gap-3 font-black text-sm active:scale-95 transition-all group border-2 border-white/10"
      >
        <BrainCircuit className="w-6 h-6 group-hover:scale-110 transition-transform" />
        <span className="hidden sm:block text-xs uppercase tracking-widest">Troubleshoot & Find</span>
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
                  <div className="w-12 h-12 bg-primary-100 rounded-2xl flex items-center justify-center">
                    <BrainCircuit className="w-7 h-7 text-primary-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900">Expert Match Engine</h2>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Troubleshoot your service needs</p>
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
                      <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Matching...</>
                    ) : (
                      <><BrainCircuit className="w-5 h-5" /> Find Expert Now</>
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
        {/* Phase 6: Smart Discovery Feed */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="container mx-auto px-4 mt-32"
        >
          <div className="bg-white rounded-[4rem] p-10 lg:p-14 border border-slate-100 shadow-premium relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary-50 rounded-full blur-[100px] -mr-48 -mt-48 opacity-40"></div>
            
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-12">
                <div>
                  <h2 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                    <Sparkles className="w-8 h-8 text-amber-500 animate-pulse" />
                    ProxiSense <span className="text-primary-600">Intelligence</span>
                  </h2>
                  <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em] mt-2">AI-Optimized neighborhood discovery</p>
                </div>
                <div className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">
                   <BrainCircuit className="w-4 h-4 text-primary-400" /> Powered by Gemini
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
                {categories.slice(0, 6).map((cat, idx) => (
                  <motion.button
                    key={cat}
                    whileHover={{ y: -8, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                        setSelectedCategory(cat);
                        window.scrollTo({ top: document.getElementById('explorer-section')?.offsetTop - 100 || 800, behavior: 'smooth' });
                    }}
                    className="group bg-slate-50 border border-slate-100 p-8 rounded-[2.5rem] flex flex-col items-center gap-5 hover:bg-white hover:border-primary-100 hover:shadow-2xl transition-all"
                  >
                    <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-lg group-hover:bg-primary-500 transition-colors">
                       <Zap className="w-7 h-7 text-primary-600 group-hover:text-white" />
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-primary-600">{cat}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        <footer className="container mx-auto px-4 mt-32 pt-20 border-t border-slate-100 pb-20">
          <div className="flex flex-col md:flex-row justify-between items-center gap-10">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
                   <MapPin className="text-white w-5 h-5" />
                </div>
                <span className="text-xl font-black tracking-tighter text-slate-900 italic">ProxiSense <span className="text-primary-600">© 2026</span></span>
             </div>
             <div className="flex gap-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <span className="hover:text-primary-600 cursor-pointer transition-colors">Safety Portal</span>
                <span className="hover:text-primary-600 cursor-pointer transition-colors">Privacy Cloud</span>
                <span className="hover:text-primary-600 cursor-pointer transition-colors">Carrier Opportunities</span>
             </div>
          </div>
        </footer>

      <AnimatePresence>
      </AnimatePresence>
      <ChatPopup />
      
      {/* Phase 2: SOS Assist */}
      <FlashAssistButton onClick={() => setShowFlashAssist(true)} />
      <FlashAssistModal 
        isOpen={showFlashAssist} 
        onClose={() => setShowFlashAssist(false)} 
        userLocation={UserLocation}
      />
    </div>
  );
};


