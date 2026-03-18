/**
 * Utility to load the Google Maps JavaScript API script once.
 */
let isLoaded = false;
let loadPromise = null;

export const loadGoogleMaps = (apiKey) => {
  if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
    return Promise.reject(new Error('GOOGLE_MAPS_KEY_MISSING'));
  }
  if (isLoaded) return Promise.resolve(window.google);
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      isLoaded = true;
      resolve(window.google);
    };

    script.onerror = (err) => {
      reject(new Error('Failed to load Google Maps API'));
    };

    document.head.appendChild(script);
  });

  return loadPromise;
};
