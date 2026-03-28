import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingCart, Search, User, Menu, X,
  LogOut, LayoutDashboard, Phone, MapPin,
  ChevronDown, Wrench, Heart, ChevronRight,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useCartStore } from '@/stores/cart';
import { useWishlistStore } from '@/stores/wishlist';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabase';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
        <span className="text-base">{category.icon}</span>
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

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileExpandedCat, setMobileExpandedCat] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
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

  useEffect(() => { setMobileMenuOpen(false); setActiveMenu(null); }, [location.pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) { 
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`); 
      setSearchQuery(''); 
    }
  };

  const isActive = (to: string) => to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);
  const openMenu = (id: string) => { if (menuTimeout.current) clearTimeout(menuTimeout.current); setActiveMenu(id); };
  const closeMenu = () => { menuTimeout.current = setTimeout(() => setActiveMenu(null), 150); };
  const keepMenu = () => { if (menuTimeout.current) clearTimeout(menuTimeout.current); };

  return (
    <header className="sticky top-0 z-50 overflow-visible">
      {/* 1. Top Bar */}
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

      {/* 2. Main Header (Perfectly Centered 3-Column Grid) */}
      <div className="bg-zinc-900 border-b border-zinc-800">
        <div className="container grid grid-cols-3 h-[74px] items-center gap-4">
          
          {/* Left: Brand */}
          <div className="flex items-center justify-start">
            <Link to="/" className="flex items-center gap-3 shrink-0">
              <img src="/logo.png" alt="Allah-Hu-Autos" className="h-10 w-10 object-contain rounded-xl shadow-lg shadow-black/20" />
              <div className="hidden lg:block">
                <p className="text-[16px] font-black text-white leading-none tracking-tight uppercase">Allah-Hu-Autos</p>
                <p className="text-[10px] text-zinc-500 leading-none mt-1 tracking-wide uppercase font-bold">Pride in Your Ride</p>
              </div>
            </Link>
          </div>

          {/* Center: Search Bar */}
          <div className="flex justify-center items-center w-full">
            <form onSubmit={handleSearch} className="w-full max-w-lg">
              <div className={`relative flex items-center transition-all duration-200 ${searchFocused ? 'scale-[1.02]' : ''}`}>
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none z-10" />
                <Input 
                  placeholder="Search accessories, parts, brands..."
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)} 
                  onBlur={() => setSearchFocused(false)}
                  className="pl-11 pr-4 h-11 w-full rounded-full bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all shadow-inner" 
                />
              </div>
            </form>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center justify-end gap-2 lg:gap-4">
            <Link to="/about" className="hidden xl:flex">
              <button className={`flex items-center gap-1.5 h-10 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${isActive('/about') ? 'text-orange-500' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`}>
                About Us
              </button>
            </Link>
            
            <div className="flex items-center gap-1">
              <Link to="/wishlist">
                <button className="relative flex items-center justify-center h-10 w-10 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all group">
                  <Heart className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  {wishlistCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-md">
                      {wishlistCount}
                    </span>
                  )}
                </button>
              </Link>

              <Link to="/cart">
                <button className="relative flex items-center justify-center h-10 w-10 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all group">
                  <ShoppingCart className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  {itemCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[9px] font-bold text-white shadow-lg shadow-orange-500/30">
                      {itemCount}
                    </span>
                  )}
                </button>
              </Link>
            </div>

            <div className="w-px h-6 bg-zinc-800 mx-1 hidden sm:block" />

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 h-10 px-3 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all">
                    <div className="w-7 h-7 rounded-lg bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
                      <User className="h-3.5 w-3.5 text-orange-400" />
                    </div>
                    <ChevronDown className="h-3 w-3 hidden lg:block" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-zinc-900 border-zinc-800 text-zinc-200">
                  <div className="px-3 py-2 border-b border-zinc-800 mb-1">
                    <p className="text-xs text-zinc-500">Signed in as</p>
                    <p className="text-sm font-medium truncate text-white">{user.email}</p>
                  </div>
                  <DropdownMenuItem onClick={() => navigate('/account')} className="hover:bg-zinc-800 focus:bg-zinc-800 cursor-pointer">
                    <User className="mr-2 h-4 w-4 text-zinc-400" /> My Account
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem onClick={() => navigate('/admin')} className="hover:bg-zinc-800 focus:bg-zinc-800 cursor-pointer">
                      <LayoutDashboard className="mr-2 h-4 w-4 text-zinc-400" /> Admin Panel
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="bg-zinc-800" />
                  <DropdownMenuItem onClick={signOut} className="text-red-400 hover:bg-zinc-800 focus:bg-zinc-800 cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/login">
                <button className="h-10 px-6 rounded-full bg-orange-500 hover:bg-orange-400 text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-orange-500/20 transition-all active:scale-95">
                  Login
                </button>
              </Link>
            )}

            <button className="md:hidden flex items-center justify-center h-10 w-10 rounded-xl text-zinc-400 hover:bg-zinc-800 ml-1" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* 3. Navigation Links (Mega-Menus) */}
      <nav className="hidden md:block bg-zinc-900 border-b border-zinc-800/60 relative overflow-visible">
        <div className="container grid h-11 items-center" style={{gridTemplateColumns: 'auto 1fr auto'}}>
          <div className="flex items-center h-full">
            <Link to="/"
              className={`relative flex items-center h-full px-4 text-[13px] font-bold uppercase tracking-tight transition-colors shrink-0 ${isActive('/') ? 'text-orange-400' : 'text-zinc-400 hover:text-white'}`}>
              Home
              {isActive('/') && <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-orange-500 rounded-full" />}
            </Link>
          </div>

          <div className="flex items-center justify-center h-full">
            {navCategories.map((cat) => (
              <div key={cat.id} className="relative h-full flex items-center shrink-0"
                onMouseEnter={() => openMenu(cat.id)} onMouseLeave={closeMenu}>
                <button onClick={() => navigate(`/category/${cat.slug}`)}
                  className={`relative flex items-center gap-1.5 h-full px-3 text-[13px] font-bold transition-colors whitespace-nowrap ${location.pathname.startsWith(`/category/${cat.slug}`) ? 'text-orange-400' : 'text-zinc-400 hover:text-white'}`}>
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

          <div className="flex items-center justify-end h-full">
            <Link to="/booking" className="flex items-center gap-1.5 px-3 h-7 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[11px] font-black uppercase tracking-wider hover:bg-orange-500/20 transition-colors">
              <Wrench className="h-3 w-3" /> Book Now
            </Link>
          </div>
        </div>
      </nav>

      {/* 4. Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-zinc-900 border-b border-zinc-800 max-h-[80vh] overflow-y-auto">
          <div className="px-4 pt-3 pb-2">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input placeholder="Search accessories..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 rounded-full bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-orange-500" />
              </div>
            </form>
          </div>
          <div className="px-2 pb-1 space-y-0.5">
            {[{to:'/',label:'🏠 Home'},{to:'/about',label:'ℹ️ About Us'},{to:'/wishlist',label:'♥ Wishlist'},{to:'/booking',label:'🔧 Book Installation'}].map(({to,label}) => (
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
                    <span className="flex items-center gap-2">{cat.name}</span>
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
        </div>
      )}
    </header>
  );
};

export default Header;