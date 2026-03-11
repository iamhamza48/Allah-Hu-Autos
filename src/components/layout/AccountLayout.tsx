import { Link, Outlet, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { User, ShoppingBag, Calendar, Car, MapPin } from 'lucide-react';

const links = [
  { to: '/account', label: 'Dashboard', icon: User, exact: true },
  { to: '/account/orders', label: 'My Orders', icon: ShoppingBag },
  { to: '/account/bookings', label: 'My Bookings', icon: Calendar },
  { to: '/account/vehicles', label: 'My Vehicles', icon: Car },
  { to: '/account/addresses', label: 'My Addresses', icon: MapPin },
];

const AccountLayout = () => {
  const location = useLocation();

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">My Account</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
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
        <div className="md:col-span-3">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AccountLayout;
