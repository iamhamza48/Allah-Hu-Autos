import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Clock3, Paintbrush, Phone, ShieldCheck, Sparkles, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { INSTALLATION_SERVICES } from '@/lib/installation-services';
import { supabase } from '@/lib/supabase';
import { formatPKR } from '@/lib/format';
import SEO from '@/components/SEO';

const iconCycle = [Paintbrush, ShieldCheck, Sparkles, Wrench];

const ModificationServices = () => {
  const [prices, setPrices] = useState<Record<string, number>>({});

  useEffect(() => {
    supabase.from('products').select('slug,base_price').like('slug', 'service-%').then(({ data }) => {
      setPrices(Object.fromEntries((data || []).map(item => [item.slug, item.base_price])));
    });
  }, []);

  return (
  <div className="bg-background">
    <SEO
      title="Car Modification & Styling Services"
      description="Explore car modification and styling services from Allah-Hu-Autos, including ambient lights, panels, seat covers and professional installation in Quetta and Lahore."
      canonicalPath="/car-modification"
    />
    <section className="relative overflow-hidden bg-gradient-to-br from-[#061b3a] via-[#0B4DAE] to-[#0871ce] text-white">
      <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
      <div className="container relative py-14 sm:py-20 lg:py-24">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-blue-200">Professional installation</p>
        <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">Car Modification <span className="text-cyan-200">& Styling</span></h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-blue-100/80 sm:text-lg">Explore our services, choose what your vehicle needs, and book a convenient visit. Our team will call before the appointment to confirm fitment, scope and pricing.</p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Button asChild size="lg" className="rounded-full bg-white text-blue-700 hover:bg-blue-50"><Link to="/booking">Book an installation <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
          <Button asChild size="lg" variant="outline" className="rounded-full border-white/30 bg-white/5 text-white hover:bg-white/10 hover:text-white"><a href="tel:03337778606"><Phone className="mr-2 h-4 w-4" /> Speak to an expert</a></Button>
        </div>
      </div>
    </section>

    <section className="container py-12 sm:py-16">
      <div className="mx-auto mb-9 max-w-2xl text-center">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Choose a service</p>
        <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Upgrades made straightforward</h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">No complicated quotation form. Select a service, choose a branch and time, then we confirm the details by phone.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {INSTALLATION_SERVICES.map((service, index) => {
          const Icon = iconCycle[index % iconCycle.length];
          return (
            <article key={service.id} id={service.id} className="flex h-full flex-col rounded-2xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon className="h-5 w-5" /></div>
              <h3 className="text-xl font-black tracking-tight">{service.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{service.summary}</p>
              <ul className="mt-4 space-y-2">
                {service.includes.map(item => <li key={item} className="flex gap-2 text-xs text-foreground/75"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />{item}</li>)}
              </ul>
              <div className="mt-5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground"><Clock3 className="h-3.5 w-3.5" />{service.duration}</div>
              <p className="mt-4 text-lg font-black text-primary">From {formatPKR(prices[`service-${service.id}`] ?? service.demoPrice)}</p>
              <Button asChild className="mt-4 w-full rounded-xl"><Link to={`/car-modification/${service.id}`}>View details <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
            </article>
          );
        })}
      </div>
    </section>
  </div>
  );
};

export default ModificationServices;
