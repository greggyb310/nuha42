import { useState, useCallback } from 'react';
import * as Location from 'expo-location';
import { Platform } from 'react-native';
import type { UseLocationReturn, Coordinates } from '@/types/location';

export function useLocation(): UseLocationReturn {
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<'undetermined' | 'granted' | 'denied' | null>(null);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      console.log('[useLocation] Requesting location permission...');

      if (Platform.OS === 'web') {
        console.log('[useLocation] Web platform detected - permission handling differs');
        setPermissionStatus('granted');
        return true;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      console.log('[useLocation] Permission status:', status);

      if (status === 'granted') {
        setPermissionStatus('granted');
        setError(null);
        return true;
      } else {
        setPermissionStatus('denied');
        setError('Location permission denied. Please enable location access in Settings.');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to request location permission';
      console.error('[useLocation] Permission error:', errorMessage);
      setError(errorMessage);
      setPermissionStatus('denied');
      return false;
    }
  }, []);

  const getCurrentLocation = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      console.log('[useLocation] Getting current location...');

      if (Platform.OS === 'web') {
        console.log('[useLocation] Web platform - using browser geolocation');
        setError('Location services are only available on iOS. Using default coordinates for web preview.');
        setCoordinates({
          latitude: 37.7749,
          longitude: -122.4194,
          altitude: null,
          accuracy: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        });
        return;
      }

      const hasPermission = permissionStatus === 'granted' || await requestPermission();

      if (!hasPermission) {
        console.log('[useLocation] No permission granted');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      console.log('[useLocation] Location retrieved:', {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
      });

      setCoordinates({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        altitude: location.coords.altitude,
        accuracy: location.coords.accuracy,
        altitudeAccuracy: location.coords.altitudeAccuracy,
        heading: location.coords.heading,
        speed: location.coords.speed,
      });

      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get current location';
      console.error('[useLocation] Location error:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [permissionStatus, requestPermission]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    coordinates,
    loading,
    error,
    permissionStatus,
    requestPermission,
    getCurrentLocation,
    clearError,
  };
}
