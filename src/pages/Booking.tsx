import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import {
  Calendar, Clock, MapPin, ChevronRight,
  CheckCircle2, Loader2, ArrowLeft, X, Phone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  normalizePakistaniMobile,
  PAKISTANI_PHONE_EXAMPLE,
  validateGuestDetails,
} from '@/lib/customer-validation';

const SPECIALIST_SERVICES = [
  "4x4 Face lifts", "PPF", "DETAILING", "WRAPPING", "Anti UV tints", 
  "Sports kits", "Sports Exhaust", "Seat Covers", "Mats", "Polishes", 
  "Sun visors", "Air Press", "Fog Lamps", "Anti-heat Tints"
];

const TIME_SLOTS = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

const fmt12 = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${ampm}`;
};

const Booking = () => {
  const navigate = useNavigate();
  
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [branchId, setBranchId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase.from('branches').select('*').eq('is_active', true);
      setBranches(data || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  const toggleService = (service: string) => {
    setSelectedServices(prev => 
      prev.includes(service) 
        ? prev.filter(s => s !== service) 
        : [...prev, service]
    );
  };

  const handleSubmit = async () => {
    const errors = validateGuestDetails({
      name: customerName,
      email: customerEmail,
      phone,
      notes,
    });
    if (Object.keys(errors).length > 0) {
      toast.error(Object.values(errors)[0]);
      return;
    }
    if (!branchId || !date || !time || selectedServices.length === 0) {
      toast.error('Select services, branch, date, and time');
      return;
    }
    const normalizedPhone = normalizePakistaniMobile(phone);
    setPhone(normalizedPhone);
    setSubmitting(true);
    try {
      const { error } = await supabase.rpc('create_guest_booking', {
        p_customer_name: customerName,
        p_customer_email: customerEmail,
        p_customer_phone: normalizedPhone,
        p_branch_id: branchId,
        p_booking_date: date,
        p_booking_time: time,
        p_services: selectedServices,
        p_notes: notes,
      });
      if (error) throw error;
      setStep(3);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex h-[80vh] items-center justify-center">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
    </div>
  );

  if (step === 3) return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 bg-zinc-50/50">
      <Card className="w-full max-w-lg border-none shadow-2xl rounded-[3rem] p-12 text-center bg-white">
        <div className="mb-8 inline-flex h-24 w-24 items-center justify-center rounded-full bg-green-50 text-green-600">
          <CheckCircle2 className="h-14 w-14" />
        </div>
        <h2 className="text-4xl font-black text-zinc-900 tracking-tighter mb-4 uppercase">Success!</h2>
        <p className="text-zinc-600 font-bold mb-10 leading-relaxed uppercase text-xs tracking-widest">
          We will call you at <span className="text-primary font-black">{phone}</span> <br/> 
          to confirm your slot and details.
        </p>
        <Button className="w-full h-16 rounded-2xl font-black text-lg uppercase tracking-widest" onClick={() => navigate('/')}>Return to Shop</Button>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-background pt-10 pb-24 px-4">
      <div className="max-w-2xl mx-auto">
        
        <div className="flex items-center justify-between mb-12">
          <button onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)} className="p-3 hover:bg-white rounded-full transition-all text-zinc-900 shadow-sm border border-zinc-200 bg-white">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex gap-1.5">
            <div className={`h-1.5 w-8 rounded-full transition-all ${step >= 1 ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`h-1.5 w-8 rounded-full transition-all ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
          </div>
        </div>

        {step === 1 ? (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="space-y-2">
              <h1 className="text-6xl font-black text-zinc-900 tracking-tighter leading-[0.9] uppercase">
                Pick your <br/><span className="text-primary">Upgrades</span>
              </h1>
              <p className="text-zinc-500 font-bold text-xs uppercase tracking-[0.3em]">Select services & location</p>
            </header>

            <div className="grid grid-cols-2 gap-3">
              {SPECIALIST_SERVICES.map((service) => {
                const isSelected = selectedServices.includes(service);
                return (
                  <button
                    key={service}
                    onClick={() => toggleService(service)}
                    className={`relative flex items-center justify-between px-6 py-5 rounded-2xl border-2 transition-all duration-300 text-left ${
                      isSelected 
                        ? 'border-primary bg-primary text-primary-foreground shadow-xl shadow-primary/20 scale-[0.98]' 
                        : 'border-zinc-300 bg-white text-zinc-900 hover:border-zinc-500 shadow-sm'
                    }`}
                  >
                    <span className="text-[11px] font-black uppercase tracking-wider">{service}</span>
                    {isSelected && <X className="h-3 w-3 text-primary-foreground/70" />}
                  </button>
                );
              })}
            </div>

            <div className="space-y-4 pt-4">
              <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 ml-1">Location Selection</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {branches.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => setBranchId(b.id)}
                    className={`w-full flex items-center justify-between p-6 rounded-2xl border-2 transition-all ${
                      branchId === b.id ? 'border-zinc-900 bg-zinc-900 text-white shadow-2xl' : 'border-zinc-300 bg-white text-zinc-900 hover:bg-white shadow-sm'
                    }`}
                  >
                    <div className="text-left">
                      <p className="font-black text-lg uppercase leading-none">{b.name}</p>
                      <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${branchId === b.id ? 'text-primary/90' : 'text-zinc-500'}`}>{b.city}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <Button 
              className="w-full h-20 rounded-3xl font-black text-xl uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 active:scale-95 transition-all"
              disabled={selectedServices.length === 0 || !branchId}
              onClick={() => setStep(2)}
            >
              Continue <ChevronRight className="ml-2 h-6 w-6" />
            </Button>
          </div>
        ) : (
          <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-500">
             <header className="space-y-2">
              <h1 className="text-6xl font-black text-zinc-900 tracking-tighter leading-[0.9] uppercase">
                Contact <br/><span className="text-primary">Details</span>
              </h1>
              <p className="text-zinc-500 font-bold text-xs uppercase tracking-[0.3em]">We will call you to confirm</p>
            </header>

            <div className="flex flex-wrap gap-2">
              {selectedServices.map(s => (
                <Badge key={s} className="bg-primary/15 text-primary border-none px-4 py-2 rounded-full font-black text-[10px] uppercase tracking-wider">
                  {s}
                </Badge>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 ml-1">Full Name</Label>
                <input
                  type="text"
                  autoComplete="name"
                  placeholder="YOUR NAME"
                  className="w-full h-16 px-6 rounded-2xl bg-white border-2 border-zinc-300 font-black uppercase text-sm outline-none focus:border-primary shadow-sm text-zinc-900"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 ml-1">Email (Optional)</Label>
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="YOU@EXAMPLE.COM"
                  className="w-full h-16 px-6 rounded-2xl bg-white border-2 border-zinc-300 font-black text-sm outline-none focus:border-primary shadow-sm text-zinc-900"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 ml-1">Contact Number (For Confirmation Call)</Label>
                <div className="relative group">
                  <Phone className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-600 transition-colors group-focus-within:text-primary" />
                  <input 
                    type="tel" 
                    placeholder="03000000000"
                    
                    className="w-full h-16 pl-14 pr-6 rounded-2xl bg-white border-2 border-zinc-300 font-black uppercase text-sm outline-none focus:border-primary transition-all shadow-sm text-zinc-900 placeholder:text-zinc-400"
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
                <p className="text-[9px] font-black text-zinc-500 uppercase tracking-tight ml-1">Use {PAKISTANI_PHONE_EXAMPLE}. Our manager will call to confirm.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 ml-1">Arrival Date</Label>
                <input 
                  type="date" 
                  min={new Date().toISOString().split('T')[0]} 
                  className="w-full h-16 px-6 rounded-2xl bg-white border-2 border-zinc-300 font-black uppercase text-sm outline-none focus:border-primary transition-all shadow-sm text-zinc-900"
                  value={date} 
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 ml-1">Arrival Time</Label>
                <select 
                  className="w-full h-16 px-6 rounded-2xl bg-white border-2 border-zinc-300 font-black uppercase text-sm outline-none appearance-none focus:border-primary transition-all shadow-sm text-zinc-900"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                >
                  <option value="" className="font-black">Time Slot</option>
                  {TIME_SLOTS.map(t => <option key={t} value={t} className="font-black uppercase">{fmt12(t)}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-2">
               <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 ml-1">Vehicle Info & Special Requests</Label>
               <Textarea 
                placeholder="E.G. LAND CRUISER 300, 2024, BLACK..."
                className="bg-white border-2 border-zinc-300 rounded-[2rem] p-8 focus:ring-0 resize-none font-black text-sm uppercase placeholder:text-zinc-400 h-40 transition-all focus:border-primary shadow-sm text-zinc-900"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
               />
            </div>

            <Button 
              className="w-full h-20 rounded-3xl font-black text-xl uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 active:scale-95 transition-all"
              disabled={submitting || !date || !time || !phone || !customerName}
              onClick={handleSubmit}
            >
              {submitting ? <Loader2 className="h-6 w-6 animate-spin" /> : 'Confirm Booking'}
            </Button>
          </div>
        )}

      </div>
    </div>
  );
};

export default Booking;
