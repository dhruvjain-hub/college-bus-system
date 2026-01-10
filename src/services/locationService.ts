import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

export const updateLocation = async (busId: string, lat: number, lng: number) => {
  await updateDoc(doc(db, "buses", busId), {
    latitude: lat,
    longitude: lng,
    lastUpdated: new Date()
  });
};
