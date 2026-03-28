import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';
import CategoryCard from '@/components/CategoryCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search, ChevronRight, LayoutGrid, SlidersHorizontal } from 'lucide-react';
import type { Product, Category } from '@/types/database';

interface CategoryRow extends Category {
  parent_id: string | null;
}

const CategoryDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<CategoryRow | null>(null);
  const [parentCategory, setParentCategory] = useState<CategoryRow | null>(null);
  const [subcategories, setSubcategories] = useState<CategoryRow[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('name');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!slug) return;
    const fetchData = async () => {
      setLoading(true);
      setSearch('');

      const { data: cat } = await supabase.from('categories').select('*').eq('slug', slug).single();
      if (!cat) { setLoading(false); return; }
      setCategory(cat as CategoryRow);

      // Fetch parent if this is a child category
      if ((cat as CategoryRow).parent_id) {
        const { data: parent } = await supabase.from('categories').select('*').eq('id', (cat as CategoryRow).parent_id).single();
        setParentCategory(parent as CategoryRow);
      } else {
        setParentCategory(null);
      }

      const { data: subs } = await supabase.from('categories').select('*').eq('parent_id', cat.id).order('name');
      const subList = (subs || []) as CategoryRow[];
      setSubcategories(subList);

      if (subList.length > 0) {
        const subIds = subList.map(s => s.id);
        const { data } = await supabase
          .from('products')
          .select('*, category:categories(*), images:product_images(*)')
          .in('category_id', subIds)
          .order(sortBy === 'price_asc' || sortBy === 'price_desc' ? 'base_price' : 'name', {
            ascending: sortBy !== 'price_desc',
          });
        setProducts(data || []);
      } else {
        const { data } = await supabase
          .from('products')
          .select('*, category:categories(*), images:product_images(*)')
          .eq('category_id', cat.id)
          .order(sortBy === 'price_asc' || sortBy === 'price_desc' ? 'base_price' : 'name', {
            ascending: sortBy !== 'price_desc',
          });
        setProducts(data || []);
      }
      setLoading(false);
    };
    fetchData();
  }, [slug, sortBy]);

  const filteredProducts = search.trim()
    ? products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    : products;

  const isParent = subcategories.length > 0;

  // ── Loading skeleton ────────────────────────────────────────────────
  if (loading) return (
    <div>
      <div className="bg-zinc-900 h-40 animate-pulse" />
      <div className="container py-12">
        <div className="flex flex-wrap justify-center gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="w-[calc(50%-0.5rem)] sm:w-[calc(33.333%-1rem)] md:w-[200px] lg:w-[220px] aspect-[4/3] rounded-xl bg-zinc-100 animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );

  if (!category) return (
    <div className="container py-20 text-center text-muted-foreground">Category not found.</div>
  );

  return (
    <div>

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="relative bg-zinc-900 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-primary/20 rounded-full blur-3xl pointer-events-none" />

        <div className="container relative z-10 py-10 lg:py-14">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-[11px] text-white/40 mb-5 font-medium tracking-wide uppercase flex-wrap">
            <Link to="/" className="hover:text-white/70 transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link to="/categories" className="hover:text-white/70 transition-colors">Categories</Link>
            {parentCategory && (
              <>
                <ChevronRight className="h-3 w-3" />
                <Link to={`/category/${parentCategory.slug}`} className="hover:text-white/70 transition-colors">
                  {parentCategory.name}
                </Link>
              </>
            )}
            <ChevronRight className="h-3 w-3" />
            <span className="text-white/70">{category.name}</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <p className="text-xs font-bold tracking-[0.2em] uppercase text-primary mb-2">
                {parentCategory ? parentCategory.name : 'Categories'}
              </p>
              <h1 className="text-4xl sm:text-5xl font-black text-white leading-[1.08] tracking-tight">
                <span className="text-primary">{category.name}</span>
              </h1>
              <p className="text-white/50 text-sm mt-2 flex items-center gap-2">
                <LayoutGrid className="h-3.5 w-3.5 text-primary" />
                {isParent
                  ? `${subcategories.length} subcategories · ${products.length} products`
                  : `${filteredProducts.length} products`}
              </p>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2 flex-wrap">
              {!isParent && (
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
                  <Input
                    placeholder="Search products..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="pl-10 h-10 w-48 rounded-full bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              )}
              <div className="flex items-center gap-1.5 bg-zinc-800 border border-zinc-700 rounded-full px-3 h-10">
                <SlidersHorizontal className="h-3.5 w-3.5 text-zinc-400" />
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="border-0 bg-transparent text-zinc-300 text-xs h-auto p-0 focus:ring-0 w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name A–Z</SelectItem>
                    <SelectItem value="price_asc">Price: Low–High</SelectItem>
                    <SelectItem value="price_desc">Price: High–Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Main content ───────────────────────────────────────────────── */}
      <div className="container py-12 lg:py-16">

        {/* Subcategory cards — parent view */}
        {isParent && (
          <div className="mb-14">
            <div className="max-w-2xl mx-auto text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-black text-zinc-900 tracking-tight mb-1">
                Browse by Subcategory
              </h2>
              <p className="text-sm text-zinc-400">{subcategories.length} subcategories</p>
            </div>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
              {subcategories.map((sub, i) => (
                <div key={sub.id} className="w-[calc(50%-0.5rem)] sm:w-[calc(33.333%-1rem)] md:w-[200px] lg:w-[220px]">
                  <CategoryCard category={sub} index={i} />
                </div>
              ))}
            </div>
            {/* Divider before all products */}
            <div className="mt-14 mb-12 h-px bg-gradient-to-r from-transparent via-zinc-200 to-transparent" />
            <div className="max-w-2xl mx-auto text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-black text-zinc-900 tracking-tight">
                All Products in {category.name}
              </h2>
              <p className="text-sm text-zinc-400 mt-1">{products.length} products</p>
            </div>
          </div>
        )}

        {/* Products grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-zinc-200 rounded-2xl">
            <p className="font-bold text-lg text-zinc-700 mb-1">No products found</p>
            <p className="text-sm text-zinc-400 mb-4">
              {search.trim() ? 'Try a different search term' : 'No products in this category yet'}
            </p>
            {search.trim() && (
              <button onClick={() => setSearch('')} className="text-primary text-sm font-semibold hover:underline">
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
            {filteredProducts.map(p => (
              <div key={p.id} className="w-[calc(50%-0.5rem)] sm:w-[calc(33.333%-1rem)] md:w-[200px] lg:w-[220px]">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Bottom CTA ─────────────────────────────────────────────────── */}
      <section className="bg-primary/10 border-t border-primary/10 py-14">
        <div className="container text-center">
          <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 mb-3 tracking-tight">
            Need help finding the right product?
          </h2>
          <p className="text-zinc-500 text-sm mb-7 max-w-md mx-auto">
            Our experts are available Mon–Sat, 10AM–9PM to help you pick the perfect accessories.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <a href="tel:03337778606">
              <button className="h-11 px-6 rounded-full bg-primary hover:bg-primary/90 text-white text-sm font-bold shadow-lg shadow-primary/25 transition-all">
                📞 Call 0333 7778606
              </button>
            </a>
            <Link to="/booking">
              <button className="h-11 px-6 rounded-full border border-zinc-300 hover:border-primary/50 text-zinc-700 hover:text-primary text-sm font-semibold transition-all">
                Book Installation
              </button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default CategoryDetail;