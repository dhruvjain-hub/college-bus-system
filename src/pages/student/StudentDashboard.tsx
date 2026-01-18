import { raiseMissedBus } from '@/services/missedBusService';
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
import {
  Bus,
  MapPin,
  Clock,
  AlertTriangle,
  Calendar,
  Navigation
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { collection, onSnapshot, doc } from 'firebase/firestore';
import { db } from '@/firebase';

export default function StudentDashboard() {
  const { user, loading } = useAuth();

  /* ===================== AUTH GUARD ===================== */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!user) return null;

  const student = user as Student;

  /* ===================== UI DATA ===================== */
  const assignedBus = mockBuses.find(b => b.id === student.busId);
  const route = mockRoutes.find(r => r.id === assignedBus?.routeId);
  const stop = mockStops.find(s => s.id === student.stopId);

  /* ===================== STATE ===================== */
  const [liveNotifications, setLiveNotifications] =
    useState<Notification[]>([]);
  const [missedRequest, setMissedRequest] = useState<any | null>(null);

  /* ===================== NOTIFICATIONS LISTENER ===================== */
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'notifications'), snap => {
      const filtered = snap.docs
        .map(d => ({ id: d.id, ...d.data() } as Notification))
        .filter(
          n =>
            n.targetType === 'all' ||
            (n.targetType === 'bus' &&
              n.targetId === student.busId) ||
            (n.targetType === 'student' &&
              n.targetId === student.id)
        );

      setLiveNotifications(filtered.reverse());
    });

    return () => unsub();
  }, [student]);

  /* ===================== MISSED BUS REQUEST LISTENER ===================== */
  useEffect(() => {
    if (!student?.id) return;

    const ref = doc(db, 'missed_bus_requests', student.id);

    const unsub = onSnapshot(ref, snap => {
      if (snap.exists()) {
        setMissedRequest({ id: snap.id, ...snap.data() });
      } else {
        setMissedRequest(null);
      }
    });

    return () => unsub();
  }, [student.id]);

  /* ===================== RAISE MISSED BUS ===================== */
  const raiseMissedBusRequest = async () => {
    if (!student?.id) return;
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      async position => {
        await raiseMissedBus(
          student.id,
          position.coords.latitude,
          position.coords.longitude
        );
      },
      error => console.error(error)
    );
  };

  /* ===================== UI ===================== */
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
          <StatCard
            title="My Bus"
            value={assignedBus?.number || 'N/A'}
            icon={<Bus />}
          />
          <StatCard
            title="Pickup Stop"
            value={stop?.name || 'N/A'}
            icon={<MapPin />}
          />
          <StatCard
            title="Pickup Time"
            value={stop?.arrivalTime || '08:00'}
            icon={<Clock />}
          />
          <StatCard
            title="Pass Validity"
            value="185 days"
            icon={<Calendar />}
          />
        </div>

        {/* MAP + ACTIONS */}
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
                        lat:
                          assignedBus.currentLocation?.lat || 0,
                        lng:
                          assignedBus.currentLocation?.lng || 0
                      }
                    ]
                  : []
              }
              showRoute
              height="h-[300px]"
            />
          </div>

          {/* RIGHT SIDE */}
          <div className="space-y-4">
            {assignedBus && <BusCard bus={assignedBus} />}

            {/* MISSED BUS BUTTON */}
            <Button
              variant="warning"
              className="w-full"
              onClick={raiseMissedBusRequest}
            >
              <AlertTriangle className="w-4 h-4" />
              I Missed My Bus
            </Button>

            {/* MISSED BUS STATUS CARD (JUST BELOW BUTTON) */}
            {missedRequest && (
              <div className="bg-card p-4 rounded-xl border border-orange-300">
                <h3 className="font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                  Missed Bus Request
                </h3>

                <p className="text-sm mt-1">
                  Status:{' '}
                  <span className="font-medium capitalize">
                    {missedRequest.status}
                  </span>
                </p>

                {missedRequest.assignedBusId && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Rescue bus has been assigned. Please wait.
                  </p>
                )}
              </div>
            )}
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
