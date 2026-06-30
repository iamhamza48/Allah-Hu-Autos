import { Link } from 'react-router-dom';
import { Shield, Wrench, Truck, Star, MapPin, Phone, Clock, Calendar, Users, Award, ChevronRight } from 'lucide-react';

const STATS = [
  { value: '29+', label: 'Years in Business', icon: Calendar },
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
    dot: 'bg-primary',
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
      <section className="relative bg-gradient-to-br from-[#062F70] via-[#0B4DAE] to-[#073B89] overflow-hidden">
        {/* dot grid */}
        <div className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        {/* glow */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 right-0 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="container relative z-10 py-12 sm:py-20">
          {/* breadcrumb */}
          <div className="flex items-center gap-1.5 text-[11px] text-white/40 mb-6 font-medium tracking-wide uppercase">
            <Link to="/" className="hover:text-white/70 transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-white/70">About Us</span>
          </div>

          <div className="max-w-2xl">
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-blue-200 mb-3">Est. 1997 · Lahore & Quetta</p>
            <h1 className="text-3xl sm:text-5xl font-black text-white leading-[1.08] tracking-tight mb-5">
              We Take Pride<br />
              in <span className="text-cyan-200">Your Ride</span>
            </h1>
            <p className="text-sm sm:text-base text-white/80 leading-relaxed max-w-xl">
              Allah-Hu-Autos has been Pakistan's go-to destination for premium automotive accessories for over 29 years.
              From a single shop in Lahore to two branches serving customers nationwide — our passion for cars has never wavered.
            </p>
          </div>
        </div>
      </section>

      {/* ── Stats bar ─────────────────────────────────────────────────── */}
      <section className="bg-[#0A3F91] text-white">
        <div className="container">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-white/20">
            {STATS.map(({ value, label, icon: Icon }) => (
              <div key={label} className="flex flex-col items-center justify-center gap-1 bg-[#0A3F91] py-5 px-2 sm:px-4">
                <Icon className="h-4 w-4 text-blue-200 mb-0.5" />
                <p className="text-xl sm:text-2xl font-black text-white leading-none">{value}</p>
                <p className="text-[10px] sm:text-[11px] text-blue-100 font-medium text-center">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Founder ──────────────────────────────────────────────────── */}
      <section className="border-b border-border bg-card">
        <div className="container py-16 sm:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-10 lg:gap-16 items-center">
            <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
              <div className="absolute -inset-3 rounded-[2rem] bg-primary/10 blur-2xl" />
              <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] border border-border bg-slate-900 shadow-2xl">
                <img
                  src="/m-alli-malik-founder.jpeg"
                  alt="M. Asad Malik, founder of Allah-Hu-Autos"
                  className="h-full w-full object-cover object-top"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7 text-white">
                  <p className="text-xl sm:text-2xl font-black tracking-tight">M. Asad Malik</p>
                  <p className="text-xs sm:text-sm text-white/75 font-medium">Founder, Allah-Hu-Autos</p>
                </div>
              </div>
              <div className="absolute -right-3 -bottom-4 rounded-2xl border border-primary/20 bg-background px-5 py-3 shadow-xl">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Founded</p>
                <p className="text-2xl font-black text-primary leading-none">1997</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold tracking-[0.2em] uppercase text-primary mb-3">The Founder</p>
              <h2 className="text-3xl sm:text-4xl font-black text-foreground leading-tight mb-6">
                A Vision Built on Trust,<br className="hidden sm:block" /> Craftsmanship and Service
              </h2>
              <div className="space-y-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
                <p>
                  <strong className="text-foreground">M. Asad Malik founded Allah-Hu-Autos in 1997</strong> with a clear purpose:
                  to give car owners dependable products, honest guidance and workmanship they could trust.
                </p>
                <p>
                  What began as a focused automotive accessories shop grew through personal attention and a genuine understanding
                  of what customers need from their vehicles. His insistence on quality over shortcuts became the standard behind
                  every product, installation and customer relationship.
                </p>
                <p>
                  Nearly three decades later, that founding spirit still guides Allah-Hu-Autos—combining experience with modern
                  automotive style while treating every customer and every vehicle with care.
                </p>
              </div>
              <blockquote className="mt-7 border-l-4 border-primary pl-5 text-base font-semibold italic text-foreground/85">
                “A customer’s trust is earned through honest work, consistent quality and service that lasts beyond the sale.”
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* ── Our Story ─────────────────────────────────────────────────── */}
      <section className="container py-16 sm:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Text */}
          <div>
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-primary mb-3">Our Story</p>
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
                className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-primary text-white hover:bg-primary/90 text-sm font-semibold shadow-lg shadow-primary/25 transition-all">
                Shop Now <ChevronRight className="h-4 w-4" />
              </Link>
              <Link to="/booking"
                className="inline-flex items-center gap-2 h-10 px-5 rounded-xl border border-border hover:border-primary/50 hover:text-primary text-sm font-semibold transition-all">
                Book Installation
              </Link>
            </div>
          </div>

          {/* Visual — timeline */}
          <div className="relative pl-6">
            <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-primary via-primary/40 to-transparent" />
            {[
              { year: '1997', title: 'Founded in Lahore', desc: 'Opened our first shop in Lahore with a focus on quality and honest service.' },
              { year: '2005', title: 'Expanded product range', desc: 'Grew from basic accessories to a full catalogue covering lighting, audio, and body styling.' },
              { year: '2015', title: 'Quetta Branch opens', desc: 'Responded to growing demand from Balochistan by opening our second location.' },
              { year: '2024', title: 'Online store launches', desc: 'Brought the Allah-Hu-Autos experience online — shop from anywhere, delivered nationwide.' },
            ].map(({ year, title, desc }) => (
              <div key={year} className="relative pl-8 pb-10 last:pb-0">
                {/* dot */}
                <div className="absolute left-[-5px] top-1 w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-background" />
                <p className="text-xs font-bold text-primary mb-0.5">{year}</p>
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
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-primary mb-2">Why Choose Us</p>
            <h2 className="text-3xl font-black text-foreground">What Sets Us Apart</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {VALUES.map(({ icon: Icon, title, desc }) => (
              <div key={title}
                className="bg-card border border-border rounded-2xl p-6 hover:border-primary/30 hover:shadow-md transition-all group">
                <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Icon className="h-5 w-5 text-primary" />
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
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-primary mb-2">Find Us</p>
          <h2 className="text-3xl font-black text-foreground">Our Branches</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-3xl mx-auto">
          {BRANCHES.map(({ city, address, phone, hours, dot, mapsLink }) => (
            <div key={city} className="bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/30 hover:shadow-md transition-all group">
              {/* Coloured top strip */}
              <div className={`h-1 w-full ${dot === 'bg-primary' ? 'bg-primary' : 'bg-muted-foreground/40'}`} />
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className={`w-2 h-2 rounded-full ${dot}`} />
                  <h3 className="font-bold text-foreground">{city} Branch</h3>
                </div>
                <div className="space-y-2.5">
                  <div className="flex items-start gap-2.5 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                    <span>{address}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                    <Phone className="h-3.5 w-3.5 text-primary shrink-0" />
                    <a href={`tel:${phone.replace(/\s/g, '')}`} className="hover:text-primary transition-colors">{phone}</a>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>{hours}</span>
                  </div>
                </div>
                <a href={mapsLink} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 mt-5 text-xs font-semibold text-primary hover:text-primary/70 transition-colors group-hover:gap-2">
                  Get Directions <ChevronRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────── */}
      <section className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
        <div className="container py-14 text-center">
          <h2 className="text-2xl sm:text-3xl font-black text-foreground mb-3">
            Ready to upgrade your ride?
          </h2>
          <p className="text-sm text-muted-foreground mb-8 max-w-md mx-auto">
            Browse 500+ accessories or book a professional installation at your nearest branch.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link to="/categories"
              className="inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-primary text-white hover:bg-primary/90 text-sm font-bold shadow-lg shadow-primary/30 transition-all">
              Browse Products <ChevronRight className="h-4 w-4" />
            </Link>
            <Link to="/booking"
              className="inline-flex items-center gap-2 h-11 px-6 rounded-xl border border-border hover:border-primary/50 text-foreground/90 hover:text-primary text-sm font-bold transition-all">
              <Wrench className="h-4 w-4" /> Book Installation
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default About;
