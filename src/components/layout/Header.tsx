import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Search, User, Menu, X, LogOut, LayoutDashboard, Phone, MapPin } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCartStore } from '@/stores/cart';
import { useAuth } from '@/hooks/use-auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/categories', label: 'Categories' },
  { to: '/products', label: 'Products' },
  { to: '/booking', label: 'Book Installation' },
];

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const itemCount = useCartStore((s) => s.getItemCount());
  const { user, isAdmin, signOut } = useAuth();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMobileMenuOpen(false);
    }
  };

  const isActive = (to: string) =>
    to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);

  return (
    <header className="sticky top-0 z-50 shadow-sm">

      {/* Top bar */}
      <div className="bg-zinc-900 text-zinc-300">
        <div className="container flex h-8 items-center justify-between text-xs gap-4">
          <a href="tel:+923001234567" className="flex items-center gap-1.5 hover:text-white transition-colors">
            <Phone className="h-3 w-3 text-primary" />
            +92 300 1234567
          </a>
          <span className="hidden sm:block font-medium text-white">
            🚗 We Take Pride in Your Ride
          </span>
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3 w-3 text-primary" />
            Lahore, Pakistan
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
        <div className="container flex h-16 items-center justify-between gap-4">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 shrink-0">
            {/* Logo — drop your logo.png into the public/ folder */}
            <img
              src="/logo.png"
              alt="Allah-Hu-Autos"
              className="h-10 w-auto object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                (e.target as HTMLImageElement).nextElementSibling?.removeAttribute('style');
              }}
            />
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary shadow-md" style={{display:'none'}}>
              <span className="text-lg font-black text-white">A</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-base font-black leading-tight text-zinc-900 dark:text-white tracking-tight">
                Allah-Hu-Autos
              </h1>
              <p className="text-[10px] text-zinc-500 leading-tight">We Take Pride in Your Ride</p>
            </div>
          </Link>

          {/* Search */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-lg">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input
                placeholder="Search accessories, parts, brands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 rounded-full text-sm focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Link to="/cart" className="relative">
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full">
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white shadow">
                    {itemCount}
                  </span>
                )}
              </Button>
            </Link>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => navigate('/account')}>
                    <User className="mr-2 h-4 w-4" /> My Account
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem onClick={() => navigate('/admin')}>
                      <LayoutDashboard className="mr-2 h-4 w-4" /> Admin Panel
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} className="text-red-500">
                    <LogOut className="mr-2 h-4 w-4" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/login">
                <Button size="sm" className="rounded-full px-5">Login</Button>
              </Link>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-10 w-10 rounded-full"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Nav bar */}
      <nav className="hidden md:block bg-zinc-900 dark:bg-zinc-950 border-b border-zinc-800">
        <div className="container flex h-10 items-center gap-1">
          {NAV_LINKS.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`px-4 h-full flex items-center text-sm font-medium border-b-2 transition-colors ${
                isActive(to)
                  ? 'border-primary text-primary'
                  : 'border-transparent text-zinc-400 hover:text-white hover:border-zinc-500'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 p-4 space-y-3">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input
                placeholder="Search accessories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 rounded-full"
              />
            </div>
          </form>
          <div className="flex flex-col">
            {NAV_LINKS.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileMenuOpen(false)}
                className={`py-2.5 px-1 text-sm font-medium border-b border-zinc-100 dark:border-zinc-800 last:border-0 ${
                  isActive(to) ? 'text-primary' : 'text-zinc-700 dark:text-zinc-300'
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
