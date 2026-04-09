import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Map, List, Navigation, SlidersHorizontal, MapPin, AlertCircle, X, Search } from 'lucide-react';
import GoogleMap from '../components/GoogleMap';
import ServiceCard from '../components/ServiceCard';
import { serviceService } from '../services/serviceService';

const ExploreMap = () => {
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [UserLocation, setUserLocation] = useState({ lat: 28.6139, lng: 77.2090 }); // Default: New Delhi
  const [locationError, setLocationError] = useState(false);
  const [activeServiceId, setActiveServiceId] = useState(null);
  
  // Mobile View Toggle ('map' or 'list')
  const [mobileView, setMobileView] = useState('map');
  const [showFilters, setShowFilters] = useState(false);

  // Filters State
  const [filters, setFilters] = useState({
    category: '',
    maxPrice: 5000,
    minRating: 0,
    maxDistance: 50 // km
  });

  const scrollRef = useRef(null);

  // 1. Get Customer Location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLocationError(false);
        },
        (err) => {
          console.warn("Geolocation denied or unavailable.", err);
          setLocationError(true);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      setLocationError(true);
    }
  }, []);

  // 2. Fetch Services
  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await serviceService.getAll();
        // Fallback simulation: ensure services have lat/lng if missing
        // For ProxiSense mock discovery, we scatter around Customer location if undefined
        const enriched = data.map(s => {
          if (!s.latitude || !s.longitude) {
            // scatter within ~5km
            return {
              ...s,
              latitude: UserLocation.lat + (Math.random() - 0.5) * 0.05,
              longitude: UserLocation.lng + (Math.random() - 0.5) * 0.05,
              distanceKm: Math.random() * 5
            };
          }
          return s;
        });
        setServices(enriched);
        setFilteredServices(enriched);
      } catch (err) {
        setError('Failed to load nearby services. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [UserLocation]);

  // 3. Apply Filters
  useEffect(() => {
    let result = [...services];

    if (filters.category) {
      result = result.filter(s => s.category?.toLowerCase() === filters.category.toLowerCase());
    }
    
    result = result.filter(s => s.price <= filters.maxPrice);
    
    if (filters.minRating > 0) {
      result = result.filter(s => (s.averageRating || 0) >= filters.minRating);
    }

    if (filters.maxDistance < 50) {
      result = result.filter(s => (s.distanceKm || 0) <= filters.maxDistance);
    }

    setFilteredServices(result);
  }, [filters, services]);

  const handleMarkerClick = (serviceId) => {
    setActiveServiceId(serviceId);
    if (window.innerWidth < 1024) {
      setMobileView('list');
    }
    // Scroll list to the active card
    const cardElement = document.getElementById(`service-card-${serviceId}`);
    if (cardElement && scrollRef.current) {
      cardElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Removed calculateDistanceStr as it's not currently needed

  return (
    <div className="pt-20 lg:pt-24 min-h-screen bg-slate-50 flex flex-col h-screen overflow-hidden">
      
      {/* Top Action Bar */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between z-40 shadow-sm flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center text-primary-600">
            <Map className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-900 tracking-tight leading-none">Map Search</h1>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Find experts nearby</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile View Toggle */}
          <div className="lg:hidden flex bg-slate-100 p-1 rounded-xl">
            <button 
              onClick={() => setMobileView('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${mobileView === 'list' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}
            >
              <List className="w-4 h-4" /> List
            </button>
            <button 
              onClick={() => setMobileView('map')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${mobileView === 'map' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}
            >
              <MapPin className="w-4 h-4" /> Map
            </button>
          </div>

          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2.5 rounded-xl border transition-all flex items-center gap-2 text-sm font-bold ${showFilters ? 'bg-primary-50 border-primary-200 text-primary-600' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
            {(filters.category || filters.minRating > 0 || filters.maxDistance < 50 || filters.maxPrice < 5000) && (
              <span className="w-2 h-2 rounded-full bg-primary-600 absolute top-2 right-2 sm:relative sm:top-auto sm:right-auto"></span>
            )}
          </button>
        </div>
      </div>

      {/* Filter Dropdown Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-white border-b border-slate-200 shadow-lg overflow-hidden z-30 flex-shrink-0 relative"
          >
            <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {/* Category */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Category</label>
                <select 
                  value={filters.category}
                  onChange={(e) => setFilters({...filters, category: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 outline-none focus:border-primary-500 transition-colors"
                >
                  <option value="">All Categories</option>
                  <option value="Cleaning">Cleaning</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Plumbing">Plumbing</option>
                  <option value="Carpentry">Carpentry</option>
                  <option value="Appliance Repair">Appliance Repair</option>
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block flex justify-between">
                  <span>Max Price</span>
                  <span className="text-primary-600">₹{filters.maxPrice}</span>
                </label>
                <input 
                  type="range" 
                  min="100" max="5000" step="100" 
                  value={filters.maxPrice}
                  onChange={(e) => setFilters({...filters, maxPrice: parseInt(e.target.value)})}
                  className="w-full accent-primary-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer" 
                />
              </div>

              {/* Minimum Rating */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block flex justify-between">
                  <span>Min Rating</span>
                  <span className="text-amber-500">{filters.minRating}+ ⭐</span>
                </label>
                <input 
                  type="range" 
                  min="0" max="5" step="0.5" 
                  value={filters.minRating}
                  onChange={(e) => setFilters({...filters, minRating: parseFloat(e.target.value)})}
                  className="w-full accent-amber-500 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer" 
                />
              </div>

              {/* Distance */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block flex justify-between">
                  <span>Distance</span>
                  <span className="text-indigo-600">Under {filters.maxDistance} km</span>
                </label>
                <input 
                  type="range" 
                  min="1" max="50" step="1" 
                  value={filters.maxDistance}
                  onChange={(e) => setFilters({...filters, maxDistance: parseInt(e.target.value)})}
                  className="w-full accent-indigo-500 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer" 
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Split Area */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Left List Panel */}
        <div className={`
          absolute inset-0 lg:relative lg:inset-auto lg:w-[450px] xl:w-[500px] flex-shrink-0 bg-slate-50/80 backdrop-blur-xl border-r border-slate-200 overflow-y-auto invisible-scrollbar z-20 transition-transform duration-500
          ${mobileView === 'list' ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `} ref={scrollRef}>
          
          <div className="p-4 space-y-4">
            {locationError && (
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-amber-800 font-bold text-sm">Location Access Denied</h4>
                  <p className="text-amber-600/80 text-xs font-medium mt-1">We are showing services from a default central location. Enable location permissions for better accuracy.</p>
                </div>
              </div>
            )}

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse flex p-4 bg-white rounded-2xl border border-slate-100 gap-4 shadow-sm">
                    <div className="w-24 h-24 bg-slate-200 rounded-xl"></div>
                    <div className="flex-1 space-y-3 py-1">
                      <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                      <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                      <div className="h-8 bg-slate-200 rounded-lg w-full mt-4"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="p-8 text-center bg-white rounded-3xl border border-slate-100">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-slate-800">Connection Error</h3>
                <p className="text-sm text-slate-500 mt-2">{error}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="mt-6 px-6 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-bold transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : filteredServices.length === 0 ? (
               <div className="p-8 text-center bg-white rounded-3xl border border-slate-100 mt-4">
                <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="font-black text-slate-800">No Services Found</h3>
                <p className="text-xs font-semibold text-slate-500 mt-2 leading-relaxed">Try adjusting your filters or expanding the search distance.</p>
                <button 
                  onClick={() => setFilters({category: '', maxPrice: 5000, minRating: 0, maxDistance: 50})}
                  className="mt-6 text-[10px] font-black uppercase tracking-widest text-primary-600 hover:text-primary-700 bg-primary-50 px-4 py-2 rounded-lg"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="space-y-4 pb-24 lg:pb-8">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">
                  Showing {filteredServices.length} providers
                </p>
                
                {filteredServices.map(service => (
                  <div 
                    id={`service-card-${service.id}`}
                    key={service.id}
                    onMouseEnter={() => setActiveServiceId(service.id)}
                    onClick={() => handleMarkerClick(service.id)}
                    className={`transition-all duration-300 rounded-2xl ${activeServiceId === service.id ? 'ring-2 ring-primary-500 shadow-xl scale-[1.02]' : 'hover:scale-[1.01]'}`}
                  >
                    {/* Render existing ServiceCard but ensure it fits sidebar gracefully */}
                    <ServiceCard service={service} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Map Panel */}
        <div className={`
          flex-1 relative bg-slate-100 z-10 transition-opacity duration-500
          ${mobileView === 'list' ? 'opacity-0 pointer-events-none lg:opacity-100 lg:pointer-events-auto' : 'opacity-100'}
        `}>
          <GoogleMap
            latitude={UserLocation.lat}
            longitude={UserLocation.lng}
            services={filteredServices}
            activeServiceId={activeServiceId}
            onMarkerClick={handleMarkerClick}
            className="w-full h-full"
          />
          
          {/* Overlay Stats/Info on Map if desired */}
          <div className="absolute top-4 right-4 pointer-events-none hidden lg:block">
             <div className="bg-white/90 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/50 shadow-xl pointer-events-auto">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-primary-600 text-white rounded-xl flex items-center justify-center font-black animate-pulse shadow-inner">
                      {filteredServices.length}
                   </div>
                   <div>
                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">Live Map</p>
                     <p className="text-sm font-bold text-slate-800 leading-none">Experts in area</p>
                   </div>
                </div>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ExploreMap;

