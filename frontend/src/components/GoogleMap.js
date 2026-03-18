import React, { useEffect, useRef, useState } from 'react';
import { loadGoogleMaps } from '../utils/googleMapsLoader';
import { MapPin, Info, Zap, Star, Navigation } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const GoogleMap = ({ 
  latitude, 
  longitude, 
  services = [], 
  activeServiceId = null,
  onMarkerClick = () => {},
  className = "" 
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});
  const infoWindowRef = useRef(null);
  const userMarkerRef = useRef(null);
  const [isMock, setIsMock] = useState(false);
  const [hoveredService, setHoveredService] = useState(null);

  useEffect(() => {
    const initMap = async () => {
      try {
        const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
        const google = await loadGoogleMaps(apiKey);
        
        if (!mapRef.current || mapInstanceRef.current) return;

        const mapOptions = {
          center: { lat: latitude, lng: longitude },
          zoom: 13,
          styles: mapStyles,
          disableDefaultUI: false,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        };

        mapInstanceRef.current = new google.maps.Map(mapRef.current, mapOptions);
        infoWindowRef.current = new google.maps.InfoWindow();
        setIsMock(false);
      } catch (err) {
        if (err.message === 'GOOGLE_MAPS_KEY_MISSING' || err.message.includes('API key')) {
          console.warn("Using high-fidelity mock discovery map (API key required for Google Maps).");
          setIsMock(true);
        } else {
          console.error("Map init failed", err);
        }
      }
    };

    initMap();
  }, []);

  // Logical marker handling for Mock Mode
  const getMockCoordinates = (service) => {
    // Convert lat/lng to simple percentage offsets for the 2D SVG map
    // We normalize based on the user's current center
    const latDiff = (service.latitude - latitude) * 200; // Scaling factor
    const lngDiff = (service.longitude - longitude) * 200;
    return {
      top: `${50 - latDiff}%`,
      left: `${50 + lngDiff}%`
    };
  };

  // Standard Google Maps logic (same as before)
  useEffect(() => {
    if (isMock || !mapInstanceRef.current || !latitude || !longitude) return;
    // ... (Same Google Maps implementation as before)
    const google = window.google;
    const pos = { lat: latitude, lng: longitude };
    if (!userMarkerRef.current) {
        userMarkerRef.current = new google.maps.Marker({
          position: pos,
          map: mapInstanceRef.current,
          icon: { path: google.maps.SymbolPath.CIRCLE, scale: 10, fillColor: "#4F46E5", fillOpacity: 1, strokeColor: "white", strokeWeight: 3 },
          zIndex: 100
        });
    } else userMarkerRef.current.setPosition(pos);
    mapInstanceRef.current.panTo(pos);
  }, [latitude, longitude, isMock]);

  useEffect(() => {
    if (isMock || !mapInstanceRef.current || !services) return;
    const google = window.google;
    const bounds = new google.maps.LatLngBounds();
    bounds.extend({ lat: latitude, lng: longitude });

    services.forEach(service => {
      if (!service.latitude || !service.longitude) return;
      const pos = { lat: service.latitude, lng: service.longitude };
      bounds.extend(pos);
      if (!markersRef.current[service.id]) {
        const marker = new google.maps.Marker({ position: pos, map: mapInstanceRef.current, icon: createMarkerIcon(google, false) });
        marker.addListener('click', () => onMarkerClick(service.id));
        markersRef.current[service.id] = marker;
      }
    });
    if (services.length > 0) mapInstanceRef.current.fitBounds(bounds);
  }, [services, isMock]);

  useEffect(() => {
    if (isMock || !activeServiceId || !markersRef.current[activeServiceId]) return;
    const google = window.google;
    Object.values(markersRef.current).forEach(m => m.setIcon(createMarkerIcon(google, false)));
    const activeMarker = markersRef.current[activeServiceId];
    activeMarker.setIcon(createMarkerIcon(google, true));
    mapInstanceRef.current.panTo(activeMarker.getPosition());
    const service = services.find(s => s.id === activeServiceId);
    if (service && infoWindowRef.current) {
       infoWindowRef.current.setContent(createInfoWindowContent(service));
       infoWindowRef.current.open(mapInstanceRef.current, activeMarker);
    }
  }, [activeServiceId, isMock]);

  if (isMock) {
    return (
      <div className={`relative w-full h-full bg-slate-50 overflow-hidden flex items-center justify-center p-8 ${className}`}>
        {/* Abstract Grid Background */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        
        <div className="relative w-full h-full max-w-4xl max-h-[600px] bg-slate-100 rounded-[3rem] border border-slate-200 shadow-inner flex items-center justify-center overflow-hidden">
           {/* SVG Map Illustration */}
           <svg className="w-full h-full opacity-20" viewBox="0 0 1000 1000">
             <path d="M100,500 Q300,300 500,500 T900,500" fill="none" stroke="#4f46e5" strokeWidth="2" strokeDasharray="10 10" />
             <circle cx="500" cy="500" r="300" fill="none" stroke="#4f46e5" strokeWidth="1" strokeOpacity="0.1" />
           </svg>

           {/* User Location Marker (Mock) */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
              <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center border-4 border-white shadow-2xl animate-pulse">
                <Navigation className="w-6 h-6 text-white" />
              </div>
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-slate-900 px-3 py-1 rounded-full text-[9px] font-black text-white uppercase whitespace-nowrap">
                You are here
              </div>
           </div>

           {/* Service Markers (Mock) */}
           {services.map(service => {
              const coords = getMockCoordinates(service);
              const isActive = activeServiceId === service.id;
              return (
                <div 
                  key={service.id} 
                  className={`absolute z-10 transition-all duration-500 cursor-pointer ${isActive ? 'z-30' : 'hover:z-20'}`}
                  style={{ top: coords.top, left: coords.left }}
                  onClick={() => onMarkerClick(service.id)}
                  onMouseEnter={() => setHoveredService(service)}
                  onMouseLeave={() => setHoveredService(null)}
                >
                   <motion.div 
                     animate={{ scale: isActive ? 1.5 : 1, y: isActive ? -10 : 0 }}
                     className={`w-10 h-10 ${isActive ? 'bg-primary-600 text-white shadow-primary-500/50' : 'bg-white text-slate-400 shadow-lg'} rounded-2xl flex items-center justify-center border-2 border-white shadow-xl group transition-colors`}
                   >
                      <MapPin className="w-5 h-5" />
                   </motion.div>

                   {/* InfoWindow (Mock) */}
                   <AnimatePresence>
                     {(isActive || hoveredService?.id === service.id) && (
                       <motion.div 
                         initial={{ opacity: 0, y: 10 }}
                         animate={{ opacity: 1, y: 0 }}
                         exit={{ opacity: 0, scale: 0.9 }}
                         className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-48 bg-white rounded-3xl p-4 shadow-2xl border border-slate-100"
                       >
                          <p className="text-[10px] font-black uppercase text-primary-600 mb-1">{service.category}</p>
                          <h4 className="text-xs font-black text-slate-800 mb-2 truncate">{service.title}</h4>
                          <div className="flex justify-between items-center text-xs">
                             <span className="font-black text-slate-900">₹{service.price}</span>
                             <span className="flex items-center gap-1 font-bold text-amber-500">
                               <Star className="w-3 h-3 fill-current" />
                               {service.averageRating.toFixed(1)}
                             </span>
                          </div>
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-[8px] border-transparent border-t-white" />
                       </motion.div>
                     )}
                   </AnimatePresence>
                </div>
              );
           })}

           <div className="absolute bottom-8 left-8 bg-black/80 backdrop-blur-md px-6 py-3 rounded-full flex items-center gap-3">
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
              <p className="text-[10px] uppercase font-black tracking-widest text-white">
                Project ProxiSense | <span className="text-amber-400">Mock Discovery Mode Active</span>
              </p>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={mapRef} className={`w-full h-full ${className}`} style={{ minHeight: '300px' }} />
  );
};

const createInfoWindowContent = (service) => `
  <div style="padding: 12px; min-width: 180px; font-family: Inter, sans-serif;">
    <p style="margin: 0 0 4px; font-size: 10px; font-weight: 900; text-transform: uppercase; color: #6366f1; letter-spacing: 0.05em;">${service.category}</p>
    <h4 style="margin: 0 0 8px; font-size: 14px; font-weight: 900; color: #1e293b;">${service.title}</h4>
    <div style="display: flex; justify-content: justify-between; align-items: center;">
       <span style="font-weight: 900; color: #1e293b; font-size: 14px;">₹${service.price}</span>
       <span style="margin-left: auto; font-size: 11px; font-weight: 800; display: flex; align-items: center; gap: 4px;">⭐ ${service.averageRating.toFixed(1)}</span>
    </div>
  </div>
`;

const createMarkerIcon = (google, isActive) => ({
  path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
  fillColor: isActive ? "#4F46E5" : "#94A3B8",
  fillOpacity: 1, strokeColor: "white", strokeWeight: 2, scale: isActive ? 2 : 1.5, anchor: new google.maps.Point(12, 22),
});

const mapStyles = [
  { "featureType": "poi", "elementType": "all", "stylers": [{ "visibility": "off" }] },
  { "featureType": "water", "elementType": "all", "stylers": [{ "color": "#cbd5e1" }] }
];

export default GoogleMap;
