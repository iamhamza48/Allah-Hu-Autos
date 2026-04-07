import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { VehicleMake, VehicleModel } from '@/types/database';
import { toast } from 'sonner';
import { Plus, Car } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';

type EntryType = 'make' | 'model';

const AdminVehicles = () => {
  const [makes, setMakes] = useState<VehicleMake[]>([]);
  const [models, setModels] = useState<VehicleModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<{ type: EntryType; name: string; make_id: string }>({
    type: 'make', name: '', make_id: '',
  });
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const [m, md] = await Promise.all([
      supabase.from('vehicle_makes').select('*').order('name'),
      supabase.from('vehicle_models').select('*, make:vehicle_makes(*)').order('name'),
    ]);
    setMakes(m.data || []);
    setModels(md.data || []);
    setLoading(false);
  };
  useEffect(() => { fetchData(); }, []);

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error('Name is required');
    if (form.type === 'model' && !form.make_id) return toast.error('Please select a make');
    setSaving(true);
    const slug = form.name.toLowerCase().replace(/\s+/g, '-');
    if (form.type === 'make') {
      const { error } = await supabase.from('vehicle_makes').insert({ name: form.name, slug });
      if (error) { toast.error(error.message); setSaving(false); return; }
    } else {
      const { error } = await supabase.from('vehicle_models').insert({ name: form.name, slug, make_id: form.make_id });
      if (error) { toast.error(error.message); setSaving(false); return; }
    }
    toast.success(`${form.type === 'make' ? 'Make' : 'Model'} added`);
    setSaving(false);
    setDialogOpen(false);
    fetchData();
  };

  const openDialog = () => { setForm({ type: 'make', name: '', make_id: '' }); setDialogOpen(true); };

  return (
    <div>
      <AdminPageHeader
        title="Vehicles"
        subtitle={`${makes.length} makes · ${models.length} models`}
        onRefresh={fetchData}
        refreshing={loading}
        action={
          <Button size="sm" className="h-8 text-xs" onClick={openDialog}>
            <Plus className="h-3.5 w-3.5 mr-1.5" /> Add
          </Button>
        }
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Add Vehicle</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-1">
            {/* Type toggle */}
            <div className="flex rounded-lg border border-zinc-200 overflow-hidden text-sm">
              {(['make', 'model'] as EntryType[]).map(t => (
                <button
                  key={t}
                  onClick={() => setForm({ ...form, type: t, make_id: '' })}
                  className={`flex-1 py-2 font-medium capitalize transition-colors ${form.type === t ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50'}`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div>
              <Label className="text-xs font-semibold text-zinc-600 uppercase tracking-wide">
                {form.type === 'make' ? 'Make Name' : 'Model Name'}
              </Label>
              <Input
                className="mt-1.5"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder={form.type === 'make' ? 'e.g. Toyota' : 'e.g. Corolla'}
              />
            </div>

            {form.type === 'model' && (
              <div>
                <Label className="text-xs font-semibold text-zinc-600 uppercase tracking-wide">Make</Label>
                <Select value={form.make_id} onValueChange={v => setForm({ ...form, make_id: v })}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select make…" />
                  </SelectTrigger>
                  <SelectContent>
                    {makes.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? 'Saving…' : `Add ${form.type === 'make' ? 'Make' : 'Model'}`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[0, 1].map(i => (
            <Card key={i} className="shadow-none p-4 space-y-3">
              <div className="h-3 bg-zinc-100 rounded w-20 animate-pulse" />
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="h-2.5 bg-zinc-100 rounded w-full animate-pulse" />
              ))}
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Card className="shadow-none overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-100 bg-zinc-50">
              <Car className="h-4 w-4 text-zinc-400" />
              <h3 className="text-sm font-semibold text-zinc-700">Makes ({makes.length})</h3>
            </div>
            {makes.length === 0 ? (
              <p className="text-sm text-zinc-400 text-center py-8">No makes added</p>
            ) : (
              <Table>
                <TableBody>
                  {makes.map(m => (
                    <TableRow key={m.id} className="hover:bg-zinc-50/60">
                      <TableCell className="text-sm font-medium text-zinc-800">{m.name}</TableCell>
                      <TableCell className="text-[11px] text-zinc-400 font-mono">{m.slug}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>

          <Card className="shadow-none overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-100 bg-zinc-50">
              <Car className="h-4 w-4 text-zinc-400" />
              <h3 className="text-sm font-semibold text-zinc-700">Models ({models.length})</h3>
            </div>
            {models.length === 0 ? (
              <p className="text-sm text-zinc-400 text-center py-8">No models added</p>
            ) : (
              <Table>
                <TableBody>
                  {models.map(m => (
                    <TableRow key={m.id} className="hover:bg-zinc-50/60">
                      <TableCell className="text-sm font-medium text-zinc-800">{m.name}</TableCell>
                      <TableCell className="text-[11px] text-zinc-400">{(m.make as any)?.name}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminVehicles;