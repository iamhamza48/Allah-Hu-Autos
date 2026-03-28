import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, ChevronDown, ExternalLink } from 'lucide-react';

const BRANCHES = [
  {
    id: 'lahore',
    name: 'Lahore Branch',
    address: 'Bahria Town, Lahore, Punjab, Pakistan — 54000',
    phone: '0333 7778606',
    hours: 'Mon–Sat: 10AM – 9PM',
    mapSrc: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3405.8465052956794!2d74.1802951762744!3d31.39081575388062!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3918ff0046555555%3A0xe5f9226500000000!2sAllah%20Hu%20Autos!5e0!3m2!1sen!2spk!4v1710000000000!5m2!1sen!2spk',
    mapsLink: 'https://maps.app.goo.gl/YourLinkHere',
    dot: 'bg-orange-500',
  },
  {
    id: 'quetta',
    name: 'Quetta Branch',
    address: 'Near BA Mall, Quetta Cantonment, Balochistan, Pakistan',
    phone: '0333 7778606',
    hours: 'Mon–Sat: 10AM – 9PM',
    mapSrc: 'https://www.google.com/maps/embed?pb=...',
    mapsLink: 'https://maps.app.goo.gl/YourLinkHere',
    dot: 'bg-zinc-400',
  },
];

const BranchCard = ({ branch }: { branch: typeof BRANCHES[0] }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="w-full rounded-xl border border-zinc-800 overflow-hidden bg-zinc-900/60">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-zinc-800/60 transition-colors text-left"
      >
        <span className={`w-2 h-2 rounded-full shrink-0 ${branch.dot} shadow-lg shadow-orange-500/20`} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white">{branch.name}</p>
          <p className="text-xs text-zinc-500 truncate">{branch.address.split(',')[0]}</p>
        </div>
        <ChevronDown className={`h-4 w-4 text-zinc-500 shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>

      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${open ? 'max-h-[400px]' : 'max-h-0'}`}>
        <div className="border-t border-zinc-800">
          <div className="relative w-full h-44 bg-zinc-800">
            <iframe src={branch.mapSrc} width="100%" height="100%" style={{ border: 0, display: 'block' }} allowFullScreen loading="lazy" title={`Map — ${branch.name}`} />
            <a href={branch.mapsLink} target="_blank" rel="noopener noreferrer" className="absolute bottom-2 right-2 flex items-center gap-1 bg-zinc-900/90 backdrop-blur border border-zinc-700 text-zinc-300 hover:text-orange-400 text-[10px] font-medium px-2 py-1 rounded-full transition-colors">
              <ExternalLink className="h-2.5 w-2.5" /> Open in Maps
            </a>
          </div>
          <div className="px-4 py-3 space-y-1.5 bg-zinc-900/40">
            <div className="flex items-start gap-2 text-xs text-zinc-400">
              <MapPin className="h-3.5 w-3.5 text-orange-500 mt-0.5 shrink-0" />
              <span>{branch.address}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <Phone className="h-3.5 w-3.5 text-orange-500 shrink-0" />
              <a href={`tel:${branch.phone.replace(/\s/g, '')}`} className="hover:text-orange-400 transition-colors">{branch.phone}</a>
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <Clock className="h-3.5 w-3.5 text-orange-500 shrink-0" />
              <span>{branch.hours}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Footer = () => {
  return (
    <footer className="w-full bg-[#0a0a0a] text-zinc-400 border-t border-zinc-800/60 font-sans overflow-hidden">
      <div className="container px-4 md:px-6 py-16 lg:py-20 mx-auto">
        <div className="grid grid-cols-12 gap-10 lg:gap-8 items-start">

          {/* Brand Section */}
          <div className="col-span-12 lg:col-span-4 lg:pr-8">
            <div className="flex items-start gap-5 mb-6">
              <img
                src="/logo.png"
                alt="Allah-Hu-Autos"
                className="h-24 w-24 object-contain rounded-2xl bg-white/5 p-2 shadow-2xl shadow-orange-500/10 shrink-0"
              />
              <div className="pt-2"> 
                <h3 className="font-black text-white text-xl leading-tight tracking-tight">Allah-Hu-Autos</h3>
                <p className="text-xs text-orange-500 font-bold leading-tight tracking-[0.15em] uppercase mt-1">
                  We Take Pride in Your Ride
                </p>
              </div>
            </div>

            <p className="text-sm text-zinc-500 leading-relaxed mb-8 max-w-sm">
              Pakistan's premium destination for automotive accessories. 
              Delivering high-quality products and expert installation nationwide since 1997.
            </p>

            <div className="flex flex-col gap-4">
              <a href="mailto:info@allahhuautos.pk" className="inline-flex items-center gap-3 text-sm text-zinc-400 hover:text-orange-400 transition-all group w-fit">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 group-hover:border-orange-500/50 transition-colors">
                  <Mail className="h-4 w-4 text-orange-500 shrink-0" />
                </div>
                info@allahhuautos.pk
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-span-6 md:col-span-3 lg:col-span-2 pt-2">
            <h4 className="font-bold text-white text-base mb-6">Quick Links</h4>
            <ul className="space-y-3">
              {[{ to: '/categories', label: 'Categories' }, { to: '/products', label: 'Products' }, { to: '/booking', label: 'Book Installation' }, { to: '/search', label: 'Search' }].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-sm text-zinc-500 hover:text-orange-400 transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-800 group-hover:bg-orange-500 transition-colors" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div className="col-span-6 md:col-span-3 lg:col-span-2 pt-2">
            <h4 className="font-bold text-white text-base mb-6">Account</h4>
            <ul className="space-y-3">
              {[{ to: '/account', label: 'My Account' }, { to: '/account/orders', label: 'My Orders' }, { to: '/account/bookings', label: 'My Bookings' }, { to: '/cart', label: 'Cart' }].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-sm text-zinc-500 hover:text-orange-400 transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-800 group-hover:bg-orange-500 transition-colors" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Our Locations */}
          <div className="col-span-12 md:col-span-6 lg:col-span-4 pt-2">
            <div className="mb-6">
              <h4 className="font-bold text-white text-base mb-1">Our Branches</h4>
              <p className="text-xs text-zinc-500">Click a branch to view location and hours</p>
            </div>
            <div className="space-y-3 w-full">
              {BRANCHES.map(branch => (
                <BranchCard key={branch.id} branch={branch} />
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-zinc-800/60 bg-[#111111]">
        <div className="container px-4 md:px-6 mx-auto flex flex-col sm:flex-row min-h-[60px] py-4 items-center justify-between gap-3 text-xs text-zinc-500 font-medium">
          <p>© {new Date().getFullYear()} Allah-Hu-Autos. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            Made with <span className="text-orange-500 animate-pulse">♥</span> in Pakistan
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;