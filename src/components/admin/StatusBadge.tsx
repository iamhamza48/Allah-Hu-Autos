import { cn } from '@/lib/utils';

const ORDER_STYLES: Record<string, string> = {
  pending:    'bg-primary/10 text-brand-slate border-primary/25',
  confirmed:  'bg-muted text-foreground border-border',
  processing: 'bg-muted text-foreground border-border',
  shipped:    'bg-muted text-foreground border-border',
  delivered:  'bg-emerald-50 text-emerald-800 border-emerald-200',
  cancelled:  'bg-destructive/10 text-destructive border-destructive/25',
};

const BOOKING_STYLES: Record<string, string> = {
  pending:    'bg-primary/10 text-brand-slate border-primary/25',
  confirmed:  'bg-muted text-foreground border-border',
  completed:  'bg-emerald-50 text-emerald-800 border-emerald-200',
  cancelled:  'bg-destructive/10 text-destructive border-destructive/25',
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