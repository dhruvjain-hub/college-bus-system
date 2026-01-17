import { Bus } from "@/lib/types";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Bus as BusIcon, User, MapPin, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";


interface BusCardProps {
  bus: Bus;
  showActions?: boolean;
  onViewDetails?: () => void;
  onTrack?: () => void;
  compact?: boolean;
  className?: string;
  routeName?: string;
  driverName?: string;

}

/**
 * ✅ Firestore-safe
 * ✅ No mock data
 * ✅ Rescue-aware
 * ✅ UI preserved
 */
export function BusCard({
  bus,
  showActions = false,
  onViewDetails,
  onTrack,
  compact = false,
  className,
  routeName,
  driverName
}: BusCardProps) {
  const navigate = useNavigate();
  const statusColor =
    bus.status === "online"
      ? "bg-success/10 text-success"
      : bus.status === "delayed"
        ? "bg-warning/10 text-warning"
        : bus.status === "breakdown"
          ? "bg-danger/10 text-danger"
          : bus.status === "rescue_assigned"
            ? "bg-orange-100 text-orange-700"
            : "bg-muted text-muted-foreground";

  /* ===================== COMPACT CARD ===================== */
  if (compact) {
    return (
      <div className="flex items-center gap-4 p-4 bg-card rounded-xl shadow-soft hover:shadow-medium transition-all">
        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", statusColor)}>
          <BusIcon className="w-6 h-6" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold truncate">{bus.number || "Unnamed Bus"}</h3>
            <StatusBadge status={bus.status} size="sm" showPulse />

            {bus.status === "rescue_assigned" && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-100 text-orange-700">
                Rescue
              </span>
            )}
          </div>

          <p className="text-sm text-muted-foreground truncate">
            {routeName || "No route assigned"}
          </p>
        </div>

        {showActions && (
          <Button variant="ghost" size="sm" onClick={onViewDetails}>
            View
          </Button>
        )}
      </div>
    );
  }

  /* ===================== FULL CARD ===================== */
  return (
    <div
      className={cn(
        "bg-card rounded-xl shadow-soft hover:shadow-medium transition-all p-5 animate-fade-in",
        bus.status === "rescue_assigned" && "ring-2 ring-orange-400",
        className
      )}
    >
      {/* HEADER */}
      <div className="flex items-start justify-between mb-4">
        <div className={cn("w-14 h-14 rounded-xl flex items-center justify-center", statusColor)}>
          <BusIcon className="w-7 h-7" />
        </div>

        <div className="flex items-center gap-2">
          <StatusBadge status={bus.status} showPulse />

          {bus.status === "rescue_assigned" && (
            <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-700">
              On Rescue
            </span>
          )}
        </div>
      </div>

      {/* TITLE */}
      <h3 className="font-display font-bold text-lg mb-1">
        {bus.number || "Unnamed Bus"}
      </h3>

      <p className="text-sm text-muted-foreground mb-4">
        {routeName || "No route assigned"}
      </p>

      {/* DETAILS */}
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <User className="w-4 h-4" />
          <span>{driverName || "No driver assigned"}</span>
        </div>

        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="w-4 h-4" />
          <span>Capacity: {bus.capacity ?? "N/A"} seats</span>
        </div>

      </div>

      {/* ACTIONS */}
      {showActions && (
        <div className="mt-4 pt-4 border-t border-border flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => navigate(`/admin/bus/${bus.id}`)}
          >
            Details
          </Button>

          <Button
            variant="default"
            size="sm"
            className="flex-1"
            onClick={() => navigate(`/admin/bus/${bus.id}/track`)}
            disabled={bus.status === "breakdown"}
          >
            Track
          </Button>
        </div>
      )}
    </div>
  );
}
