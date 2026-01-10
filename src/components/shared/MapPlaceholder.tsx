import { MapPin, Navigation, Bus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MapPlaceholderProps {
  buses?: Array<{
    id: string;
    number: string;
    status: 'online' | 'offline' | 'delayed' | 'breakdown';
    lat: number;
    lng: number;
  }>;
  showRoute?: boolean;
  className?: string;
  height?: string;
}

export function MapPlaceholder({ buses = [], showRoute = false, className, height = 'h-[400px]' }: MapPlaceholderProps) {
  return (
    <div className={cn(
      'relative rounded-xl overflow-hidden bg-gradient-to-br from-info/5 via-primary/5 to-success/5 border border-border',
      height,
      className
    )}>
      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-30">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-muted-foreground" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Simulated Route */}
      {showRoute && (
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 300">
          <path
            d="M 50 250 Q 100 200 150 180 T 250 120 T 350 50"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="3"
            strokeDasharray="8 4"
            className="opacity-60"
          />
          {/* Stop markers */}
          <circle cx="50" cy="250" r="8" fill="hsl(var(--success))" />
          <circle cx="150" cy="180" r="6" fill="hsl(var(--primary))" />
          <circle cx="250" cy="120" r="6" fill="hsl(var(--primary))" />
          <circle cx="350" cy="50" r="8" fill="hsl(var(--danger))" />
        </svg>
      )}

      {/* Bus Markers */}
      {buses.map((bus, index) => (
        <div
          key={bus.id}
          className="absolute transform -translate-x-1/2 -translate-y-1/2"
          style={{
            left: `${20 + (index * 25)}%`,
            top: `${30 + (index * 15)}%`,
          }}
        >
          <div className={cn(
            'relative w-10 h-10 rounded-full flex items-center justify-center shadow-medium',
            bus.status === 'online' ? 'bg-success' :
            bus.status === 'delayed' ? 'bg-warning' :
            bus.status === 'breakdown' ? 'bg-danger' :
            'bg-muted'
          )}>
            <Bus className="w-5 h-5 text-white" />
            {bus.status === 'online' && (
              <span className="absolute inset-0 rounded-full animate-ping bg-success opacity-40" />
            )}
          </div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 whitespace-nowrap">
            <span className="text-xs font-medium bg-card px-2 py-0.5 rounded shadow-soft">
              {bus.number}
            </span>
          </div>
        </div>
      ))}

      {/* Center Message */}
      {buses.length === 0 && !showRoute && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center p-6 bg-card/80 backdrop-blur-sm rounded-xl shadow-medium">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <MapPin className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-display font-bold text-lg mb-2">Live Map View</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              Connect Google Maps API to enable real-time bus tracking
            </p>
          </div>
        </div>
      )}

      {/* Map Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <button className="w-8 h-8 bg-card rounded-lg shadow-soft flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
          <span className="text-lg font-bold">+</span>
        </button>
        <button className="w-8 h-8 bg-card rounded-lg shadow-soft flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
          <span className="text-lg font-bold">−</span>
        </button>
        <button className="w-8 h-8 bg-card rounded-lg shadow-soft flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors mt-2">
          <Navigation className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
