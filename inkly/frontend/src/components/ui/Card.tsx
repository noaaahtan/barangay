import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-slate-200 bg-white p-6 shadow-sm',
        className,
      )}
    >
      {children}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  iconColor?: 'coral' | 'sky' | 'gold' | 'default';
  className?: string;
}

const iconColorStyles: Record<string, string> = {
  coral: 'bg-brand-50 text-brand-500',
  sky: 'bg-sky-brand-50 text-sky-brand-500',
  gold: 'bg-gold-50 text-gold-500',
  default: 'bg-slate-100 text-slate-600',
};

export function StatCard({ label, value, icon, iconColor = 'default', className }: StatCardProps) {
  return (
    <Card className={cn('flex items-start gap-4', className)}>
      {icon && (
        <div className={cn('rounded-lg p-2.5', iconColorStyles[iconColor])}>
          {icon}
        </div>
      )}
      <div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
      </div>
    </Card>
  );
}
