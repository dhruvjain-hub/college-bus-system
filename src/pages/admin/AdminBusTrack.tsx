import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, onSnapshot, getDoc } from "firebase/firestore";
import { db } from "@/firebase";
import LiveFleetMap from "@/components/maps/LiveFleetMap";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";

type BusDoc = {
  id: string;
  number: string;
  latitude: number;
  longitude: number;
  status?: "online" | "delayed" | "breakdown" | "rescue_assigned";
  routeId?: string;
};


export default function AdminBusTrack() {
  const { busId } = useParams<{ busId: string }>();
  const navigate = useNavigate();
  const [bus, setBus] = useState<BusDoc | null>(null);

  const [route, setRoute] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!busId) return;

    const unsub = onSnapshot(
      doc(db, "buses", busId),
      async snap => {
        if (!snap.exists()) {
          setBus(null);
          setRoute(null);
          setLoading(false);
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
              ...routeSnap.data()
            });
          } else {
            setRoute(null);
          }
        } else {
          setRoute(null);
        }

        setLoading(false);
      }
    );

    return () => unsub();
  }, [busId]);

  if (loading) {
    return <p className="p-6">Loading live tracking…</p>;
  }

  if (!bus) {
    return <p className="p-6">Bus not found</p>;
  }

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-80px)] flex flex-col">

        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="font-bold">
            Tracking Bus {bus.number || "Unnamed"}
          </h2>

          <Button
            variant="outline"
            onClick={() => navigate(`/admin/bus/${bus.id}`)}
          >
            View Details
          </Button>
        </div>

        <div className="flex-1">
          <LiveFleetMap
            buses={[
              {
                id: bus.id,
                number: bus.number,
                lat: bus.latitude,
                lng: bus.longitude,
                status: bus.status
              }
            ]}
            route={route}
            showRoute
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
