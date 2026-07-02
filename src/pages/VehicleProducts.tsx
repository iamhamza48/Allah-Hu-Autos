import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';
import VehicleSelector from '@/components/VehicleSelector';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Product } from '@/types/database';
import { Car, ChevronRight, SlidersHorizontal, PackageSearch, LayoutGrid } from 'lucide-react';
import { isPublicStoreProduct } from '@/lib/catalog-visibility';

interface VehicleInfo {
  id: string;
  year: number;
  model: { name: string; make: { name: string } };
}

const VehicleProducts = () => {
  const { vehicleId } = useParams<{ vehicleId: string }>();
  const [vehicle, setVehicle] = useState<VehicleInfo | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('default');
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    if (!vehicleId) return;
    setLoading(true);
    setVehicle(null);
    setProducts([]);

    Promise.all([
      supabase
        .from('vehicles')
        .select('id, year, model:vehicle_models(name, make:vehicle_makes(name))')
        .eq('id', vehicleId)
        .single(),
      supabase
        .from('products')
        .select('*, category:categories(*), images:product_images(*), variants:product_variants(*)')
        .order('name'),
    ]).then(([vehicleRes, productsRes]) => {
      setVehicle(vehicleRes.data as any);
      const prods = (productsRes.data || []).filter(isPublicStoreProduct) as Product[];
      setProducts(prods);
      setLoading(false);
    });
  }, [vehicleId]);

  const categories = useMemo(() => {
    const cats = new Map<string, string>();
    products.forEach(p => {
      if (p.category) cats.set(p.category.id, p.category.name);
    });
    return Array.from(cats.entries());
  }, [products]);

  const filtered = useMemo(() => {
    const list = activeCategory === 'all'
      ? products
      : products.filter(p => p.category_id === activeCategory);

    return [...list].sort((a, b) => {
      if (sortBy === 'price-asc') return a.base_price - b.base_price;
      if (sortBy === 'price-desc') return b.base_price - a.base_price;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });
  }, [products, activeCategory, sortBy]);

  const makeName = (vehicle as any)?.model?.make?.name ?? '';
  const modelName = (vehicle as any)?.model?.name ?? '';

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="relative bg-zinc-900 overflow-hidden">
        {/* Dot-grid texture */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
        {/* Red glow top-left */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        {/* Diagonal accent bar */}
        <div
          className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10"
          style={{
            background: 'linear-gradient(135deg, transparent 40%, hsl(var(--primary)) 100%)',
          }}
        />

        <div className="container relative z-10 py-8">

          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-[11px] text-white/40 mb-6 font-medium tracking-wide uppercase">
            <Link to="/" className="hover:text-white/70 transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link to="/products" className="hover:text-white/70 transition-colors">Products</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-white/70">
              {vehicle ? `${makeName} ${modelName}` : '—'}
            </span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-start gap-8">

            {/* Left — car identity */}
            <div className="flex-1 mb-6 lg:mb-0">
              {loading && !vehicle ? (
                <div className="space-y-3">
                  <div className="h-10 w-72 bg-white/10 rounded-lg animate-pulse" />
                  <div className="h-4 w-48 bg-white/10 rounded animate-pulse" />
                </div>
              ) : vehicle ? (
                <>
                  <div className="flex items-center gap-3 mb-1">
                    {/* Icon badge */}
                    <div className="w-14 h-14 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0 shadow-lg shadow-primary/10">
                      <Car className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-white/40 font-semibold uppercase tracking-widest mb-0.5">
                        Compatible Accessories
                      </p>
                      <h1 className="text-3xl sm:text-4xl font-black text-white leading-none tracking-tight">
                        {makeName}{' '}
                        <span className="text-primary">{modelName}</span>
                      </h1>
                    </div>
                  </div>

                  {/* Stat pills */}
                  <div className="flex items-center gap-3 mt-5 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/10 rounded-full px-3 py-1 text-xs text-white/70 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
                      {vehicle.year} Model Year
                    </span>
                    <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/10 rounded-full px-3 py-1 text-xs text-white/70 font-medium">
                      <LayoutGrid className="h-3 w-3 text-primary" />
                      {loading ? '...' : `${products.length} accessories`}
                    </span>
                    {categories.length > 0 && (
                      <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/10 rounded-full px-3 py-1 text-xs text-white/70 font-medium">
                        <PackageSearch className="h-3 w-3 text-primary" />
                        {categories.length} categories
                      </span>
                    )}
                  </div>
                </>
              ) : null}
            </div>

            {/* Right — change vehicle */}
            <div className="w-full lg:w-[440px] shrink-0">
              <p className="text-[10px] text-white/30 font-semibold uppercase tracking-widest mb-2">
                Search Another Vehicle
              </p>
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-sm">
                <VehicleSelector />
              </div>
            </div>

          </div>
        </div>

        {/* Bottom fade to page bg */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-white/10" />
      </div>

      {/* ── Category chips + Sort ─────────────────────────────────────────── */}
      {!loading && products.length > 0 && (
        <div className="sticky top-[104px] z-30 bg-white/80 dark:bg-zinc-900/80 backdrop-blur border-b border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="container flex items-center gap-3 py-2.5 overflow-x-auto scrollbar-hide">
            {/* Category filters */}
            <div className="flex items-center gap-3 flex-1 min-w-0 whitespace-nowrap overflow-x-auto scrollbar-hide py-1">
              <button
                onClick={() => setActiveCategory('all')}
                className={`flex-shrink-0 min-w-[140px] max-w-[200px] px-4 py-1 rounded-full text-xs font-semibold border transition-all overflow-hidden whitespace-nowrap text-ellipsis ${
                  activeCategory === 'all'
                    ? 'bg-primary text-white border-primary shadow-sm'
                    : 'bg-transparent border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-500'
                }`}
                style={{textOverflow:'ellipsis'}}
                title={`All (${products.length})`}
              >
                All ({products.length})
              </button>
              {categories.map(([id, name]) => {
                const count = products.filter(p => p.category_id === id).length;
                return (
                  <button
                    key={id}
                    onClick={() => setActiveCategory(id)}
                    className={`flex-shrink-0 min-w-[140px] max-w-[200px] px-4 py-1 rounded-full text-xs font-semibold border transition-all overflow-hidden whitespace-nowrap text-ellipsis ${
                      activeCategory === id
                        ? 'bg-primary text-white border-primary shadow-sm'
                        : 'bg-transparent border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-500'
                    }`}
                    style={{textOverflow:'ellipsis'}}
                    title={`${name} (${count})`}
                  >
                    {name} ({count})
                  </button>
                );
              })}
            </div>

            {/* Sort */}
            <div className="flex items-center gap-1.5 shrink-0">
              <SlidersHorizontal className="h-3.5 w-3.5 text-zinc-400" />
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-36 h-7 text-xs border-zinc-200 dark:border-zinc-700 bg-transparent">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="price-asc">Price: Low → High</SelectItem>
                  <SelectItem value="price-desc">Price: High → Low</SelectItem>
                  <SelectItem value="name">Name A–Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* ── Products Grid ─────────────────────────────────────────────────── */}
      <div className="container py-8">

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl bg-zinc-200 dark:bg-zinc-800 animate-pulse"
                style={{ aspectRatio: '3/4', animationDelay: `${i * 60}ms` }}
              />
            ))}
          </div>
        ) : filtered.length === 0 && products.length > 0 ? (
          // Category has no results
          <div className="text-center py-16">
            <p className="text-zinc-400 text-sm">No products in this category.</p>
            <button
              onClick={() => setActiveCategory('all')}
              className="mt-3 text-primary text-sm font-medium hover:underline"
            >
              Show all accessories
            </button>
          </div>
        ) : products.length === 0 ? (
          // No compatibility at all
          <div className="text-center py-24 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
            <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-4">
              <Car className="h-8 w-8 text-zinc-400" />
            </div>
            <p className="font-bold text-lg text-zinc-700 dark:text-zinc-300 mb-1">
              No accessories listed yet
            </p>
            <p className="text-sm text-zinc-400 mb-6 max-w-xs mx-auto">
              We haven't tagged compatible accessories for this vehicle yet. Check back soon.
            </p>
            <Link to="/products">
              <Button variant="outline" size="sm">Browse All Products</Button>
            </Link>
          </div>
        ) : (
          <>
            <p className="text-xs text-zinc-400 font-medium mb-4">
              Showing <span className="text-zinc-700 dark:text-zinc-200 font-bold">{filtered.length}</span> of {products.length} accessories
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {filtered.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VehicleProducts;
