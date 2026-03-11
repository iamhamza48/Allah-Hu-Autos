import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Search, User, Menu, X, LogOut, LayoutDashboard } from 'lucide-react';
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

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const itemCount = useCartStore((s) => s.getItemCount());
  const { user, isAdmin, signOut } = useAuth();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      {/* Top bar */}
      <div className="bg-dark text-dark-foreground">
        <div className="container flex h-8 items-center justify-between text-xs">
          <span>📞 +92 300 1234567</span>
          <span className="hidden sm:block font-medium tracking-wide">
            🚗 We Take Pride in Your Ride
          </span>
          <span>📍 Lahore, Pakistan</span>
        </div>
      </div>

      {/* Main header */}
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <span className="text-lg font-black text-primary-foreground">A</span>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-base font-bold leading-tight text-foreground">Allah-Hu-Autos</h1>
            <p className="text-[10px] text-muted-foreground leading-tight">We Take Pride in Your Ride</p>
          </div>
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search accessories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-secondary border-0"
            />
          </div>
        </form>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Link to="/cart" className="relative">
            <Button variant="ghost" size="icon">
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {itemCount}
                </span>
              )}
            </Button>
          </Link>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
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
                <DropdownMenuItem onClick={signOut}>
                  <LogOut className="mr-2 h-4 w-4" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/login">
              <Button variant="default" size="sm">Login</Button>
            </Link>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Nav */}
      <nav className="hidden md:block border-t">
        <div className="container flex h-10 items-center gap-6 text-sm">
          <Link to="/" className="font-medium text-foreground hover:text-primary transition-colors">Home</Link>
          <Link to="/categories" className="font-medium text-muted-foreground hover:text-primary transition-colors">Categories</Link>
          <Link to="/products" className="font-medium text-muted-foreground hover:text-primary transition-colors">Products</Link>
          <Link to="/booking" className="font-medium text-muted-foreground hover:text-primary transition-colors">Book Installation</Link>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-card p-4 space-y-3">
          <form onSubmit={handleSearch}>
            <Input
              placeholder="Search accessories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
          <div className="flex flex-col gap-2">
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="py-2 font-medium">Home</Link>
            <Link to="/categories" onClick={() => setMobileMenuOpen(false)} className="py-2 font-medium">Categories</Link>
            <Link to="/products" onClick={() => setMobileMenuOpen(false)} className="py-2 font-medium">Products</Link>
            <Link to="/booking" onClick={() => setMobileMenuOpen(false)} className="py-2 font-medium">Book Installation</Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
