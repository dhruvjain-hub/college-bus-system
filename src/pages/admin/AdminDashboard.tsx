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
  Bus, Users, AlertTriangle, CheckCircle, Clock, MapPin, ArrowRight, Send
} from "lucide-react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { db } from "@/firebase";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select";

export default function AdminDashboard() {
  const [selectedBus, setSelectedBus] = useState<string | null>(null);
  const [buses, setBuses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [missedRequests, setMissedRequests] = useState<any[]>([]);

  const [notifOpen, setNotifOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [targetType, setTargetType] = useState<"all" | "bus" | "student">("all");
  const [targetId, setTargetId] = useState("");

  const sendCustomNotification = async () => {
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

  const assignRescue = async (requestId: string) => {
    if (!selectedBus) return alert("Select a bus first");

    await updateDoc(doc(db, "missed_bus_requests", requestId), {
      status: "assigned",
      assignedBusId: selectedBus,
      assignedAt: serverTimestamp()
    });

    alert("Rescue Assigned Successfully");
  };

  useEffect(() => {
    const u1 = onSnapshot(collection(db, "buses"), s =>
      setBuses(s.docs.map(d => ({ id: d.id, ...d.data() })))
    );
    const u2 = onSnapshot(query(collection(db, "users"), where("role", "==", "student")),
      s => setStudents(s.docs.map(d => ({ id: d.id, ...d.data() })))
    );
    const u3 = onSnapshot(collection(db, "missed_bus_requests"),
      s => setMissedRequests(s.docs.map(d => ({ id: d.id, ...d.data() })))
    );

    return () => { u1(); u2(); u3(); };
  }, []);

  const activeBuses = buses.filter(b => b.status === "online");
  const delayedBuses = buses.filter(b => b.status === "delayed");
  const pendingRequests = missedRequests.filter(r => r.status === "pending");

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Transport Dashboard</h1>
            <p className="text-muted-foreground">Live overview of transport system</p>
          </div>

          <Dialog open={notifOpen} onOpenChange={setNotifOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Send className="w-4 h-4" /> Send Notification
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Send Notification</DialogTitle>
              </DialogHeader>

              <Label>Title</Label>
              <Input value={title} onChange={e => setTitle(e.target.value)} />

              <Label>Message</Label>
              <Input value={message} onChange={e => setMessage(e.target.value)} />

              <Label>Target</Label>
              <Select onValueChange={(v: any) => setTargetType(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Target" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Students</SelectItem>
                  <SelectItem value="bus">Specific Bus</SelectItem>
                  <SelectItem value="student">Single Student</SelectItem>
                </SelectContent>
              </Select>

              {targetType !== "all" && (
                <>
                  <Label>Target ID</Label>
                  <Input placeholder="Enter Bus ID or Student ID" onChange={e => setTargetId(e.target.value)} />
                </>
              )}

              <Button onClick={sendCustomNotification}>Send</Button>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard title="Total Buses" value={buses.length} icon={<Bus />} />
          <StatCard title="Active" value={activeBuses.length} icon={<CheckCircle />} variant="success" />
          <StatCard title="Delayed" value={delayedBuses.length} icon={<Clock />} variant="warning" />
          <StatCard title="Students" value={students.length} icon={<Users />} />
          <StatCard title="Pending Requests" value={pendingRequests.length} icon={<AlertTriangle />} variant="danger" />
        </div>

        {/* Map & Requests */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-card p-4 rounded-xl">
            <LiveFleetMap buses={buses.map(b => ({
              id: b.id,
              number: b.number,
              lat: b.latitude,
              lng: b.longitude
            }))} />
          </div>

          <div className="bg-card p-5 rounded-xl">
            <h2 className="font-bold mb-3">Missed Bus Requests</h2>
            {pendingRequests.map(r => (
              <div key={r.id} className="border p-3 mb-2 rounded-lg">
                <p>Student: {r.studentId}</p>
                <p className="text-xs text-muted-foreground">
                  {r.createdAt && formatDistanceToNow(r.createdAt.toDate(), { addSuffix: true })}
                </p>
                <div className="flex justify-between mt-2">
                  <StatusBadge status={r.status} size="sm" />
                  <Button size="sm" onClick={() => assignRescue(r.id)}>Assign Rescue</Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bus Fleet */}
        <div>
          <h2 className="font-bold mb-3">Bus Fleet</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {buses.map(bus => (
              <BusCard
                key={bus.id}
                bus={bus}
                showActions
                onViewDetails={() => setSelectedBus(bus.id)}
                className={selectedBus === bus.id ? "ring-2 ring-primary" : ""}
              />
            ))}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
