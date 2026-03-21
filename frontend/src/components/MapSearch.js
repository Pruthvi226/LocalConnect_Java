import React, { useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';

const mapContainerStyle = {
  width: '100%',
  height: '500px',
  borderRadius: '0.5rem',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
};

// Default center (San Francisco roughly, if no user location is provided)
const defaultCenter = {
  lat: 37.7749,
  lng: -122.4194
};

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  styles: [ // Simple styled map for "modern" look
    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
    {
      featureType: "administrative.locality",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }],
    },
    {
      featureType: "poi",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }],
    },
    {
      featureType: "poi.park",
      elementType: "geometry",
      stylers: [{ color: "#263c3f" }],
    },
    {
      featureType: "poi.park",
      elementType: "labels.text.fill",
      stylers: [{ color: "#6b9a76" }],
    },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [{ color: "#38414e" }],
    },
    {
      featureType: "road",
      elementType: "geometry.stroke",
      stylers: [{ color: "#212a37" }],
    },
    {
      featureType: "road",
      elementType: "labels.text.fill",
      stylers: [{ color: "#9ca5b3" }],
    },
    {
      featureType: "road.highway",
      elementType: "geometry",
      stylers: [{ color: "#746855" }],
    },
    {
      featureType: "road.highway",
      elementType: "geometry.stroke",
      stylers: [{ color: "#1f2835" }],
    },
    {
      featureType: "road.highway",
      elementType: "labels.text.fill",
      stylers: [{ color: "#f3d19c" }],
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#17263c" }],
    },
    {
      featureType: "water",
      elementType: "labels.text.fill",
      stylers: [{ color: "#515c6d" }],
    },
    {
      featureType: "water",
      elementType: "labels.text.stroke",
      stylers: [{ color: "#17263c" }],
    },
  ],
};

const MapSearch = ({ services, center = defaultCenter, onMarkerClick }) => {
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '';
  
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey
  });

  const [map, setMap] = useState(null);
  const [selectedService, setSelectedService] = useState(null);

  const onLoad = useCallback(function callback(map) {
    const bounds = new window.google.maps.LatLngBounds();
    
    let hasValidPoints = false;
    services?.forEach((service) => {
      if (service.latitude && service.longitude) {
        bounds.extend({ lat: service.latitude, lng: service.longitude });
        hasValidPoints = true;
      }
    });

    if (hasValidPoints) {
      map.fitBounds(bounds);
    } else {
      map.setCenter(center);
      map.setZoom(12);
    }

    setMap(map);
  }, [services, center]);

  const onUnmount = useCallback(function callback(map) {
    setMap(null);
  }, []);

  if (loadError) {
    return (
      <div className="w-full h-[500px] flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-500">
        <div>Error loading maps. Check your API key.</div>
      </div>
    );
  }

  // If no API key is set, we fallback to a mock rendering
  if (!apiKey || apiKey === '') {
    return (
      <div className="w-full h-[500px] flex items-center justify-center bg-slate-800 rounded-lg text-white border border-slate-700 shadow-inner p-8 text-center">
        <div>
          <h3 className="text-xl font-bold mb-2">Live Service Map</h3>
          <p className="text-slate-400 mb-4">Google Maps API key is not configured in .env. Showing simulated representation.</p>
          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
            {services?.slice(0, 4).map((s, idx) => (
              <div key={s.id || idx} className="bg-slate-700 p-3 rounded-md shadow-md text-left text-sm cursor-pointer hover:bg-slate-600 transition-colors" onClick={() => onMarkerClick?.(s)}>
                <div className="font-semibold">{s.title.substring(0, 20)}...</div>
                <div className="text-emerald-400 font-mono mt-1">${s.price}</div>
              </div>
            ))}
            {services?.length === 0 && <div className="text-slate-500 col-span-2">No services nearby.</div>}
          </div>
        </div>
      </div>
    );
  }

  return isLoaded ? (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={center}
      zoom={12}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={mapOptions}
    >
      {/* Markers for services */}
      {services?.filter(s => s.latitude && s.longitude).map((service) => (
        <Marker
          key={service.id}
          position={{ lat: service.latitude, lng: service.longitude }}
          onClick={() => {
            setSelectedService(service);
            if(onMarkerClick) onMarkerClick(service);
          }}
          icon={{
            url: service.isAvailableNow 
                ? 'http://maps.google.com/mapfiles/ms/icons/green-dot.png' 
                : 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
          }}
        />
      ))}

      {/* Info Window for selected service */}
      {selectedService && (
        <InfoWindow
          position={{ lat: selectedService.latitude, lng: selectedService.longitude }}
          onCloseClick={() => setSelectedService(null)}
        >
          <div className="p-2 max-w-[200px] text-gray-800">
            <h3 className="font-bold mb-1 truncate">{selectedService.title}</h3>
            <p className="text-sm text-gray-600 mb-2 truncate">By {selectedService.providerName}</p>
            <div className="flex justify-between items-center text-sm font-semibold">
              <span className="text-emerald-600">${selectedService.price}</span>
              {selectedService.isAvailableNow && (
                 <span className="text-xs bg-emerald-100 text-emerald-800 px-1 py-0.5 rounded font-black flex items-center gap-1 border border-emerald-200 shadow-sm ml-2">
                    ⚡ {selectedService.distanceKm ? `${Math.round(selectedService.distanceKm * 5 + 15)} Min ETA` : '30 Min ETA'}
                 </span>
              )}
            </div>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  ) : (
    <div className="w-full h-[500px] flex items-center justify-center bg-gray-900 rounded-lg shadow-inner">
      <div className="animate-pulse flex space-x-4">
        <div className="rounded-full bg-slate-700 h-10 w-10"></div>
        <div className="flex-1 space-y-6 py-1">
          <div className="h-2 bg-slate-700 rounded w-24"></div>
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-4">
              <div className="h-2 bg-slate-700 rounded col-span-2"></div>
              <div className="h-2 bg-slate-700 rounded col-span-1"></div>
            </div>
            <div className="h-2 bg-slate-700 rounded w-16"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(MapSearch);
