import { useEffect, useState } from "react";
import {
  GoogleMap,
  Marker,
  Polyline,
  InfoWindow,
  useLoadScript
} from "@react-google-maps/api";

/* ===================== TYPES ===================== */

export type FleetBus = {
  id: string;
  number: string;
  lat: number;
  lng: number;
  status?: "online" | "delayed" | "breakdown" | "rescue_assigned";
};

export type FleetRoute = {
  id: string;
  routeName?: string;
  path: { lat: number; lng: number }[];
  startPoint?: { lat: number; lng: number };
  endPoint?: { lat: number; lng: number };
};

interface LiveFleetMapProps {
  buses: FleetBus[];
  route?: FleetRoute | null;
  showRoute?: boolean;
}

/* ===================== CONSTANTS ===================== */

const containerStyle = {
  width: "100%",
  height: "100%"
};

const defaultCenter = { lat: 26.9124, lng: 75.7873 };

const STATUS_COLOR: Record<string, string> = {
  online: "#22c55e",
  delayed: "#facc15",
  breakdown: "#ef4444",
  rescue_assigned: "#f97316"
};

/* ===================== HELPERS ===================== */

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
    remaining: path.slice(closestIndex)
  };
}

/* ===================== COMPONENT ===================== */

export default function LiveFleetMap({
  buses,
  route,
  showRoute = false
}: LiveFleetMapProps) {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  });

  const [selectedBus, setSelectedBus] =
    useState<FleetBus | null>(null);

  /* 🔥 AUTO-SELECT BUS (CRITICAL FIX) */
  useEffect(() => {
    if (buses.length === 1) {
      setSelectedBus(buses[0]);
    }
  }, [buses]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
        Loading Map…
      </div>
    );
  }

  const center = buses.length
    ? { lat: buses[0].lat, lng: buses[0].lng }
    : defaultCenter;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={13}
    >
      {/* ===================== ROUTE ===================== */}
      {showRoute && route && route.path?.length > 1 && selectedBus && (() => {
        const { covered, remaining } = splitRoute(
          route.path,
          selectedBus.lat,
          selectedBus.lng
        );

        return (
          <>
            <Polyline
              path={covered}
              options={{
                strokeColor: "#22c55e",
                strokeOpacity: 0.9,
                strokeWeight: 6
              }}
            />

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
                        window.google.maps.SymbolPath
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

      {/* ===================== START / END ===================== */}
      {showRoute && route?.startPoint && (
        <Marker
          position={route.startPoint}
          icon={{
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 6,
            fillColor: "#22c55e",
            fillOpacity: 1,
            strokeWeight: 0
          }}
        />
      )}

      {showRoute && route?.endPoint && (
        <Marker
          position={route.endPoint}
          icon={{
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 6,
            fillColor: "#ef4444",
            fillOpacity: 1,
            strokeWeight: 0
          }}
        />
      )}

      {/* ===================== BUS MARKERS ===================== */}
      {buses.map(bus => (
        <Marker
          key={bus.id}
          position={{ lat: bus.lat, lng: bus.lng }}
          onClick={() => setSelectedBus(bus)}
          label={{
            text: bus.number,
            color: "white",
            fontSize: "11px",
            fontWeight: "bold"
          }}
          icon={{
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor:
              STATUS_COLOR[bus.status || "online"],
            fillOpacity: 1,
            strokeColor: "white",
            strokeWeight: 2
          }}
        />
      ))}

      {/* ===================== INFO WINDOW ===================== */}
      {selectedBus && (
        <InfoWindow
          position={{
            lat: selectedBus.lat + 0.005,
            lng: selectedBus.lng
          }}
          onCloseClick={() => setSelectedBus(null)}
        >
          <div className="text-sm">
            <p className="font-semibold">
              Bus: {selectedBus.number}
            </p>
            {route?.routeName && (
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
