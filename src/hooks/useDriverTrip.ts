import { useState } from 'react';
import { busService } from '@/services/busService';
import { locationService } from '@/services/locationService';

export function useDriverTrip(busId: string) {
  const [tripActive, setTripActive] = useState(false);
  const [loading, setLoading] = useState(false);

  const startTrip = async () => {
    if (!busId) return;

    setLoading(true);
    await busService.updateStatus(busId, 'online');
    setTripActive(true);
    setLoading(false);
  };

  const endTrip = async () => {
    if (!busId) return;

    setLoading(true);
    await busService.updateStatus(busId, 'offline');
    await locationService.stopTracking(busId);
    setTripActive(false);
    setLoading(false);
  };

  return {
    startTrip,
    endTrip,
    tripActive,
    loading,
  };
}
