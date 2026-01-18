import React, { useEffect, useRef } from 'react';
import { Box } from '@mui/material';

const GoogleMap = ({ latitude, longitude, title }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    if (!latitude || !longitude) return;

    const loadGoogleMaps = () => {
      const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
      
      if (!apiKey || apiKey === 'YOUR_API_KEY') {
        console.warn('Google Maps API key not configured');
        return;
      }

      // Check if Google Maps is already loaded
      if (window.google && window.google.maps) {
        initializeMap();
        return;
      }

      // Load Google Maps script
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        initializeMap();
      };
      document.head.appendChild(script);
    };

    const initializeMap = () => {
      if (!mapRef.current || !window.google || !window.google.maps) return;

      const mapOptions = {
        center: { lat: latitude, lng: longitude },
        zoom: 14,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
      };

      const map = new window.google.maps.Map(mapRef.current, mapOptions);
      
      const marker = new window.google.maps.Marker({
        position: { lat: latitude, lng: longitude },
        map: map,
        title: title || 'Service Location',
        animation: window.google.maps.Animation.DROP,
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;
    };

    loadGoogleMaps();

    return () => {
      if (markerRef.current) {
        markerRef.current.setMap(null);
        markerRef.current = null;
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current = null;
      }
    };
  }, [latitude, longitude, title]);

  if (!latitude || !longitude) {
    return null;
  }

  return (
    <Box
      ref={mapRef}
      sx={{
        width: '100%',
        height: 300,
        borderRadius: 2,
        overflow: 'hidden',
        border: '1px solid #e0e0e0',
        backgroundColor: '#f5f5f5',
      }}
    />
  );
};

export default GoogleMap;
