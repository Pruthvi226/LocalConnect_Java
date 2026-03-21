import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Navigation, Crosshair, 
  Search, SlidersHorizontal, Star, 
  Clock, ShieldCheck, ChevronRight,
  Maximize2, ArrowUpRight, Zap,
  AlertCircle, LocateFixed, MapPin
} from 'lucide-react';
import MapSearch from '../components/MapSearch';
import ServiceCard from '../components/ServiceCard';
import LocationSearch from '../components/LocationSearch';
import { serviceService } from '../services/serviceService';

const NearbyServices = () => {
  const [services, setServices] = useState([]);
  const [userLocation, setUserLocation] = useState(null); // {latitude, longitude, address}
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [distanceRange, setDistanceRange] = useState(3);
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeServiceId, setActiveServiceId] = useState(null);
  const [instantMode, setInstantMode] = useState(false);
  const [smartMatchMode, setSmartMatchMode] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  
  const scrollRefs = useRef({});

  const categories = ['All', 'Cleaning', 'Plumbing', 'Electrical', 'Tutoring', 'AC Repair', 'Pest Control'];

  useEffect(() => {
    initGeolocation();
  }, []);

  const initGeolocation = () => {
    if (!navigator.geolocation) {
      setError('Geospatial sensors not detected in this browser.');
      setLoading(false);
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          address: 'Your Current Location'
        };
        setUserLocation(coords);
        setPage(0);
        fetchNearby(coords, 0, false);
      },
      () => {
        setError('Signal lost. Please enable location access or search for a specific city.');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleLocationSelect = (loc) => {
    setUserLocation(loc);
    setPage(0);
    fetchNearby(loc, 0, false);
  };

  const fetchNearby = async (coords, pageNum = 0, isLoadMore = false) => {
    try {
      if (isLoadMore) setLoadingMore(true);
      else setLoading(true);

      const filters = {
        userLat: coords.latitude,
        userLng: coords.longitude,
        maxDistanceKm: distanceRange,
        category: activeCategory === 'All' ? '' : activeCategory,
        isAvailableNow: instantMode ? true : undefined,
        page: pageNum,
        size: 8
      };
      
      const data = smartMatchMode 
        ? await serviceService.getRecommendationsPaginated(filters)
        : await serviceService.getAllPaginated(filters);
        
      const items = data.content || data;
      const isLast = data.last ?? true;

      if (isLoadMore) {
         setServices(prev => [...prev, ...items]);
      } else {
         setServices(items);
      }
      setHasMore(!isLast);
      setError('');
    } catch (e) {
      setError('Ecosystem sync failed. Retrying triangulation...');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (userLocation) {
       setPage(0);
       fetchNearby(userLocation, 0, false);
    }
  }, [distanceRange, activeCategory, instantMode, smartMatchMode]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchNearby(userLocation, nextPage, true);
  };

  const handleMarkerClick = (id) => {
    setActiveServiceId(id);
    const element = scrollRefs.current[id];
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      <div className="flex flex-col lg:flex-row h-[calc(100vh-5rem)] overflow-hidden">
        
        {/* Discover Sidebar */}
        <aside className="w-full lg:w-[480px] flex flex-col bg-white border-r border-slate-100 shadow-xl relative z-10 overflow-hidden">
           
           <div className="p-8 pb-4 space-y-6">
              <div>
                <div className="flex items-center gap-3 text-primary-600 mb-2 font-black uppercase tracking-[0.2em] text-[10px]">
                   <Navigation className="w-4 h-4" />
                   Geospatial Discovery
                </div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                  Micro-Local <span className="text-primary-600">Experts.</span>
                </h1>
              </div>

              {/* Advanced Search & Filter Stack */}
              <div className="space-y-6">
                 <LocationSearch 
                   onLocationSelect={handleLocationSelect} 
                   placeholder={userLocation?.address || "Search city or area..."}
                 />

                 <div className="flex items-center gap-4">
                    <div className="flex-1">
                       <div className="flex justify-between items-center mb-3">
                          <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Visibility Range</label>
                          <span className="text-xs font-black text-primary-600">{distanceRange}km</span>
                       </div>
                       <input 
                         type="range" 
                         min="1" max="10" step="1"
                         value={distanceRange}
                         onChange={(e) => setDistanceRange(e.target.value)}
                         className="w-full h-1.5 bg-slate-100 rounded-full appearance-none cursor-pointer accent-primary-600"
                       />
                    </div>
                    <button className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:bg-slate-100 transition-colors">
                       <SlidersHorizontal className="w-5 h-5" />
                    </button>
                 </div>

                 <div className="overflow-x-auto invisible-scrollbar flex gap-2 pb-2">
                     {categories.map((cat) => (
                       <button
                         key={cat}
                         onClick={() => setActiveCategory(cat)}
                         className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap active:scale-95 ${
                           activeCategory === cat ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100 uppercase'
                         }`}
                       >
                          {cat}
                       </button>
                    ))}
                 </div>
                 <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between bg-green-50/80 p-4 border border-green-100 rounded-2xl">
                       <div className="flex items-center gap-3">
                          <button 
                            onClick={() => setInstantMode(!instantMode)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${instantMode ? 'bg-green-500' : 'bg-slate-300'}`}
                          >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${instantMode ? 'translate-x-6' : 'translate-x-1'}`} />
                          </button>
                          <div>
                             <p className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1">
                                <Zap className="w-4 h-4 text-green-500" /> Instant Service
                             </p>
                             <p className="text-[10px] font-bold text-slate-500">Get an expert at your door in 30 mins</p>
                          </div>
                       </div>
                    </div>
                    <div className="flex items-center justify-between bg-indigo-50/80 p-4 border border-indigo-100 rounded-2xl">
                       <div className="flex items-center gap-3">
                          <button 
                            onClick={() => setSmartMatchMode(!smartMatchMode)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${smartMatchMode ? 'bg-indigo-500' : 'bg-slate-300'}`}
                          >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${smartMatchMode ? 'translate-x-6' : 'translate-x-1'}`} />
                          </button>
                          <div>
                             <p className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1">
                                <ShieldCheck className="w-4 h-4 text-indigo-500" /> Smart Match
                             </p>
                             <p className="text-[10px] font-bold text-slate-500">AI-recommended trusted providers first</p>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 invisible-scrollbar bg-slate-50/50">
              {loading ? (
                <>
                   {[1, 2, 3].map(i => (
                     <div key={i} className="h-48 bg-white rounded-[2rem] border border-slate-100 p-6 flex gap-4 animate-pulse">
                        <div className="w-24 h-24 bg-slate-50 rounded-2xl"></div>
                        <div className="flex-1 space-y-3 pt-2">
                           <div className="h-4 w-1/2 bg-slate-50 rounded"></div>
                           <div className="h-6 w-3/4 bg-slate-50 rounded"></div>
                           <div className="h-3 w-1/3 bg-slate-50 rounded"></div>
                        </div>
                     </div>
                   ))}
                </>
              ) : error ? (
                <div className="py-12 text-center bg-red-50 rounded-[2.5rem] border border-red-100 p-8 m-2">
                   <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                   <p className="text-red-700 font-bold text-sm leading-relaxed">{error}</p>
                   <button onClick={initGeolocation} className="mt-6 text-xs font-black uppercase tracking-widest text-red-600 underline">Recalibrate Signal</button>
                </div>
              ) : services.length === 0 ? (
                <div className="py-20 text-center opacity-40">
                   <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Search className="w-10 h-10 text-slate-300" />
                   </div>
                   <h4 className="text-xl font-black text-slate-800 mb-2">No Clusters Found</h4>
                   <p className="text-slate-500 font-medium px-10">Try expanding your radius or searching another zone.</p>
                </div>
              ) : (
                <div className="space-y-4">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 mb-2">
                      {services.length} Professionals Syncing Nearby
                   </p>
                   <AnimatePresence mode="popLayout">
                      {services.map((service) => (
                         <div 
                           key={service.id} 
                           ref={el => scrollRefs.current[service.id] = el}
                           onMouseEnter={() => setActiveServiceId(service.id)}
                           className={`transition-all duration-300 ${activeServiceId === service.id ? 'scale-[1.02] ring-2 ring-primary-500 ring-offset-4 rounded-[2.2rem]' : ''}`}
                         >
                            <ServiceCard service={service} />
                         </div>
                      ))}
                    </AnimatePresence>
                    {hasMore && (
                       <button 
                         onClick={handleLoadMore} 
                         disabled={loadingMore}
                         className="w-full py-4 mt-6 bg-white border border-slate-200 shadow-sm rounded-2xl text-slate-500 font-black uppercase tracking-widest text-xs hover:bg-slate-50 transition-colors flex justify-center items-center gap-2"
                       >
                         {loadingMore ? (
                            <><div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div> Scanning...</>
                         ) : 'Load More Experts'}
                       </button>
                    )}
                 </div>
              )}
           </div>

           {/* Location Signal */}
           <div className="p-6 bg-white border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-primary-50 rounded-full flex items-center justify-center border border-primary-100 shadow-inner">
                    <LocateFixed className="w-5 h-5 text-primary-500" />
                 </div>
                 <div className="min-w-0">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Geospatial Signal</p>
                    <p className="text-xs font-bold text-slate-800 truncate max-w-[220px]">
                       {userLocation?.address || 'Detecting Area...'}
                    </p>
                 </div>
              </div>
              <button 
                onClick={initGeolocation}
                className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-100 transition-colors active:scale-90"
                title="Refresh Current Location"
              >
                 <Crosshair className="w-4 h-4 text-slate-400" />
              </button>
           </div>
        </aside>

        {/* Immersive Map Container */}
        <main className="flex-1 relative bg-slate-100 overflow-hidden">
           <MapSearch 
             center={{ lat: userLocation?.latitude || 12.9716, lng: userLocation?.longitude || 77.5946 }}
             services={services}
             onMarkerClick={(service) => handleMarkerClick(service.id)}
           />
           
           {/* Floating Map Overlays */}
           <div className="absolute top-8 left-8 flex flex-col gap-4">
              <motion.div 
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="bg-slate-900/90 backdrop-blur-md text-white px-6 py-4 rounded-[2rem] border border-white/10 shadow-2xl flex items-center gap-4"
              >
                 <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0 animate-pulse">
                    <Zap className="w-5 h-5 text-white" />
                 </div>
                 <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-primary-400">Live Coverage</p>
                    <p className="text-xs font-bold leading-none">{services.length} Active Hotspots</p>
                 </div>
              </motion.div>
           </div>

           <div className="absolute top-8 right-8 flex flex-col gap-3">
              <button className="w-12 h-12 bg-white rounded-2xl shadow-2xl flex items-center justify-center group hover:bg-primary-600 transition-all active:scale-95 border border-slate-100">
                 <Maximize2 className="w-5 h-5 text-slate-400 group-hover:text-white" />
              </button>
              <button className="w-12 h-12 bg-white rounded-2xl shadow-2xl flex items-center justify-center group hover:bg-primary-600 transition-all active:scale-95 border border-slate-100">
                 <ShieldCheck className="w-5 h-5 text-slate-400 group-hover:text-white" />
              </button>
           </div>
           
           {/* Zoom Hub Placeholder (Standard Map UI already has this, but we keep it for custom UI overlay) */}
           <div className="absolute bottom-12 right-12 bg-white/80 backdrop-blur-lg p-3 rounded-[2rem] shadow-2xl border border-white/20 hidden lg:flex flex-col gap-3">
              <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg">+</div>
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 font-black text-xl border border-slate-100 shadow-sm">-</div>
           </div>
        </main>

      </div>
    </div>
  );
};

export default NearbyServices;



