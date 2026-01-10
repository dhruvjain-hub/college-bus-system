import { Bus } from '@/lib/types';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { mockRoutes, mockDrivers } from '@/lib/mock-data';
import { Bus as BusIcon, User, MapPin, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BusCardProps {
  bus: Bus;
  showActions?: boolean;
  onViewDetails?: () => void;
  compact?: boolean;
  className?: string;
}

export function BusCard({ bus, showActions = false, onViewDetails, compact = false, className }: BusCardProps) {
  const route = mockRoutes.find(r => r.id === bus.routeId);
  const driver = mockDrivers.find(d => d.id === bus.driverId);

  if (compact) {
    return (
      <div className="flex items-center gap-4 p-4 bg-card rounded-xl shadow-soft hover:shadow-medium transition-all">
        <div className={cn(
          'w-12 h-12 rounded-xl flex items-center justify-center',
          bus.status === 'online' ? 'bg-success/10 text-success' :
          bus.status === 'delayed' ? 'bg-warning/10 text-warning' :
          bus.status === 'breakdown' ? 'bg-danger/10 text-danger' :
          'bg-muted text-muted-foreground'
        )}>
          <BusIcon className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold truncate">{bus.number}</h3>
            <StatusBadge status={bus.status} size="sm" showPulse />
          </div>
          <p className="text-sm text-muted-foreground truncate">{route?.name || 'No route'}</p>
        </div>
        {showActions && (
          <Button variant="ghost" size="sm" onClick={onViewDetails}>
            View
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={cn(
  "bg-card rounded-xl shadow-soft hover:shadow-medium transition-all p-5 animate-fade-in",
  className
  )}>
      <div className="flex items-start justify-between mb-4">
        <div className={cn(
          'w-14 h-14 rounded-xl flex items-center justify-center',
          bus.status === 'online' ? 'bg-success/10 text-success' :
          bus.status === 'delayed' ? 'bg-warning/10 text-warning' :
          bus.status === 'breakdown' ? 'bg-danger/10 text-danger' :
          'bg-muted text-muted-foreground'
        )}>
          <BusIcon className="w-7 h-7" />
        </div>
        <StatusBadge status={bus.status} showPulse />
      </div>

      <h3 className="font-display font-bold text-lg mb-1">{bus.number}</h3>
      <p className="text-sm text-muted-foreground mb-4">{route?.name || 'No route assigned'}</p>

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <User className="w-4 h-4" />
          <span>{driver?.name || 'No driver'}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="w-4 h-4" />
          <span>Capacity: {bus.capacity} seats</span>
        </div>
        {route && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{route.startTime} - {route.endTime}</span>
          </div>
        )}
      </div>

      {showActions && (
        <div className="mt-4 pt-4 border-t border-border flex gap-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={onViewDetails}>
            Details
          </Button>
          <Button variant="default" size="sm" className="flex-1">
            Track
          </Button>
        </div>
      )}
    </div>
  );
}
