import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import VehicleSelector from '@/components/VehicleSelector';
import type { UserVehicle, Vehicle } from '@/types/database';
import { toast } from 'sonner';
import { Trash2, Plus } from 'lucide-react';

const AccountVehicles = () => {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<UserVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [nickname, setNickname] = useState('');

  const fetchVehicles = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('user_vehicles')
      .select('*, vehicle:vehicles(*, model:vehicle_models(*, make:vehicle_makes(*)))')
      .eq('user_id', user.id);
    setVehicles(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchVehicles(); }, [user]);

  const handleAdd = async () => {
    if (!user || !selectedVehicle) return;
    const { error } = await supabase.from('user_vehicles').insert({
      user_id: user.id,
      vehicle_id: selectedVehicle.id,
      nickname: nickname || null,
    });
    if (error) toast.error('Failed to add vehicle');
    else { toast.success('Vehicle added!'); setAdding(false); setNickname(''); fetchVehicles(); }
  };

  const handleRemove = async (id: string) => {
    await supabase.from('user_vehicles').delete().eq('id', id);
    toast.success('Vehicle removed');
    fetchVehicles();
  };

  if (loading) return <div className="h-20 rounded-lg bg-secondary animate-pulse" />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">My Vehicles</h2>
        <Button size="sm" onClick={() => setAdding(!adding)}><Plus className="h-4 w-4 mr-1" /> Add Vehicle</Button>
      </div>

      {adding && (
        <Card className="mb-6">
          <CardContent className="p-4 space-y-4">
            <VehicleSelector onSelect={setSelectedVehicle} />
            <div><Label>Nickname (optional)</Label><Input value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="e.g. My Corolla" /></div>
            <Button onClick={handleAdd} disabled={!selectedVehicle}>Save Vehicle</Button>
          </CardContent>
        </Card>
      )}

      {vehicles.length === 0 ? (
        <p className="text-muted-foreground">No vehicles added.</p>
      ) : (
        <div className="space-y-3">
          {vehicles.map((uv) => (
            <Card key={uv.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    {uv.vehicle?.model?.make?.name} {uv.vehicle?.model?.name} {uv.vehicle?.year}
                  </p>
                  {uv.nickname && <p className="text-sm text-muted-foreground">{uv.nickname}</p>}
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleRemove(uv.id)}>
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

export default AccountVehicles;
