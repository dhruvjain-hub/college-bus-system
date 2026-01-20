import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase';

async function updateLocation(
  busId: string,
  location: {
    lat: number;
    lng: number;
    speed?: number | null;
  }
) {
  if (!busId) return;

  await updateDoc(doc(db, 'buses', busId), {
    location,
    lastUpdated: serverTimestamp(),
  });
}

async function stopTracking(busId: string) {
  if (!busId) return;

  await updateDoc(doc(db, 'buses', busId), {
    lastUpdated: serverTimestamp(),
  });
}

export const locationService = {
  updateLocation,
  stopTracking,
};
