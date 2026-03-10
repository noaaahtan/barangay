import { HiInbox } from 'react-icons/hi2';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  message?: string;
  className?: string;
}

export function EmptyState({
  message = 'No data found',
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white py-12',
        className,
      )}
    >
      <HiInbox className="h-10 w-10 text-brand-200" />
      <p className="mt-2 text-sm text-slate-500">{message}</p>
    </div>
  );
}
