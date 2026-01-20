import {
  addDoc,
  collection,
  serverTimestamp,
  updateDoc,
  doc,
} from 'firebase/firestore';
import { db } from '@/firebase';

async function reportBreakdown(
  busId: string,
  driverId: string,
  issue: string
) {
  if (!busId || !driverId) return;

  await addDoc(collection(db, 'breakdown_reports'), {
    busId,
    driverId,
    issue,
    status: 'pending',
    createdAt: serverTimestamp(),
  });
}

async function updateBreakdownStatus(
  breakdownId: string,
  status: 'pending' | 'resolved'
) {
  await updateDoc(doc(db, 'breakdown_reports', breakdownId), { status });
}

export const breakdownService = {
  reportBreakdown,
  updateBreakdownStatus,
};
