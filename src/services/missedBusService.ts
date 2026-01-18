import {
  doc,
  setDoc,
  getDoc,
  updateDoc
} from "firebase/firestore";
import { db } from "../firebase";

export const raiseMissedBus = async (
  studentId: string,
  lat: number,
  lng: number
) => {
  // 🔥 studentId = documentId
  const requestRef = doc(db, "missed_bus_requests", studentId);

  const existing = await getDoc(requestRef);

  // Agar already pending hai → kuch mat karo
  if (existing.exists() && existing.data().status === "pending") {
    console.log("Already raised missed bus request");
    return;
  }

  // Nahi hai → create / overwrite
  await setDoc(requestRef, {
    studentId,
    latitude: lat,
    longitude: lng,
    status: "pending",
    time: new Date()
  });
};

export const assignRescue = async (studentId: string) => {
  await updateDoc(doc(db, "missed_bus_requests", studentId), {
    status: "assigned"
  });
};
