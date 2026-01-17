import { Notification } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Bell, AlertTriangle, CheckCircle, Info, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';

interface NotificationCardProps {
  notification: Notification;
  onDismiss?: () => void;
  onRead?: () => void;
}

const typeConfig = {
  info: { icon: Info, color: 'text-info', bg: 'bg-info/10' },
  warning: { icon: AlertTriangle, color: 'text-warning', bg: 'bg-warning/10' },
  success: { icon: CheckCircle, color: 'text-success', bg: 'bg-success/10' },
  danger: { icon: Bell, color: 'text-danger', bg: 'bg-danger/10' },
};

export function NotificationCard({ notification, onDismiss, onRead }: NotificationCardProps) {
  const config =
    typeConfig[notification.type as keyof typeof typeConfig] ||
    typeConfig.info;
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'relative p-4 rounded-xl bg-card shadow-soft transition-all hover:shadow-medium',
        !notification.read && 'border-l-4 border-l-accent'
      )}
      onClick={onRead}
    >
      <div className="flex gap-4">
        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center shrink-0', config.bg)}>
          <Icon className={cn('w-5 h-5', config.color)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-semibold text-sm">{notification.title}</h4>
            {onDismiss && (
              <Button
                variant="ghost"
                size="icon-sm"
                className="shrink-0 -mr-2 -mt-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onDismiss();
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
          <p className="text-xs text-muted-foreground mt-2">
            {notification.createdAt
              ? formatDistanceToNow(
                notification.createdAt.toDate
                  ? notification.createdAt.toDate()
                  : new Date(notification.createdAt),
                { addSuffix: true }
              )
              : "Just now"}
          </p>

        </div>
      </div>
      {!notification.read && (
        <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-accent" />
      )}
    </div>
  );
}
