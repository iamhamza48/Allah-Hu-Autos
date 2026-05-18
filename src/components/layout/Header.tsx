import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingCart, Search, User, Menu, X,
  LogOut, LayoutDashboard, Phone, MapPin,
  ChevronDown, Heart, ChevronRight, ArrowRight,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
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
    // If not enough space to the right, align to the right edge of the trigger instead
    setAlignRight(rect.left + dropdownWidth > window.innerWidth - 16);
  }, [anchorRef]);

  return (
    <div
      className={`absolute top-full w-[420px] max-w-[calc(100vw-2rem)] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-xl rounded-b-xl z-50 border-t-[3px] border-t-primary animate-dropdown-in ${alignRight ? 'right-0' : 'left-0'
        }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-gray-700">
        <Link
          to={`/category/${category.slug}`}
          onClick={onClose}
          className="flex items-center gap-2 font-bold text-gray-900 dark:text-white hover:text-primary transition-colors text-sm"
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
            className="flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:text-primary hover:bg-blue-50 dark:hover:bg-primary/10 transition-all group"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600 group-hover:bg-primary transition-colors shrink-0" />
            {sub.name}
          </Link>
        ))}
      </div>

      {/* Footer CTA */}
      <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-xl">
        <Link
          to={`/category/${category.slug}`}
          onClick={onClose}
          className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
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
                className="w-full h-12 pl-12 pr-28 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm transition-all"
              />
              <div className="absolute right-2 flex items-center gap-2">
                {query && (
                  <button
                    type="submit"
                    className="h-8 px-3 rounded-lg bg-primary text-white hover:bg-primary/90 text-xs font-semibold transition-colors flex items-center gap-1"
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
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
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
                            <p className="text-sm text-gray-900 dark:text-white font-medium line-clamp-1 group-hover:text-primary transition-colors">{p.name}</p>
                            <p className="text-xs text-primary font-semibold mt-0.5">{formatPKR(p.base_price)}</p>
                          </div>
                          <ChevronRight className="h-3.5 w-3.5 text-gray-400 group-hover:text-primary shrink-0 transition-colors" />
                        </Link>
                      );
                    })}
                  </div>
                  {results.length === 6 && (
                    <button
                      type="button"
                      onClick={() => { navigate(`/search?q=${encodeURIComponent(query)}`); onClose(); }}
                      className="mt-3 w-full py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary/50 text-gray-500 hover:text-primary text-xs font-semibold transition-colors"
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
                  className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:text-primary hover:border-primary/40 text-xs transition-colors"
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
  // Refs for viewport-aware dropdown positioning
  const catRefs = useRef<Record<string, React.RefObject<HTMLDivElement | null>>>({});

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

  // Ensure each category has a ref for viewport detection
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
          <a href="tel:03337778606" className="flex items-center gap-1.5 hover:text-white transition-colors group">
            <Phone className="h-3 w-3 text-blue-200" /> 0333 7778606
          </a>
          <span className="hidden sm:flex items-center gap-2 text-blue-200 tracking-widest uppercase text-[10px]">
            <span className="w-4 h-px bg-blue-400/50" /> We Take Pride in Your Ride <span className="w-4 h-px bg-blue-400/50" />
          </span>
          <div className="flex items-center gap-1.5 text-blue-200">
            <MapPin className="h-3 w-3" /> Lahore &amp; Quetta
          </div>
        </div>
      </div>

      {/* ── Main header ─────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm relative">
        <div className="container flex h-[64px] items-center gap-3">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <div className="logo-mark shrink-0">
              <img src="/logo.webp" alt="Allah-Hu-Autos" width="40" height="40" className="h-10 w-10 object-contain" />
            </div>
            <div className="hidden sm:block">
              <p className="text-[15px] font-black text-gray-900 dark:text-white leading-none tracking-tight">Allah-Hu-Autos</p>
              <p className="text-[10px] text-gray-500 leading-none mt-0.5 tracking-wide">We Take Pride in Your Ride</p>
            </div>
          </Link>

          <div className="flex-1" />

          {/* Icon actions */}
          <div className="flex items-center gap-0.5">

            {/* Search icon */}
            <button
              type="button"
              onClick={() => setSearchOpen(s => !s)}
              className={`flex items-center justify-center h-10 w-10 rounded-xl transition-all ${searchOpen
                  ? 'bg-primary text-white shadow-md'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              aria-label="Search"
            >
              {searchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
            </button>

            <ThemeToggle />

            {/* About Us — desktop */}
            <Link to="/about" className="hidden md:flex">
              <button type="button" className={`flex items-center h-10 px-3 rounded-xl text-xs font-medium transition-all ${isActive('/about') ? 'text-primary bg-blue-50 dark:bg-primary/10' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}>
                About Us
              </button>
            </Link>

            {/* Wishlist */}
            <Link to="/wishlist">
              <button type="button" className="relative flex items-center justify-center h-10 w-10 rounded-xl text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all group" aria-label="Wishlist">
                <Heart className="h-5 w-5 group-hover:scale-110 transition-transform" />
                {wishlistCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-white">
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
                  <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-white shadow-md shadow-primary/30">
                    {itemCount}
                  </span>
                )}
              </button>
            </Link>

            <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1" />

            {/* User */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button type="button" className="flex items-center gap-1.5 h-10 px-2.5 rounded-xl text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
                      <User className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <ChevronDown className="h-3 w-3 hidden sm:block" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white shadow-lg">
                  <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700 mb-1">
                    <p className="text-xs text-gray-400">Signed in as</p>
                    <p className="text-sm font-medium truncate">{user.email}</p>
                  </div>
                  <DropdownMenuItem onClick={() => navigate('/account')} className="hover:bg-gray-50 dark:hover:bg-gray-800 focus:bg-gray-50 dark:focus:bg-gray-800 cursor-pointer"><User className="mr-2 h-4 w-4 text-gray-400" /> My Account</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/wishlist')} className="hover:bg-gray-50 dark:hover:bg-gray-800 focus:bg-gray-50 dark:focus:bg-gray-800 cursor-pointer"><Heart className="mr-2 h-4 w-4 text-gray-400" /> My Wishlist</DropdownMenuItem>
                  {isAdmin && <DropdownMenuItem onClick={() => navigate('/admin')} className="hover:bg-gray-50 dark:hover:bg-gray-800 focus:bg-gray-50 dark:focus:bg-gray-800 cursor-pointer"><LayoutDashboard className="mr-2 h-4 w-4 text-gray-400" /> Admin Panel</DropdownMenuItem>}
                  <DropdownMenuSeparator className="bg-gray-100 dark:bg-gray-700" />
                  <DropdownMenuItem onClick={signOut} className="text-red-600 focus:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 focus:bg-red-50 cursor-pointer"><LogOut className="mr-2 h-4 w-4" /> Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/login">
                <button type="button" className="flex items-center h-9 px-5 rounded-xl bg-primary text-white hover:bg-primary/90 text-sm font-semibold shadow-md shadow-primary/20 transition-all">
                  Login
                </button>
              </Link>
            )}

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
        <div className="container flex h-12 items-center justify-between">
          <div className="flex items-center h-full gap-1">
            {[
              { to: '/', label: 'Home' },
              { to: '/products', label: 'Shop' },
              { to: '/categories', label: 'Categories' },
              { to: '/booking', label: 'Book Install' },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`relative h-full flex items-center px-4 text-[13px] font-medium transition-colors ${isActive(item.to) ? 'text-white' : 'text-blue-200 hover:text-white'
                  }`}
              >
                {item.label}
                {isActive(item.to) && <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-white rounded-full" />}
              </Link>
            ))}
          </div>

          <div className="flex items-center h-full gap-1">
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
                    className={`relative flex items-center gap-1.5 h-full px-3 text-[12px] font-medium transition-colors whitespace-nowrap ${location.pathname.startsWith(`/category/${cat.slug}`) ? 'text-white' : 'text-blue-200 hover:text-white'
                      }`}
                  >
                    {cat.name}
                    {cat.subcategories.length > 0 && (
                      <ChevronDown className={`h-3 w-3 transition-transform duration-150 ${activeMenu === cat.id ? 'rotate-180 text-white' : ''}`} />
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
            <a
              href="tel:03337778606"
              className="ml-2 flex items-center gap-1.5 px-3 h-8 rounded-full bg-white/10 border border-white/20 text-white text-[11px] font-semibold hover:bg-white/20 transition-colors"
            >
              Contact
            </a>
          </div>
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
              className="w-full flex items-center gap-3 h-10 px-4 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 text-sm hover:border-primary/40 transition-colors"
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
                    ? 'bg-blue-50 dark:bg-primary/10 text-primary'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                  }`}
              >
                {label}
                {isActive(to) && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
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
                      <Link to={`/category/${cat.slug}`} className="flex items-center px-3 py-1.5 rounded text-xs text-primary font-semibold hover:bg-blue-50 dark:hover:bg-primary/10 transition-colors">View all {cat.name} →</Link>
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
              <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/25 flex items-center justify-center shrink-0">
                <Phone className="h-3.5 w-3.5 text-primary" />
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