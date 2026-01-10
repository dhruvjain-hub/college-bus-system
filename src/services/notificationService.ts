import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase";

export async function sendNotification(title: string, message: string, target: "students" | "drivers" | "all") {
  await addDoc(collection(db, "notifications"), {
    title,
    message,
    target,
    createdAt: serverTimestamp()
  });
}
