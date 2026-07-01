import { useEffect, useState } from 'react';
import { Pencil, Save, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { formatPKR } from '@/lib/format';
import { toast } from 'sonner';

interface ServiceProduct {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  base_price: number;
  images: { id: string; url: string; sort_order: number | null }[];
}

const AdminServices = () => {
  const [services, setServices] = useState<ServiceProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<ServiceProduct | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', price: '', image1: '', image2: '' });

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('products').select('id,name,slug,description,base_price,images:product_images(id,url,sort_order)').like('slug', 'service-%').order('name');
    if (error) toast.error(error.message);
    setServices((data || []) as ServiceProduct[]);
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  const openEdit = (service: ServiceProduct) => {
    const images = [...(service.images || [])].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    setEditing(service);
    setForm({ name: service.name, description: service.description || '', price: String(service.base_price), image1: images[0]?.url || '', image2: images[1]?.url || '' });
  };

  const save = async () => {
    if (!editing) return;
    const price = Number(form.price);
    if (!form.name.trim() || !Number.isFinite(price) || price < 0) return toast.error('Enter a valid service name and price.');
    setSaving(true);
    const { error } = await supabase.from('products').update({ name: form.name.trim(), description: form.description.trim(), base_price: price, updated_at: new Date().toISOString() }).eq('id', editing.id);
    if (error) { setSaving(false); return toast.error(error.message); }

    const { error: deleteError } = await supabase.from('product_images').delete().eq('product_id', editing.id);
    if (deleteError) { setSaving(false); return toast.error(deleteError.message); }
    const imageRows = [form.image1.trim(), form.image2.trim()].filter(Boolean).map((url, index) => ({ product_id: editing.id, url, alt: form.name.trim(), sort_order: index }));
    if (imageRows.length) {
      const { error: imageError } = await supabase.from('product_images').insert(imageRows);
      if (imageError) { setSaving(false); return toast.error(imageError.message); }
    }
    setSaving(false);
    setEditing(null);
    toast.success('Service updated');
    void load();
  };

  return (
    <div>
      <AdminPageHeader title="Services" subtitle="Manage modification service prices, descriptions and page images" />
      {loading ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-40 animate-pulse rounded-xl bg-muted" />)}</div> : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map(service => <Card key={service.id} className="overflow-hidden shadow-none">
            {service.images?.[0]?.url && <img src={service.images[0].url} alt="" className="h-32 w-full object-cover" />}
            <div className="p-4">
              <h2 className="font-bold">{service.name}</h2>
              <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">{service.description}</p>
              <div className="mt-4 flex items-center justify-between"><span className="font-black text-primary">From {formatPKR(service.base_price)}</span><Button size="sm" variant="outline" onClick={() => openEdit(service)}><Pencil className="mr-1.5 h-3.5 w-3.5" />Edit</Button></div>
            </div>
          </Card>)}
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={open => !open && setEditing(null)}>
        <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
          <DialogHeader><DialogTitle>Edit service page</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Service name</Label><Input className="mt-1.5" value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} /></div>
            <div><Label>Starting price (PKR)</Label><Input type="number" min="0" className="mt-1.5" value={form.price} onChange={event => setForm({ ...form, price: event.target.value })} /></div>
            <div><Label>Description</Label><Textarea className="mt-1.5 min-h-28" value={form.description} onChange={event => setForm({ ...form, description: event.target.value })} /></div>
            <div><Label>Primary image URL</Label><Input className="mt-1.5" value={form.image1} onChange={event => setForm({ ...form, image1: event.target.value })} placeholder="https://.../service.webp" /></div>
            <div><Label>Second image URL (optional)</Label><Input className="mt-1.5" value={form.image2} onChange={event => setForm({ ...form, image2: event.target.value })} placeholder="https://.../service-2.webp" /></div>
            <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setEditing(null)}><X className="mr-1.5 h-4 w-4" />Cancel</Button><Button onClick={() => void save()} disabled={saving}><Save className="mr-1.5 h-4 w-4" />{saving ? 'Saving…' : 'Save service'}</Button></div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminServices;
