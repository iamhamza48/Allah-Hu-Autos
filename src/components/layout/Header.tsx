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
  lighting:    { label: 'Lighting', slugs: ['ambient-lights','led-lights','fog-lamps'] },
  exterior:    { label: 'Exterior', slugs: ['body-kits','exhaust-tips','antennas','batman-mirror-covers','number-plate-frames','side-mirror-accessories','window-tints','window-shades'] },
  interior:    { label: 'Interior', slugs: ['car-mats','steering-covers','dashboard-accessories','door-accessories','interior-accessories','tissue-box-holders','key-covers','car-perfumes'] },
  tech:        { label: 'Tech & Gadgets', slugs: ['cameras','car-audio','car-chargers','phone-holders','security-systems'] },
  maintenance: { label: 'Maintenance', slugs: ['brake-accessories','tow-accessories','tyre-battery-tools','horns','car-care-products'] },
};

const MegaMenu = ({ category, onClose }: { category: NavCategory; onClose: () => void }) => (
  <div className="absolute top-full left-0 w-[480px] max-w-[calc(100vw-2rem)] bg-card border border-border shadow-2xl rounded-b-xl z-50 border-t-2 border-t-primary">
    <div className="flex items-center justify-between px-5 py-3 border-b border-border/80">
      <Link to={`/category/${category.slug}`} onClick={onClose}
        className="flex items-center gap-2 font-bold text-foreground hover:text-primary transition-colors text-sm">
        {category.name}
        <ChevronRight className="h-3.5 w-3.5" />
      </Link>
      <span className="text-[11px] text-muted-foreground bg-muted/80 px-2 py-0.5 rounded-full">
        {category.subcategories.length} categories
      </span>
    </div>
    <div className="p-4 grid grid-cols-2 gap-x-4 gap-y-0.5">
      {category.subcategories.map((sub) => (
        <Link key={sub.id} to={`/category/${sub.slug}`} onClick={onClose}
          className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all group">
          <span className="w-1 h-1 rounded-full bg-border group-hover:bg-primary transition-colors shrink-0" />
          {sub.name}
        </Link>
      ))}
    </div>
    <div className="px-5 py-2.5 border-t border-border/80 bg-muted/30 rounded-b-xl">
      <Link to={`/category/${category.slug}`} onClick={onClose}
        className="text-xs font-semibold text-primary hover:text-brand-yellowHover transition-colors">
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
      <div className="absolute top-full left-0 right-0 z-50 bg-brand-slate border-b border-border shadow-2xl">
        <div className="container py-4">
          {/* Search input */}
          <form onSubmit={handleSubmit}>
            <div className="relative flex items-center">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search accessories, parts, brands..."
                className="w-full h-12 pl-12 pr-24 rounded-xl bg-background/40 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/25 text-sm transition-all"
              />
              <div className="absolute right-2 flex items-center gap-2">
                {query && (
                  <button
                    type="submit"
                    className="h-8 px-3 rounded-lg bg-primary text-primary-foreground hover:bg-brand-yellowHover hover:text-brand-slate text-xs font-semibold transition-colors flex items-center gap-1"
                  >
                    Search <ArrowRight className="h-3 w-3" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
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
                <div className="flex items-center gap-2 py-4 text-muted-foreground text-sm">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  Searching...
                </div>
              ) : results.length === 0 ? (
                <p className="py-4 text-sm text-muted-foreground">No results for "<span className="text-foreground">{query}</span>"</p>
              ) : (
                <>
                  <p className="text-[11px] text-muted-foreground uppercase tracking-widest font-semibold mb-2">
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
                          className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-background/30 transition-colors group"
                        >
                          <div className="w-12 h-12 rounded-lg bg-muted shrink-0 overflow-hidden">
                            {img
                              ? <img src={img} alt={p.name} className="w-full h-full object-cover" />
                              : <div className="w-full h-full flex items-center justify-center text-muted-foreground"><Search className="h-4 w-4" /></div>
                            }
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm text-foreground font-medium line-clamp-1 group-hover:text-primary transition-colors">{p.name}</p>
                            <p className="text-xs text-primary font-semibold mt-0.5">{formatPKR(p.base_price)}</p>
                          </div>
                          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary shrink-0 transition-colors" />
                        </Link>
                      );
                    })}
                  </div>
                  {results.length === 6 && (
                    <button
                      type="button"
                      onClick={() => { navigate(`/search?q=${encodeURIComponent(query)}`); onClose(); }}
                      className="mt-3 w-full py-2.5 rounded-xl border border-border hover:border-primary/50 text-muted-foreground hover:text-primary text-xs font-semibold transition-colors"
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
              <p className="text-[11px] text-muted-foreground uppercase tracking-widest font-semibold w-full mb-1">Popular searches</p>
              {['LED Lights', 'Car Mats', 'Body Kits', 'Ambient Lights', 'Phone Holder', 'Dash Cam'].map(term => (
                <button
                  key={term}
                  type="button"
                  onClick={() => setQuery(term)}
                  className="px-3 py-1 rounded-full bg-background/30 border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 text-xs transition-colors"
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

    return () => {
      supabase.removeChannel(channel);
    };
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
    <header className="sticky top-0 z-50 overflow-visible backdrop-blur supports-[backdrop-filter]:bg-brand-navy/85">

      {/* ── Top bar ─────────────────────────────────────────────────── */}
      <div className="bg-black/40 text-brand-muted border-b border-border/60">
        <div className="container flex h-8 items-center justify-between text-[11px] font-medium">
          <a href="tel:03337778606" className="flex items-center gap-1.5 hover:text-primary transition-colors group">
            <Phone className="h-3 w-3 text-primary" /> 0333 7778606
          </a>
          <span className="hidden sm:flex items-center gap-2 text-muted-foreground/80 tracking-widest uppercase text-[10px]">
            <span className="w-4 h-px bg-border" /> We Take Pride in Your Ride <span className="w-4 h-px bg-border" />
          </span>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <MapPin className="h-3 w-3 text-primary" /> Lahore &amp; Quetta
          </div>
        </div>
      </div>

      {/* ── Main header ─────────────────────────────────────────────── */}
      <div className="bg-brand-navy/95 backdrop-blur border-b border-border relative">
        <div className="container flex h-[60px] items-center gap-3">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <div className="logo-mark shrink-0">
              <img src="/logo.png" alt="Allah-Hu-Autos" className="h-10 w-10 object-contain" />
            </div>
            <div className="hidden sm:block">
              <p className="text-[15px] font-black text-foreground leading-none tracking-tight">Allah-Hu-Autos</p>
              <p className="text-[10px] text-muted-foreground leading-none mt-0.5 tracking-wide">We Take Pride in Your Ride</p>
            </div>
          </Link>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Icon actions */}
          <div className="flex items-center gap-0.5">

            {/* Search icon */}
            <button
              type="button"
              onClick={() => setSearchOpen(s => !s)}
              className={`flex items-center justify-center h-10 w-10 rounded-xl transition-all ${
                searchOpen
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
              aria-label="Search"
            >
              {searchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
            </button>

            <ThemeToggle />

            {/* About Us — text only, desktop */}
            <Link to="/about" className="hidden md:flex">
              <button type="button" className={`flex items-center h-10 px-3 rounded-xl text-xs font-medium transition-all ${
                isActive('/about') ? 'text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}>
                About Us
              </button>
            </Link>

            {/* Wishlist — icon only */}
            <Link to="/wishlist">
              <button type="button" className="relative flex items-center justify-center h-10 w-10 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-all group" aria-label="Wishlist">
                <Heart className="h-5 w-5 group-hover:scale-110 transition-transform" />
                {wishlistCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                    {wishlistCount}
                  </span>
                )}
              </button>
            </Link>

            {/* Cart — icon only */}
            <Link to="/cart">
              <button type="button" className="relative flex items-center justify-center h-10 w-10 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-all group" aria-label="Cart">
                <ShoppingCart className="h-5 w-5 group-hover:scale-110 transition-transform" />
                {itemCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground shadow-md shadow-primary/30">
                    {itemCount}
                  </span>
                )}
              </button>
            </Link>

            <div className="w-px h-5 bg-border mx-1" />

            {/* User */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button type="button" className="flex items-center gap-1.5 h-10 px-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-all">
                    <div className="w-7 h-7 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center">
                      <User className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <ChevronDown className="h-3 w-3 hidden sm:block" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-card border-border text-foreground">
                  <div className="px-3 py-2 border-b border-border mb-1">
                    <p className="text-xs text-muted-foreground">Signed in as</p>
                    <p className="text-sm font-medium truncate text-foreground">{user.email}</p>
                  </div>
                  <DropdownMenuItem onClick={() => navigate('/account')} className="hover:bg-muted focus:bg-muted cursor-pointer"><User className="mr-2 h-4 w-4 text-muted-foreground" /> My Account</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/wishlist')} className="hover:bg-muted focus:bg-muted cursor-pointer"><Heart className="mr-2 h-4 w-4 text-muted-foreground" /> My Wishlist</DropdownMenuItem>
                  {isAdmin && <DropdownMenuItem onClick={() => navigate('/admin')} className="hover:bg-muted focus:bg-muted cursor-pointer"><LayoutDashboard className="mr-2 h-4 w-4 text-muted-foreground" /> Admin Panel</DropdownMenuItem>}
                  <DropdownMenuSeparator className="bg-border" />
                  <DropdownMenuItem onClick={signOut} className="text-destructive focus:text-destructive hover:bg-destructive/10 focus:bg-destructive/10 cursor-pointer"><LogOut className="mr-2 h-4 w-4" /> Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/login">
                <button type="button" className="flex items-center h-9 px-4 rounded-xl bg-primary text-primary-foreground hover:bg-brand-yellowHover hover:text-brand-slate text-sm font-semibold shadow-md shadow-primary/25 transition-all">
                  Login
                </button>
              </Link>
            )}

            {/* Mobile toggle */}
            <button
              type="button"
              className="md:hidden flex items-center justify-center h-10 w-10 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-all ml-1"
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
      <nav className="hidden md:block bg-brand-slate/95 border-b border-border relative overflow-visible">
        <div className="container flex h-12 items-center justify-between">
          <div className="flex items-center h-full gap-1">
            {[
              { to: '/', label: 'Home' },
              { to: '/products', label: 'Shop' },
              { to: '/categories', label: 'Categories' },
              { to: '/about', label: 'About' },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`relative h-full flex items-center px-4 text-[13px] font-medium transition-colors ${
                  isActive(item.to) ? 'text-primary' : 'text-brand-muted hover:text-foreground'
                }`}
              >
                {item.label}
                {isActive(item.to) && <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-primary rounded-full" />}
              </Link>
            ))}
          </div>

          <div className="flex items-center h-full gap-2">
            {navCategories.slice(0, 5).map((cat) => (
              <div key={cat.id} className="relative h-full flex items-center shrink-0" onMouseEnter={() => openMenu(cat.id)} onMouseLeave={closeMenu}>
                <button
                  type="button"
                  onClick={() => navigate(`/category/${cat.slug}`)}
                  className={`relative flex items-center gap-1.5 h-full px-2.5 text-[12px] font-medium transition-colors whitespace-nowrap ${
                    location.pathname.startsWith(`/category/${cat.slug}`) ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {cat.name}
                  {cat.subcategories.length > 0 && (
                    <ChevronDown className={`h-3 w-3 transition-transform duration-150 ${activeMenu === cat.id ? 'rotate-180 text-primary' : ''}`} />
                  )}
                </button>
                {activeMenu === cat.id && cat.subcategories.length > 0 && (
                  <div className="absolute top-full right-0" onMouseEnter={keepMenu} onMouseLeave={closeMenu}>
                    <MegaMenu category={cat} onClose={() => setActiveMenu(null)} />
                  </div>
                )}
              </div>
            ))}
            <a href="tel:03337778606" className="ml-2 flex items-center gap-1.5 px-3 h-8 rounded-full bg-primary/10 border border-primary/35 text-primary text-[11px] font-semibold hover:bg-primary/20 transition-colors">
              Contact
            </a>
          </div>
        </div>
      </nav>

      {/* ── Mobile menu ─────────────────────────────────────────────── */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-brand-slate border-b border-border max-h-[80vh] overflow-y-auto">
          {/* Mobile search */}
          <div className="px-4 pt-3 pb-2">
            <button
              type="button"
              onClick={() => { setMobileMenuOpen(false); setSearchOpen(true); }}
              className="w-full flex items-center gap-3 h-10 px-4 rounded-xl bg-background/25 border border-border text-muted-foreground text-sm hover:border-primary/40 transition-colors"
            >
              <Search className="h-4 w-4" />
              Search accessories...
            </button>
          </div>

          <div className="px-2 pb-1 space-y-0.5">
            {[{to:'/',label:'Home'},{to:'/products',label:'Shop'},{to:'/categories',label:'Categories'},{to:'/about',label:'About'},{to:'/wishlist',label:'Wishlist'},{to:'/booking',label:'Book Installation'}].map(({to,label}) => (
              <Link key={to} to={to} className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive(to) ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}`}>
                {label}{isActive(to) && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
              </Link>
            ))}
            <a href="tel:03337778606" className="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">Contact</a>
          </div>

          {navCategories.length > 0 && (
            <div className="px-2 pb-4">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold px-3 pt-3 pb-1.5">Shop by Category</p>
              {navCategories.map((cat) => (
                <div key={cat.id}>
                  <button type="button" onClick={() => setMobileExpandedCat(mobileExpandedCat === cat.id ? null : cat.id)}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-foreground/90 hover:bg-secondary transition-colors">
                    <span>{cat.name}</span>
                    {cat.subcategories.length > 0 && <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${mobileExpandedCat === cat.id ? 'rotate-180' : ''}`} />}
                  </button>
                  {mobileExpandedCat === cat.id && (
                    <div className="ml-4 pl-3 border-l border-border mb-1 space-y-0.5">
                      <Link to={`/category/${cat.slug}`} className="flex items-center px-3 py-1.5 rounded text-xs text-primary font-semibold hover:bg-secondary transition-colors">View all {cat.name} →</Link>
                      {cat.subcategories.map((sub) => (
                        <Link key={sub.id} to={`/category/${sub.slug}`} className="flex items-center px-3 py-1.5 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">{sub.name}</Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="px-2 pb-4 pt-1 border-t border-border">
            <a href="tel:03337778606" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
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