// Travel time via Google Maps JavaScript API (DistanceMatrixService)
// Requires VITE_GOOGLE_MAPS_API_KEY in .env.local
// The JS API handles CORS correctly from the browser.

import { Loader } from '@googlemaps/js-api-loader';

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

let _loader = null;
let _loaded = false;

function getLoader() {
  if (!_loader) {
    _loader = new Loader({ apiKey: API_KEY, version: 'weekly' });
  }
  return _loader;
}

export function hasTravelTimeApiKey() {
  return Boolean(API_KEY && API_KEY.length > 10);
}

export async function getDriveTimeMinutes(origin, destination) {
  if (!hasTravelTimeApiKey()) {
    throw new Error('Ingen Google Maps API-nøgle konfigureret.');
  }
  if (!origin || !destination) {
    throw new Error('Afsenders- og destinationsadresse er påkrævet.');
  }

  if (!_loaded) {
    await getLoader().load();
    _loaded = true;
  }

  return new Promise((resolve, reject) => {
    // eslint-disable-next-line no-undef
    const service = new google.maps.DistanceMatrixService();
    service.getDistanceMatrix(
      {
        origins: [origin],
        destinations: [destination],
        // eslint-disable-next-line no-undef
        travelMode: google.maps.TravelMode.DRIVING,
        drivingOptions: {
          departureTime: new Date(),
          // eslint-disable-next-line no-undef
          trafficModel: google.maps.TrafficModel.BEST_GUESS,
        },
        region: 'DK',
      },
      (response, status) => {
        if (status !== 'OK') {
          reject(new Error(`Distance Matrix fejlede: ${status}`));
          return;
        }
        const element = response.rows?.[0]?.elements?.[0];
        if (!element || element.status !== 'OK') {
          reject(new Error(`Element status: ${element?.status ?? 'ukendt'}`));
          return;
        }
        const secs =
          element.duration_in_traffic?.value ?? element.duration?.value ?? 0;
        resolve(Math.round(secs / 60));
      }
    );
  });
}
