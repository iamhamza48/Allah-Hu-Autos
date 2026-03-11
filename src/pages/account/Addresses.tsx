import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import type { Address } from '@/types/database';
import { toast } from 'sonner';
import { Trash2, Plus } from 'lucide-react';

const AccountAddresses = () => {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ label: '', address_line: '', city: '', phone: '', is_default: false });

  const fetchAddresses = async () => {
    if (!user) return;
    const { data } = await supabase.from('addresses').select('*').eq('user_id', user.id).order('is_default', { ascending: false });
    setAddresses(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchAddresses(); }, [user]);

  const handleAdd = async () => {
    if (!user) return;
    const { error } = await supabase.from('addresses').insert({ ...form, user_id: user.id });
    if (error) toast.error('Failed to add address');
    else { toast.success('Address added!'); setAdding(false); setForm({ label: '', address_line: '', city: '', phone: '', is_default: false }); fetchAddresses(); }
  };

  const handleRemove = async (id: string) => {
    await supabase.from('addresses').delete().eq('id', id);
    toast.success('Address removed');
    fetchAddresses();
  };

  if (loading) return <div className="h-20 rounded-lg bg-secondary animate-pulse" />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">My Addresses</h2>
        <Button size="sm" onClick={() => setAdding(!adding)}><Plus className="h-4 w-4 mr-1" /> Add Address</Button>
      </div>

      {adding && (
        <Card className="mb-6">
          <CardContent className="p-4 space-y-4">
            <div><Label>Label</Label><Input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="e.g. Home, Office" /></div>
            <div><Label>Address</Label><Input value={form.address_line} onChange={(e) => setForm({ ...form, address_line: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>City</Label><Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></div>
              <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.is_default} onCheckedChange={(v) => setForm({ ...form, is_default: v })} />
              <Label>Set as default</Label>
            </div>
            <Button onClick={handleAdd}>Save Address</Button>
          </CardContent>
        </Card>
      )}

      {addresses.length === 0 ? (
        <p className="text-muted-foreground">No addresses saved.</p>
      ) : (
        <div className="space-y-3">
          {addresses.map((a) => (
            <Card key={a.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{a.label} {a.is_default && <span className="text-xs text-primary">(Default)</span>}</p>
                  <p className="text-sm text-muted-foreground">{a.address_line}, {a.city}</p>
                  <p className="text-xs text-muted-foreground">{a.phone}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleRemove(a.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AccountAddresses;
