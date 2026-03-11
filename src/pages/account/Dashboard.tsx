import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent } from '@/components/ui/card';
import { ShoppingBag, Calendar, Car, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const AccountDashboard = () => {
  const { profile } = useAuth();

  const cards = [
    { icon: ShoppingBag, label: 'My Orders', to: '/account/orders', desc: 'View order history' },
    { icon: Calendar, label: 'My Bookings', to: '/account/bookings', desc: 'Manage bookings' },
    { icon: Car, label: 'My Vehicles', to: '/account/vehicles', desc: 'Manage your vehicles' },
    { icon: MapPin, label: 'My Addresses', to: '/account/addresses', desc: 'Manage addresses' },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold mb-2">Welcome, {profile?.full_name || 'User'}!</h2>
      <p className="text-muted-foreground mb-6">Manage your account, orders, and vehicles.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {cards.map(({ icon: Icon, label, to, desc }) => (
          <Link key={to} to={to}>
            <Card className="hover:shadow-md hover:border-primary/30 transition-all">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{label}</h3>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AccountDashboard;
