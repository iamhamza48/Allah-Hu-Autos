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
    mapSrc: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d108888.09443354553!2d74.17261!3d31.36320!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x391904b972f88ec5%3A0x7c7289bdebbf8f2b!2sBahria%20Town%20Lahore!5e0!3m2!1sen!2s!4v1700000000000',
    mapsLink: 'https://maps.google.com/?q=Bahria+Town+Lahore',
    color: 'from-orange-500/20 to-orange-500/5',
    dot: 'bg-orange-500',
  },
  {
    id: 'quetta',
    name: 'Quetta Branch',
    address: 'Near BA Mall, Quetta Cantonment, Balochistan, Pakistan',
    phone: '0333 7778606',
    hours: 'Mon–Sat: 10AM – 9PM',
    mapSrc: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d54973.32!2d66.99597!3d30.18414!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ed2ff07f4e0b5a1%3A0x6b0e16f6a0d2e7a0!2sQuetta%2C%20Balochistan!5e0!3m2!1sen!2s!4v1700000000001',
    mapsLink: 'https://maps.google.com/?q=Quetta+Cantonment+Balochistan',
    color: 'from-zinc-500/20 to-zinc-500/5',
    dot: 'bg-zinc-400',
  },
];

const BranchCard = ({ branch }: { branch: typeof BRANCHES[0] }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-zinc-800 overflow-hidden bg-zinc-900/60">
      {/* Toggle header */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-zinc-800/60 transition-colors text-left"
      >
        <span className={`w-2 h-2 rounded-full shrink-0 ${branch.dot} shadow-lg`} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white">{branch.name}</p>
          <p className="text-xs text-zinc-500 truncate">{branch.address.split(',')[0]}</p>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-zinc-500 shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Expandable content */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          open ? 'max-h-[400px]' : 'max-h-0'
        }`}
      >
        <div className="border-t border-zinc-800">
          {/* Map embed */}
          <div className="relative w-full h-44 bg-zinc-800">
            <iframe
              src={branch.mapSrc}
              width="100%"
              height="100%"
              style={{ border: 0, display: 'block' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={`Map — ${branch.name}`}
            />
            {/* Open in Maps link */}
            <a
              href={branch.mapsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-2 right-2 flex items-center gap-1 bg-zinc-900/90 backdrop-blur border border-zinc-700 text-zinc-300 hover:text-orange-400 hover:border-orange-500/40 text-[10px] font-medium px-2 py-1 rounded-full transition-colors"
            >
              <ExternalLink className="h-2.5 w-2.5" />
              Open in Maps
            </a>
          </div>

          {/* Branch details */}
          <div className="px-4 py-3 space-y-1.5 bg-zinc-900/40">
            <div className="flex items-start gap-2 text-xs text-zinc-400">
              <MapPin className="h-3.5 w-3.5 text-orange-500 mt-0.5 shrink-0" />
              <span>{branch.address}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <Phone className="h-3.5 w-3.5 text-orange-500 shrink-0" />
              <a href={`tel:${branch.phone.replace(/\s/g, '')}`} className="hover:text-orange-400 transition-colors">
                {branch.phone}
              </a>
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
    <footer className="bg-zinc-950 text-zinc-400 border-t border-zinc-800/60">
      <div className="container py-12">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">

          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <img
                src="/logo.png"
                alt="Allah-Hu-Autos"
                className="h-10 w-10 object-contain rounded-xl"
              />
              <div>
                <h3 className="font-black text-white text-base leading-tight">Allah-Hu-Autos</h3>
                <p className="text-[10px] text-zinc-600 leading-tight tracking-wide">We Take Pride in Your Ride</p>
              </div>
            </div>
            <p className="text-sm text-zinc-500 leading-relaxed mb-4">
              Pakistan's premium destination for automotive accessories. Quality products and expert installation since 1997.
            </p>
            <div className="flex items-center gap-2">
              <Mail className="h-3.5 w-3.5 text-orange-500 shrink-0" />
              <a href="mailto:info@allahhuautos.pk" className="text-xs text-zinc-500 hover:text-orange-400 transition-colors">
                info@allahhuautos.pk
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-white text-sm mb-4">Quick Links</h4>
            <ul className="space-y-2.5">
              {[
                { to: '/categories', label: 'Categories' },
                { to: '/products', label: 'Products' },
                { to: '/booking', label: 'Book Installation' },
                { to: '/search', label: 'Search' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-sm text-zinc-500 hover:text-orange-400 transition-colors flex items-center gap-1.5 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-zinc-700 group-hover:bg-orange-500 transition-colors" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="font-bold text-white text-sm mb-4">Account</h4>
            <ul className="space-y-2.5">
              {[
                { to: '/account', label: 'My Account' },
                { to: '/account/orders', label: 'My Orders' },
                { to: '/account/bookings', label: 'My Bookings' },
                { to: '/cart', label: 'Cart' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-sm text-zinc-500 hover:text-orange-400 transition-colors flex items-center gap-1.5 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-zinc-700 group-hover:bg-orange-500 transition-colors" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Our Locations */}
          <div>
            <h4 className="font-bold text-white text-sm mb-4">Our Branches</h4>
            <p className="text-xs text-zinc-600 mb-3">Click a branch to view location</p>
            <div className="space-y-2">
              {BRANCHES.map(branch => (
                <BranchCard key={branch.id} branch={branch} />
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-zinc-800/60">
        <div className="container flex flex-col sm:flex-row h-14 items-center justify-between gap-2 text-[11px] text-zinc-600">
          <p>© 2026 Allah-Hu-Autos. All rights reserved. Est. 1997.</p>
          <p className="flex items-center gap-1">
            Made with <span className="text-orange-500">♥</span> in Pakistan
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;