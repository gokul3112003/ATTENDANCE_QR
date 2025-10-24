
import type { LocationData } from '../types';

const DEVICE_ID_KEY = 'qr_attendance_device_id';

/**
 * Retrieves a unique identifier for the device.
 * If one doesn't exist in localStorage, it generates a new UUID,
 * stores it, and returns it. This serves as a persistent, anonymous
 * identifier for the browser instance.
 * @returns {string} The unique device identifier.
 */
export function getDeviceIdentifier(): string {
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  return deviceId;
}

/**
 * Retrieves the current GPS coordinates of the device.
 * Wraps the navigator.geolocation API in a Promise for easier async handling.
 * @returns {Promise<LocationData>} A promise that resolves with the device's location.
 * @throws {Error} If location services are not available, permission is denied, or an error occurs.
 */
export function getCurrentLocation(): Promise<LocationData> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser.'));
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            reject(new Error('Location access denied. Please enable location permissions in your browser settings.'));
            break;
          case error.POSITION_UNAVAILABLE:
            reject(new Error('Location information is unavailable.'));
            break;
          case error.TIMEOUT:
            reject(new Error('The request to get user location timed out.'));
            break;
          default:
            reject(new Error('An unknown error occurred while getting location.'));
            break;
        }
      },
      options
    );
  });
}
