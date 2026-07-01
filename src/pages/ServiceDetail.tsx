import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Clock3, MapPin, Phone, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { INSTALLATION_SERVICES } from '@/lib/installation-services';
import { supabase } from '@/lib/supabase';
import { formatPKR } from '@/lib/format';
import { getBranchFields } from '@/lib/branch-utils';
import SEO, { SITE_URL } from '@/components/SEO';

interface BranchOption { id: string; name: string; city: string; address: string; }
interface ServiceRecord { base_price: number; description: string | null; images?: { url: string }[]; }

const ServiceDetail = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const service = useMemo(() => INSTALLATION_SERVICES.find(item => item.id === serviceId), [serviceId]);
  const [record, setRecord] = useState<ServiceRecord | null>(null);
  const [branches, setBranches] = useState<BranchOption[]>([]);
  const [branchId, setBranchId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!service) return;
    Promise.all([
      supabase.from('products').select('base_price,description,images:product_images(url)').eq('slug', `service-${service.id}`).maybeSingle(),
      supabase.from('branches').select('id,name,city,address').eq('is_active', true).order('name'),
    ]).then(([serviceResult, branchResult]) => {
      setRecord(serviceResult.data as ServiceRecord | null);
      setBranches((branchResult.data || []) as BranchOption[]);
      setLoading(false);
    });
  }, [service]);

  if (!service) return <Navigate to="/car-modification" replace />;
  if (loading) return <div className="container py-20"><div className="h-96 animate-pulse rounded-3xl bg-muted" /></div>;

  const images = record?.images?.map(image => image.url).filter(Boolean) || [];
  const displayImages = images.length > 0 ? images.slice(0, 2) : [service.image];
  const selectedBranch = branches.find(branch => branch.id === branchId);
  const bookingUrl = `/booking?service=${encodeURIComponent(service.bookingName)}&branch=${encodeURIComponent(branchId)}`;
  const price = record?.base_price ?? service.demoPrice;

  return (
    <div className="bg-background">
      <SEO
        title={`${service.title} Service`}
        description={`${service.summary} Book ${service.title.toLowerCase()} at Allah-Hu-Autos in Quetta or Lahore with expert installation.`}
        canonicalPath={`/car-modification/${service.id}`}
        image={displayImages[0]}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Service',
          name: service.title,
          description: record?.description || service.summary,
          provider: {
            '@type': 'AutoPartsStore',
            name: 'Allah-Hu-Autos',
            url: SITE_URL,
            telephone: '+923337778606',
          },
          areaServed: ['Quetta', 'Lahore', 'Pakistan'],
          offers: {
            '@type': 'Offer',
            price,
            priceCurrency: 'PKR',
            availability: 'https://schema.org/InStock',
          },
        }}
      />
      <div className="container py-6 sm:py-10">
        <Link to="/car-modification" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary"><ArrowLeft className="h-4 w-4" /> All services</Link>

        <div className="grid gap-7 lg:grid-cols-[1.15fr_0.85fr] lg:gap-10">
          <div>
            <div className={`grid gap-3 ${displayImages.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
              {displayImages.map((image, index) => <img key={`${image}-${index}`} src={image} alt={`${service.title}${index ? ' alternate view' : ''}`} className={`w-full rounded-2xl object-cover ${displayImages.length > 1 ? 'aspect-square' : 'aspect-[4/3]'}`} />)}
            </div>
            <div className="mt-7">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Car Modification & Styling</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-5xl">{service.title}</h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">{record?.description || service.summary}</p>
            </div>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {service.includes.map(item => <div key={item} className="flex items-center gap-2 rounded-xl border bg-card p-3 text-sm"><Check className="h-4 w-4 shrink-0 text-emerald-600" />{item}</div>)}
            </div>
          </div>

          <aside className="h-fit rounded-3xl border bg-card p-5 shadow-lg sm:p-7 lg:sticky lg:top-28">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Starting from</p>
            <p className="mt-1 text-3xl font-black text-primary">{formatPKR(record?.base_price ?? service.demoPrice)}</p>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">Final price depends on vehicle, material and required coverage. We confirm it before starting work.</p>

            <div className="mt-5 flex items-center gap-2 rounded-xl bg-muted/60 p-3 text-sm"><Clock3 className="h-4 w-4 text-primary" /><span><strong>Estimated time:</strong> {service.duration}</span></div>

            <div className="mt-6">
              <h2 className="font-black">Select your branch</h2>
              <p className="mt-1 text-xs text-muted-foreground">Choose where you would like the service performed.</p>
              <div className="mt-3 space-y-2">
                {branches.map(branch => {
                  const fields = getBranchFields(branch.address);
                  return <button key={branch.id} type="button" onClick={() => setBranchId(branch.id)} className={`w-full rounded-xl border-2 p-4 text-left transition-colors ${branchId === branch.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'}`}>
                    <span className="flex items-center gap-2 font-bold"><MapPin className="h-4 w-4 text-primary" />{branch.name}</span>
                    <span className="mt-1 block text-xs leading-5 text-muted-foreground">{fields.address || branch.city}</span>
                  </button>;
                })}
              </div>
            </div>

            <Button asChild={!!branchId} disabled={!branchId} className="mt-6 h-12 w-full rounded-xl font-bold">
              {branchId ? <Link to={bookingUrl}>Choose date & time <ArrowRight className="ml-2 h-4 w-4" /></Link> : <span>Select a branch to continue</span>}
            </Button>
            {selectedBranch && <p className="mt-3 text-center text-xs text-muted-foreground"><ShieldCheck className="mr-1 inline h-3.5 w-3.5" />Booking at {selectedBranch.name}</p>}
            <a href="tel:03337778606" className="mt-4 flex items-center justify-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary"><Phone className="h-4 w-4" /> Need advice? Call us</a>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetail;
