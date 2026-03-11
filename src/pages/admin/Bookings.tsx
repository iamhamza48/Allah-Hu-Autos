import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Booking } from '@/types/database';
import { toast } from 'sonner';

const AdminBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    const { data } = await supabase
      .from('bookings')
      .select('*, branch:branches(*), profile:profiles(*)')
      .order('booking_date', { ascending: false });
    setBookings(data || []);
    setLoading(false);
  };
  useEffect(() => { fetch(); }, []);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('bookings').update({ status }).eq('id', id);
    toast.success('Updated');
    fetch();
  };

  if (loading) return <div className="h-40 bg-secondary animate-pulse rounded-lg" />;

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Bookings ({bookings.length})</h2>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Branch</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((b) => (
              <TableRow key={b.id}>
                <TableCell>{b.profile?.full_name || 'N/A'}</TableCell>
                <TableCell>{b.branch?.name}</TableCell>
                <TableCell>{b.booking_date}</TableCell>
                <TableCell>{b.booking_time}</TableCell>
                <TableCell>
                  <Select value={b.status} onValueChange={(v) => updateStatus(b.id, v)}>
                    <SelectTrigger className="w-32 h-8"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['pending', 'confirmed', 'completed', 'cancelled'].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default AdminBookings;
