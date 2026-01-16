import { useState } from "react";
import {
  GoogleMap,
  Marker,
  Polyline,
  InfoWindow,
  useLoadScript,
} from "@react-google-maps/api";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";

/**
 * Bus coming from AdminDashboard
 * IMPORTANT: bus MUST have routeId
 */
type Bus = {
  id: string;
  number: string;
  lat: number;
  lng: number;
  routeId: string;
};

type Route = {
  routeName: string;
  path: { lat: number; lng: number }[];
};

const containerStyle = {
  width: "100%",
  height: "400px",
};

/**
 * Split route into covered & remaining
 * based on closest route point to bus
 */
function splitRoute(
  path: { lat: number; lng: number }[],
  busLat: number,
  busLng: number
) {
  let closestIndex = 0;
  let minDist = Infinity;

  path.forEach((p, i) => {
    const d =
      Math.abs(p.lat - busLat) + Math.abs(p.lng - busLng);
    if (d < minDist) {
      minDist = d;
      closestIndex = i;
    }
  });

  return {
    covered: path.slice(0, closestIndex + 1),
    remaining: path.slice(closestIndex),
  };
}

export default function LiveFleetMap({ buses }: { buses: Bus[] }) {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY!,
  });

  const [selectedBus, setSelectedBus] = useState<Bus | null>(null);
  const [route, setRoute] = useState<Route | null>(null);

  /**
   * When bus is clicked:
   * 1. Save selected bus
   * 2. Load route from Firestore
   */
  const handleBusClick = async (bus: Bus) => {
    setSelectedBus(bus);

    if (!bus.routeId) {
      console.warn("Bus has no routeId");
      setRoute(null);
      return;
    }

    const routeRef = doc(db, "routes", bus.routeId);
    const snap = await getDoc(routeRef);

    if (snap.exists()) {
      setRoute(snap.data() as Route);
    } else {
      console.warn("Route not found:", bus.routeId);
      setRoute(null);
    }
  };

  if (!isLoaded) return <div>Loading Map...</div>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={{ lat: 26.9124, lng: 75.7873 }}
      zoom={12}
    >
      {/* ROUTE DRAWING */}
      {route && selectedBus && (() => {
        const { covered, remaining } = splitRoute(
          route.path,
          selectedBus.lat,
          selectedBus.lng
        );

        return (
          <>
            {/* COVERED ROUTE */}
            <Polyline
              path={covered}
              options={{
                strokeColor: "#22c55e", // green
                strokeOpacity: 0.9,
                strokeWeight: 6,
              }}
            />

            {/* REMAINING ROUTE WITH ARROWS */}
            <Polyline
              path={remaining}
              options={{
                strokeColor: "#ef4444", // red
                strokeOpacity: 0.85,
                strokeWeight: 6,
                icons: [
                  {
                    icon: {
                      path: window.google.maps.SymbolPath
                        .FORWARD_CLOSED_ARROW,
                      scale: 3,
                      strokeColor: "#ef4444",
                    },
                    offset: "0",
                    repeat: "80px",
                  },
                ],
              }}
            />
          </>
        );
      })()}

      {/* BUS MARKERS */}
      {buses.map((bus) => (
        <Marker
          key={bus.id}
          position={{ lat: bus.lat, lng: bus.lng }}
          onClick={() => handleBusClick(bus)}
          icon={{
            path: "M4 16c0 1.1.9 2 2 2s2-.9 2-2h6c0 1.1.9 2 2 2s2-.9 2-2h1V6H3v10h1zm0-8h14v5H4V8zm12-6H6c-1.1 0-2 .9-2 2v2h14V4c0-1.1-.9-2-2-2z",
            fillColor: "#2563eb",
            fillOpacity: 1,
            scale: 1.6,
            strokeWeight: 1,
            anchor: new window.google.maps.Point(10, 20),
          }}
          label={{
            text: bus.number,
            color: "white",
            fontSize: "11px",
            fontWeight: "bold",
          }}
        />
      ))}

      {/* INFO WINDOW */}
      {selectedBus && (
        <InfoWindow
          position={{ lat: selectedBus.lat, lng: selectedBus.lng }}
          onCloseClick={() => setSelectedBus(null)}
        >
          <div className="text-sm">
            <p className="font-semibold">
              Bus: {selectedBus.number}
            </p>
            {route && (
              <p className="text-muted-foreground">
                Route: {route.routeName}
              </p>
            )}
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
}
