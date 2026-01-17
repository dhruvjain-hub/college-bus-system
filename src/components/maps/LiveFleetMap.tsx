import { useEffect, useState } from "react";
import {
  GoogleMap,
  Marker,
  Polyline,
  InfoWindow,
  useLoadScript
} from "@react-google-maps/api";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";

/* ===================== TYPES ===================== */

export type FleetBus = {
  id: string;
  number: string;
  lat: number;
  lng: number;
  routeId?: string;
};

type RouteDoc = {
  routeName: string;
  path: { lat: number; lng: number }[];
};

interface LiveFleetMapProps {
  buses: FleetBus[];
  showRoute?: boolean;
}

/* ===================== CONSTANTS ===================== */

const containerStyle = {
  width: "100%",
  height: "400px"
};

const defaultCenter = { lat: 26.9124, lng: 75.7873 }; // Jaipur fallback

/* ===================== HELPERS ===================== */

/**
 * Split route into covered & remaining based on closest point
 */
function splitRoute(
  path: { lat: number; lng: number }[],
  busLat: number,
  busLng: number
) {
  let closestIndex = 0;
  let minDist = Infinity;

  path.forEach((p, i) => {
    const d = Math.abs(p.lat - busLat) + Math.abs(p.lng - busLng);
    if (d < minDist) {
      minDist = d;
      closestIndex = i;
    }
  });

  return {
    covered: path.slice(0, closestIndex + 1),
    remaining: path.slice(closestIndex)
  };
}

/* ===================== COMPONENT ===================== */

export default function LiveFleetMap({
  buses,
  showRoute = false
}: LiveFleetMapProps) {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  });

  const [selectedBus, setSelectedBus] = useState<FleetBus | null>(null);
  const [route, setRoute] = useState<RouteDoc | null>(null);

  /* ===================== LOAD ROUTE ON BUS CLICK ===================== */

  const handleBusClick = async (bus: FleetBus) => {
    setSelectedBus(bus);

    if (!showRoute || !bus.routeId) {
      setRoute(null);
      return;
    }

    try {
      const snap = await getDoc(doc(db, "routes", bus.routeId));
      if (snap.exists()) {
        setRoute(snap.data() as RouteDoc);
      } else {
        setRoute(null);
      }
    } catch (err) {
      console.error("Failed to load route:", err);
      setRoute(null);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-[400px] text-sm text-muted-foreground">
        Loading Map...
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={
        buses.length
          ? { lat: buses[0].lat, lng: buses[0].lng }
          : defaultCenter
      }
      zoom={13}
    >
      {/* ===================== ROUTE DRAWING ===================== */}
      {showRoute && route && selectedBus && route.path?.length > 1 && (() => {
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
                strokeColor: "#22c55e",
                strokeOpacity: 0.9,
                strokeWeight: 6
              }}
            />

            {/* REMAINING ROUTE + DIRECTION ARROWS */}
            <Polyline
              path={remaining}
              options={{
                strokeColor: "#ef4444",
                strokeOpacity: 0.85,
                strokeWeight: 6,
                icons: [
                  {
                    icon: {
                      path:
                        window.google?.maps.SymbolPath
                          .FORWARD_CLOSED_ARROW,
                      scale: 3,
                      strokeColor: "#ef4444"
                    },
                    offset: "0",
                    repeat: "80px"
                  }
                ]
              }}
            />
          </>
        );
      })()}

      {/* ===================== BUS MARKERS ===================== */}
      {buses.map(bus => (
        <Marker
          key={bus.id}
          position={{ lat: bus.lat, lng: bus.lng }}
          onClick={() => handleBusClick(bus)}
          label={{
            text: bus.number,
            color: "white",
            fontSize: "11px",
            fontWeight: "bold"
          }}
          icon={{
            path:
              "M4 16c0 1.1.9 2 2 2s2-.9 2-2h6c0 1.1.9 2 2 2s2-.9 2-2h1V6H3v10h1zm0-8h14v5H4V8zm12-6H6c-1.1 0-2 .9-2 2v2h14V4c0-1.1-.9-2-2-2z",
            fillColor: "#2563eb",
            fillOpacity: 1,
            scale: 1.6,
            strokeWeight: 1,
            anchor: window.google
              ? new window.google.maps.Point(10, 20)
              : undefined
          }}
        />
      ))}

      {/* ===================== INFO WINDOW ===================== */}
      {selectedBus && (
        <InfoWindow
          position={{
            lat: selectedBus.lat,
            lng: selectedBus.lng
          }}
          onCloseClick={() => {
            setSelectedBus(null);
            setRoute(null);
          }}
        >
          <div className="text-sm">
            <p className="font-semibold">Bus: {selectedBus.number}</p>
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
