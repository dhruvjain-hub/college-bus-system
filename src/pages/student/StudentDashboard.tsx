import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/shared/StatCard';
import { BusCard } from '@/components/shared/BusCard';
import { NotificationCard } from '@/components/shared/NotificationCard';
import { MapPlaceholder } from '@/components/shared/MapPlaceholder';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { mockBuses, mockRoutes, mockNotifications, mockStops } from '@/lib/mock-data';
import { useAuth } from '@/contexts/AuthContext';
import { Student } from '@/lib/types';
import { Bus, MapPin, Clock, AlertTriangle, Calendar, Phone, Navigation } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function StudentDashboard() {
  const { user } = useAuth();
  const student = user as Student;
  
  const assignedBus = mockBuses.find(b => b.id === student?.busId);
  const route = mockRoutes.find(r => r.id === assignedBus?.routeId);
  const stop = mockStops.find(s => s.id === student?.stopId);
  const unreadNotifications = mockNotifications.filter(n => !n.read);

  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold">
              Good Morning, {student?.name?.split(' ')[0]}! 👋
            </h1>
            <p className="text-muted-foreground mt-1">
              Your bus is on the way. Estimated arrival at your stop in 12 mins.
            </p>
          </div>
          <Link to="/student/track">
            <Button variant="hero" size="lg">
              <Navigation className="w-4 h-4" />
              Track My Bus
            </Button>
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="My Bus"
            value={assignedBus?.number || 'N/A'}
            icon={<Bus className="w-6 h-6" />}
            variant="primary"
          />
          <StatCard
            title="Pickup Stop"
            value={stop?.name || 'N/A'}
            icon={<MapPin className="w-6 h-6" />}
          />
          <StatCard
            title="Pickup Time"
            value={stop?.arrivalTime || '08:00'}
            icon={<Clock className="w-6 h-6" />}
          />
          <StatCard
            title="Pass Validity"
            value="185 days"
            icon={<Calendar className="w-6 h-6" />}
            variant="success"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Live Map */}
          <div className="lg:col-span-2 bg-card rounded-xl shadow-soft p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-lg">Live Bus Location</h2>
              <StatusBadge status={assignedBus?.status || 'online'} showPulse />
            </div>
            <MapPlaceholder 
              buses={assignedBus ? [{
                id: assignedBus.id,
                number: assignedBus.number,
                status: assignedBus.status,
                lat: assignedBus.currentLocation?.lat || 0,
                lng: assignedBus.currentLocation?.lng || 0,
              }] : []}
              showRoute
              height="h-[300px]"
            />
          </div>

          {/* Bus Info Card */}
          <div className="space-y-4">
            {assignedBus && (
              <BusCard bus={assignedBus} showActions onViewDetails={() => {}} />
            )}
            
            {/* Emergency Actions */}
            <div className="bg-card rounded-xl shadow-soft p-5">
              <h3 className="font-display font-bold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button variant="warning" className="w-full justify-start" size="lg">
                  <AlertTriangle className="w-5 h-5" />
                  I Missed My Bus
                </Button>
                <Button variant="outline" className="w-full justify-start" size="lg">
                  <Phone className="w-5 h-5" />
                  Emergency Contact
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Route & Notifications */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Today's Route */}
          <div className="bg-card rounded-xl shadow-soft p-5">
            <h2 className="font-display font-bold text-lg mb-4">Today's Route</h2>
            <div className="space-y-3">
              {route?.stops.map((routeStop, index) => (
                <div key={routeStop.id} className="flex items-center gap-4">
                  <div className="relative">
                    <div className={`w-4 h-4 rounded-full ${
                      routeStop.id === stop?.id 
                        ? 'bg-accent ring-4 ring-accent/20' 
                        : index === route.stops.length - 1
                          ? 'bg-success'
                          : 'bg-primary'
                    }`} />
                    {index < route.stops.length - 1 && (
                      <div className="absolute top-4 left-1/2 w-0.5 h-8 -translate-x-1/2 bg-border" />
                    )}
                  </div>
                  <div className="flex-1 flex items-center justify-between py-2">
                    <div>
                      <p className={`font-medium ${routeStop.id === stop?.id ? 'text-accent' : ''}`}>
                        {routeStop.name}
                        {routeStop.id === stop?.id && (
                          <span className="ml-2 text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full">
                            Your Stop
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground">{routeStop.arrivalTime}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-card rounded-xl shadow-soft p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-lg">Notifications</h2>
              {unreadNotifications.length > 0 && (
                <span className="text-xs bg-accent text-accent-foreground px-2 py-1 rounded-full">
                  {unreadNotifications.length} new
                </span>
              )}
            </div>
            <div className="space-y-3">
              {mockNotifications.slice(0, 3).map(notification => (
                <NotificationCard key={notification.id} notification={notification} />
              ))}
            </div>
            <Link to="/student/notifications">
              <Button variant="ghost" className="w-full mt-4">
                View All Notifications
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
