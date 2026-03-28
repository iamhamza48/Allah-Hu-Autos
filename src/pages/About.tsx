import { Link } from 'react-router-dom';
import { Shield, Wrench, Truck, Star, MapPin, Phone, Clock, Calendar, Users, Award, ChevronRight } from 'lucide-react';

const STATS = [
  { value: '27+', label: 'Years in Business', icon: Calendar },
  { value: '500+', label: 'Products Available', icon: Award },
  { value: '2', label: 'Branches Nationwide', icon: MapPin },
  { value: '10K+', label: 'Happy Customers', icon: Users },
];

const VALUES = [
  {
    icon: Shield,
    title: 'Genuine Products',
    desc: 'Every item we stock is sourced from trusted suppliers. No counterfeits, no compromises — just quality accessories your car deserves.',
  },
  {
    icon: Wrench,
    title: 'Expert Installation',
    desc: 'Our trained technicians handle every fitment with care. Whether it\'s ambient lighting or a full body kit, we do it right.',
  },
  {
    icon: Truck,
    title: 'Nationwide Delivery',
    desc: 'We ship across Pakistan so you can get the accessories you need, wherever you are — Lahore, Karachi, Quetta and beyond.',
  },
  {
    icon: Star,
    title: 'Customer First',
    desc: 'We\'ve built our reputation on honest advice and after-sales support. We\'re not happy until you are.',
  },
];

const BRANCHES = [
  {
    city: 'Lahore',
    address: 'Bahria Town, Lahore, Punjab — 54000',
    phone: '0333 7778606',
    hours: 'Mon–Sat: 10AM – 9PM',
    dot: 'bg-orange-500',
    mapsLink: 'https://maps.google.com/?q=Bahria+Town+Lahore',
  },
  {
    city: 'Quetta',
    address: 'Near BA Mall, Quetta Cantonment, Balochistan',
    phone: '0333 7778606',
    hours: 'Mon–Sat: 10AM – 9PM',
    dot: 'bg-zinc-400',
    mapsLink: 'https://maps.google.com/?q=Quetta+Cantonment+Balochistan',
  },
];

