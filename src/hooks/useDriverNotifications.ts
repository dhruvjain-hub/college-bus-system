import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/firebase';

export function useDriverNotifications(driverId: string) {
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (!driverId) return;

    const q = query(
      collection(db, 'notifications'),
      where('driverId', '==', driverId)
    );

    const unsub = onSnapshot(q, (snap) => {
      setNotifications(
        snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      );
    });

    return () => unsub();
  }, [driverId]);

  return notifications;
}
