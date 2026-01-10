import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status?: string;
  showPulse?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  online: { label: "Online", color: "bg-success text-success-foreground" },
  offline: { label: "Offline", color: "bg-muted text-muted-foreground" },
  delayed: { label: "Delayed", color: "bg-warning text-warning-foreground" },
  breakdown: { label: "Breakdown", color: "bg-danger text-danger-foreground" },
  pending: { label: "Pending", color: "bg-warning text-warning-foreground" },
  assigned: { label: "Assigned", color: "bg-info text-info-foreground" },
  resolved: { label: "Resolved", color: "bg-success text-success-foreground" },
  "in-progress": { label: "In Progress", color: "bg-info text-info-foreground" },
  reported: { label: "Reported", color: "bg-warning text-warning-foreground" },

  // 🚍 REAL TRANSPORT STATES
  on_route: { label: "On Route", color: "bg-primary text-primary-foreground" },
  idle: { label: "Idle", color: "bg-muted text-muted-foreground" }
};

const sizeClasses = {
  sm: "text-xs px-2 py-0.5",
  md: "text-sm px-2.5 py-1",
  lg: "text-base px-3 py-1.5"
};

export function StatusBadge({ status = "offline", showPulse = false, size = "md", className }: StatusBadgeProps) {
  const config = statusConfig[status] ?? statusConfig["offline"];

  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-full font-medium",
      config.color,
      sizeClasses[size],
      className
    )}>
      {showPulse && (status === "online" || status === "in-progress" || status === "on_route") && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
        </span>
      )}
      {config.label}
    </span>
  );
}
