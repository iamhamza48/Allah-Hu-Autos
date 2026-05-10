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
  const [reloadTick, setReloadTick] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes, newRes] = await Promise.all([
          supabase.from('products').select('*, category:categories(*), images:product_images(*), variants:product_variants(*)').eq('featured', true).limit(10),
          supabase.from('categories').select('*').eq('featured', true).is('parent_id', null).limit(6),
          supabase.from('products').select('*, category:categories(*), images:product_images(*), variants:product_variants(*)').order('created_at', { ascending: false }).limit(10),
        ]);

        if (productsRes.error) throw productsRes.error;
        if (newRes.error) throw newRes.error;

        // Keep homepage categories working even when parent_id is not present in older schemas.
        if (categoriesRes.error) {
          const fallback = await supabase.from('categories').select('*').eq('featured', true).limit(6);
          if (fallback.error) throw fallback.error;
          setFeaturedCategories(fallback.data || []);
        } else {
          setFeaturedCategories(categoriesRes.data || []);
        }

        setFeaturedProducts(productsRes.data || []);
        setNewArrivals(newRes.data || []);
      } catch (error) {
        console.error('Failed to load homepage data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [reloadTick]);

  useEffect(() => {
    const channel = supabase
      .channel('home-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => setReloadTick((v) => v + 1))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, () => setReloadTick((v) => v + 1))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'product_images' }, () => setReloadTick((v) => v + 1))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'product_variants' }, () => setReloadTick((v) => v + 1))
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-brand-navy overflow-hidden">
        {/* Slightly darkened the gradient for better text contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/80 to-black/30 z-0" />
        <div
          className="absolute inset-0 opacity-40 z-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1600&q=80&fit=crop')" }}
        />
        
        {/* Increased vertical padding for a taller, grander hero */}
        <div className="container relative z-10 py-16 lg:py-28">
          {/* CHANGED THIS LINE: max-w-2xl is now max-w-4xl */}
          <div className="max-w-4xl">
            <Badge className="mb-4 bg-primary/20 text-primary border-primary/30 text-sm px-3 py-1">
              Best at what we do
            </Badge>
            
            {/* Massively scaled up the font size (text-4xl to 6xl) and added tracking-tight */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-4 leading-[1.1] tracking-tight">
              {/* CHANGED THIS LINE: Added whitespace-nowrap to the span */}
              We Take Pride in <span className="text-primary whitespace-nowrap">Your Ride</span>
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
      <section className="relative bg-primary/[1] border-y border-primary/10 py-12 lg:py-16 overflow-hidden">
        {/* A very soft, subtle radial glow in the background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w h-full bg-gradient-to-b from-primary/[1] to-transparent pointer-events-none" />
        
        <div className="container relative z-10">
          {/* Centered Text Layout */}
          <div className="max-w mx-auto text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-3 text-white 
              [text-shadow:_-2px_-2px_0_#000,_2px_-2px_0_#000,_-2px_2px_0_#000,_2px_2px_0_#000]">
              Shop by Your Car
            </h2>
            <p className="text-zinc-900">
              Select your vehicle's make, model, and year to see accessories guaranteed to fit your ride.
            </p>
          </div>
          
          {/* Crisp white floating card to hold the dropdowns */}
          <div className="max-w-4xl mx-auto bg-white p-4 sm:p-6 md:px-8 rounded-3xl shadow-xl shadow-primary/5 border border-primary/10">
            <VehicleSelector />
          </div>
        </div>
      </section>

{/* Featured Categories */}
      <section className="bg-white py-12 lg:py-16 dark:bg-zinc-950">
        <div className="container">
          {/* Centered Header Layout */}
          <div className="max-w-2xl mx-auto text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-3 text-zinc-900 dark:text-zinc-100">
              Shop by Category
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm sm:text-base">
              Find exactly what you need for your vehicle from our premium selection of accessories.
            </p>
          </div>
          
          {loading ? (
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="w-[calc(50%-0.5rem)] sm:w-[calc(33.333%-1rem)] md:w-[220px] lg:w-[240px] aspect-[4/3] rounded-xl bg-zinc-100 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
              {featuredCategories.map((cat, i) => (
                <div key={cat.id} className="w-[calc(50%-0.5rem)] sm:w-[calc(33.333%-1rem)] md:w-[220px] lg:w-[240px]">
                  <CategoryCard category={cat} index={i} />
                </div>
              ))}
            </div>
          )}

          {/* Centered View All Button */}
          <div className="mt-10 flex justify-center">
            <Link to="/categories">
              <Button className="gap-2 rounded-full px-8 shadow-md shadow-primary/20 font-bold">
                Explore All Categories <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {/* Added a very subtle primary (orange) tint to the background to add color without being dark */}
      <section className="bg-primary/[0.03] border-y border-primary/10 py-12 lg:py-16 dark:bg-zinc-900/40 dark:border-zinc-800">
        <div className="container">
          {/* Centered Header Layout */}
          <div className="max-w-2xl mx-auto text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-3 text-zinc-900 dark:text-zinc-100">
              Featured Products
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm sm:text-base">
              Handpicked, top-rated accessories guaranteed to upgrade your ride.
            </p>
          </div>

          {loading ? (
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="w-[calc(50%-0.5rem)] sm:w-[calc(33.333%-1rem)] md:w-[220px] lg:w-[220px] aspect-[4/3] rounded-xl bg-white animate-pulse shadow-sm" />
              ))}
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-zinc-100 shadow-sm max-w-2xl mx-auto">
              <p className="text-lg font-medium text-zinc-900">No featured products yet.</p>
              <p className="text-sm text-zinc-500 mt-1">Mark products as featured in the admin panel.</p>
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
              {featuredProducts.map(p => (
                <div key={p.id} className="w-[calc(50%-0.5rem)] sm:w-[calc(33.333%-1rem)] md:w-[220px] lg:w-[220px]">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          )}

          {/* Centered View All Button */}
          <div className="mt-10 flex justify-center">
            <Link to="/products">
              <Button className="gap-2 rounded-full px-8 shadow-md shadow-primary/20 font-bold">
                Shop All Products <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>


      {/* New Arrivals */}
      <section className="bg-white py-12 lg:py-16 dark:bg-zinc-950">
        <div className="container">
          {/* Centered Header Layout */}
          <div className="max-w-2xl mx-auto text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-3 text-zinc-900 dark:text-zinc-100">
              New Arrivals
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm sm:text-base">
              Discover the latest premium accessories added to our collection.
            </p>
          </div>

          {loading ? (
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="w-[calc(50%-0.5rem)] sm:w-[calc(33.333%-1rem)] md:w-[220px] lg:w-[220px] aspect-[4/3] rounded-xl bg-zinc-100 animate-pulse shadow-sm" />
              ))}
            </div>
          ) : newArrivals.length === 0 ? (
            <div className="text-center py-12 bg-zinc-50 rounded-2xl border border-zinc-100 max-w-2xl mx-auto">
              <p className="text-lg font-medium text-zinc-900">No new arrivals right now.</p>
              <p className="text-sm text-zinc-500 mt-1">Check back soon for the latest gear.</p>
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
              {newArrivals.map(p => (
                <div key={p.id} className="w-[calc(50%-0.5rem)] sm:w-[calc(33.333%-1rem)] md:w-[220px] lg:w-[220px]">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          )}

          {/* Centered View All Button */}
          <div className="mt-10 flex justify-center">
            <Link to="/products">
              <Button className="gap-2 rounded-full px-8 shadow-md shadow-primary/20 font-bold">
                Explore More <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* High-End Dark CTA Banner */}
      {/* CHANGE: Background changed from dark (#111111) to a light orange tint (primary/10) */}
      <section className="relative bg-primary/10 py-16 lg:py-24 overflow-hidden border-t border-border/10 dark:bg-zinc-900 dark:border-zinc-800">
        
        {/* Optional: You might want to remove this dark gradient background for the light version */}
        {/* <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent z-0" /> */}
        
        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            
            {/* CHANGE: Headline text color changed from white to zinc-950 for contrast */}
            <h2 className="text-3xl md:text-5xl font-black text-zinc-950 dark:text-zinc-100 tracking-tight mb-4">
              Need help choosing the <br className="hidden sm:block" />
              <span className="text-primary">right accessories?</span>
            </h2>
            
            {/* CHANGE: Description text color changed from zinc-400 to zinc-600 for contrast */}
            <p className="text-zinc-600 dark:text-zinc-400 text-base sm:text-lg mb-10 max-w-xl mx-auto font-medium">
              Our auto experts are available Monday–Saturday, 10AM–9PM to help you find the perfect fit for your ride.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="tel:03337778606" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto rounded-full px-8 gap-2 font-bold text-base shadow-lg shadow-primary/20">
                  📞 Call 0333 7778606
                </Button>
              </a>
              <Link to="/booking" className="w-full sm:w-auto">
                {/* CHANGE: 'Book Installation' button border and text color updated for the light background */}
                <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-full px-8 gap-2 border-zinc-200 text-zinc-900 hover:bg-zinc-50 font-medium text-base dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-800">
                  Book Installation
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;