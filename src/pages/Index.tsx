import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ProductCard from '@/components/ProductCard';
import CategoryCard from '@/components/CategoryCard';
import VehicleSelector from '@/components/VehicleSelector';
import type { Product, Category } from '@/types/database';
import { ArrowRight, Shield, Truck, Wrench, Phone, Star, ChevronRight } from 'lucide-react';

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

    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <div>
{/* ── Hero ──────────────────────────────────────────────────────── */}
<section className="relative min-h-[560px] lg:min-h-[680px] bg-gray-950 overflow-hidden flex items-center">

  {/* Background image — side profile car, car is on the RIGHT */}
  <div
    className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
    style={{
      backgroundImage:
        "url('https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1800&q=85&fit=crop&crop=right')",
    }}
  />

  {/* Very strong left gradient so text is always readable */}
  <div className="absolute inset-0 z-[1]"
    style={{
      background: 'linear-gradient(to right, rgba(3,7,18,1) 0%, rgba(3,7,18,0.97) 30%, rgba(3,7,18,0.85) 50%, rgba(3,7,18,0.4) 70%, rgba(3,7,18,0.15) 100%)'
    }}
  />
  {/* Bottom fade */}
  <div className="absolute bottom-0 left-0 right-0 h-24 z-[1] bg-gradient-to-t from-gray-950/70 to-transparent" />

  {/* Blue left accent bar */}
  <div className="absolute left-0 top-20 bottom-20 w-[3px] z-[2] bg-gradient-to-b from-transparent via-blue-500 to-transparent" />

  <div className="container relative z-10 py-20 lg:py-28">
    <div className="max-w-xl">
      <Badge className="mb-5 bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[11px] px-3 py-1 rounded-full font-semibold tracking-widest uppercase backdrop-blur-sm">
        ✦ Premium Automotive Accessories
      </Badge>

      <h1 className="text-4xl sm:text-5xl lg:text-[3.4rem] font-black text-white mb-5 leading-[1.07] tracking-tight">
        We Take Pride in{' '}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-300 to-cyan-300">
          Your Ride
        </span>
      </h1>

      <p className="text-base sm:text-lg text-white/70 mb-8 max-w-md leading-relaxed">
        Premium automotive accessories for every car on Pakistani roads — LED lights, body kits, mats, audio &amp; more. Delivered to your door.
      </p>

      <div className="flex flex-wrap items-center gap-3 mb-10">
        <Link to="/products">
          <Button size="lg" className="gap-2 font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 px-7 rounded-xl">
            Shop Now <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
        <Link to="/categories">
          <Button size="lg" variant="outline" className="border border-white/25 text-white hover:bg-white/10 hover:text-white bg-white/5 backdrop-blur-sm font-medium rounded-xl">
            Browse Categories
          </Button>
        </Link>
        <Link to="/booking">
          <Button size="lg" variant="outline" className="border border-white/25 text-white hover:bg-white/10 hover:text-white bg-white/5 backdrop-blur-sm font-medium rounded-xl">
            Book Installation
          </Button>
        </Link>
      </div>

      <div className="flex gap-8 sm:gap-10 border-t border-white/10 pt-6">
        {[['500+', 'Products'], ['50+', 'Brands'], ['2', 'Branches']].map(([num, label]) => (
          <div key={label}>
            <p className="text-2xl sm:text-3xl font-black text-blue-400 mb-1 leading-none">{num}</p>
            <p className="text-[11px] sm:text-xs text-white/50 font-semibold uppercase tracking-widest mt-1">{label}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
</section>

      {/* ── Trust bar ─────────────────────────────────────────────────── */}
      <section className="bg-[#0B4DAE] border-b border-blue-700/30">
        <div className="container">
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-blue-700/30">
            {[
              { icon: Shield, title: 'Quality Guaranteed', desc: 'Genuine, certified products only' },
              { icon: Truck, title: 'Nationwide Delivery', desc: 'Fast shipping across Pakistan' },
              { icon: Wrench, title: 'Expert Installation', desc: 'Professional fitting at our branches' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-4 px-6 py-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 shrink-0">
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{title}</p>
                  <p className="text-xs text-blue-200">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Vehicle Finder ────────────────────────────────────────────── */}
      <section className="bg-gray-50 dark:bg-gray-900 py-14 lg:py-20 border-b border-gray-200 dark:border-gray-700">
        <div className="container">
          <div className="max-w-xl mx-auto text-center mb-10">
            <p className="section-label mb-2">Vehicle Finder</p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-3 text-gray-900 dark:text-white">
              Shop by Your Car
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
              Select your vehicle's make, model, and year to find accessories guaranteed to fit.
            </p>
          </div>

          <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
            <VehicleSelector />
          </div>
        </div>
      </section>

      {/* ── Featured Categories ───────────────────────────────────────── */}
      <section className="bg-white dark:bg-gray-950 py-14 lg:py-20">
        <div className="container">
          <div className="max-w-xl mx-auto text-center mb-10">
            <p className="section-label mb-2">Browse</p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-3 text-gray-900 dark:text-white">
              Shop by Category
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
              Find exactly what you need from our premium selection of accessories.
            </p>
          </div>

          {loading ? (
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="w-[calc(50%-0.5rem)] sm:w-[calc(33.333%-1rem)] md:w-[220px] lg:w-[240px] aspect-[4/3] rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
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

          <div className="mt-10 flex justify-center">
            <Link to="/categories">
              <Button className="gap-2 rounded-full px-8 shadow-md shadow-primary/20 font-bold bg-primary hover:bg-primary/90 text-white">
                Explore All Categories <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Featured Products ─────────────────────────────────────────── */}
      <section className="bg-gray-50 dark:bg-gray-900 border-y border-gray-200 dark:border-gray-700 py-14 lg:py-20">
        <div className="container">
          <div className="max-w-xl mx-auto text-center mb-10">
            <p className="section-label mb-2">Top Picks</p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-3 text-gray-900 dark:text-white">
              Featured Products
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
              Handpicked, top-rated accessories guaranteed to upgrade your ride.
            </p>
          </div>

          {loading ? (
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="w-[calc(50%-0.5rem)] sm:w-[calc(33.333%-1rem)] md:w-[220px] lg:w-[220px] aspect-[4/3] rounded-xl bg-white dark:bg-gray-800 animate-pulse shadow-sm" />
              ))}
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm max-w-2xl mx-auto">
              <p className="text-lg font-medium text-gray-900 dark:text-white">No featured products yet.</p>
              <p className="text-sm text-gray-500 mt-1">Mark products as featured in the admin panel.</p>
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

          <div className="mt-10 flex justify-center">
            <Link to="/products">
              <Button className="gap-2 rounded-full px-8 shadow-md shadow-primary/20 font-bold bg-primary hover:bg-primary/90 text-white">
                Shop All Products <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── New Arrivals ──────────────────────────────────────────────── */}
      <section className="bg-white dark:bg-gray-950 py-14 lg:py-20">
        <div className="container">
          <div className="max-w-xl mx-auto text-center mb-10">
            <p className="section-label mb-2">Just In</p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-3 text-gray-900 dark:text-white">
              New Arrivals
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
              Discover the latest premium accessories added to our collection.
            </p>
          </div>

          {loading ? (
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="w-[calc(50%-0.5rem)] sm:w-[calc(33.333%-1rem)] md:w-[220px] lg:w-[220px] aspect-[4/3] rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse shadow-sm" />
              ))}
            </div>
          ) : newArrivals.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 max-w-2xl mx-auto">
              <p className="text-lg font-medium text-gray-900 dark:text-white">No new arrivals right now.</p>
              <p className="text-sm text-gray-500 mt-1">Check back soon for the latest gear.</p>
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

          <div className="mt-10 flex justify-center">
            <Link to="/products">
              <Button className="gap-2 rounded-full px-8 shadow-md shadow-primary/20 font-bold bg-primary hover:bg-primary/90 text-white">
                Explore More <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 border-t border-gray-200 dark:border-gray-800 py-16 lg:py-24 overflow-hidden">
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-5" style={{
          backgroundImage: `radial-gradient(circle at 25px 25px, currentColor 2px, transparent 0)`,
          backgroundSize: '50px 50px',
        }} />

        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <p className="section-label text-primary mb-3">Get Expert Help</p>
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight mb-4">
              Need help choosing the <br className="hidden sm:block" />
              right accessories?
            </h2>

            <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg mb-10 max-w-xl mx-auto font-medium">
              Our auto experts are available Monday–Saturday, 10AM–9PM to help you find the perfect fit for your ride.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="tel:03337778606" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto rounded-full px-8 gap-2 font-bold text-base bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20">
                  <Phone className="h-4 w-4" /> Call 0333 7778606
                </Button>
              </a>
              <Link to="/booking" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto rounded-full px-8 gap-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 font-medium text-base shadow-sm">
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
