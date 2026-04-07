import { Link, Outlet, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import {
  LayoutDashboard, Package, FolderTree, ShoppingBag, Calendar,
  Warehouse, Users, Star, Car, Settings, ImagePlus, LogOut, Shield,
} from 'lucide-react';

const links = [
  { to: '/admin',            label: 'Dashboard',     icon: LayoutDashboard, exact: true },
  { to: '/admin/products',   label: 'Products',      icon: Package },
  { to: '/admin/categories', label: 'Categories',    icon: FolderTree },
  { to: '/admin/images',     label: 'Images',        icon: ImagePlus },
  { divider: true },
  { to: '/admin/orders',     label: 'Orders',        icon: ShoppingBag },
  { to: '/admin/bookings',   label: 'Bookings',      icon: Calendar },
  { to: '/admin/inventory',  label: 'Inventory',     icon: Warehouse },
  { divider: true },
  { to: '/admin/customers',  label: 'Customers',     icon: Users },
  { to: '/admin/reviews',    label: 'Reviews',       icon: Star },
  { to: '/admin/vehicles',   label: 'Vehicles',      icon: Car },
  { to: '/admin/settings',   label: 'Settings',      icon: Settings },
] as const;

const AdminLayout = () => {
  const location = useLocation();
  const { profile, signOut } = useAuth();

  return (
    <div className="flex min-h-screen bg-zinc-50">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-zinc-950 flex flex-col border-r border-zinc-800">
        {/* Logo area */}
        <div className="h-14 flex items-center px-4 border-b border-zinc-800">
          <Shield className="h-5 w-5 text-orange-500 mr-2.5" />
          <span className="text-sm font-bold text-white tracking-tight">Admin Panel</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
          {links.map((item, i) => {
              if ('divider' in item) {
                return <div key={i} className="my-2 border-t border-zinc-800" />;
              }
              const { to, label, icon: Icon, exact = false } = item as { to: string; label: string; icon: any; exact?: boolean };
              const active = exact
                ? location.pathname === to
                : location.pathname.startsWith(to);

            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  'flex items-center gap-2.5 rounded-md px-3 py-2 text-[13px] font-medium transition-colors',
                  active
                    ? 'bg-orange-500 text-white'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom user strip */}
        <div className="border-t border-zinc-800 p-3">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="h-7 w-7 rounded-full bg-orange-500 flex items-center justify-center text-white text-[11px] font-bold shrink-0">
              {profile?.full_name?.charAt(0) ?? 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-[12px] font-medium text-white truncate">{profile?.full_name ?? 'Admin'}</p>
              <p className="text-[10px] text-zinc-500">Administrator</p>
            </div>
          </div>
          <button
            onClick={signOut}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[12px] text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-zinc-200 flex items-center px-6 shrink-0">
          <h1 className="text-sm font-semibold text-zinc-500">
            {(() => {
              const match = links.find(l => {
                if ('divider' in l) return false;
                const item = l as { to: string; exact?: boolean };
                return item.exact
                  ? location.pathname === item.to
                  : location.pathname.startsWith(item.to);
              }) as any;
              return match?.label ?? 'Admin';
            })()}
          </h1>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;