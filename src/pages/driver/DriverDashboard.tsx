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

export default function DriverDashboard() {
  const { user } = useAuth();
  const driver = user as Driver;
  const { toast } = useToast();
  
  const [tripActive, setTripActive] = useState(false);
  const [busStatus, setBusStatus] = useState<'online' | 'delayed' | 'breakdown'>('online');
  
  const assignedBus = mockBuses.find(b => b.id === driver?.busId);
  const route = mockRoutes.find(r => r.id === assignedBus?.routeId);
  const assignedStudents = mockStudents.filter(s => s.busId === driver?.busId);

  const handleStartTrip = () => {
    setTripActive(true);
    toast({
      title: 'Trip Started',
      description: 'GPS tracking is now active. Drive safely!',
    });
  };

  const handleEndTrip = () => {
    setTripActive(false);
    toast({
      title: 'Trip Ended',
      description: 'GPS tracking stopped. Trip data saved.',
    });
  };

  const handleStatusChange = (status: 'online' | 'delayed' | 'breakdown') => {
    setBusStatus(status);
    toast({
      title: 'Status Updated',
      description: `Bus status changed to ${status}`,
    });
  };

  const handlePanic = () => {
    toast({
      title: 'Emergency Alert Sent!',
      description: 'Admin and emergency contacts have been notified.',
      variant: 'destructive',
    });
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
            <AlertTriangle className="w-5 h-5" />
            Panic Button
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
                  <Play className="w-5 h-5" />
                  Start Trip
                </Button>
              ) : (
                <Button variant="danger" size="lg" onClick={handleEndTrip}>
                  <Square className="w-5 h-5" />
                  End Trip
                </Button>
              )}
            </div>
          </div>

          {tripActive && (
            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground mb-3">Update Bus Status:</p>
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant={busStatus === 'online' ? 'success' : 'outline'} 
                  size="sm"
                  onClick={() => handleStatusChange('online')}
                >
                  <CheckCircle className="w-4 h-4" />
                  On Time
                </Button>
                <Button 
                  variant={busStatus === 'delayed' ? 'warning' : 'outline'} 
                  size="sm"
                  onClick={() => handleStatusChange('delayed')}
                >
                  <Clock className="w-4 h-4" />
                  Delayed
                </Button>
                <Button 
                  variant={busStatus === 'breakdown' ? 'danger' : 'outline'} 
                  size="sm"
                  onClick={() => handleStatusChange('breakdown')}
                >
                  <AlertTriangle className="w-4 h-4" />
                  Breakdown
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Students Assigned"
            value={assignedStudents.length}
            icon={<Users className="w-6 h-6" />}
            variant="primary"
          />
          <StatCard
            title="Total Stops"
            value={route?.stops.length || 0}
            icon={<MapPin className="w-6 h-6" />}
          />
          <StatCard
            title="Trip Duration"
            value={tripActive ? '45 min' : '--'}
            icon={<Clock className="w-6 h-6" />}
          />
          <StatCard
            title="GPS Updates"
            value={tripActive ? 'Active' : 'Stopped'}
            icon={<Navigation className="w-6 h-6" />}
            variant={tripActive ? 'success' : 'default'}
          />
        </div>

        {/* Map & Students */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-card rounded-xl shadow-soft p-4">
            <h2 className="font-display font-bold text-lg mb-4">Route Map</h2>
            <MapPlaceholder 
              buses={assignedBus ? [{
                id: assignedBus.id,
                number: assignedBus.number,
                status: busStatus,
                lat: 12.9716,
                lng: 77.5946,
              }] : []}
              showRoute
              height="h-[350px]"
            />
          </div>

          {/* Student List */}
          <div className="bg-card rounded-xl shadow-soft p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-lg">Today's Passengers</h2>
              <span className="text-sm text-muted-foreground">{assignedStudents.length} students</span>
            </div>
            <div className="space-y-3 max-h-[350px] overflow-y-auto">
              {assignedStudents.map(student => {
                const studentStop = route?.stops.find(s => s.id === student.stopId);
                return (
                  <div key={student.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                      {student.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{student.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {studentStop?.name} • {studentStop?.arrivalTime}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon-sm">
                      <CheckCircle className="w-4 h-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button variant="outline" size="lg" className="h-auto py-4 flex-col gap-2">
            <Users className="w-6 h-6" />
            <span>Mark Attendance</span>
          </Button>
          <Button variant="outline" size="lg" className="h-auto py-4 flex-col gap-2">
            <AlertTriangle className="w-6 h-6" />
            <span>Report Issue</span>
          </Button>
          <Button variant="outline" size="lg" className="h-auto py-4 flex-col gap-2">
            <Send className="w-6 h-6" />
            <span>Send Alert</span>
          </Button>
          <Button variant="outline" size="lg" className="h-auto py-4 flex-col gap-2">
            <Clock className="w-6 h-6" />
            <span>Delay Notice</span>
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
