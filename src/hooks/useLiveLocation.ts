import { useEffect, useRef } from 'react';
import { locationService } from '@/services/locationService';

export function useLiveLocation(busId: string, enabled: boolean) {
  const watchId = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled || !busId) {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
        watchId.current = null;
      }
      return;
    }

    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        locationService.updateLocation(busId, {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          speed: pos.coords.speed,
        });
      },
      (err) => {
        console.error('GPS error:', err.message);
      },
      { enableHighAccuracy: true }
    );

    return () => {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
      }
    };
  }, [busId, enabled]);
}
