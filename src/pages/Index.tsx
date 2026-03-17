import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ProductCard from '@/components/ProductCard';
import CategoryCard from '@/components/CategoryCard';
import VehicleSelector from '@/components/VehicleSelector';
import type { Product, Category } from '@/types/database';
import { ArrowRight, Shield, Truck, Wrench, Star, Tag, Zap } from 'lucide-react';

const BRANDS = ['Toyota', 'Honda', 'Suzuki', 'KIA', 'Hyundai', 'MG', 'Changan', 'Haval', 'Daihatsu', 'Audi', 'BMW', 'Mercedes'];

const Index = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [featuredCategories, setFeaturedCategories] = useState<Category[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [productsRes, categoriesRes, newRes] = await Promise.all([
        supabase.from('products').select('*, category:categories(*), images:product_images(*)').eq('featured', true).limit(10),
        supabase.from('categories').select('*').eq('featured', true).limit(12),
        supabase.from('products').select('*, category:categories(*), images:product_images(*)').order('created_at', { ascending: false }).limit(10),
      ]);
      setFeaturedProducts(productsRes.data || []);
      setFeaturedCategories(categoriesRes.data || []);
      setNewArrivals(newRes.data || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-zinc-800 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-900/90 via-zinc-800/70 to-zinc-700/30 z-0" />
        <div
          className="absolute inset-0 opacity-60 z-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1600&q=80&fit=crop')" }}
        />
        <div className="container relative z-10 py-12 lg:py-20">
          <div className="max-w-xl">
            <Badge className="mb-2 bg-primary/20 text-primary border-primary/30 text-xs">
              🚗 Pakistan's #1 Auto Accessories
            </Badge>
            <h1 className="text-3xl sm:text-4xl font-black mb-2 leading-tight">
              We Take Pride in{' '}
              <span className="text-primary">Your Ride</span>
            </h1>
            <p className="text-sm text-white/70 mb-4 max-w-md">
              Premium automotive accessories for every car on Pakistani roads — LED lights, body kits, mats, audio & more.
            </p>
            <div className="flex flex-wrap gap-2 mb-6">
              <Link to="/products">
                <Button size="sm" className="gap-1.5 h-8">Shop Now <ArrowRight className="h-3.5 w-3.5" /></Button>
              </Link>
              <Link to="/categories">
                <Button size="sm" variant="outline" className="border-white/30 !text-white hover:bg-white/10 hover:!text-white bg-transparent h-8">
                  Browse Categories
                </Button>
              </Link>
              <Link to="/booking">
                <Button size="sm" variant="outline" className="border-white/30 !text-white hover:bg-white/10 hover:!text-white bg-transparent h-8">
                  Book Installation
                </Button>
              </Link>
            </div>
            {/* Quick stats */}
            <div className="flex gap-4">
              {[['500+', 'Products'], ['50+', 'Brands'], ['4', 'Branches']].map(([num, label]) => (
                <div key={label}>
                  <p className="text-base font-black text-primary">{num}</p>
                  <p className="text-[10px] text-white/50">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <div className="border-b bg-card">
        <div className="container">
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x">
            {[
              { icon: Shield, label: 'Genuine Products' },
              { icon: Truck, label: 'Nationwide Delivery' },
              { icon: Wrench, label: 'Expert Installation' },
              { icon: Star, label: '5-Star Rated' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 px-3 py-2">
                <Icon className="h-3.5 w-3.5 text-primary shrink-0" />
                <span className="text-xs font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Vehicle Finder */}
      <section className="border-b bg-secondary/40">
        <div className="container py-3">
          <div className="flex items-center gap-3 mb-2">
            <Zap className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-bold">Find Accessories for Your Vehicle</h2>
          </div>
          <div className="max-w-2xl">
            <VehicleSelector />
          </div>
        </div>
      </section>

      {/* Compatible Brands ticker */}
      <div className="border-b bg-card overflow-hidden">
        <div className="container py-2">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            <span className="text-[10px] text-muted-foreground font-medium shrink-0">COMPATIBLE WITH:</span>
            {BRANDS.map(b => (
              <span key={b} className="text-[11px] font-semibold px-2 py-0.5 rounded bg-secondary shrink-0">{b}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Categories */}
      <section className="container py-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold">Shop by Category</h2>
          <Link to="/categories">
            <Button variant="ghost" size="sm" className="gap-1 h-6 text-xs px-2">
              All Categories <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {Array.from({ length: 12 }).map((_, i) => <div key={i} className="aspect-[4/3] rounded-lg bg-secondary animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {featuredCategories.map((cat, i) => <CategoryCard key={cat.id} category={cat} index={i} />)}
          </div>
        )}
      </section>

      {/* Featured Products */}
      <section className="bg-secondary/40 border-y">
        <div className="container py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-bold">Featured Products</h2>
            </div>
            <Link to="/products">
              <Button variant="ghost" size="sm" className="gap-1 h-6 text-xs px-2">
                View All <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
              {Array.from({ length: 10 }).map((_, i) => <div key={i} className="aspect-[4/3] rounded-lg bg-card animate-pulse" />)}
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No featured products yet.</p>
              <p className="text-xs mt-1">Mark products as featured in the admin panel.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
              {featuredProducts.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* New Arrivals */}
      <section className="container py-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-bold">New Arrivals</h2>
          </div>
          <Link to="/products">
            <Button variant="ghost" size="sm" className="gap-1 h-6 text-xs px-2">
              View All <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {Array.from({ length: 10 }).map((_, i) => <div key={i} className="aspect-[4/3] rounded-lg bg-secondary animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {newArrivals.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>

      {/* CTA banner */}
      <section className="border-y bg-primary/5">
        <div className="container py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold">Need help choosing the right accessories?</h3>
              <p className="text-xs text-muted-foreground">Our experts are available Mon–Sat, 10AM–9PM</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <a href="tel:+923001234567">
                <Button size="sm" className="h-7 text-xs gap-1.5">📞 Call Us</Button>
              </a>
              <Link to="/booking">
                <Button size="sm" variant="outline" className="h-7 text-xs">Book Installation</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
