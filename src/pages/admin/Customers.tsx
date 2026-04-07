import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Users, MessageSquare, Phone, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';

const AdminCustomers = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: profiles, error: pError } = await supabase
        .from('profiles').select('*').order('created_at', { ascending: false });
      if (pError) throw pError;

      const { data: bookings } = await supabase
        .from('bookings').select('user_id, notes').order('created_at', { ascending: false });

      const phoneMap: Record<string, string> = {};
      bookings?.forEach(b => {
        if (b.user_id && b.notes) {
          const match = b.notes.match(/CONTACT:\s*([^\n\r]*)/i);
          if (match?.[1] && !phoneMap[b.user_id]) phoneMap[b.user_id] = match[1].trim();
        }
      });

      setCustomers((profiles || []).map(p => ({ ...p, phone: p.phone || phoneMap[p.id] || '' })));
    } catch (error: any) {
      toast.error('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const displayed = useMemo(() => {
    const q = search.toLowerCase();
    return customers.filter(c =>
      !q || c.full_name?.toLowerCase().includes(q) || c.phone?.includes(q)
    );
  }, [customers, search]);

  const openWhatsApp = (phone: string, name: string) => {
    if (!phone) return toast.error('No phone number found');
    let clean = phone.replace(/\D/g, '');
    if (clean.startsWith('0')) clean = '92' + clean.slice(1);
    if (clean.length === 10) clean = '92' + clean;
    const msg = encodeURIComponent(`Assalam o Alaikum ${name}, this is Allah-Hu-Autos.`);
    window.open(`https://wa.me/${clean}?text=${msg}`, '_blank');
  };

  return (
    <div>
      <AdminPageHeader
        title={`Customers (${displayed.length})`}
        subtitle="Registered customer directory"
        onRefresh={fetchData}
        refreshing={loading}
      />

      <div className="relative max-w-sm mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search name or phone…"
          className="pl-9 h-9 text-sm"
        />
      </div>

      {loading ? (
        <Card className="shadow-none">
          <div className="divide-y">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-4">
                <div className="h-8 w-8 bg-zinc-100 rounded-full animate-pulse shrink-0" />
                <div className="h-3 bg-zinc-100 rounded w-36 animate-pulse" />
                <div className="h-3 bg-zinc-100 rounded w-24 animate-pulse ml-auto" />
              </div>
            ))}
          </div>
        </Card>
      ) : displayed.length === 0 ? (
        <div className="text-center py-16 text-zinc-400 border border-dashed border-zinc-200 rounded-xl bg-white">
          <Users className="h-8 w-8 mx-auto mb-2 opacity-30" />
          <p className="font-medium text-zinc-500">No customers found</p>
        </div>
      ) : (
        <Card className="shadow-none overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-zinc-50 hover:bg-zinc-50">
                <TableHead className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Customer</TableHead>
                <TableHead className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Phone</TableHead>
                <TableHead className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Joined</TableHead>
                <TableHead className="text-right text-xs font-semibold text-zinc-500 uppercase tracking-wide">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayed.map((c) => (
                <TableRow key={c.id} className="hover:bg-zinc-50/60">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-600 font-bold text-xs shrink-0">
                        {c.full_name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <span className="font-medium text-sm text-zinc-900">{c.full_name || 'Guest'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {c.phone ? (
                      <a href={`tel:${c.phone}`} className="text-sm text-zinc-700 hover:text-zinc-900 flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-zinc-400" /> {c.phone}
                      </a>
                    ) : (
                      <span className="text-xs text-zinc-300 italic">No number</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(c.created_at).toLocaleDateString('en-PK')}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs font-semibold gap-1.5 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300"
                      onClick={() => openWhatsApp(c.phone, c.full_name)}
                      disabled={!c.phone}
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      WhatsApp
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
};

export default AdminCustomers;