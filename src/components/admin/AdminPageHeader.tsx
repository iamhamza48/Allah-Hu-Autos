import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AdminPageHeaderProps {
  title: string;
  subtitle?: string;
  onRefresh?: () => void;
  refreshing?: boolean;
  action?: React.ReactNode;
  className?: string;
}

export const AdminPageHeader = ({
  title,
  subtitle,
  onRefresh,
  refreshing,
  action,
  className,
}: AdminPageHeaderProps) => (
  <div className={cn('flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-6', className)}>
    <div>
      <h2 className="text-lg md:text-xl font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">{title}</h2>
      {subtitle && <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{subtitle}</p>}
    </div>
    <div className="flex items-center gap-2 self-start sm:self-auto">
      {action}
      {onRefresh && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={refreshing}
          className="h-8 text-xs border-zinc-200 text-zinc-600 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-300 dark:hover:text-white"
        >
          <RefreshCw className={cn('h-3.5 w-3.5 mr-1.5', refreshing && 'animate-spin')} />
          Refresh
        </Button>
      )}
    </div>
  </div>
);