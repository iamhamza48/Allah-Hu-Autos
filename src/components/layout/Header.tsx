import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingCart, Search, Menu, X,
  Phone, MapPin,
  ChevronDown, Heart, ChevronRight, ArrowRight,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useCartStore } from '@/stores/cart';
import { useWishlistStore } from '@/stores/wishlist';
import { supabase } from '@/lib/supabase';
import type { Product } from '@/types/database';
import { formatPKR } from '@/lib/format';
import ThemeToggle from '@/components/ThemeToggle';

interface SubCategory { id: string; name: string; slug: string; }
interface NavCategory { id: string; name: string; slug: string; icon?: string; subcategories: SubCategory[]; }

const CATEGORY_GROUPS: Record<string, { label: string; icon?: string; slugs: string[] }> = {
  lighting: { label: 'Lighting', slugs: ['ambient-lights', 'led-lights', 'fog-lamps'] },
  exterior: { label: 'Exterior', slugs: ['body-kits', 'exhaust-tips', 'antennas', 'batman-mirror-covers', 'number-plate-frames', 'side-mirror-accessories', 'window-tints', 'window-shades'] },
  interior: { label: 'Interior', slugs: ['car-mats', 'steering-covers', 'dashboard-accessories', 'door-accessories', 'interior-accessories', 'tissue-box-holders', 'key-covers', 'car-perfumes'] },
  tech: { label: 'Tech & Gadgets', slugs: ['cameras', 'car-audio', 'car-chargers', 'phone-holders', 'security-systems'] },
  maintenance: { label: 'Maintenance', slugs: ['brake-accessories', 'tow-accessories', 'tyre-battery-tools', 'horns', 'car-care-products'] },
};

