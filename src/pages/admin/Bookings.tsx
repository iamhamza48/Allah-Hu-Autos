import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Search, Calendar, Clock, MapPin, MessageSquare, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { StatusBadge } from '@/components/admin/StatusBadge';

const AdminBookings = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchBookings = async () => {
    setLoading(true);
    const { data: bookingRows, error } = await supabase
      .from('bookings')
      .select('*, branch:branches(name, city), product:products(name)')
      .order('created_at', { ascending: false });

    if (error) { toast.error('Fetch error: ' + error.message); setLoading(false); return; }

    const rows = bookingRows || [];
    const userIds = [...new Set(rows.map((b: any) => b.user_id).filter(Boolean))];
    let profileMap: Record<string, any> = {};

    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles').select('id, full_name, phone').in('id', userIds);
      profiles?.forEach((p: any) => { profileMap[p.id] = p; });
    }

    setBookings(rows.map((b: any) => ({
      ...b,
      profile: profileMap[b.user_id] || { full_name: 'Guest User', phone: '' },
    })));
    setLoading(false);
  };

  useEffect(() => { fetchBookings(); }, []);

  const displayed = useMemo(() => {
    let list = [...bookings];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(b =>
        b.profile?.full_name?.toLowerCase().includes(q) ||
        b.notes?.toLowerCase().includes(q)
      );
    }
    if (filterStatus !== 'all') list = list.filter(b => b.status === filterStatus);
    return list;
  }, [bookings, search, filterStatus]);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('bookings').update({ status }).eq('id', id);
    if (error) return toast.error(error.message);
    toast.success('Status updated to ' + status);
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
  };

  const parseNotes = (notes: string) => {
    const contact = notes?.match(/CONTACT:\s*([^\n\r]*)/i)?.[1] || '';
    const services = notes?.match(/SERVICES:\s*([^\n\r]*)/i)?.[1]?.split(',').map(s => s.trim()) || [];
    const vehicle = notes?.match(/USER NOTES:\s*([\s\S]*)/i)?.[1] || '—';
    return { contact, services, vehicle };
  };

  const openWhatsApp = (phone: string, name: string, date: string) => {
    let clean = phone.replace(/\D/g, '');
    if (clean.startsWith('0')) clean = '92' + clean.slice(1);
    if (clean.length === 10) clean = '92' + clean;
    const msg = encodeURIComponent(`Assalam o Alaikum ${name}, this is Allah-Hu-Autos regarding your booking for ${date}.`);
    window.open(`https://wa.me/${clean}?text=${msg}`, '_blank');
  };

  return (
    <div>
      <AdminPageHeader
        title={`Bookings (${displayed.length})`}
        onRefresh={fetchBookings}
        refreshing={loading}
      />

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search customer or vehicle…" className="pl-9 h-9 text-sm" />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-44 h-9 text-sm"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <Card className="shadow-none">
          <div className="divide-y">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-4 p-4">
                <div className="h-3 bg-zinc-100 rounded w-24 animate-pulse" />
                <div className="h-3 bg-zinc-100 rounded w-40 animate-pulse" />
                <div className="h-3 bg-zinc-100 rounded w-16 animate-pulse ml-auto" />
              </div>
            ))}
          </div>
        </Card>
      ) : displayed.length === 0 ? (
        <div className="text-center py-16 text-zinc-400 border border-dashed border-zinc-200 rounded-xl bg-white">
          <Calendar className="h-8 w-8 mx-auto mb-2 opacity-30" />
          <p className="font-medium text-zinc-500">No bookings found</p>
        </div>
      ) : (
        <Card className="shadow-none overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-zinc-50 hover:bg-zinc-50">
                <TableHead className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Customer</TableHead>
                <TableHead className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Vehicle & Services</TableHead>
                <TableHead className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Branch</TableHead>
                <TableHead className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Schedule</TableHead>
                <TableHead className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayed.map((b) => {
                const { contact, services, vehicle } = parseNotes(b.notes || '');
                const finalPhone = contact || b.profile?.phone;

                return (
                  <TableRow key={b.id} className="hover:bg-zinc-50/60">
                    <TableCell>
                      <div className="font-medium text-sm text-zinc-900">{b.profile?.full_name}</div>
                      {finalPhone && (
                        <div className="flex flex-col gap-1 mt-1">
                          <a href={`tel:${finalPhone}`} className="text-[11px] text-zinc-400 hover:text-zinc-700 flex items-center gap-1">
                            <Phone className="h-3 w-3" /> {finalPhone}
                          </a>
                          <button
                            onClick={() => openWhatsApp(finalPhone, b.profile?.full_name, b.booking_date)}
                            className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 hover:underline w-fit"
                          >
                            <MessageSquare className="h-3 w-3" /> WhatsApp
                          </button>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium text-zinc-800 uppercase">{vehicle}</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {services.map(s => s && (
                          <Badge key={s} variant="outline" className="text-[10px] px-1.5 py-0 border-zinc-200 text-zinc-500">{s}</Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-zinc-800 flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-zinc-400 shrink-0" /> {b.branch?.name}
                      </div>
                      <div className="text-[11px] text-zinc-400 ml-5">{b.branch?.city}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm flex items-center gap-1.5 text-zinc-800">
                        <Calendar className="h-3.5 w-3.5 text-zinc-400" /> {b.booking_date}
                      </div>
                      <div className="text-[11px] text-zinc-400 flex items-center gap-1.5 mt-1">
                        <Clock className="h-3 w-3" /> {b.booking_time}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select value={b.status} onValueChange={(v) => updateStatus(b.id, v)}>
                        <SelectTrigger className="w-32 h-7 text-xs border-zinc-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
};

export default AdminBookings;