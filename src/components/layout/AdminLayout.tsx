import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import {
  LayoutDashboard, Package, FolderTree, ShoppingBag, Calendar,
  Warehouse, Star, Car, Settings, ImagePlus, LogOut, Shield, Menu, Bell,
} from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import { useEffect, useState, type ComponentType } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const links = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/categories', label: 'Categories', icon: FolderTree },
  { to: '/admin/images', label: 'Images', icon: ImagePlus },
  { divider: true },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/admin/bookings', label: 'Bookings', icon: Calendar },
  { to: '/admin/inventory', label: 'Inventory', icon: Warehouse },
  { divider: true },
  { to: '/admin/reviews', label: 'Reviews', icon: Star },
  { to: '/admin/vehicles', label: 'Vehicles', icon: Car },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
] as const;

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [newOrderCount, setNewOrderCount] = useState(0);

  useEffect(() => {
    const channel = supabase
      .channel('admin-new-orders')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
        const order = payload.new as { id?: string; customer_name?: string; total?: number };
        setNewOrderCount(count => count + 1);
        toast.success('New order received', {
          description: `${order.customer_name || 'Guest customer'} placed order #${order.id?.slice(0, 8) || ''}`,
          action: { label: 'View', onClick: () => navigate('/admin/orders') },
        });
      })
      .subscribe();

    return () => { void supabase.removeChannel(channel); };
  }, [navigate]);
  const currentSection = (() => {
    const match = links.find(l => {
      if ('divider' in l) return false;
      const item = l as { to: string; exact?: boolean };
      return item.exact
        ? location.pathname === item.to
        : location.pathname.startsWith(item.to);
    }) as { label?: string } | undefined;
    return match?.label ?? 'Admin';
  })();

  const SidebarContent = ({ onNavigate }: { onNavigate?: () => void }) => (
    <>
      <div className="h-14 flex items-center gap-2.5 px-4 border-b border-white/10 bg-[#0F172A]">
        <div className="logo-mark shrink-0 p-1">
          <img src="/logo.webp" alt="" width="28" height="28" className="h-7 w-7 object-contain" />
        </div>
        <div className="min-w-0 flex items-center gap-2">
          <Shield className="h-4 w-4 text-blue-400 shrink-0" />
          <span className="text-sm font-bold text-white tracking-tight truncate">Admin</span>
        </div>
      </div>

      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto bg-[#0F172A]">
        {links.map((item, i) => {
          if ('divider' in item) {
            return <div key={i} className="my-2 border-t border-white/10" />;
          }
          const { to, label, icon: Icon, exact = false } = item as { to: string; label: string; icon: ComponentType<{ className?: string }>; exact?: boolean };
          const active = exact
            ? location.pathname === to
            : location.pathname.startsWith(to);

          return (
            <Link
              key={to}
              to={to}
              onClick={onNavigate}
              className={cn(
                'group flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-200',
                active
                  ? 'bg-primary text-white shadow-md shadow-black/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              )}
            >
              <Icon className={cn('h-4 w-4 shrink-0 transition-transform duration-200', active ? 'text-white' : 'text-slate-400 group-hover:text-white')} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-3 bg-black/25">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white text-[11px] font-bold shrink-0">
            {profile?.full_name?.charAt(0) ?? 'A'}
          </div>
          <div className="min-w-0">
            <p className="text-[12px] font-medium text-white truncate">{profile?.full_name ?? 'Admin'}</p>
            <p className="text-[10px] text-slate-400">Administrator</p>
          </div>
        </div>
        <button
          type="button"
          onClick={signOut}
          className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[12px] text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign out
        </button>
      </div>
    </>
  );

  return (
    <div className="admin-app flex min-h-screen bg-background text-foreground">
      <aside className="hidden md:flex w-60 shrink-0 bg-[#0F172A] border-r border-white/10 flex-col text-white">
        <SidebarContent />
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 bg-card border-b border-border flex items-center px-4 md:px-6 shrink-0 shadow-sm">
          <div className="md:hidden mr-2">
            <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg text-foreground">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-[280px] border-white/10 bg-[#0F172A] text-white">
                <SheetHeader className="sr-only">
                  <SheetTitle>Admin Navigation</SheetTitle>
                </SheetHeader>
                <div className="h-full flex flex-col">
                  <SidebarContent onNavigate={() => setMobileNavOpen(false)} />
                </div>
              </SheetContent>
            </Sheet>
          </div>
          <h1 className="text-sm font-semibold text-muted-foreground">
            {currentSection}
          </h1>
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="relative h-9 w-9"
              aria-label="View new orders"
              onClick={() => { setNewOrderCount(0); navigate('/admin/orders'); }}
            >
              <Bell className="h-4 w-4" />
              {newOrderCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 min-w-4 h-4 px-1 rounded-full bg-red-500 text-[9px] leading-4 text-white text-center">
                  {newOrderCount > 9 ? '9+' : newOrderCount}
                </span>
              )}
            </Button>
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
