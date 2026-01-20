import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/shared/StatCard";
import { BusCard } from "@/components/shared/BusCard";
import { NotificationCard } from "@/components/shared/NotificationCard";
import LiveFleetMap from "@/components/maps/LiveFleetMap";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  Bus,
  MapPin,
  Clock,
  AlertTriangle,
  Calendar,
  Navigation
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  where,
  setDoc,
  serverTimestamp
} from "firebase/firestore";
import { db } from "@/firebase";
import { Bus as FullBus } from "@/lib/types";

/* ===================== TYPES ===================== */

type StudentUser = {
  id: string;
  name: string;
  busId?: string;
};

type BusDoc = {
  id: string;
  number: string;
  latitude: number;
  longitude: number;
  status?: "online" | "delayed" | "breakdown" | "rescue_assigned";
  routeId?: string;
};

type RouteDoc = {
  id: string;
  path: { lat: number; lng: number }[];
};

type NotificationDoc = {
  id: string;
  title: string;
  message: string;
  targetType: "all" | "student" | "bus";
  targetId?: string;
};

/* ===================== COMPONENT ===================== */

export default function StudentDashboard() {
  const { user, loading } = useAuth();
  const student = user as StudentUser;

  const [bus, setBus] = useState<BusDoc | null>(null);
  const [route, setRoute] = useState<RouteDoc | null>(null);
  const [notifications, setNotifications] = useState<NotificationDoc[]>([]);
  const [missedRequest, setMissedRequest] = useState<any | null>(null);

  /* ===================== AUTH ===================== */

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading…
      </div>
    );
  }

  if (!student) return null;

  /* ===================== BUS + ROUTE ===================== */

  useEffect(() => {
    if (!student.busId) return;

    const unsub = onSnapshot(doc(db, "buses", student.busId), async snap => {
      if (!snap.exists()) {
        setBus(null);
        setRoute(null);
        return;
      }

      const busData = {
        id: snap.id,
        ...(snap.data() as Omit<BusDoc, "id">)
      };

      setBus(busData);

      if (busData.routeId) {
        const routeSnap = await getDoc(
          doc(db, "routes", busData.routeId)
        );

        if (routeSnap.exists()) {
          setRoute({
            id: routeSnap.id,
            ...(routeSnap.data() as Omit<RouteDoc, "id">)
          });
        } else {
          setRoute(null);
        }
      } else {
        setRoute(null);
      }
    });

    return () => unsub();
  }, [student.busId]);

  /* ===================== NOTIFICATIONS ===================== */

  useEffect(() => {
    const q = query(collection(db, "notifications"));

    const unsub = onSnapshot(q, snap => {
      const data = snap.docs
        .map(d => ({ id: d.id, ...(d.data() as any) }))
        .filter(
          n =>
            n.targetType === "all" ||
            (n.targetType === "student" && n.targetId === student.id) ||
            (n.targetType === "bus" && n.targetId === student.busId)
        );

      setNotifications(data.reverse());
    });

    return () => unsub();
  }, [student.id, student.busId]);

  /* ===================== MISSED BUS (SINGLE REQUEST ONLY) ===================== */

  useEffect(() => {
    const ref = doc(db, "missed_bus_requests", student.id);

    const unsub = onSnapshot(ref, snap => {
      if (snap.exists()) {
        setMissedRequest({ id: snap.id, ...snap.data() });
      } else {
        setMissedRequest(null);
      }
    });

    return () => unsub();
  }, [student.id]);

  const raiseMissedBusRequest = () => {
    if (!bus || missedRequest) return;

    navigator.geolocation.getCurrentPosition(async pos => {
      await setDoc(doc(db, "missed_bus_requests", student.id), {
        studentId: student.id,
        busId: bus.id,
        routeId: bus.routeId || null,
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        status: "pending",
        createdAt: serverTimestamp()
      });
    });
  };

  /* ===================== MAP BUS (TYPE SAFE) ===================== */

  const mapBusForUI: FullBus | null = bus
  ? {
      id: bus.id,
      number: bus.number,
      status: bus.status,
      capacity: 0,
      driverId: "",
      routeId: bus.routeId ?? "",
      currentLocation: {
        lat: bus.latitude,
        lng: bus.longitude
      }
    }
  : null;


  /* ===================== UI ===================== */

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">
            Good Morning, {student.name.split(" ")[0]}
          </h1>

          <Link to="/student/track">
            <Button variant="hero">
              <Navigation className="w-4 h-4" />
              Track My Bus
            </Button>
          </Link>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="My Bus" value={bus?.number || "N/A"} icon={<Bus />} />
          <StatCard title="Pickup Stop" value="Assigned Stop" icon={<MapPin />} />
          <StatCard title="Pickup Time" value="08:00" icon={<Clock />} />
          <StatCard title="Pass Validity" value="185 days" icon={<Calendar />} />
        </div>

        {/* MAP + ACTIONS */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-card rounded-xl h-[360px] overflow-hidden">
            {bus && (
              <LiveFleetMap
                buses={[
                  {
                    id: bus.id,
                    number: bus.number,
                    lat: bus.latitude,
                    lng: bus.longitude,
                    status: bus.status ?? "online"
                  }
                ]}
                route={route}
                showRoute
              />
            )}
          </div>

          <div className="space-y-4">
            {mapBusForUI && <BusCard bus={mapBusForUI} />}

            <Button
              variant="warning"
              className="w-full"
              disabled={!!missedRequest}
              onClick={raiseMissedBusRequest}
            >
              <AlertTriangle className="w-4 h-4" />
              {missedRequest ? "Request Already Raised" : "I Missed My Bus"}
            </Button>

            {missedRequest && (
              <div className="bg-card p-4 rounded-xl border border-orange-300">
                <h3 className="font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                  Missed Bus Request
                </h3>
                <p className="text-sm mt-1 capitalize">
                  Status: {missedRequest.status}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* NOTIFICATIONS */}
        <div className="bg-card p-5 rounded-xl">
          <h2 className="font-bold mb-3">Notifications</h2>
          {notifications.slice(0, 3).map(n => (
            <NotificationCard key={n.id} notification={n} />
          ))}
        </div>

      </div>
    </DashboardLayout>
  );
}
