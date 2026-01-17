import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";

export default function AdminBusDetails() {
  const { busId } = useParams<{ busId: string }>();
  const navigate = useNavigate();

  const [bus, setBus] = useState<any | null>(null);
  const [route, setRoute] = useState<any | null>(null);
  const [driver, setDriver] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!busId) return;

    const load = async () => {
      try {
        const busSnap = await getDoc(doc(db, "buses", busId));

        if (!busSnap.exists()) {
          setLoading(false);
          return;
        }

        const busData = busSnap.data();
        setBus({ id: busSnap.id, ...busData });

        if (busData.routeId) {
          const routeSnap = await getDoc(
            doc(db, "routes", busData.routeId)
          );
          routeSnap.exists() && setRoute(routeSnap.data());
        }

        if (busData.driverId) {
          const driverSnap = await getDoc(
            doc(db, "users", busData.driverId)
          );
          driverSnap.exists() && setDriver(driverSnap.data());
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [busId]);

  if (loading) {
    return <p className="p-6">Loading bus details…</p>;
  }

  if (!bus) {
    return <p className="p-6">Bus not found</p>;
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl bg-card p-6 rounded-xl shadow-soft space-y-4">

        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">
            Bus {bus.number || "Unnamed"}
          </h1>

          <StatusBadge status={bus.status} />
        </div>

        <div className="space-y-2 text-sm">
          <div><b>Route:</b> {route?.routeName || "Not assigned"}</div>
          <div><b>Driver:</b> {driver?.name || "Not assigned"}</div>
          <div><b>Capacity:</b> {bus.capacity ?? "N/A"} seats</div>
          <div>
            <b>Last Location:</b>{" "}
            {bus.latitude}, {bus.longitude}
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Back
          </Button>

          <Button onClick={() => navigate(`/admin/bus/${bus.id}/track`)}>
            View Live Tracking
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
