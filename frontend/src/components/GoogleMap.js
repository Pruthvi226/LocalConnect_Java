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
  const UserMarkerRef = useRef(null);
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
    // We normalize based on the Customer's current center
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
    if (!UserMarkerRef.current) {
        UserMarkerRef.current = new google.maps.Marker({
          position: pos,
          map: mapInstanceRef.current,
          icon: { path: google.maps.SymbolPath.CIRCLE, scale: 10, fillColor: "#4F46E5", fillOpacity: 1, strokeColor: "white", strokeWeight: 3 },
          zIndex: 100
        });
    } else UserMarkerRef.current.setPosition(pos);
    mapInstanceRef.current.panTo(pos);
  }, [latitude, longitude, isMock]);

  useEffect(() => {
    if (isMock || !mapInstanceRef.current || !services) return;
    const google = window.google;
    const bounds = new google.maps.LatLngBounds();
    
    // Always include user location in bounds
    if (latitude && longitude) {
      bounds.extend({ lat: latitude, lng: longitude });
    }

    services.forEach(service => {
      if (!service.latitude || !service.longitude) return;
      const pos = { lat: service.latitude, lng: service.longitude };
      bounds.extend(pos);
      
      if (!markersRef.current[service.id]) {
        const marker = new google.maps.Marker({ 
          position: pos, 
          map: mapInstanceRef.current, 
          icon: createMarkerIcon(google, false),
          title: service.title 
        });
        marker.addListener('click', () => onMarkerClick(service.id));
        markersRef.current[service.id] = marker;
      } else {
        markersRef.current[service.id].setPosition(pos);
      }
    });

    if (services.length > 0 || (latitude && longitude)) {
      mapInstanceRef.current.fitBounds(bounds);
      // Don't zoom in too much if there's only one point
      const listener = google.maps.event.addListener(mapInstanceRef.current, "idle", () => {
        if (mapInstanceRef.current.getZoom() > 15) mapInstanceRef.current.setZoom(15);
        google.maps.event.removeListener(listener);
      });
    }
  }, [services, isMock, latitude, longitude]);

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
      <div className={`w-full h-full bg-slate-100 flex flex-col justify-center items-center rounded-[2.5rem] p-8 ${className}`}>
        <p className="font-bold text-slate-800 text-lg mb-1">Map unavailable.</p>
        <p className="text-slate-500 text-sm">Showing list view instead.</p>
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

