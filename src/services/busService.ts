import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase';

async function updateStatus(
  busId: string,
  status: 'online' | 'offline' | 'delayed' | 'breakdown'
) {
  if (!busId) return;

  await updateDoc(doc(db, 'buses', busId), { status });
}

export const busService = {
  updateStatus,
};