// ── Viewport-aware MegaMenu ───────────────────────────────────────────────────
const MegaMenu = ({
  category,
  onClose,
  anchorRef,
}: {
  category: NavCategory;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLDivElement | null>;
}) => {
  const [alignRight, setAlignRight] = useState(false);

  useEffect(() => {
    if (!anchorRef.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    const dropdownWidth = 420;
    setAlignRight(rect.left + dropdownWidth > window.innerWidth - 16);
  }, [anchorRef]);

  return (
    <div
      className={`absolute top-full w-[420px] max-w-[calc(100vw-2rem)] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-xl rounded-b-xl z-50 border-t-[3px] border-t-blue-500 animate-dropdown-in ${alignRight ? 'right-0' : 'left-0'}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-gray-700">
        <Link
          to={`/category/${category.slug}`}
          onClick={onClose}
          className="flex items-center gap-2 font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm"
        >
          {category.name}
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
        <span className="text-[11px] text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
          {category.subcategories.length} categories
        </span>
      </div>

      {/* Grid of subcategories */}
      <div className="p-4 grid grid-cols-2 gap-x-4 gap-y-0.5">
        {category.subcategories.map((sub) => (
          <Link
            key={sub.id}
            to={`/category/${sub.slug}`}
            onClick={onClose}
            className="flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all group"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600 group-hover:bg-blue-500 transition-colors shrink-0" />
            {sub.name}
          </Link>
        ))}
      </div>

      {/* Footer CTA */}
      <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-xl">
        <Link
          to={`/category/${category.slug}`}
          onClick={onClose}
          className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
        >
          View all {category.name} <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
};

// ── Search Dropdown ─────────────────────────────────────────────────────────
const SearchDropdown = ({ onClose }: { onClose: () => void }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const timer = setTimeout(async () => {
      setSearching(true);
      const { data } = await supabase
        .from('products')
        .select('*, images:product_images(*)')
        .ilike('name', `%${query}%`)
        .limit(6);
      setResults(data || []);
      setSearching(false);
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="absolute top-full left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-xl animate-dropdown-in">
        <div className="container py-5">
          <form onSubmit={handleSubmit}>
            <div className="relative flex items-center">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search accessories, parts, brands..."
                className="w-full h-12 pl-12 pr-14 sm:pr-28 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm transition-all"
              />
              <div className="absolute right-2 flex items-center gap-2">
                {query && (
                  <button
                    type="submit"
                    className="hidden sm:flex h-8 px-3 rounded-lg bg-blue-600 text-white hover:bg-blue-500 text-xs font-semibold transition-colors items-center gap-1"
                  >
                    Search <ArrowRight className="h-3 w-3" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="h-8 w-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </form>

          {query.trim() && (
            <div className="mt-4">
              {searching ? (
                <div className="flex items-center gap-2 py-4 text-gray-500 text-sm">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  Searching...
                </div>
              ) : results.length === 0 ? (
                <p className="py-4 text-sm text-gray-500">No results for "<span className="text-gray-900 dark:text-white">{query}</span>"</p>
              ) : (
                <>
                  <p className="text-[11px] text-gray-400 uppercase tracking-widest font-semibold mb-3">
                    {results.length} results
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {results.map(p => {
                      const img = p.images?.[0]?.url;
                      return (
                        <Link
                          key={p.id}
                          to={`/product/${p.slug}`}
                          onClick={onClose}
                          className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
                        >
                          <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 shrink-0 overflow-hidden">
                            {img
                              ? <img src={img} alt={p.name} className="w-full h-full object-cover" />
                              : <div className="w-full h-full flex items-center justify-center text-gray-400"><Search className="h-4 w-4" /></div>
                            }
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm text-gray-900 dark:text-white font-medium line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{p.name}</p>
                            <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mt-0.5">{formatPKR(p.base_price)}</p>
                          </div>
                          <ChevronRight className="h-3.5 w-3.5 text-gray-400 group-hover:text-blue-500 shrink-0 transition-colors" />
                        </Link>
                      );
                    })}
                  </div>
                  {results.length === 6 && (
                    <button
                      type="button"
                      onClick={() => { navigate(`/search?q=${encodeURIComponent(query)}`); onClose(); }}
                      className="mt-3 w-full py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-400/50 text-gray-500 hover:text-blue-600 text-xs font-semibold transition-colors"
                    >
                      View all results for "{query}" →
                    </button>
                  )}
                </>
              )}
            </div>
          )}

          {!query.trim() && (
            <div className="mt-4 flex flex-wrap gap-2">
              <p className="text-[11px] text-gray-400 uppercase tracking-widest font-semibold w-full mb-1">Popular searches</p>
              {['LED Lights', 'Car Mats', 'Body Kits', 'Ambient Lights', 'Phone Holder', 'Dash Cam'].map(term => (
                <button
                  key={term}
                  type="button"
                  onClick={() => setQuery(term)}
                  className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-400/40 text-xs transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// ── Main Header ──────────────────────────────────────────────────────────────
const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileExpandedCat, setMobileExpandedCat] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [navCategories, setNavCategories] = useState<NavCategory[]>([]);
  const [navReload, setNavReload] = useState(0);
  const menuTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const catRefs = useRef<Record<string, React.RefObject<HTMLDivElement | null>>>({});

  const navigate = useNavigate();
  const location = useLocation();
  const itemCount = useCartStore((s) => s.getItemCount());
  const wishlistCount = useWishlistStore((s) => s.getCount());

  useEffect(() => {
    const fetchCategories = async () => {
      const { data: allCats, error } = await supabase
        .from('categories').select('id, name, slug, parent_id').order('name');
      if (error || !allCats) return;
      const hasParentId = allCats.some((c: any) => c.parent_id !== undefined && c.parent_id !== null);
      if (hasParentId) {
        const parents = allCats.filter((c: any) => !c.parent_id);
        setNavCategories(parents.map((p: any) => ({
          ...p,
          subcategories: allCats.filter((c: any) => c.parent_id === p.id),
        })));
      } else {
        const bySlug: Record<string, any> = {};
        for (const cat of allCats) bySlug[(cat as any).slug] = cat;
        setNavCategories(
          Object.entries(CATEGORY_GROUPS)
            .map(([slug, g]) => ({
              id: slug, name: g.label, slug, icon: g.icon,
              subcategories: g.slugs.map((s) => bySlug[s]).filter(Boolean),
            }))
            .filter((g) => g.subcategories.length > 0)
        );
      }
    };
    fetchCategories();
  }, [navReload]);

  useEffect(() => {
    const channel = supabase
      .channel('header-categories-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, () => {
        setNavReload((v) => v + 1);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setActiveMenu(null);
    setSearchOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setSearchOpen(false); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const getCatRef = (id: string): React.RefObject<HTMLDivElement | null> => {
    if (!catRefs.current[id]) {
      catRefs.current[id] = { current: null };
    }
    return catRefs.current[id];
  };

  const isActive = (to: string) => to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);
  const openMenu = (id: string) => { if (menuTimeout.current) clearTimeout(menuTimeout.current); setActiveMenu(id); };
  const closeMenu = () => { menuTimeout.current = setTimeout(() => setActiveMenu(null), 150); };
  const keepMenu = () => { if (menuTimeout.current) clearTimeout(menuTimeout.current); };

  return (
    <header className="sticky top-0 z-50 overflow-visible">

      {/* ── Top bar ─────────────────────────────────────────────────── */}
      <div className="bg-[#0B4DAE] text-white/90">
        <div className="container flex h-9 items-center justify-between text-[11px] font-medium">
          <a
            href="tel:03337778606"
            className="flex items-center gap-1.5 hover:text-white transition-colors group"
          >
            <Phone className="h-3 w-3 text-blue-200 group-hover:text-white transition-colors" />
            <span>0333 7778606</span>
          </a>
          <span className="hidden sm:flex items-center gap-2 text-blue-200 tracking-widest uppercase text-[10px]">
            <span className="w-4 h-px bg-blue-400/50" />
            We Take Pride in Your Ride
            <span className="w-4 h-px bg-blue-400/50" />
          </span>
          <div className="flex items-center gap-1.5 text-blue-200">
            <MapPin className="h-3 w-3" /> Lahore &amp; Quetta
          </div>
        </div>
      </div>

      {/* ── Main header ─────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm relative">
        <div className="container flex h-[62px] sm:h-[68px] items-center gap-2 sm:gap-4">

{/* Logo */}
<Link to="/" className="flex items-center gap-3 shrink-0">
  <div className="shrink-0 bg-[#0B4DAE] rounded-xl p-1.5">
    <img
      src="/logo.webp"
      alt="Allah-Hu-Autos"
      width="44"
      height="44"
      className="h-9 w-9 object-contain"
    />
  </div>
  <div className="hidden sm:block">
    <p className="text-[15px] font-black text-gray-900 dark:text-white leading-none tracking-tight">
      Allah-Hu-Autos
    </p>
    <p className="text-[10px] text-gray-400 dark:text-gray-500 leading-none mt-1 tracking-wide font-medium">
      We Take Pride in Your Ride
    </p>
  </div>
</Link>

          <div className="flex-1" />

          {/* Desktop: inline search bar for larger screens */}
          <div className="hidden lg:flex flex-1 max-w-sm mx-4">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="w-full flex items-center gap-3 h-10 px-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-400 text-sm hover:border-blue-400/50 hover:bg-gray-100 dark:hover:bg-gray-750 transition-all text-left"
            >
              <Search className="h-4 w-4 shrink-0" />
              <span className="flex-1">Search accessories...</span>
              <kbd className="hidden xl:flex items-center gap-0.5 text-[10px] text-gray-300 dark:text-gray-600 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded px-1.5 py-0.5 font-mono">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Icon actions */}
          <div className="flex items-center gap-0.5">

            {/* Search icon (mobile/md only) */}
            <button
              type="button"
              onClick={() => setSearchOpen(s => !s)}
              className={`lg:hidden flex items-center justify-center h-10 w-10 rounded-xl transition-all ${searchOpen
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              aria-label="Search"
            >
              {searchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
            </button>

            <div className="hidden sm:block"><ThemeToggle /></div>

            {/* About Us — desktop */}
            <Link to="/about" className="hidden md:flex">
              <button type="button" className={`flex items-center h-10 px-3 rounded-xl text-[13px] font-medium transition-all ${isActive('/about')
                ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}>
                About
              </button>
            </Link>

            {/* Wishlist */}
            <Link to="/wishlist" className="hidden sm:block">
              <button type="button" className="relative flex items-center justify-center h-10 w-10 rounded-xl text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all group" aria-label="Wishlist">
                <Heart className="h-5 w-5 group-hover:scale-110 transition-transform" />
                {wishlistCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white shadow-md">
                    {wishlistCount}
                  </span>
                )}
              </button>
            </Link>

            {/* Cart */}
            <Link to="/cart">
              <button type="button" className="relative flex items-center justify-center h-10 w-10 rounded-xl text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all group" aria-label="Cart">
                <ShoppingCart className="h-5 w-5 group-hover:scale-110 transition-transform" />
                {itemCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[9px] font-bold text-white shadow-md shadow-blue-600/30">
                    {itemCount}
                  </span>
                )}
              </button>
            </Link>

            <div className="hidden sm:block w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1" />

            {/* Mobile toggle */}
            <button
              type="button"
              className="md:hidden flex items-center justify-center h-10 w-10 rounded-xl text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all ml-1"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Search dropdown */}
        {searchOpen && <SearchDropdown onClose={() => setSearchOpen(false)} />}
      </div>

      {/* ── Nav strip ───────────────────────────────────────────────── */}
      <nav className="hidden md:block bg-[#0B4DAE] border-b border-blue-700/30 relative overflow-visible">
        <div className="container flex h-11 items-center justify-between">

          {/* Left: primary nav links */}
          <div className="flex items-center h-full">
            {[
              { to: '/', label: 'Home' },
              { to: '/products', label: 'Shop' },
              { to: '/categories', label: 'Categories' },
              { to: '/booking', label: 'Book Install' },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`relative h-full flex items-center px-4 text-[13px] font-medium transition-colors ${isActive(item.to)
                  ? 'text-white'
                  : 'text-blue-200 hover:text-white'
                  }`}
              >
                {item.label}
                {isActive(item.to) && (
                  <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-white rounded-full" />
                )}
              </Link>
            ))}

            {/* Divider */}
            <div className="h-4 w-px bg-blue-400/30 mx-1" />

            {/* Category dropdowns */}
            {navCategories.slice(0, 5).map((cat) => {
              const ref = getCatRef(cat.id);
              return (
                <div
                  key={cat.id}
                  ref={ref as React.RefObject<HTMLDivElement>}
                  className="relative h-full flex items-center shrink-0"
                  onMouseEnter={() => openMenu(cat.id)}
                  onMouseLeave={closeMenu}
                >
                  <button
                    type="button"
                    onClick={() => navigate(`/category/${cat.slug}`)}
                    className={`relative flex items-center gap-1.5 h-full px-3 text-[12px] font-medium transition-colors whitespace-nowrap ${location.pathname.startsWith(`/category/${cat.slug}`)
                      ? 'text-white'
                      : 'text-blue-200 hover:text-white'
                      }`}
                  >
                    {cat.name}
                    {cat.subcategories.length > 0 && (
                      <ChevronDown className={`h-3 w-3 transition-transform duration-150 ${activeMenu === cat.id ? 'rotate-180 text-white' : 'text-blue-300'}`} />
                    )}
                    {location.pathname.startsWith(`/category/${cat.slug}`) && (
                      <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-white rounded-full" />
                    )}
                  </button>
                  {activeMenu === cat.id && cat.subcategories.length > 0 && (
                    <div className="absolute top-full" onMouseEnter={keepMenu} onMouseLeave={closeMenu}>
                      <MegaMenu category={cat} onClose={() => setActiveMenu(null)} anchorRef={ref} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right: contact pill */}
          <a
            href="tel:03337778606"
            className="flex items-center gap-1.5 px-3 h-7 rounded-full bg-white/10 border border-white/20 text-white text-[11px] font-semibold hover:bg-white/20 transition-colors shrink-0"
          >
            <Phone className="h-3 w-3" />
            Contact
          </a>
        </div>
      </nav>

      {/* ── Mobile menu ─────────────────────────────────────────────── */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 max-h-[80vh] overflow-y-auto shadow-xl">
          {/* Mobile search */}
          <div className="px-4 pt-4 pb-2">
            <button
              type="button"
              onClick={() => { setMobileMenuOpen(false); setSearchOpen(true); }}
              className="w-full flex items-center gap-3 h-10 px-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 text-sm hover:border-blue-400/40 transition-colors"
            >
              <Search className="h-4 w-4" />
              Search accessories...
            </button>
          </div>

          <div className="px-2 pb-1 space-y-0.5">
            {[
              { to: '/', label: 'Home' },
              { to: '/products', label: 'Shop' },
              { to: '/categories', label: 'Categories' },
              { to: '/about', label: 'About' },
              { to: '/wishlist', label: 'Wishlist' },
              { to: '/booking', label: 'Book Installation' },
            ].map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive(to)
                  ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                  }`}
              >
                {label}
                {isActive(to) && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />}
              </Link>
            ))}
          </div>

          {navCategories.length > 0 && (
            <div className="px-2 pb-4">
              <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold px-3 pt-4 pb-2">Shop by Category</p>
              {navCategories.map((cat) => (
                <div key={cat.id}>
                  <button
                    type="button"
                    onClick={() => setMobileExpandedCat(mobileExpandedCat === cat.id ? null : cat.id)}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <span>{cat.name}</span>
                    {cat.subcategories.length > 0 && (
                      <ChevronDown className={`h-3.5 w-3.5 text-gray-400 transition-transform ${mobileExpandedCat === cat.id ? 'rotate-180' : ''}`} />
                    )}
                  </button>
                  {mobileExpandedCat === cat.id && (
                    <div className="ml-4 pl-3 border-l border-gray-200 dark:border-gray-700 mb-1 space-y-0.5">
                      <Link to={`/category/${cat.slug}`} className="flex items-center px-3 py-1.5 rounded text-xs text-blue-600 dark:text-blue-400 font-semibold hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors">View all {cat.name} →</Link>
                      {cat.subcategories.map((sub) => (
                        <Link key={sub.id} to={`/category/${sub.slug}`} className="flex items-center px-3 py-1.5 rounded text-xs text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">{sub.name}</Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="px-2 pb-4 pt-1 border-t border-gray-100 dark:border-gray-700">
            <a href="tel:03337778606" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors">
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/25 flex items-center justify-center shrink-0">
                <Phone className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              </div>
              0333 7778606
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
