import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/useToast';
import { HiXMark, HiCheckCircle, HiExclamationTriangle, HiInformationCircle } from 'react-icons/hi2';
import type { ToastVariant } from '@/context/ToastContext';

const icons: Record<ToastVariant, typeof HiCheckCircle> = {
  success: HiCheckCircle,
  error: HiExclamationTriangle,
  info: HiInformationCircle,
};

const variantStyles: Record<ToastVariant, string> = {
  success: 'border-green-200 bg-green-50 text-green-800',
  error: 'border-red-200 bg-red-50 text-red-800',
  info: 'border-blue-200 bg-blue-50 text-blue-800',
};

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((toast) => {
        const Icon = icons[toast.variant];
        return (
          <div
            key={toast.id}
            className={cn(
              'flex items-center gap-2 rounded-lg border px-4 py-3 text-sm shadow-lg',
              variantStyles[toast.variant],
            )}
          >
            <Icon className="h-5 w-5 shrink-0" />
            <span className="flex-1">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-2 shrink-0 rounded p-0.5 hover:bg-black/5"
            >
              <HiXMark className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
