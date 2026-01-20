import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "@/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { NotificationCard } from "@/components/shared/NotificationCard";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

/* ===================== TYPES ===================== */

type StudentUser = {
  id: string;
  busId?: string;
};

type NotificationDoc = {
  id: string;
  title: string;
  message: string;
  targetType: "all" | "student" | "bus";
  targetId?: string;
  createdAt?: any;
};

/* ===================== COMPONENT ===================== */

export default function StudentNotifications() {
  const { user } = useAuth();
  const student = user as StudentUser | null;

  const [notifications, setNotifications] = useState<NotificationDoc[]>([]);

  useEffect(() => {
    if (!student) return;

    const q = query(
      collection(db, "notifications"),
      orderBy("createdAt", "desc") // 🔥 FIX
    );

    const unsub = onSnapshot(q, snap => {
      const data = snap.docs
        .map(d => ({
          id: d.id,
          ...(d.data() as any),
        }))
        .filter(
          n =>
            n.targetType === "all" ||
            (n.targetType === "student" && n.targetId === student.id) ||
            (n.targetType === "bus" && n.targetId === student.busId)
        );

      setNotifications(data); // 🔥 NO reverse
    });

    return () => unsub();
  }, [student?.id, student?.busId]);

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Notifications</h1>

        {notifications.length === 0 ? (
          <p className="text-muted-foreground">No notifications</p>
        ) : (
          <div className="space-y-3">
            {notifications.map(notification => (
              <NotificationCard
                key={notification.id}
                notification={notification}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
