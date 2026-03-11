import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { VehicleMake, VehicleModel, Vehicle } from '@/types/database';

interface VehicleSelectorProps {
  onSelect?: (vehicle: Vehicle | null) => void;
  compact?: boolean;
}

const VehicleSelector = ({ onSelect, compact }: VehicleSelectorProps) => {
  const [makes, setMakes] = useState<VehicleMake[]>([]);
  const [models, setModels] = useState<VehicleModel[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedMake, setSelectedMake] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('');

  useEffect(() => {
    supabase.from('vehicle_makes').select('*').order('name').then(({ data }) => {
      setMakes(data || []);
    });
  }, []);

  useEffect(() => {
    if (!selectedMake) { setModels([]); return; }
    supabase.from('vehicle_models').select('*').eq('make_id', selectedMake).order('name').then(({ data }) => {
      setModels(data || []);
      setSelectedModel('');
      setSelectedVehicle('');
    });
  }, [selectedMake]);

  useEffect(() => {
    if (!selectedModel) { setVehicles([]); return; }
    supabase.from('vehicles').select('*').eq('model_id', selectedModel).order('year', { ascending: false }).then(({ data }) => {
      setVehicles(data || []);
      setSelectedVehicle('');
    });
  }, [selectedModel]);

  useEffect(() => {
    if (selectedVehicle && onSelect) {
      const v = vehicles.find((v) => v.id === selectedVehicle);
      onSelect(v || null);
    } else {
      onSelect?.(null);
    }
  }, [selectedVehicle, vehicles, onSelect]);

  const gridClass = compact ? 'flex flex-col gap-2' : 'grid grid-cols-1 sm:grid-cols-3 gap-3';

  return (
    <div className={gridClass}>
      <Select value={selectedMake} onValueChange={setSelectedMake}>
        <SelectTrigger>
          <SelectValue placeholder="Select Make" />
        </SelectTrigger>
        <SelectContent>
          {makes.map((m) => (
            <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={selectedModel} onValueChange={setSelectedModel} disabled={!selectedMake}>
        <SelectTrigger>
          <SelectValue placeholder="Select Model" />
        </SelectTrigger>
        <SelectContent>
          {models.map((m) => (
            <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={selectedVehicle} onValueChange={setSelectedVehicle} disabled={!selectedModel}>
        <SelectTrigger>
          <SelectValue placeholder="Select Year" />
        </SelectTrigger>
        <SelectContent>
          {vehicles.map((v) => (
            <SelectItem key={v.id} value={v.id}>{v.year}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default VehicleSelector;
