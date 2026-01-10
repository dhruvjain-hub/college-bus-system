import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";

type Bus = {
  id: string;
  number: string;
  lat: number;
  lng: number;
};

const containerStyle = {
  width: "100%",
  height: "400px",
};

export default function LiveFleetMap({ buses }: { buses: Bus[] }) {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY!,
  });

  if (!isLoaded) return <div>Loading Map...</div>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={{ lat: 26.9124, lng: 75.7873 }}
      zoom={12}
    >
      {buses.map(bus => (
        <Marker
          key={bus.id}
          position={{ lat: bus.lat, lng: bus.lng }}
          icon={{
            path: "M4 16c0 1.1.9 2 2 2s2-.9 2-2h6c0 1.1.9 2 2 2s2-.9 2-2h1V6H3v10h1zm0-8h14v5H4V8zm12-6H6c-1.1 0-2 .9-2 2v2h14V4c0-1.1-.9-2-2-2z",
            fillColor: "#2563eb",
            fillOpacity: 1,
            scale: 1.5,
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
    </GoogleMap>
  );
}
