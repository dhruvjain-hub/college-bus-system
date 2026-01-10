import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

const variantStyles = {
  default: 'bg-card',
  primary: 'bg-gradient-to-br from-primary to-primary/80 text-primary-foreground',
  success: 'bg-gradient-to-br from-success to-success/80 text-success-foreground',
  warning: 'bg-gradient-to-br from-warning to-warning/80 text-warning-foreground',
  danger: 'bg-gradient-to-br from-danger to-danger/80 text-danger-foreground',
  info: 'bg-gradient-to-br from-info to-info/80 text-info-foreground',
};

export function StatCard({ title, value, icon, trend, variant = 'default', className }: StatCardProps) {
  const isColored = variant !== 'default';
  
  return (
    <div className={cn(
      'rounded-xl p-5 shadow-soft transition-all duration-300 hover:shadow-medium animate-fade-in',
      variantStyles[variant],
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className={cn(
            'text-sm font-medium',
            isColored ? 'opacity-80' : 'text-muted-foreground'
          )}>
            {title}
          </p>
          <p className="text-3xl font-display font-bold mt-1">{value}</p>
          {trend && (
            <p className={cn(
              'text-sm mt-2 flex items-center gap-1',
              isColored 
                ? 'opacity-80' 
                : trend.isPositive ? 'text-success' : 'text-danger'
            )}>
              <span>{trend.isPositive ? '↑' : '↓'}</span>
              <span>{Math.abs(trend.value)}% from yesterday</span>
            </p>
          )}
        </div>
        <div className={cn(
          'w-12 h-12 rounded-xl flex items-center justify-center',
          isColored ? 'bg-white/20' : 'bg-primary/10 text-primary'
        )}>
          {icon}
        </div>
      </div>
    </div>
  );
}
