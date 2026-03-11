import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { VehicleMake, VehicleModel } from '@/types/database';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';

const AdminVehicles = () => {
  const [makes, setMakes] = useState<VehicleMake[]>([]);
  const [models, setModels] = useState<VehicleModel[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ type: 'make' as 'make' | 'model', name: '', make_id: '' });

  const fetch = async () => {
    const [m, md] = await Promise.all([
      supabase.from('vehicle_makes').select('*').order('name'),
      supabase.from('vehicle_models').select('*, make:vehicle_makes(*)').order('name'),
    ]);
    setMakes(m.data || []);
    setModels(md.data || []);
  };
  useEffect(() => { fetch(); }, []);

  const handleSave = async () => {
    if (form.type === 'make') {
      await supabase.from('vehicle_makes').insert({ name: form.name, slug: form.name.toLowerCase().replace(/\s+/g, '-') });
    } else {
      await supabase.from('vehicle_models').insert({ name: form.name, slug: form.name.toLowerCase().replace(/\s+/g, '-'), make_id: form.make_id });
    }
    toast.success('Added');
    setDialogOpen(false);
    fetch();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Vehicles</h2>
        <Button onClick={() => { setForm({ type: 'make', name: '', make_id: '' }); setDialogOpen(true); }}><Plus className="h-4 w-4 mr-1" /> Add</Button>
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Vehicle</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button variant={form.type === 'make' ? 'default' : 'outline'} onClick={() => setForm({ ...form, type: 'make' })}>Make</Button>
              <Button variant={form.type === 'model' ? 'default' : 'outline'} onClick={() => setForm({ ...form, type: 'model' })}>Model</Button>
            </div>
            <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            {form.type === 'model' && (
              <div><Label>Make</Label>
                <select className="w-full border rounded-md p-2" value={form.make_id} onChange={(e) => setForm({ ...form, make_id: e.target.value })}>
                  <option value="">Select make</option>
                  {makes.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
            )}
            <Button onClick={handleSave} className="w-full">Save</Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="p-4"><h3 className="font-bold mb-2">Makes ({makes.length})</h3></div>
          <Table>
            <TableBody>
              {makes.map((m) => (
                <TableRow key={m.id}><TableCell>{m.name}</TableCell></TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
        <Card>
          <div className="p-4"><h3 className="font-bold mb-2">Models ({models.length})</h3></div>
          <Table>
            <TableBody>
              {models.map((m) => (
                <TableRow key={m.id}>
                  <TableCell>{m.name}</TableCell>
                  <TableCell className="text-muted-foreground">{(m.make as any)?.name}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
};

export default AdminVehicles;
