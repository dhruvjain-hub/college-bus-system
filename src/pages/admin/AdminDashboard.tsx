import { useState, useEffect } from "react";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/shared/StatCard";
import { BusCard } from "@/components/shared/BusCard";
import LiveFleetMap from "@/components/maps/LiveFleetMap";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Bus,
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/firebase";

export default function AdminDashboard() {
  const [selectedBus, setSelectedBus] = useState<string | null>(null);
  const [buses, setBuses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [missedRequests, setMissedRequests] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);

  const assignRescue = async (requestId: string) => {
    if (!selectedBus) {
      alert("Please select a bus from fleet first");
      return;
    }

    const ref = doc(db, "missed_bus_requests", requestId);
    await updateDoc(ref, {
      status: "assigned",
      assignedBusId: selectedBus,
      assignedAt: serverTimestamp(),
    });

    alert("Rescue Assigned Successfully");
  };


  useEffect(() => {
    const unsubBuses = onSnapshot(collection(db, "buses"), snap =>
      setBuses(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );

    const unsubStudents = onSnapshot(
      query(collection(db, "users"), where("role", "==", "student")),
      snap => setStudents(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );

    const unsubDrivers = onSnapshot(
      query(collection(db, "users"), where("role", "==", "driver")),
      snap => setDrivers(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );

    const unsubMissed = onSnapshot(collection(db, "missed_bus_requests"), snap =>
      setMissedRequests(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );

    const unsubRoutes = onSnapshot(collection(db, "routes"), snap =>
      setRoutes(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );

    return () => {
      unsubBuses();
      unsubStudents();
      unsubDrivers();
      unsubMissed();
      unsubRoutes();
    };
  }, []);

  const activeBuses = buses.filter(b => b.status === "online");
  const delayedBuses = buses.filter(b => b.status === "delayed");
  const pendingRequests = missedRequests.filter(r => r.status === "pending");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold">
              Transport Dashboard
            </h1>
            <p className="text-muted-foreground">
              Live overview of transport system
            </p>
          </div>
          <Link to="/admin/fleet">
            <Button variant="hero">
              <MapPin className="w-4 h-4" />
              Live Fleet Map
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard title="Total Buses" value={buses.length} icon={<Bus />} />
          <StatCard
            title="Active"
            value={activeBuses.length}
            icon={<CheckCircle />}
            variant="success"
          />
          <StatCard
            title="Delayed"
            value={delayedBuses.length}
            icon={<Clock />}
            variant="warning"
          />
          <StatCard title="Students" value={students.length} icon={<Users />} />
          <StatCard
            title="Pending Requests"
            value={pendingRequests.length}
            icon={<AlertTriangle />}
            variant="danger"
          />
        </div>

        {/* Map + Requests */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-card rounded-xl shadow-soft p-4">
            <h2 className="font-display font-bold text-lg mb-3">
              Live Fleet Overview
            </h2>
            <LiveFleetMap buses={buses.map(b => ({
              id: b.id,
              number: b.number,
              lat: b.latitude,
              lng: b.longitude,
            }))} />

          </div>

          <div className="bg-card rounded-xl shadow-soft p-5">
            <h2 className="font-display font-bold text-lg mb-4">
              Missed Bus Requests
            </h2>
            {pendingRequests.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No pending requests
              </p>
            ) : (
              pendingRequests.map(r => (
                <div
                  key={r.id}
                  className="border p-3 mb-3 rounded-lg bg-danger/5"
                >
                  <p className="font-medium">Student: {r.studentId}</p>
                  <p className="text-sm text-muted-foreground">
                    {r.time &&
                      formatDistanceToNow(r.time.toDate(), {
                        addSuffix: true,
                      })}
                  </p>
                  <div className="flex justify-between items-center mt-2">
                    <StatusBadge status={r.status} size="sm" />
                    <Button size="sm" variant="accent" onClick={() => assignRescue(r.id)}>
                      Assign Rescue
                    </Button>
                  </div>

                </div>
              ))
            )}
          </div>
        </div>

        {/* Bus Fleet */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-bold text-lg">Bus Fleet</h2>
            <Link to="/admin/buses">
              <Button variant="ghost" size="sm">
                Manage All
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {buses.map(bus => (
              <BusCard
                key={bus.id}
                bus={bus}
                showActions
                onViewDetails={() => setSelectedBus(bus.id)}
                className={selectedBus === bus.id ? "ring-2 ring-primary" : ""}
              />

            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
