import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/shared/StatCard';
import { MapPlaceholder } from '@/components/shared/MapPlaceholder';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { useAuth } from '@/contexts/AuthContext';
import { Driver } from '@/lib/types';
import { useDriverTrip } from '@/hooks/useDriverTrip';
import { useLiveLocation } from '@/hooks/useLiveLocation';
import { useDriverNotifications } from '@/hooks/useDriverNotifications';
import { breakdownService } from '@/services/breakdownService';
import { busService } from '@/services/busService';
import { notificationService } from '@/services/notificationService';
import { useState } from 'react';
import {
  Bus,
  Users,
  Navigation,
  Play,
  Square,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Send,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function DriverDashboard() {
  const { user } = useAuth();
  const driver = user as Driver;
  const { toast } = useToast();

  const busId = driver.busId;

  /* ---------------- TRIP LIFECYCLE ---------------- */
  const { startTrip, endTrip, tripActive, loading } = useDriverTrip(busId);

  /* ---------------- LIVE GPS ---------------- */
  useLiveLocation(busId, tripActive);

  /* ---------------- NOTIFICATIONS ---------------- */
  const notifications = useDriverNotifications(driver.id);

  /* ---------------- UI STATE ---------------- */
  const [busStatus, setBusStatus] =
    useState<'online' | 'delayed' | 'breakdown'>('online');

  /* ---------------- SAFE FALLBACK DATA ---------------- */
  const assignedBus = busId
    ? { id: busId, number: 'Assigned Bus' }
    : null;

  const route = null;
  const assignedStudents: any[] = [];

  /* ---------------- HANDLERS ---------------- */

  const handleStartTrip = async () => {
    try {
      await startTrip();
      toast({
        title: 'Trip Started',
        description: 'Live GPS tracking is now active.',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Unable to start trip.',
        variant: 'destructive',
      });
    }
  };

  const handleEndTrip = async () => {
    try {
      await endTrip();
      toast({
        title: 'Trip Ended',
        description: 'Trip data saved successfully.',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Unable to end trip.',
        variant: 'destructive',
      });
    }
  };

  const handleStatusChange = async (
    status: 'online' | 'delayed' | 'breakdown'
  ) => {
    try {
      setBusStatus(status);
      if (busId) {
        await busService.updateStatus(busId, status);
      }
      toast({
        title: 'Status Updated',
        description: `Bus status changed to ${status}`,
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to update bus status',
        variant: 'destructive',
      });
    }
  };

  const handlePanic = async () => {
    try {
      await notificationService.sendEmergencyAlert(
        driver.id,
        `Driver ${driver.name} pressed panic button`
      );

      toast({
        title: 'Emergency Alert Sent!',
        description: 'Admin has been notified.',
        variant: 'destructive',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to send emergency alert',
        variant: 'destructive',
      });
    }
  };

  const reportBreakdown = async () => {
    try {
      await breakdownService.reportBreakdown(
        busId,
        driver.id,
        'Reported from driver dashboard'
      );
      toast({
        title: 'Issue Reported',
        description: 'Admin has been notified.',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to report issue.',
        variant: 'destructive',
      });
    }
  };

  /* ---------------- UI ---------------- */

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
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center ${tripActive
                    ? 'bg-success/10 text-success'
                    : 'bg-muted text-muted-foreground'
                  }`}
              >
                <Bus className="w-8 h-8" />
              </div>
              <div>
                <h2 className="font-display font-bold text-xl">
                  Trip Control
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <StatusBadge
                    status={tripActive ? 'online' : 'offline'}
                    showPulse
                  />
                  <span className="text-muted-foreground">
                    {tripActive ? 'Trip in progress' : 'Ready to start'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              {!tripActive ? (
                <Button
                  variant="success"
                  size="lg"
                  onClick={handleStartTrip}
                  disabled={loading}
                >
                  <Play className="w-5 h-5" /> Start Trip
                </Button>
              ) : (
                <Button
                  variant="danger"
                  size="lg"
                  onClick={handleEndTrip}
                  disabled={loading}
                >
                  <Square className="w-5 h-5" /> End Trip
                </Button>
              )}
            </div>
          </div>

          {tripActive && (
            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground mb-3">
                Update Bus Status:
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={busStatus === 'online' ? 'success' : 'outline'}
                  size="sm"
                  onClick={() => handleStatusChange('online')}
                >
                  <CheckCircle className="w-4 h-4" /> On Time
                </Button>
                <Button
                  variant={busStatus === 'delayed' ? 'warning' : 'outline'}
                  size="sm"
                  onClick={() => handleStatusChange('delayed')}
                >
                  <Clock className="w-4 h-4" /> Delayed
                </Button>
                <Button
                  variant={busStatus === 'breakdown' ? 'danger' : 'outline'}
                  size="sm"
                  onClick={() => handleStatusChange('breakdown')}
                >
                  <AlertTriangle className="w-4 h-4" /> Breakdown
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
            icon={<Users />}
            variant="primary"
          />
          <StatCard
            title="Total Stops"
            value={route?.stops?.length || 0}
            icon={<MapPin />}
          />
          <StatCard
            title="Trip Duration"
            value={tripActive ? '45 min' : '--'}
            icon={<Clock />}
          />
          <StatCard
            title="GPS Updates"
            value={tripActive ? 'Active' : 'Stopped'}
            icon={<Navigation />}
            variant={tripActive ? 'success' : 'default'}
          />
        </div>

        {/* Map */}
        <div className="bg-card rounded-xl shadow-soft p-4">
          <MapPlaceholder
            buses={
              tripActive && assignedBus
                ? [
                  {
                    id: assignedBus.id,
                    number: assignedBus.number,
                    status: busStatus,
                    lat: 0,   // fallback latitude
                    lng: 0,   // fallback longitude
                  },
                ]
                : []
            }
            showRoute
            height="h-[350px]"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button
            variant="outline"
            size="lg"
            className="h-auto py-4 flex-col gap-2"
          >
            <Users className="w-6 h-6" />
            <span>Mark Attendance</span>
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="h-auto py-4 flex-col gap-2"
            onClick={reportBreakdown}
          >
            <AlertTriangle className="w-6 h-6" />
            <span>Report Issue</span>
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="h-auto py-4 flex-col gap-2"
          >
            <Send className="w-6 h-6" />
            <span>Send Alert</span>
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="h-auto py-4 flex-col gap-2"
          >
            <Clock className="w-6 h-6" />
            <span>Delay Notice</span>
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
