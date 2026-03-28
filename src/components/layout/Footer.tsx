import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, ChevronDown, ExternalLink } from 'lucide-react';

const BRANCHES = [
  { id: 'lahore', name: 'Lahore Branch', addr: 'Bahria Town, Lahore, Punjab, Pakistan — 54000', phone: '0333 7778606', hrs: 'Mon–Sat: 10AM – 9PM', map: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3405.8465052956794!2d74.1802951762744!3d31.39081575388062!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3918ff0046555555%3A0xe5f9226500000000!2sAllah%20Hu%20Autos!5e0!3m2!1sen!2spk!4v1710000000000!5m2!1sen!2spk', link: 'https://www.google.com/maps/place/Allah+Hu+Autos/@31.3917756,74.1885451,17z/data=!4m6!3m5!1s0x3918ff001005566b:0xe0ba911de79f9394!8m2!3d31.3917756!4d74.1885451!16s%2Fg%2F11mm0mclfm?entry=ttu&g_ep=EgoyMDI2MDMyNC4wIKXMDSoASAFQAw%3D%3D', dot: 'bg-orange-500' },
  { id: 'quetta', name: 'Quetta Branch', addr: 'Near BA Mall, Quetta Cantonment, Balochistan, Pakistan', phone: '0333 7778606', hrs: 'Mon–Sat: 10AM – 9PM', map: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3405.8465052956794!2d74.1802951762744!3d31.39081575388062!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3918ff0046555555%3A0xe5f9226500000000!2sAllah%20Hu%20Autos!5e0!3m2!1sen!2spk!4v1710000000000!5m2!1sen!2spk', link: 'https://www.google.com/maps/place/Allah+Hu+Autos/@30.1815671,66.9986468,17z/data=!4m15!1m8!3m7!1s0x3ed2e127522321e5:0x65cbabe21b94e1f0!2sAllah+Hu+Autos!8m2!3d30.1813812!4d66.9986345!10e5!16s%2Fg%2F11hzlywvsn!3m5!1s0x3ed2e127522321e5:0x65cbabe21b94e1f0!8m2!3d30.1813812!4d66.9986345!16s%2Fg%2F11hzlywvsn?entry=ttu&g_ep=EgoyMDI2MDMyNC4wIKXMDSoASAFQAw%3D%3D', dot: 'bg-zinc-400' },
];

const LINK_SECTIONS = [
  { title: 'Quick Links', links: [['/categories', 'Categories'], ['/products', 'Products'], ['/booking', 'Book Installation'], ['/search', 'Search']] },
  { title: 'Account', links: [['/account', 'My Account'], ['/account/orders', 'My Orders'], ['/account/bookings', 'My Bookings'], ['/cart', 'Cart']] }
];

const BranchCard = ({ b }: { b: typeof BRANCHES[0] }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="w-full rounded-lg border border-zinc-800 overflow-hidden bg-zinc-900/60 mb-3">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-3 py-3 hover:bg-zinc-800/60 transition-colors text-left"
      >
        <span className={`w-2 h-2 rounded-full shrink-0 ${b.dot}`} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{b.name}</p>
          <p className="text-xs text-zinc-500 truncate">{b.addr.split(',')[0]}</p>
        </div>
        <ChevronDown className={`h-4 w-4 text-zinc-500 shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="border-t border-zinc-800">
          {/* Map — fixed height, never overflows */}
          <div className="relative w-full" style={{ height: '160px' }}>
            <iframe
              src={b.map}
              className="absolute inset-0 w-full h-full border-0"
              allowFullScreen
              loading="lazy"
            />
            <a
              href={b.link}
              target="_blank"
              rel="noreferrer"
              className="absolute bottom-2 right-2 z-10 flex items-center gap-1 bg-zinc-900/90 backdrop-blur border border-zinc-700 text-zinc-300 hover:text-orange-400 text-[10px] px-2 py-1 rounded-full"
            >
              <ExternalLink className="h-2.5 w-2.5" /> Maps
            </a>
          </div>

          {/* Details */}
          <div className="px-3 py-3 space-y-2 bg-zinc-900/40">
            <div className="flex gap-2 text-xs text-zinc-400">
              <MapPin className="h-3.5 w-3.5 text-orange-500 shrink-0 mt-0.5" />
              <span className="break-words">{b.addr}</span>
            </div>
            <div className="flex gap-2 text-xs text-zinc-400">
              <Phone className="h-3.5 w-3.5 text-orange-500 shrink-0" />
              <a href={`tel:${b.phone.replace(/\s/g,'')}`} className="hover:text-orange-400">{b.phone}</a>
            </div>
            <div className="flex gap-2 text-xs text-zinc-400">
              <Clock className="h-3.5 w-3.5 text-orange-500 shrink-0" />
              <span>{b.hrs}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Footer = () => (
  <footer className="w-full bg-[#0a0a0a] text-zinc-400 border-t border-zinc-800/60">
    <div className="container px-4 md:px-6 py-10 lg:py-16 mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-6 items-start">

        {/* Brand */}
        <div className="sm:col-span-2 lg:col-span-4 lg:pr-6">
          <div className="flex items-center gap-4 mb-4">
            <img src="/logo.png" alt="Logo" className="h-16 w-16 object-contain rounded-xl bg-white/5 p-1.5 shadow-xl shrink-0" />
            <div>
              <h3 className="font-black text-white text-lg leading-tight">Allah-Hu-Autos</h3>
              <p className="text-[10px] text-orange-500 font-bold uppercase tracking-widest mt-0.5">We Take Pride in Your Ride</p>
            </div>
          </div>
          <p className="text-sm text-zinc-500 leading-relaxed mb-5">
            Pakistan's premium destination for automotive accessories. Quality products and expert installation nationwide since 1997.
          </p>
          <a href="mailto:info@allahhuautos.pk" className="inline-flex items-center gap-2 text-sm hover:text-orange-400 transition-colors">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800">
              <Mail className="h-3.5 w-3.5 text-orange-500" />
            </div>
            info@allahhuautos.pk
          </a>
        </div>

        {/* Link columns — each takes half on mobile, auto on lg */}
        {LINK_SECTIONS.map((section) => (
          <div key={section.title} className="lg:col-span-2">
            <h4 className="font-bold text-white text-sm mb-4">{section.title}</h4>
            <ul className="space-y-2.5">
              {section.links.map(([path, label]) => (
                <li key={path}>
                  <Link to={path} className="text-sm hover:text-orange-400 flex items-center gap-2 group transition-colors">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-700 group-hover:bg-orange-500 transition-colors shrink-0" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Branches — full width on mobile, col-span-4 on lg */}
        <div className="sm:col-span-2 lg:col-span-4">
          <div className="mb-4">
            <h4 className="font-bold text-white text-sm mb-1">Our Branches</h4>
            <p className="text-xs text-zinc-500">Click a branch to view location</p>
          </div>
          {/* max-w constrains on wide screens, full width on mobile */}
          <div className="w-full max-w-sm lg:max-w-none">
            {BRANCHES.map(b => <BranchCard key={b.id} b={b} />)}
          </div>
        </div>
      </div>
    </div>

    <div className="border-t border-zinc-800/60 bg-[#111111]">
      <div className="container px-4 md:px-6 mx-auto flex flex-col sm:flex-row py-4 justify-between gap-2 text-xs">
        <p>© {new Date().getFullYear()} Allah-Hu-Autos. All rights reserved.</p>
        <p className="flex items-center gap-1">Made with <span className="text-orange-500 mx-1">♥</span> in Pakistan</p>
      </div>
    </div>
  </footer>
);

export default Footer;