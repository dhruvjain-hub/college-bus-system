import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/shared/StatCard';
import { BusCard } from '@/components/shared/BusCard';
import { NotificationCard } from '@/components/shared/NotificationCard';
import { MapPlaceholder } from '@/components/shared/MapPlaceholder';
import { Button } from '@/components/ui/button';
import { mockBuses, mockRoutes, mockStops } from '@/lib/mock-data';
import { useAuth } from '@/contexts/AuthContext';
import { Student, Notification } from '@/lib/types';
import { Bus, MapPin, Clock, AlertTriangle, Calendar, Navigation } from 'lucide-react';
import { Link } from 'react-router-dom';
import { collection, addDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase';

export default function StudentDashboard() {
  const { user, loading } = useAuth();

  // 🔐 AUTH GUARD
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const student = user as Student;

  // UI DATA
  const assignedBus = mockBuses.find(b => b.id === student.busId);
  const route = mockRoutes.find(r => r.id === assignedBus?.routeId);
  const stop = mockStops.find(s => s.id === student.stopId);

  // 🔔 LIVE NOTIFICATIONS
  const [liveNotifications, setLiveNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'notifications'), snap => {
      const filtered = snap.docs
        .map(d => ({ id: d.id, ...d.data() } as Notification))
        .filter(n =>
          n.targetType === 'all' ||
          (n.targetType === 'bus' && n.targetId === student.busId) ||
          (n.targetType === 'student' && n.targetId === student.id)
        );

      setLiveNotifications(filtered.reverse());
    });

    return () => unsub();
  }, [student]);

  const raiseMissedBusRequest = async () => {
    if (!navigator.geolocation) {
      alert('Enable location access.');
      return;
    }

    navigator.geolocation.getCurrentPosition(async pos => {
      await addDoc(collection(db, 'missed_bus_requests'), {
        studentId: student.id,
        busId: student.busId,
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        status: 'pending',
        createdAt: serverTimestamp(),
      });

      alert('Missed bus request sent.');
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">
            Good Morning, {student.name.split(' ')[0]}
          </h1>
          <Link to="/student/track">
            <Button variant="hero">
              <Navigation className="w-4 h-4" /> Track My Bus
            </Button>
          </Link>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="My Bus" value={assignedBus?.number || 'N/A'} icon={<Bus />} />
          <StatCard title="Pickup Stop" value={stop?.name || 'N/A'} icon={<MapPin />} />
          <StatCard title="Pickup Time" value={stop?.arrivalTime || '08:00'} icon={<Clock />} />
          <StatCard title="Pass Validity" value="185 days" icon={<Calendar />} />
        </div>

        {/* MAP + BUS CARD */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-card p-4 rounded-xl">
            <MapPlaceholder
              buses={
                assignedBus
                  ? [
                      {
                        id: assignedBus.id,
                        number: assignedBus.number,
                        status: assignedBus.status,
                        lat: assignedBus.currentLocation?.lat || 0,
                        lng: assignedBus.currentLocation?.lng || 0,
                      },
                    ]
                  : []
              }
              showRoute
              height="h-[300px]"
            />
          </div>

          <div className="space-y-4">
            {assignedBus && <BusCard bus={assignedBus} />}
            <Button variant="warning" className="w-full" onClick={raiseMissedBusRequest}>
              <AlertTriangle className="w-4 h-4" /> I Missed My Bus
            </Button>
          </div>
        </div>

        {/* NOTIFICATIONS */}
        <div className="bg-card p-5 rounded-xl">
          <h2 className="font-bold mb-3">Notifications</h2>

          {liveNotifications.slice(0, 3).map(n => (
            <NotificationCard key={n.id} notification={n} />
          ))}
        </div>

      </div>
    </DashboardLayout>
  );
}