const About = () => {
  return (
    <div className="bg-background">

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="relative bg-zinc-900 overflow-hidden">
        {/* dot grid */}
        <div className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        {/* glow */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 right-0 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="container relative z-10 py-16 sm:py-20">
          {/* breadcrumb */}
          <div className="flex items-center gap-1.5 text-[11px] text-white/40 mb-6 font-medium tracking-wide uppercase">
            <Link to="/" className="hover:text-white/70 transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-white/70">About Us</span>
          </div>

          <div className="max-w-2xl">
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-orange-500 mb-3">Est. 1997 · Lahore & Quetta</p>
            <h1 className="text-4xl sm:text-5xl font-black text-white leading-[1.08] tracking-tight mb-5">
              We Take Pride<br />
              in <span className="text-orange-500">Your Ride</span>
            </h1>
            <p className="text-base text-white/55 leading-relaxed max-w-xl">
              Allah-Hu-Autos has been Pakistan's go-to destination for premium automotive accessories for over 27 years. 
              From a single shop in Lahore to two branches serving customers nationwide — our passion for cars has never wavered.
            </p>
          </div>
        </div>
      </section>

      {/* ── Stats bar ─────────────────────────────────────────────────── */}
      <section className="bg-orange-500">
        <div className="container">
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-orange-400/40">
            {STATS.map(({ value, label, icon: Icon }) => (
              <div key={label} className="flex flex-col items-center justify-center gap-1 py-5 px-4">
                <Icon className="h-4 w-4 text-white/70 mb-0.5" />
                <p className="text-2xl font-black text-white leading-none">{value}</p>
                <p className="text-[11px] text-white/70 font-medium text-center">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Our Story ─────────────────────────────────────────────────── */}
      <section className="container py-16 sm:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Text */}
          <div>
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-orange-500 mb-3">Our Story</p>
            <h2 className="text-3xl font-black text-foreground leading-tight mb-6">
              From One Shop to<br />a Nationwide Name
            </h2>
            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
              <p>
                It started in 1997 with a small shop and a simple belief: Pakistani car owners deserve access to quality accessories at honest prices. 
                What began as a local business in Lahore quickly earned a reputation for genuine products and skilled installation.
              </p>
              <p>
                Word spread. Customers drove from across Punjab — and eventually from Balochistan — just to get the Allah-Hu-Autos experience. 
                That demand led us to open our second branch in Quetta, serving the south with the same commitment that built our name in Lahore.
              </p>
              <p>
                Today we carry 500+ products across lighting, exterior, interior, tech, and maintenance — all backed by our expert installation team 
                and our promise to stand behind every item we sell.
              </p>
            </div>

            <div className="flex gap-3 mt-8">
              <Link to="/products"
                className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-orange-500 hover:bg-orange-400 text-white text-sm font-semibold shadow-lg shadow-orange-500/25 transition-all">
                Shop Now <ChevronRight className="h-4 w-4" />
              </Link>
              <Link to="/booking"
                className="inline-flex items-center gap-2 h-10 px-5 rounded-xl border border-border hover:border-orange-500/50 hover:text-orange-500 text-sm font-semibold transition-all">
                Book Installation
              </Link>
            </div>
          </div>

          {/* Visual — timeline */}
          <div className="relative pl-6">
            <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-orange-500 via-orange-500/40 to-transparent" />
            {[
              { year: '1997', title: 'Founded in Lahore', desc: 'Opened our first shop in Lahore with a focus on quality and honest service.' },
              { year: '2005', title: 'Expanded product range', desc: 'Grew from basic accessories to a full catalogue covering lighting, audio, and body styling.' },
              { year: '2015', title: 'Quetta Branch opens', desc: 'Responded to growing demand from Balochistan by opening our second location.' },
              { year: '2024', title: 'Online store launches', desc: 'Brought the Allah-Hu-Autos experience online — shop from anywhere, delivered nationwide.' },
            ].map(({ year, title, desc }) => (
              <div key={year} className="relative pl-8 pb-10 last:pb-0">
                {/* dot */}
                <div className="absolute left-[-5px] top-1 w-2.5 h-2.5 rounded-full bg-orange-500 ring-4 ring-background" />
                <p className="text-xs font-bold text-orange-500 mb-0.5">{year}</p>
                <p className="text-sm font-bold text-foreground mb-1">{title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── Values ────────────────────────────────────────────────────── */}
      <section className="bg-secondary/40 border-y">
        <div className="container py-16">
          <div className="text-center mb-10">
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-orange-500 mb-2">Why Choose Us</p>
            <h2 className="text-3xl font-black text-foreground">What Sets Us Apart</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {VALUES.map(({ icon: Icon, title, desc }) => (
              <div key={title}
                className="bg-card border border-border rounded-2xl p-6 hover:border-orange-500/30 hover:shadow-md transition-all group">
                <div className="w-11 h-11 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-4 group-hover:bg-orange-500/20 transition-colors">
                  <Icon className="h-5 w-5 text-orange-500" />
                </div>
                <h3 className="font-bold text-foreground mb-2 text-sm">{title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Branches ──────────────────────────────────────────────────── */}
      <section className="container py-16 sm:py-20">
        <div className="text-center mb-10">
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-orange-500 mb-2">Find Us</p>
          <h2 className="text-3xl font-black text-foreground">Our Branches</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-3xl mx-auto">
          {BRANCHES.map(({ city, address, phone, hours, dot, mapsLink }) => (
            <div key={city} className="bg-card border border-border rounded-2xl overflow-hidden hover:border-orange-500/30 hover:shadow-md transition-all group">
              {/* Coloured top strip */}
              <div className={`h-1 w-full ${dot === 'bg-orange-500' ? 'bg-orange-500' : 'bg-zinc-400'}`} />
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className={`w-2 h-2 rounded-full ${dot}`} />
                  <h3 className="font-bold text-foreground">{city} Branch</h3>
                </div>
                <div className="space-y-2.5">
                  <div className="flex items-start gap-2.5 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 text-orange-500 mt-0.5 shrink-0" />
                    <span>{address}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                    <Phone className="h-3.5 w-3.5 text-orange-500 shrink-0" />
                    <a href={`tel:${phone.replace(/\s/g, '')}`} className="hover:text-orange-500 transition-colors">{phone}</a>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5 text-orange-500 shrink-0" />
                    <span>{hours}</span>
                  </div>
                </div>
                <a href={mapsLink} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 mt-5 text-xs font-semibold text-orange-500 hover:text-orange-400 transition-colors group-hover:gap-2">
                  Get Directions <ChevronRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────── */}
      <section className="bg-zinc-900 border-t border-zinc-800">
        <div className="container py-14 text-center">
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">
            Ready to upgrade your ride?
          </h2>
          <p className="text-sm text-zinc-500 mb-8 max-w-md mx-auto">
            Browse 500+ accessories or book a professional installation at your nearest branch.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link to="/categories"
              className="inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-orange-500 hover:bg-orange-400 text-white text-sm font-bold shadow-lg shadow-orange-500/30 transition-all">
              Browse Products <ChevronRight className="h-4 w-4" />
            </Link>
            <Link to="/booking"
              className="inline-flex items-center gap-2 h-11 px-6 rounded-xl border border-zinc-700 hover:border-orange-500/50 text-zinc-300 hover:text-orange-400 text-sm font-bold transition-all">
              <Wrench className="h-4 w-4" /> Book Installation
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default About;