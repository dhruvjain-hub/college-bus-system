import { useState, useEffect } from "react";
import {
  collection,
  onSnapshot,
  query,
  where,
  doc,
  updateDoc,
  serverTimestamp,
  addDoc
} from "firebase/firestore";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/shared/StatCard";
import { BusCard } from "@/components/shared/BusCard";
import LiveFleetMap from "@/components/maps/LiveFleetMap";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Bus,
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  Send
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { db } from "@/firebase";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select";
import { writeBatch } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  /* ===================== AUTO MESSAGE TEMPLATES ===================== */
  const notificationTemplates: Record<string, string> = {
    "Bus Delay Alert":
      "Your bus is delayed due to traffic or technical issues. Please wait for further updates.",
    "Route Change":
      "The bus route has been changed today due to unavoidable reasons. Please check the updated route.",
    "Emergency Update":
      "This is an emergency notification. Please follow the instructions provided by the transport authority.",
    "Missed Bus Information":
      "You have missed your scheduled bus. Please contact the transport office for assistance.",
    "General Announcement":
      "This is a general announcement regarding transport services."
  };

  /* ===================== STATES ===================== */
  const [buses, setBuses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [missedRequests, setMissedRequests] = useState<any[]>([]);

  // Notification
  const [notifOpen, setNotifOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [targetType, setTargetType] =
    useState<"all" | "bus" | "student">("all");
  const [targetId, setTargetId] = useState("");
  const navigate = useNavigate();

  // Rescue Assignment
  const [activeRequest, setActiveRequest] = useState<any | null>(null);
  const [rescueBusId, setRescueBusId] = useState("");

  const [routes, setRoutes] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);


  /* ===================== SEND NOTIFICATION ===================== */
  const sendCustomNotification = async () => {
    if (!title || !message) {
      alert("Please select notification type and enter message");
      return;
    }

    await addDoc(collection(db, "notifications"), {
      title,
      message,
      targetType,
      targetId: targetType === "all" ? null : targetId,
      createdAt: serverTimestamp()
    });

    setNotifOpen(false);
    setTitle("");
    setMessage("");
    setTargetId("");
  };

  /* ===================== CONFIRM RESCUE ASSIGNMENT ===================== */
  const confirmRescueAssignment = async () => {
    if (!activeRequest || !rescueBusId) return;

    try {
      const batch = writeBatch(db);

      const requestRef = doc(db, "missed_bus_requests", activeRequest.id);
      const busRef = doc(db, "buses", rescueBusId);

      // 1️⃣ Update request
      batch.update(requestRef, {
        status: "assigned",
        assignedBusId: rescueBusId,
        assignedAt: serverTimestamp()
      });

      // 2️⃣ Update bus
      batch.update(busRef, {
        status: "rescue_assigned"
      });

      await batch.commit();

      setActiveRequest(null);
      setRescueBusId("");

      alert("Rescue bus assigned successfully");
    } catch (error) {
      console.error(error);
      alert("Failed to assign rescue");
    }
  };

  /* ===================== FIREBASE LISTENERS ===================== */
  useEffect(() => {
    const u1 = onSnapshot(collection(db, "buses"), s =>
      setBuses(s.docs.map(d => ({ id: d.id, ...d.data() })))
    );

    const u2 = onSnapshot(
      query(collection(db, "users"), where("role", "==", "student")),
      s => setStudents(s.docs.map(d => ({ id: d.id, ...d.data() })))
    );

    const u3 = onSnapshot(
      collection(db, "missed_bus_requests"),
      s => setMissedRequests(s.docs.map(d => ({ id: d.id, ...d.data() })))
    );

    const u4 = onSnapshot(collection(db, "routes"), snap =>
      setRoutes(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );

    const u5 = onSnapshot(
      query(collection(db, "users"), where("role", "==", "driver")),
      snap => setDrivers(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );


    return () => {
      u1();
      u2();
      u3();
      u4();
      u5();
    };
  }, []);

  /* ===================== DERIVED DATA ===================== */
  const activeBuses = buses.filter(b => b.status === "online");
  const delayedBuses = buses.filter(b => b.status === "delayed");
  const pendingRequests = missedRequests.filter(r => r.status === "pending");

  const rescueBuses = buses.filter(b => b.status === "online");

  const getRouteName = (routeId?: string) =>
    routes.find(r => r.id === routeId)?.routeName || "No route";

  const getDriverName = (driverId?: string) =>
    drivers.find(d => d.id === driverId)?.name || "No driver";

  const getStudentName = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    return student ? student.name : "Unknown Student";
  };


  /* ===================== UI ===================== */
  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Transport Dashboard</h1>
            <p className="text-muted-foreground">
              Live overview of transport system
            </p>
          </div>

          {/* SEND NOTIFICATION */}
          <Dialog open={notifOpen} onOpenChange={setNotifOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Send className="w-4 h-4 mr-2" />
                Send Notification
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Send Notification</DialogTitle>
              </DialogHeader>

              <Label>Notification Type</Label>
              <Select
                onValueChange={value => {
                  setTitle(value);
                  setMessage(notificationTemplates[value] || "");
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Notification Type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(notificationTemplates).map(t => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Label>Message</Label>
              <textarea
                className="w-full rounded-md border px-3 py-2 text-sm"
                rows={3}
                value={message}
                onChange={e => setMessage(e.target.value)}
              />

              <Label>Target</Label>
              <Select onValueChange={(v: any) => setTargetType(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Target" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Students</SelectItem>
                  <SelectItem value="student">Single Student</SelectItem>
                </SelectContent>
              </Select>

              {targetType === "student" && (
                <>
                  <Label>Select Student</Label>
                  <Select onValueChange={setTargetId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Student" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map(s => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name} ({s.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </>
              )}

              <Button onClick={sendCustomNotification}>Send</Button>
            </DialogContent>
          </Dialog>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard title="Total Buses" value={buses.length} icon={<Bus />} />
          <StatCard title="Active" value={activeBuses.length} icon={<CheckCircle />} variant="success" />
          <StatCard title="Delayed" value={delayedBuses.length} icon={<Clock />} variant="warning" />
          <StatCard title="Students" value={students.length} icon={<Users />} />
          <StatCard title="Pending Requests" value={pendingRequests.length} icon={<AlertTriangle />} variant="danger" />
        </div>

        {/* MAP & REQUESTS */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-card p-4 rounded-xl">
            <LiveFleetMap
              buses={buses.map(b => ({
                id: b.id,
                number: b.number,
                lat: b.latitude,
                lng: b.longitude,
                routeId: b.routeId
              }))}
            />
          </div>

          <div className="bg-card p-5 rounded-xl">
            <h2 className="font-bold mb-3">Missed Bus Requests</h2>

            {pendingRequests.map(r => (
              <div key={r.id} className="border p-3 mb-2 rounded-lg">
                <p className="font-medium">
                  Student: {getStudentName(r.studentId)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {students.find(s => s.id === r.studentId)?.email}
                </p>
                <p className="text-xs text-muted-foreground">
                  {r.createdAt &&
                    formatDistanceToNow(r.createdAt.toDate(), {
                      addSuffix: true
                    })}
                </p>

                <div className="flex justify-between mt-2">
                  <StatusBadge status={r.status} size="sm" />
                  <Button size="sm" onClick={() => setActiveRequest(r)}>
                    Assign Rescue
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* BUS FLEET */}
        <div>
          <h2 className="font-bold mb-3">Bus Fleet</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {buses.map(bus => (
              <BusCard
                key={bus.id}
                bus={bus}
                routeName={getRouteName(bus.routeId)}
                driverName={getDriverName(bus.driverId)}
                showActions
              />
            ))}


          </div>
        </div>

        {/* RESCUE ASSIGNMENT DIALOG */}
        {activeRequest && (
          <Dialog open onOpenChange={() => setActiveRequest(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Assign Rescue Bus</DialogTitle>
              </DialogHeader>

              <p className="text-sm text-muted-foreground">
                Student ID: {activeRequest.studentId}
              </p>

              <Label>Select Rescue Bus</Label>
              <Select onValueChange={setRescueBusId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a bus" />
                </SelectTrigger>
                <SelectContent>
                  {rescueBuses.length === 0 ? (
                    <SelectItem disabled value="none">
                      No buses available for rescue
                    </SelectItem>
                  ) : (
                    rescueBuses.map(bus => (
                      <SelectItem key={bus.id} value={bus.id}>
                        {bus.number || "Unnamed Bus"}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>

              </Select>

              <Button
                disabled={!rescueBusId}
                onClick={confirmRescueAssignment}
              >
                Confirm Assignment
              </Button>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </DashboardLayout>
  );
}
