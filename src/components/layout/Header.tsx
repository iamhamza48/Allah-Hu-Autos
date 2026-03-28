import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingCart, Search, User, Menu, X,
  LogOut, LayoutDashboard, Phone, MapPin,
  ChevronDown, Wrench, Heart, ChevronRight, ArrowRight,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { useCartStore } from '@/stores/cart';
import { useWishlistStore } from '@/stores/wishlist';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabase';
import type { Product } from '@/types/database';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatPKR } from '@/lib/format';

interface SubCategory { id: string; name: string; slug: string; }
interface NavCategory { id: string; name: string; slug: string; icon?: string; subcategories: SubCategory[]; }

const CATEGORY_GROUPS: Record<string, { label: string; icon?: string; slugs: string[] }> = {
  lighting:    { label: 'Lighting', slugs: ['ambient-lights','led-lights','fog-lamps'] },
  exterior:    { label: 'Exterior', slugs: ['body-kits','exhaust-tips','antennas','batman-mirror-covers','number-plate-frames','side-mirror-accessories','window-tints','window-shades'] },
  interior:    { label: 'Interior', slugs: ['car-mats','steering-covers','dashboard-accessories','door-accessories','interior-accessories','tissue-box-holders','key-covers','car-perfumes'] },
  tech:        { label: 'Tech & Gadgets', slugs: ['cameras','car-audio','car-chargers','phone-holders','security-systems'] },
  maintenance: { label: 'Maintenance', slugs: ['brake-accessories','tow-accessories','tyre-battery-tools','horns','car-care-products'] },
};

