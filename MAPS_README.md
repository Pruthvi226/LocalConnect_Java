# 📍 Google Maps Integration Guide

ProxiSense uses Google Maps Platform for its "Explore Map" and "Nearby Services" features. Follow these steps to set up your production-grade mapping system.

## 1. Get an API Key
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project named `ProxiSense`.
3. Enable the following APIs:
   - **Maps JavaScript API** (For the interactive map)
   - **Places API** (For address search and autocomplete)
   - **Geolocation API** (To find the user's current position)
4. Go to **Credentials** and click **Create Credentials** -> **API Key**.

## 2. Configure Environment Variables
Copy your API key and update the following files:

### Frontend (`frontend/.env`)
```env
REACT_APP_GOOGLE_MAPS_API_KEY=YOUR_ACTUAL_API_KEY
```

### Backend (`backend/src/main/resources/application.properties`)
```properties
google.maps.api.key=YOUR_ACTUAL_API_KEY
```

## 3. Security Restrictions (Mandatory for Production)
To prevent unauthorized use of your key, restrict it in the Google Cloud Console:
1. **Application Restrictions**: Set to `HTTP referrers (web sites)`.
2. **Website Restrictions**: Add your production domain (e.g., `*.proxisense.com/*`) and `http://localhost:3000/*` for testing.
3. **API Restrictions**: Restrict the key to only the 3 APIs mentioned in Step 1.

## 4. Mock Mode fallback
If the API key is invalid or restricted, ProxiSense will automatically fallback to **High-Fidelity Mock Mode**, allowing you to demonstrate the interface without active billing.

---
> [!TIP]
> Google provides a $200 monthly credit for the Maps Platform, which is usually enough for small to medium-scale hyperlocal businesses.
