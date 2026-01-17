// src/services/notificationService.ts
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase";

export async function sendNotification(
  title: string,
  message: string,
  targetType: "all" | "bus" | "student",
  targetId: string | null = null
) {
  await addDoc(collection(db, "notifications"), {
    title,
    message,

    // 🔥 REQUIRED FIELDS
    type: "info",           // UI depends on this
    targetType,             // student dashboard filter depends on this
    targetId,               // null allowed
    read: false,            // UI badge depends on this

    createdAt: serverTimestamp(),
  });
}
