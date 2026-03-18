import React, { useEffect, useRef, useState } from 'react';
import { Search, MapPin, X, Navigation } from 'lucide-react';
import { loadGoogleMaps } from '../utils/googleMapsLoader';

const LocationSearch = ({ onLocationSelect, placeholder = "Search city or area...", className = "" }) => {
  const inputRef = useRef(null);
  const autoCompleteRef = useRef(null);
  const [inputValue, setInputValue] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [showMockDropdown, setShowMockDropdown] = useState(false);

  const mockCities = [
    { name: "Mumbai", latitude: 19.0760, longitude: 72.8777, address: "Mumbai, Maharashtra" },
    { name: "Bangalore", latitude: 12.9716, longitude: 77.5946, address: "Bangalore, Karnataka" },
    { name: "Delhi", latitude: 28.6139, longitude: 77.2090, address: "Delhi, NCR" },
    { name: "Pune", latitude: 18.5204, longitude: 73.8567, address: "Pune, Maharashtra" }
  ];

  useEffect(() => {
    const initAutocomplete = async () => {
      try {
        const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
        const google = await loadGoogleMaps(apiKey);
        
        if (!inputRef.current) return;

        autoCompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
          types: ['(cities)'],
          componentRestrictions: { country: "in" },
          fields: ["address_components", "geometry", "icon", "name"],
        });

        autoCompleteRef.current.addListener("place_changed", () => {
          const place = autoCompleteRef.current.getPlace();
          if (!place.geometry || !place.geometry.location) return;

          const location = {
            latitude: place.geometry.location.lat(),
            longitude: place.geometry.location.lng(),
            address: place.formatted_address || place.name
          };

          setInputValue(place.name);
          onLocationSelect(location);
        });
        
        setIsLoaded(true);
      } catch (err) {
        console.warn("Autocomplete init failed - switching to mock mode.", err.message);
        setIsLoaded(true); // Allow input but use mock dropdown
      }
    };

    initAutocomplete();
  }, [onLocationSelect]);

  const handleMockClick = (city) => {
    setInputValue(city.name);
    onLocationSelect(city);
    setShowMockDropdown(false);
  };

  const handleInputFocus = () => {
    if (!autoCompleteRef.current) setShowMockDropdown(true);
  };

  const handleClear = () => {
    setInputValue('');
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className={`relative group ${className}`}>
      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors">
        <MapPin className="w-5 h-5" />
      </div>
      
      <input
        ref={inputRef}
        type="text"
        placeholder={isLoaded ? placeholder : "Loading location services..."}
        className="w-full bg-slate-50 border border-slate-100 py-4 pl-14 pr-12 rounded-2xl font-bold text-slate-900 focus:outline-none focus:border-primary-500 focus:bg-white transition-all shadow-sm"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onFocus={handleInputFocus}
        disabled={!isLoaded}
      />

      {showMockDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden">
          <div className="p-3 border-b border-slate-50 bg-slate-50/50">
            <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Select a Demo Zone</p>
          </div>
          {mockCities.map(city => (
            <button
              key={city.name}
              onClick={() => handleMockClick(city)}
              className="w-full px-5 py-4 text-left hover:bg-slate-50 flex items-center gap-3 transition-colors border-b border-slate-50 last:border-0"
            >
              <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center text-primary-600">
                <Navigation className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">{city.name}</p>
                <p className="text-[10px] text-slate-400 font-medium">{city.address}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {inputValue && (
        <button 
          onClick={handleClear}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-full text-slate-400 transition-all"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default LocationSearch;
