import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase';

async function sendEmergencyAlert(
  driverId: string,
  message: string
) {
  await addDoc(collection(db, 'notifications'), {
    type: 'EMERGENCY',
    driverId,
    message,
    target: 'admin',
    read: false,
    createdAt: serverTimestamp(),
  });
}

export const notificationService = {
  sendEmergencyAlert,
};
