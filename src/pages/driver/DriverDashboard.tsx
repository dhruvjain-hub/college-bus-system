import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/shared/StatCard';
import { MapPlaceholder } from '@/components/shared/MapPlaceholder';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { mockBuses, mockStudents, mockRoutes } from '@/lib/mock-data';
import { useAuth } from '@/contexts/AuthContext';
import { Driver } from '@/lib/types';
import { 
  Bus, Users, Navigation, Play, Square, AlertTriangle, 
  CheckCircle, Clock, MapPin, Send
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { collection, addDoc, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/firebase';

export default function DriverDashboard() {
  const { user } = useAuth();
  const driver = user as Driver;
  const { toast } = useToast();

  const [tripActive, setTripActive] = useState(false);
  const [busStatus, setBusStatus] = useState<'online' | 'delayed' | 'breakdown'>('online');

  const assignedBus = mockBuses.find(b => b.id === driver?.busId);
  const route = mockRoutes.find(r => r.id === assignedBus?.routeId);
  const assignedStudents = mockStudents.filter(s => s.busId === driver?.busId);

  const handleStartTrip = async () => {
    setTripActive(true);
    if (assignedBus) {
      await updateDoc(doc(db, 'buses', assignedBus.id), { status: 'online' });
    }
    toast({ title: 'Trip Started', description: 'GPS tracking is now active.' });
  };

  const handleEndTrip = async () => {
    setTripActive(false);
    if (assignedBus) {
      await updateDoc(doc(db, 'buses', assignedBus.id), { status: 'offline' });
    }
    toast({ title: 'Trip Ended', description: 'Trip data saved.' });
  };

  const handleStatusChange = async (status: 'online' | 'delayed' | 'breakdown') => {
    setBusStatus(status);
    if (assignedBus) {
      await updateDoc(doc(db, 'buses', assignedBus.id), { status });
    }
    toast({ title: 'Status Updated', description: `Bus status changed to ${status}` });
  };

  const handlePanic = async () => {
    await addDoc(collection(db, 'notifications'), {
      title: 'Emergency Alert',
      message: `Driver ${driver.name} pressed panic button`,
      target: 'admin',
      createdAt: serverTimestamp()
    });

    toast({
      title: 'Emergency Alert Sent!',
      description: 'Admin has been notified.',
      variant: 'destructive',
    });
  };

  const reportBreakdown = async () => {
    if (!assignedBus) return;
    await addDoc(collection(db, 'breakdown_reports'), {
      busId: assignedBus.id,
      driverId: driver.id,
      issue: 'Bus breakdown reported',
      status: 'pending',
      createdAt: serverTimestamp()
    });
    toast({ title: 'Issue Reported', description: 'Admin has been notified.' });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold">
              Driver Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              {route?.name || 'No route assigned'} • {assignedBus?.number}
            </p>
          </div>
          <Button variant="panic" size="lg" onClick={handlePanic}>
            <AlertTriangle className="w-5 h-5" /> Panic Button
          </Button>
        </div>

        {/* Trip Control */}
        <div className="bg-card rounded-xl shadow-soft p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                tripActive ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
              }`}>
                <Bus className="w-8 h-8" />
              </div>
              <div>
                <h2 className="font-display font-bold text-xl">Trip Control</h2>
                <div className="flex items-center gap-2 mt-1">
                  <StatusBadge status={tripActive ? 'online' : 'offline'} showPulse />
                  <span className="text-muted-foreground">
                    {tripActive ? 'Trip in progress' : 'Ready to start'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              {!tripActive ? (
                <Button variant="success" size="lg" onClick={handleStartTrip}>
                  <Play className="w-5 h-5" /> Start Trip
                </Button>
              ) : (
                <Button variant="danger" size="lg" onClick={handleEndTrip}>
                  <Square className="w-5 h-5" /> End Trip
                </Button>
              )}
            </div>
          </div>

          {tripActive && (
            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground mb-3">Update Bus Status:</p>
              <div className="flex flex-wrap gap-2">
                <Button variant={busStatus === 'online' ? 'success' : 'outline'} size="sm" onClick={() => handleStatusChange('online')}>
                  <CheckCircle className="w-4 h-4" /> On Time
                </Button>
                <Button variant={busStatus === 'delayed' ? 'warning' : 'outline'} size="sm" onClick={() => handleStatusChange('delayed')}>
                  <Clock className="w-4 h-4" /> Delayed
                </Button>
                <Button variant={busStatus === 'breakdown' ? 'danger' : 'outline'} size="sm" onClick={() => handleStatusChange('breakdown')}>
                  <AlertTriangle className="w-4 h-4" /> Breakdown
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Students Assigned" value={assignedStudents.length} icon={<Users />} variant="primary" />
          <StatCard title="Total Stops" value={route?.stops.length || 0} icon={<MapPin />} />
          <StatCard title="Trip Duration" value={tripActive ? '45 min' : '--'} icon={<Clock />} />
          <StatCard title="GPS Updates" value={tripActive ? 'Active' : 'Stopped'} icon={<Navigation />} variant={tripActive ? 'success' : 'default'} />
        </div>

        {/* Map */}
        <div className="bg-card rounded-xl shadow-soft p-4">
          <MapPlaceholder
            buses={assignedBus ? [{
              id: assignedBus.id,
              number: assignedBus.number,
              status: busStatus,
              lat: 12.9716,
              lng: 77.5946
            }] : []}
            showRoute
            height="h-[350px]"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button variant="outline" size="lg" className="h-auto py-4 flex-col gap-2">
            <Users className="w-6 h-6" /> <span>Mark Attendance</span>
          </Button>
          <Button variant="outline" size="lg" className="h-auto py-4 flex-col gap-2" onClick={reportBreakdown}>
            <AlertTriangle className="w-6 h-6" /> <span>Report Issue</span>
          </Button>
          <Button variant="outline" size="lg" className="h-auto py-4 flex-col gap-2">
            <Send className="w-6 h-6" /> <span>Send Alert</span>
          </Button>
          <Button variant="outline" size="lg" className="h-auto py-4 flex-col gap-2">
            <Clock className="w-6 h-6" /> <span>Delay Notice</span>
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
