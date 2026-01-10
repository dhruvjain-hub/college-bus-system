import { addDoc, collection } from "firebase/firestore";
import { db } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";


export const raiseMissedBus = async (studentId: string, lat: number, lng: number) => {
  await addDoc(collection(db, "missed_bus_requests"), {
    studentId,
    latitude: lat,
    longitude: lng,
    status: "pending",
    time: new Date()
  });
};

const assignRescue = async (id: string) => {
  await updateDoc(doc(db, "missed_bus_requests", id), {
    status: "assigned"
  });
};

