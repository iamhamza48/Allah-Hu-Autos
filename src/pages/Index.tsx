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
        supabase.from('categories').select('*').eq('featured', true).is('parent_id', null).limit(6),
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
      <section className="relative bg-zinc-900 overflow-hidden">
        {/* Slightly darkened the gradient for better text contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/80 to-black/30 z-0" />
        <div
          className="absolute inset-0 opacity-40 z-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1600&q=80&fit=crop')" }}
        />
        
        {/* Increased vertical padding for a taller, grander hero */}
        <div className="container relative z-10 py-16 lg:py-28">
          <div className="max-w-2xl">
            <Badge className="mb-4 bg-primary/20 text-primary border-primary/30 text-sm px-3 py-1">
              Best at what we do
            </Badge>
            
            {/* Massively scaled up the font size (text-4xl to 6xl) and added tracking-tight */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-4 leading-[1.1] tracking-tight">
              We Take Pride in <span className="text-primary">Your Ride</span>
            </h1>
            
            {/* Bumped text size to base/lg and improved line height */}
            <p className="text-base sm:text-lg text-white/80 mb-8 max-w-lg leading-relaxed">
              Premium automotive accessories for every car on Pakistani roads  LED lights, body kits, mats, audio & more.
            </p>
            
            {/* Made buttons larger (removed size="sm" and h-8) for better touch targets */}
            <div className="flex flex-wrap items-center gap-3 mb-10">
              <Link to="/products">
                <Button size="lg" className="gap-2 font-bold">
                  Shop Now <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/categories">
                <Button size="lg" variant="outline" className="border-white/30 !text-white hover:bg-white/10 hover:!text-white bg-transparent font-medium">
                  Browse Categories
                </Button>
              </Link>
              <Link to="/booking">
                <Button size="lg" variant="outline" className="border-white/30 !text-white hover:bg-white/10 hover:!text-white bg-transparent font-medium">
                  Book Installation
                </Button>
              </Link>
            </div>
            
            {/* Made the stats numbers huge and the labels more professional */}
            <div className="flex gap-8 sm:gap-12 border-t border-white/10 pt-6">
              {[['500+', 'Products'], ['50+', 'Brands'], ['2', 'Branches']].map(([num, label]) => (
                <div key={label}>
                  <p className="text-2xl sm:text-3xl font-black text-primary mb-1">{num}</p>
                  <p className="text-xs sm:text-sm text-white/60 font-medium uppercase tracking-wider">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>


      {/* Vehicle Finder */}
      <section className="border-y bg-muted/30 py-12 lg:py-16">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-3">
              Shop by Your Car
            </h2>
            <p className="text-muted-foreground">
              Select your vehicle's make, model, and year to see accessories guaranteed to fit your ride.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto bg-card p-4 sm:p-6 rounded-2xl shadow-sm border border-border/50">
            <VehicleSelector />
          </div>
        </div>
      </section>


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