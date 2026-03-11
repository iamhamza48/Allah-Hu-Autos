import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Booking } from '@/types/database';

const AccountBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('bookings')
      .select('*, branch:branches(*)')
      .eq('user_id', user.id)
      .order('booking_date', { ascending: false })
      .then(({ data }) => {
        setBookings(data || []);
        setLoading(false);
      });
  }, [user]);

  if (loading) return <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 rounded-lg bg-secondary animate-pulse" />)}</div>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">My Bookings</h2>
      {bookings.length === 0 ? (
        <p className="text-muted-foreground">No bookings yet.</p>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <Card key={b.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{b.branch?.name}</p>
                  <p className="text-sm text-muted-foreground">{b.booking_date} at {b.booking_time}</p>
                  {b.notes && <p className="text-xs text-muted-foreground mt-1">{b.notes}</p>}
                </div>
                <Badge>{b.status}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AccountBookings;
