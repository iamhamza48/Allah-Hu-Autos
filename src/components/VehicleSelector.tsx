import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import type { VehicleMake, VehicleModel, Vehicle } from '@/types/database';

interface VehicleSelectorProps {
  onSelect?: (vehicle: Vehicle | null) => void;
}

const VehicleSelector = ({ onSelect }: VehicleSelectorProps) => {
  const navigate = useNavigate();

  const [makes, setMakes] = useState<VehicleMake[]>([]);
  const [models, setModels] = useState<VehicleModel[]>([]);
  const [years, setYears] = useState<Vehicle[]>([]);

  const [selectedMakeId, setSelectedMakeId] = useState('');
  const [selectedModelId, setSelectedModelId] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState('');

  const isSearchWidget = !onSelect;

  // 1. Fetch all makes from vehicle_makes
  useEffect(() => {
    supabase
      .from('vehicle_makes')
      .select('*')
      .order('name')
      .then(({ data }) => setMakes(data || []));
  }, []);

  // 2. Fetch models for the selected make
  useEffect(() => {
    setSelectedModelId('');
    setSelectedVehicleId('');
    if (onSelect) onSelect(null);
    setModels([]);
    setYears([]);

    if (!selectedMakeId) return;

    supabase
      .from('vehicle_models')
      .select('*')
      .eq('make_id', selectedMakeId)
      .order('name')
      .then(({ data }) => setModels(data || []));
  }, [selectedMakeId]);

  // 3. Fetch vehicles (years) for the selected model
  useEffect(() => {
    setSelectedVehicleId('');
    if (onSelect) onSelect(null);
    setYears([]);

    if (!selectedModelId) return;

    supabase
      .from('vehicles')
      .select('*')
      .eq('model_id', selectedModelId)
      .order('year', { ascending: false })
      .then(({ data }) => setYears(data || []));
  }, [selectedModelId]);

  const handleYearChange = (vid: string) => {
    setSelectedVehicleId(vid);
    if (onSelect) {
      const v = years.find(y => y.id === vid) || null;
      onSelect(v);
    }
  };

  const handleSearchClick = () => {
    if (selectedVehicleId) {
      navigate(`/vehicles/${selectedVehicleId}/products`);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full">
      {/* Make */}
      <Select value={selectedMakeId} onValueChange={setSelectedMakeId}>
        <SelectTrigger className="flex-1 bg-background">
          <SelectValue placeholder="Select Make" />
        </SelectTrigger>
        <SelectContent>
          {makes.map(m => (
            <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Model */}
      <Select value={selectedModelId} onValueChange={setSelectedModelId} disabled={!selectedMakeId}>
        <SelectTrigger className="flex-1 bg-background">
          <SelectValue placeholder="Select Model" />
        </SelectTrigger>
        <SelectContent>
          {models.map(m => (
            <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Year */}
      <Select value={selectedVehicleId} onValueChange={handleYearChange} disabled={!selectedModelId}>
        <SelectTrigger className="w-full sm:w-36 bg-background">
          <SelectValue placeholder="Year" />
        </SelectTrigger>
        <SelectContent>
          {years.map(v => (
            <SelectItem key={v.id} value={v.id}>{v.year}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {isSearchWidget && (
        <Button
          onClick={handleSearchClick}
          disabled={!selectedVehicleId}
          className="w-full sm:w-auto gap-2"
        >
          <Search className="h-4 w-4" /> Find Parts
        </Button>
      )}
    </div>
  );
};

export default VehicleSelector;