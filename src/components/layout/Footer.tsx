import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, ChevronDown, ExternalLink } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getBranchFields } from '@/lib/branch-utils';

const FALLBACK_BRANCHES = [
  { id: 'lahore', name: 'Lahore Branch', address: '{"address":"Allah Hu Autos, near Jalyana Gate 1, Bahria Town, Lahore","map_iframe_url":"","map_link":"https://maps.app.goo.gl/5GZKe1i7sgRWhN7j6?g_st=iw","hours":"Mon–Sat: 10AM – 9PM"}', phone: '0333 7778606', city: 'Lahore', dot: 'bg-blue-300' },
  { id: 'quetta', name: 'Quetta Branch', address: '{"address":"Allah Hu Autos, Japan Market, Zarghoon Road, Quetta","map_iframe_url":"","map_link":"https://maps.app.goo.gl/jHYyyWoQPdav4hoP6?g_st=iw","hours":"Mon–Sat: 10AM – 9PM"}', phone: '0333 7778606', city: 'Quetta', dot: 'bg-blue-200/60' },
];

const LINK_SECTIONS = [
  { title: 'Quick Links', links: [['/categories', 'Categories'], ['/products', 'Products'], ['/booking', 'Book Installation'], ['/search', 'Search']] },
  { title: 'Customer Care', links: [['/cart', 'Cart'], ['/wishlist', 'Wishlist'], ['/booking', 'Book Installation'], ['/about', 'About Us']] }
];

const BranchCard = ({ b }: { b: any }) => {
  const [open, setOpen] = useState(false);
  const fields = getBranchFields(b.address);
  const hasMap = !!fields.map_iframe_url;
  
  return (
    <div className="w-full rounded-xl border border-blue-700/30 overflow-hidden bg-blue-800/30 mb-3 shadow-sm">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-3 py-3 hover:bg-blue-700/20 transition-colors text-left"
      >
        <span className={`w-2 h-2 rounded-full shrink-0 ${b.dot || 'bg-blue-300'}`} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{b.name}</p>
          <p className="text-xs text-blue-300 truncate">{fields.address || b.city || ''}</p>
        </div>
        <ChevronDown className={`h-4 w-4 text-blue-300 shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="border-t border-blue-700/30">
          {hasMap && (
            <div className="relative w-full" style={{ height: '160px' }}>
              <iframe
                src={fields.map_iframe_url}
                className="absolute inset-0 w-full h-full border-0"
                allowFullScreen
                loading="lazy"
                title={`Map ${b.name}`}
              />
              {fields.map_link && (
                <a
                  href={fields.map_link}
                  target="_blank"
                  rel="noreferrer"
                  className="absolute bottom-2 right-2 z-10 flex items-center gap-1 bg-white/95 backdrop-blur border border-gray-200 text-gray-600 hover:text-primary text-[10px] px-2 py-1 rounded-full transition-colors"
                >
                  <ExternalLink className="h-2.5 w-2.5" /> Directions
                </a>
              )}
            </div>
          )}

          <div className="px-3 py-3 space-y-2 bg-blue-800/20">
            <div className="flex gap-2 text-xs text-blue-200">
              <MapPin className="h-3.5 w-3.5 text-blue-300 shrink-0 mt-0.5" />
              <span className="break-words">{fields.address || '—'}</span>
            </div>
            {b.phone && (
              <div className="flex gap-2 text-xs text-blue-200">
                <Phone className="h-3.5 w-3.5 text-blue-300 shrink-0" />
                <a href={`tel:${b.phone.replace(/\s/g, '')}`} className="hover:text-white transition-colors">{b.phone}</a>
              </div>
            )}
            <div className="flex gap-2 text-xs text-blue-200">
              <Clock className="h-3.5 w-3.5 text-blue-300 shrink-0" />
              <span>{fields.hours}</span>
            </div>
            {fields.map_link && !hasMap && (
              <a
                href={fields.map_link}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-white hover:text-blue-200 transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5" /> View on Google Maps
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const Footer = () => {
  const [dbBranches, setDbBranches] = useState<any[]>([]);

  useEffect(() => {
    const fetchFooterBranches = async () => {
      try {
        const { data } = await supabase
          .from('branches')
          .select('*')
          .eq('is_active', true)
          .order('name');
        if (data && data.length > 0) {
          setDbBranches(data);
        }
      } catch (e) {
        console.error('Failed to load dynamic footer branches:', e);
      }
    };
    fetchFooterBranches();
  }, []);

  const activeBranches = dbBranches.length > 0 ? dbBranches : FALLBACK_BRANCHES;

  return (
    <footer className="w-full bg-[#0B4DAE] text-blue-100 border-t border-blue-700/20">
      <div className="container px-4 md:px-6 py-10 lg:py-16 mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-6 items-start">

          {/* Brand section */}
          <div className="sm:col-span-2 lg:col-span-4 lg:pr-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="shrink-0">
                <img src="/logo.webp" alt="Logo" width="72" height="72" loading="lazy" decoding="async" className="h-[4.5rem] w-[4.5rem] object-contain drop-shadow-md" />
              </div>
              <div>
                <h3 className="font-black text-white text-lg leading-tight">Allah-Hu-Autos</h3>
                <p className="text-[10px] text-blue-200 font-bold uppercase tracking-widest mt-0.5">We Take Pride in Your Ride</p>
              </div>
            </div>
            <p className="text-sm text-blue-200 leading-relaxed mb-5">
              Pakistan's premium destination for automotive accessories. Quality products and expert installation nationwide since 1997.
            </p>
            <a href="mailto:info@allahhuautos.pk" className="inline-flex items-center gap-2 text-sm text-blue-200 hover:text-white transition-colors">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 border border-white/20">
                <Mail className="h-3.5 w-3.5 text-blue-200" />
              </div>
              info@allahhuautos.pk
            </a>
          </div>

          {/* Link sections */}
          {LINK_SECTIONS.map((section) => (
            <div key={section.title} className="lg:col-span-2">
              <h4 className="font-bold text-white text-sm mb-4">{section.title}</h4>
              <ul className="space-y-2.5">
                {section.links.map(([path, label]) => (
                  <li key={path}>
                    <Link to={path} className="text-sm text-blue-200 hover:text-white flex items-center gap-2 group transition-colors">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400/50 group-hover:bg-white transition-colors shrink-0" />
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Branches */}
          <div className="sm:col-span-2 lg:col-span-4">
            <div className="mb-4">
              <h4 className="font-bold text-white text-sm mb-1">Our Branches</h4>
              <p className="text-xs text-blue-300">Click a branch to view location</p>
            </div>
            <div className="w-full max-w-sm lg:max-w-none">
              {activeBranches.map((b, idx) => (
                <BranchCard key={b.id || idx} b={b} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-blue-700/30 bg-[#083A8A]/40">
        <div className="container px-4 md:px-6 mx-auto flex flex-col sm:flex-row py-4 justify-between gap-2 text-xs text-blue-300">
          <p>© {new Date().getFullYear()} Allah-Hu-Autos. All rights reserved.</p>
          <p>Serving Pakistan with pride since 1997.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
