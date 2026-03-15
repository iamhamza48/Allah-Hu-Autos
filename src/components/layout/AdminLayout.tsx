import { Link, Outlet, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Package, FolderTree, ShoppingBag, Calendar,
  Warehouse, Users, Star, Car, Settings, ImagePlus,
} from 'lucide-react';

const links = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/categories', label: 'Categories', icon: FolderTree },
  { to: '/admin/images', label: 'Image Uploader', icon: ImagePlus },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/admin/bookings', label: 'Bookings', icon: Calendar },
  { to: '/admin/inventory', label: 'Inventory', icon: Warehouse },
  { to: '/admin/customers', label: 'Customers', icon: Users },
  { to: '/admin/reviews', label: 'Reviews', icon: Star },
  { to: '/admin/vehicles', label: 'Vehicles', icon: Car },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];

const AdminLayout = () => {
  const location = useLocation();

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <nav className="space-y-1">
          {links.map(({ to, label, icon: Icon, exact }) => {
            const active = exact ? location.pathname === to : location.pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary'
                )}
              >
                <Icon className="h-4 w-4" /> {label}
              </Link>
            );
          })}
        </nav>
        <div className="lg:col-span-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
