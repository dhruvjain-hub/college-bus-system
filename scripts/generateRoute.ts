import fetch from "node-fetch";
import polyline from "@mapbox/polyline";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, updateDoc } from "firebase/firestore";

/* ================= TYPES ================= */

interface DirectionsResponse {
  routes: {
    overview_polyline: {
      points: string;
    };
  }[];
}

type LatLng = {
  lat: number;
  lng: number;
};

/* ================= FIREBASE ================= */

const firebaseConfig = {
  apiKey: "AIzaSyAtSJWHsEWjqqkjzlIfwqZ68BBELhpBKlI",
  authDomain: "college-bus-tracker-770bb.firebaseapp.com",
  projectId: "college-bus-tracker-770bb",
  storageBucket: "college-bus-tracker-770bb.appspot.com",
  messagingSenderId: "47573011226",
  appId: "1:47573011226:web:2bb61a1bf6855f98adfaa3",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* ================= CONFIG ================= */

// 🔐 Prefer ENV, fallback for now
const GOOGLE_API_KEY =
  process.env.GOOGLE_MAPS_API_KEY ||
  "AIzaSyDZKNtnEvY-Y-BEIvUEL55r5WcH8KrLabw";

// Firestore route document ID
const ROUTE_ID = "s3x5626krZprMjXKhZc5";

// Route points
const ORIGIN = "26.7657,75.8536";
const DESTINATION = "26.8793929,75.7881609";

// Optional stops
const WAYPOINTS = [
  "26.78,75.84",
  "26.80,75.82",
].join("|");

/* ================= SCRIPT ================= */

async function generateRoute() {
  console.log("🚀 Generating route from Google Directions API...");

  const url =
    `https://maps.googleapis.com/maps/api/directions/json` +
    `?origin=${ORIGIN}` +
    `&destination=${DESTINATION}` +
    `&waypoints=${WAYPOINTS}` +
    `&key=${GOOGLE_API_KEY}`;

  const res = await fetch(url);
  const data = (await res.json()) as DirectionsResponse;

  if (!data.routes || data.routes.length === 0) {
  console.error("Google Directions full response:", data);
  throw new Error("❌ No routes returned from Google");
}


  if (!data.routes || data.routes.length === 0) {
    throw new Error("❌ No routes returned from Google");
  }

  // 🔥 Decode overview polyline
  const encoded = data.routes[0].overview_polyline.points;

  const decodedPath: LatLng[] = polyline
    .decode(encoded)
    .map(([lat, lng]: [number, number]) => ({
      lat,
      lng,
    }));

  console.log("📍 Total route points:", decodedPath.length);

  // 🔥 Save to Firestore
  const routeRef = doc(db, "routes", ROUTE_ID);

  await updateDoc(routeRef, {
    path: decodedPath,
    startPoint: decodedPath[0],
    endPoint: decodedPath[decodedPath.length - 1],
    updatedAt: new Date(),
  });

  console.log("✅ Route successfully saved to Firestore!");
}

generateRoute().catch(err => {
  console.error("🔥 Route generation failed:", err);
  process.exit(1);
});