const MegaMenu = ({ category, onClose }: { category: NavCategory; onClose: () => void }) => (
  <div className="absolute top-full left-0 w-[480px] bg-white border border-zinc-200 shadow-2xl rounded-b-xl z-50" style={{borderTop: '2px solid #f97316'}}>
    <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-100">
      <Link to={`/category/${category.slug}`} onClick={onClose}
        className="flex items-center gap-2 font-bold text-zinc-900 hover:text-orange-500 transition-colors text-sm">
        {category.name}
        <ChevronRight className="h-3.5 w-3.5" />
      </Link>
      <span className="text-[11px] text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-full">
        {category.subcategories.length} categories
      </span>
    </div>
    <div className="p-4 grid grid-cols-2 gap-x-4 gap-y-0.5">
      {category.subcategories.map((sub) => (
        <Link key={sub.id} to={`/category/${sub.slug}`} onClick={onClose}
          className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm text-zinc-600 hover:text-orange-500 hover:bg-orange-50 transition-all group">
          <span className="w-1 h-1 rounded-full bg-zinc-300 group-hover:bg-orange-400 transition-colors shrink-0" />
          {sub.name}
        </Link>
      ))}
    </div>
    <div className="px-5 py-2.5 border-t border-zinc-100 bg-zinc-50 rounded-b-xl">
      <Link to={`/category/${category.slug}`} onClick={onClose}
        className="text-xs font-semibold text-orange-500 hover:text-orange-600 transition-colors">
        View all {category.name} →
      </Link>
    </div>
  </div>
);

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

  const handleResultClick = () => onClose();

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="absolute top-full left-0 right-0 z-50 bg-zinc-900 border-b border-zinc-800 shadow-2xl">
        <div className="container py-4">
          {/* Search input */}
          <form onSubmit={handleSubmit}>
            <div className="relative flex items-center">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 pointer-events-none" />
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search accessories, parts, brands..."
                className="w-full h-12 pl-12 pr-24 rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder:text-zinc-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-sm transition-all"
              />
              <div className="absolute right-2 flex items-center gap-2">
                {query && (
                  <button
                    type="submit"
                    className="h-8 px-3 rounded-lg bg-orange-500 hover:bg-orange-400 text-white text-xs font-semibold transition-colors flex items-center gap-1"
                  >
                    Search <ArrowRight className="h-3 w-3" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="h-8 w-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </form>

          {/* Results */}
          {query.trim() && (
            <div className="mt-3">
              {searching ? (
                <div className="flex items-center gap-2 py-4 text-zinc-500 text-sm">
                  <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                  Searching...
                </div>
              ) : results.length === 0 ? (
                <p className="py-4 text-sm text-zinc-500">No results for "<span className="text-white">{query}</span>"</p>
              ) : (
                <>
                  <p className="text-[11px] text-zinc-500 uppercase tracking-widest font-semibold mb-2">
                    {results.length} results
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {results.map(p => {
                      const img = p.images?.[0]?.url;
                      return (
                        <Link
                          key={p.id}
                          to={`/product/${p.slug}`}
                          onClick={handleResultClick}
                          className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-zinc-800 transition-colors group"
                        >
                          <div className="w-12 h-12 rounded-lg bg-zinc-700 shrink-0 overflow-hidden">
                            {img
                              ? <img src={img} alt={p.name} className="w-full h-full object-cover" />
                              : <div className="w-full h-full flex items-center justify-center text-zinc-500"><Search className="h-4 w-4" /></div>
                            }
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm text-white font-medium line-clamp-1 group-hover:text-orange-400 transition-colors">{p.name}</p>
                            <p className="text-xs text-orange-500 font-semibold mt-0.5">{formatPKR(p.base_price)}</p>
                          </div>
                          <ChevronRight className="h-3.5 w-3.5 text-zinc-600 group-hover:text-orange-400 shrink-0 transition-colors" />
                        </Link>
                      );
                    })}
                  </div>
                  {results.length === 6 && (
                    <button
                      onClick={() => { navigate(`/search?q=${encodeURIComponent(query)}`); onClose(); }}
                      className="mt-3 w-full py-2.5 rounded-xl border border-zinc-700 hover:border-orange-500/50 text-zinc-400 hover:text-orange-400 text-xs font-semibold transition-colors"
                    >
                      View all results for "{query}" →
                    </button>
                  )}
                </>
              )}
            </div>
          )}

          {/* Empty state hints */}
          {!query.trim() && (
            <div className="mt-3 flex flex-wrap gap-2">
              <p className="text-[11px] text-zinc-600 uppercase tracking-widest font-semibold w-full mb-1">Popular searches</p>
              {['LED Lights', 'Car Mats', 'Body Kits', 'Ambient Lights', 'Phone Holder', 'Dash Cam'].map(term => (
                <button
                  key={term}
                  onClick={() => setQuery(term)}
                  className="px-3 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-white hover:border-orange-500/40 text-xs transition-colors"
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
  const menuTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const itemCount = useCartStore((s) => s.getItemCount());
  const wishlistCount = useWishlistStore((s) => s.getCount());
  const { user, isAdmin, signOut } = useAuth();

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
  }, []);

  // Close everything on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setActiveMenu(null);
    setSearchOpen(false);
  }, [location.pathname]);

  // Close search on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setSearchOpen(false); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const isActive = (to: string) => to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);
  const openMenu = (id: string) => { if (menuTimeout.current) clearTimeout(menuTimeout.current); setActiveMenu(id); };
  const closeMenu = () => { menuTimeout.current = setTimeout(() => setActiveMenu(null), 150); };
  const keepMenu = () => { if (menuTimeout.current) clearTimeout(menuTimeout.current); };

  return (
    <header className="sticky top-0 z-50 overflow-visible">

      {/* ── Top bar ─────────────────────────────────────────────────── */}
      <div className="bg-zinc-950 text-zinc-400">
        <div className="container flex h-8 items-center justify-between text-[11px] font-medium">
          <a href="tel:03337778606" className="flex items-center gap-1.5 hover:text-orange-400 transition-colors group">
            <Phone className="h-3 w-3 text-orange-500" /> 0333 7778606
          </a>
          <span className="hidden sm:flex items-center gap-2 text-zinc-600 tracking-widest uppercase text-[10px]">
            <span className="w-4 h-px bg-zinc-800" /> We Take Pride in Your Ride <span className="w-4 h-px bg-zinc-800" />
          </span>
          <div className="flex items-center gap-1.5 text-zinc-500">
            <MapPin className="h-3 w-3 text-orange-500" /> Lahore &amp; Quetta
          </div>
        </div>
      </div>

      {/* ── Main header ─────────────────────────────────────────────── */}
      <div className="bg-zinc-900 border-b border-zinc-800 relative">
        <div className="container flex h-[60px] items-center gap-3">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <img src="/logo.png" alt="Allah-Hu-Autos" className="h-10 w-10 object-contain rounded-xl" />
            <div className="hidden sm:block">
              <p className="text-[15px] font-black text-white leading-none tracking-tight">Allah-Hu-Autos</p>
              <p className="text-[10px] text-zinc-500 leading-none mt-0.5 tracking-wide">We Take Pride in Your Ride</p>
            </div>
          </Link>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Icon actions */}
          <div className="flex items-center gap-0.5">

            {/* Search icon */}
            <button
              onClick={() => setSearchOpen(s => !s)}
              className={`flex items-center justify-center h-10 w-10 rounded-xl transition-all ${
                searchOpen
                  ? 'bg-orange-500 text-white'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
              aria-label="Search"
            >
              {searchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
            </button>

            {/* About Us — text only, desktop */}
            <Link to="/about" className="hidden md:flex">
              <button className={`flex items-center h-10 px-3 rounded-xl text-xs font-medium transition-all ${
                isActive('/about') ? 'text-orange-400' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}>
                About Us
              </button>
            </Link>

            {/* Wishlist — icon only */}
            <Link to="/wishlist">
              <button className="relative flex items-center justify-center h-10 w-10 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all group" aria-label="Wishlist">
                <Heart className="h-5 w-5 group-hover:scale-110 transition-transform" />
                {wishlistCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                    {wishlistCount}
                  </span>
                )}
              </button>
            </Link>

            {/* Cart — icon only */}
            <Link to="/cart">
              <button className="relative flex items-center justify-center h-10 w-10 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all group" aria-label="Cart">
                <ShoppingCart className="h-5 w-5 group-hover:scale-110 transition-transform" />
                {itemCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[9px] font-bold text-white shadow-lg shadow-orange-500/40">
                    {itemCount}
                  </span>
                )}
              </button>
            </Link>

            <div className="w-px h-5 bg-zinc-800 mx-1" />

            {/* User */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1.5 h-10 px-2.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all">
                    <div className="w-7 h-7 rounded-lg bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
                      <User className="h-3.5 w-3.5 text-orange-400" />
                    </div>
                    <ChevronDown className="h-3 w-3 hidden sm:block" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-zinc-900 border-zinc-800 text-zinc-200">
                  <div className="px-3 py-2 border-b border-zinc-800 mb-1">
                    <p className="text-xs text-zinc-500">Signed in as</p>
                    <p className="text-sm font-medium truncate text-white">{user.email}</p>
                  </div>
                  <DropdownMenuItem onClick={() => navigate('/account')} className="hover:bg-zinc-800 focus:bg-zinc-800 cursor-pointer"><User className="mr-2 h-4 w-4 text-zinc-400" /> My Account</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/wishlist')} className="hover:bg-zinc-800 focus:bg-zinc-800 cursor-pointer"><Heart className="mr-2 h-4 w-4 text-zinc-400" /> My Wishlist</DropdownMenuItem>
                  {isAdmin && <DropdownMenuItem onClick={() => navigate('/admin')} className="hover:bg-zinc-800 focus:bg-zinc-800 cursor-pointer"><LayoutDashboard className="mr-2 h-4 w-4 text-zinc-400" /> Admin Panel</DropdownMenuItem>}
                  <DropdownMenuSeparator className="bg-zinc-800" />
                  <DropdownMenuItem onClick={signOut} className="text-red-400 hover:bg-zinc-800 focus:bg-zinc-800 cursor-pointer"><LogOut className="mr-2 h-4 w-4" /> Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/login">
                <button className="flex items-center h-9 px-4 rounded-xl bg-orange-500 hover:bg-orange-400 text-white text-sm font-semibold shadow-lg shadow-orange-500/25 transition-all">
                  Login
                </button>
              </Link>
            )}

            {/* Mobile toggle */}
            <button
              className="md:hidden flex items-center justify-center h-10 w-10 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all ml-1"
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
      <nav className="hidden md:block bg-zinc-900 border-b border-zinc-800/60 relative overflow-visible">
        <div className="container grid h-11 items-center" style={{gridTemplateColumns: 'auto 1fr auto'}}>

          {/* Left — Home */}
          <div className="flex items-center h-full">
            <Link to="/"
              className={`relative flex items-center h-full px-4 text-[13px] font-medium transition-colors shrink-0 ${isActive('/') ? 'text-orange-400' : 'text-zinc-400 hover:text-white'}`}>
              Home
              {isActive('/') && <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-orange-500 rounded-full" />}
            </Link>
          </div>

          {/* Centre — categories */}
          <div className="flex items-center justify-center h-full">
            {navCategories.map((cat) => (
              <div key={cat.id} className="relative h-full flex items-center shrink-0"
                onMouseEnter={() => openMenu(cat.id)} onMouseLeave={closeMenu}>
                <button onClick={() => navigate(`/category/${cat.slug}`)}
                  className={`relative flex items-center gap-1.5 h-full px-3 text-[13px] font-medium transition-colors whitespace-nowrap ${location.pathname.startsWith(`/category/${cat.slug}`) ? 'text-orange-400' : 'text-zinc-400 hover:text-white'}`}>
                  {cat.name}
                  {cat.subcategories.length > 0 && (
                    <ChevronDown className={`h-3 w-3 transition-transform duration-150 ${activeMenu === cat.id ? 'rotate-180 text-orange-400' : ''}`} />
                  )}
                  {location.pathname.startsWith(`/category/${cat.slug}`) && <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-orange-500 rounded-full" />}
                </button>
                {activeMenu === cat.id && cat.subcategories.length > 0 && (
                  <div className="absolute top-full left-0" onMouseEnter={keepMenu} onMouseLeave={closeMenu}>
                    <MegaMenu category={cat} onClose={() => setActiveMenu(null)} />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right — Book Now */}
          <div className="flex items-center justify-end h-full">
            <Link to="/booking" className="flex items-center gap-1.5 px-3 h-7 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[11px] font-semibold hover:bg-orange-500/20 transition-colors">
              <Wrench className="h-3 w-3" /> Book Now
            </Link>
          </div>

        </div>
      </nav>

      {/* ── Mobile menu ─────────────────────────────────────────────── */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-zinc-900 border-b border-zinc-800 max-h-[80vh] overflow-y-auto">
          {/* Mobile search */}
          <div className="px-4 pt-3 pb-2">
            <button
              onClick={() => { setMobileMenuOpen(false); setSearchOpen(true); }}
              className="w-full flex items-center gap-3 h-10 px-4 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-500 text-sm hover:border-orange-500/40 transition-colors"
            >
              <Search className="h-4 w-4" />
              Search accessories...
            </button>
          </div>

          <div className="px-2 pb-1 space-y-0.5">
            {[{to:'/',label:'Home'},{to:'/about',label:'About Us'},{to:'/wishlist',label:'Wishlist'},{to:'/booking',label:'Book Installation'}].map(({to,label}) => (
              <Link key={to} to={to} className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive(to) ? 'bg-orange-500/10 text-orange-400' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'}`}>
                {label}{isActive(to) && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-500" />}
              </Link>
            ))}
          </div>

          {navCategories.length > 0 && (
            <div className="px-2 pb-4">
              <p className="text-[10px] uppercase tracking-widest text-zinc-600 font-semibold px-3 pt-3 pb-1.5">Shop by Category</p>
              {navCategories.map((cat) => (
                <div key={cat.id}>
                  <button onClick={() => setMobileExpandedCat(mobileExpandedCat === cat.id ? null : cat.id)}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-300 hover:bg-zinc-800 transition-colors">
                    <span>{cat.name}</span>
                    {cat.subcategories.length > 0 && <ChevronDown className={`h-3.5 w-3.5 text-zinc-500 transition-transform ${mobileExpandedCat === cat.id ? 'rotate-180' : ''}`} />}
                  </button>
                  {mobileExpandedCat === cat.id && (
                    <div className="ml-4 pl-3 border-l border-zinc-800 mb-1 space-y-0.5">
                      <Link to={`/category/${cat.slug}`} className="flex items-center px-3 py-1.5 rounded text-xs text-orange-400 font-semibold hover:bg-zinc-800 transition-colors">View all {cat.name} →</Link>
                      {cat.subcategories.map((sub) => (
                        <Link key={sub.id} to={`/category/${sub.slug}`} className="flex items-center px-3 py-1.5 rounded text-xs text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors">{sub.name}</Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="px-2 pb-4 pt-1 border-t border-zinc-800">
            <a href="tel:03337778606" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors">
              <div className="w-7 h-7 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
                <Phone className="h-3.5 w-3.5 text-orange-500" />
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