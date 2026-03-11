import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import VehicleSelector from '@/components/VehicleSelector';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import type { Branch, Vehicle } from '@/types/database';
import { Calendar, Clock } from 'lucide-react';

const Booking = () => {
  const { user } = useAuth();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    supabase.from('branches').select('*').eq('is_active', true).then(({ data }) => {
      setBranches(data || []);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast.error('Please login first'); return; }
    if (!selectedBranch || !date || !time) { toast.error('Please fill all required fields'); return; }

    setSubmitting(true);
    const { error } = await supabase.from('bookings').insert({
      user_id: user.id,
      branch_id: selectedBranch,
      vehicle_id: selectedVehicle?.id || null,
      booking_date: date,
      booking_time: time,
      notes,
      status: 'pending',
    });

    if (error) {
      toast.error('Failed to create booking');
    } else {
      toast.success('Booking created successfully!');
      setDate('');
      setTime('');
      setNotes('');
    }
    setSubmitting(false);
  };

  const timeSlots = [
    '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM',
    '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM',
    '06:00 PM', '07:00 PM', '08:00 PM',
  ];

  return (
    <div className="container py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-2">Book Installation</h1>
      <p className="text-muted-foreground mb-8">Schedule a professional installation at one of our branches</p>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader><CardTitle>Booking Details</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label>Branch *</Label>
              <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                <SelectTrigger><SelectValue placeholder="Select branch" /></SelectTrigger>
                <SelectContent>
                  {branches.map((b) => (
                    <SelectItem key={b.id} value={b.id}>{b.name} — {b.city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Your Vehicle (optional)</Label>
              <VehicleSelector onSelect={setSelectedVehicle} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Date *</Label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} min={new Date().toISOString().split('T')[0]} required />
              </div>
              <div>
                <Label className="flex items-center gap-1"><Clock className="h-3 w-3" /> Time *</Label>
                <Select value={time} onValueChange={setTime}>
                  <SelectTrigger><SelectValue placeholder="Select time" /></SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Notes (optional)</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any special requirements..." />
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={submitting}>
              {submitting ? 'Booking...' : 'Confirm Booking'}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default Booking;
