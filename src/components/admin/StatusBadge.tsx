import { cn } from '@/lib/utils';

const ORDER_STYLES: Record<string, string> = {
  pending:    'bg-amber-50 text-amber-700 border-amber-200',
  confirmed:  'bg-blue-50 text-blue-700 border-blue-200',
  processing: 'bg-violet-50 text-violet-700 border-violet-200',
  shipped:    'bg-indigo-50 text-indigo-700 border-indigo-200',
  delivered:  'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled:  'bg-red-50 text-red-700 border-red-200',
};

const BOOKING_STYLES: Record<string, string> = {
  pending:    'bg-amber-50 text-amber-700 border-amber-200',
  confirmed:  'bg-blue-50 text-blue-700 border-blue-200',
  completed:  'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled:  'bg-red-50 text-red-700 border-red-200',
};

interface StatusBadgeProps {
  status: string;
  type?: 'order' | 'booking';
  className?: string;
}

export const StatusBadge = ({ status, type = 'order', className }: StatusBadgeProps) => {
  const map = type === 'booking' ? BOOKING_STYLES : ORDER_STYLES;
  const style = map[status] ?? 'bg-zinc-50 text-zinc-600 border-zinc-200';
  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border capitalize tracking-wide',
      style,
      className
    )}>
      {status}
    </span>
  );
};

export { ORDER_STYLES, BOOKING_STYLES };