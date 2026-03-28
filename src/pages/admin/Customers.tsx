import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Users, MessageSquare, Phone, Calendar, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const AdminCustomers = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch all profiles
      const { data: profiles, error: pError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (pError) throw pError;

      // 2. Fetch bookings to extract "hidden" phone numbers from notes
      const { data: bookings } = await supabase
        .from('bookings')
        .select('user_id, notes')
        .order('created_at', { ascending: false });

      // 3. Map extracted numbers to users
      const phoneMap: Record<string, string> = {};
      bookings?.forEach(b => {
        if (b.user_id && b.notes) {
          const match = b.notes.match(/CONTACT:\s*([^\n\r]*)/i);
          if (match && match[1] && !phoneMap[b.user_id]) {
            phoneMap[b.user_id] = match[1].trim();
          }
        }
      });

      // 4. Merge: Use Profile phone first, fallback to Booking note phone
      const merged = (profiles || []).map(p => ({
        ...p,
        phone: p.phone || phoneMap[p.id] || ""
      }));

      setCustomers(merged);
    } catch (error: any) {
      toast.error('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const displayed = useMemo(() => {
    const q = search.toLowerCase();
    return customers.filter(c => 
      !q || 
      c.full_name?.toLowerCase().includes(q) || 
      c.phone?.includes(q)
    );
  }, [customers, search]);

  const openWhatsApp = (phone: string, name: string) => {
    if (!phone) return toast.error("No phone number found");
    let clean = phone.replace(/\D/g, '');
    if (clean.startsWith('0')) clean = '92' + clean.slice(1);
    if (clean.length === 10) clean = '92' + clean;
    
    const msg = encodeURIComponent(`Assalam o Alaikum ${name}, this is Allah-Hu-Autos.`);
    window.open(`https://wa.me/${clean}?text=${msg}`, '_blank');
  };

  if (loading) return <div className="h-40 bg-secondary animate-pulse rounded-lg" />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Customer Directory ({displayed.length})</h2>
        <Button variant="ghost" size="sm" onClick={fetchData}>
          <RefreshCw className="h-4 w-4 mr-2" /> Refresh
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
          placeholder="Search name or phone..." 
          className="pl-9" 
        />
      </div>

      {displayed.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground border rounded-lg border-dashed">
          <Users className="h-8 w-8 mx-auto mb-2 opacity-30" />
          <p className="font-medium">No customers found</p>
        </div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer Name</TableHead>
                <TableHead>Phone / WhatsApp</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayed.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 font-bold text-xs">
                        {c.full_name?.charAt(0) || '?'}
                      </div>
                      {c.full_name || "Guest"}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    {c.phone ? (
                      <div className="flex flex-col">
                        <a href={`tel:${c.phone}`} className="text-sm font-medium text-zinc-900 hover:text-primary flex items-center gap-1.5">
                          <Phone className="h-3 w-3 text-muted-foreground" /> {c.phone}
                        </a>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">Missing info</span>
                    )}
                  </TableCell>

                  <TableCell className="text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(c.created_at).toLocaleDateString('en-PK')}
                    </div>
                  </TableCell>

                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs font-bold gap-1.5 border-green-200 text-green-700 hover:bg-green-50"
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