import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import CategoryCard from '@/components/CategoryCard';
import { Input } from '@/components/ui/input';
import type { Category } from '@/types/database';
import { Search, ChevronRight, LayoutGrid } from 'lucide-react';
import { HIDDEN_STORE_CATEGORY_SLUGS, SERVICES_CATEGORY_SLUG } from '@/lib/catalog-visibility';
import SEO from '@/components/SEO';

interface CategoryRow extends Category {
  parent_id: string | null;
  sort_order: number | null;
}

const Categories = () => {
  const [parents, setParents] = useState<CategoryRow[]>([]);
  const [children, setChildren] = useState<CategoryRow[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [reloadTick, setReloadTick] = useState(0);

  useEffect(() => {
    supabase.from('categories').select('*').order('sort_order', { ascending: true }).order('name').then(({ data }) => {
      const all = ((data || []) as CategoryRow[]).filter(category =>
        !HIDDEN_STORE_CATEGORY_SLUGS.has(category.slug) && category.slug !== SERVICES_CATEGORY_SLUG
      );
      setParents(all.filter(c => !c.parent_id));
      setChildren(all.filter(c => !!c.parent_id));
      setLoading(false);
    });
  }, [reloadTick]);

  useEffect(() => {
    const channel = supabase
      .channel('categories-page-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, () => {
        setReloadTick((v) => v + 1);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getChildren = (parentId: string) => children.filter(c => c.parent_id === parentId);

  const filteredParents = search.trim()
    ? parents.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        getChildren(p.id).some(c => c.name.toLowerCase().includes(search.toLowerCase()))
      )
    : parents;

  const filteredChildren = (parentId: string) => {
    const kids = getChildren(parentId);
    if (!search.trim()) return kids;
    return kids.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
  };

  const totalCategories = parents.length + children.length;

  return (
    <div>
      <SEO
        title="Car Accessories Categories"
        description="Explore Allah-Hu-Autos categories including LEDs, car speakers, Android panels, security systems, accessories, perfumes and polishes in Pakistan."
        canonicalPath="/categories"
      />

      {/* ── Hero header ───────────────────────────────────────────────── */}
      <section className="relative bg-zinc-900 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-primary/20 rounded-full blur-3xl pointer-events-none" />

        <div className="container relative z-10 py-10 lg:py-14">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-[11px] text-white/40 mb-5 font-medium tracking-wide uppercase">
            <Link to="/" className="hover:text-white/70 transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-white/70">Categories</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            {/* Title */}
            <div>
              <p className="text-xs font-bold tracking-[0.2em] uppercase text-primary mb-2">Browse our range</p>
              <h1 className="text-4xl sm:text-5xl font-black text-white leading-[1.08] tracking-tight">
                All <span className="text-primary">Categories</span>
              </h1>
              <p className="text-white/50 text-sm mt-2 flex items-center gap-2">
                <LayoutGrid className="h-3.5 w-3.5 text-primary" />
                {loading ? '...' : `${totalCategories} categories across ${parents.length} departments`}
              </p>
            </div>

            {/* Search */}
            <div className="relative md:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
              <Input
                placeholder="Search categories..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-10 h-10 rounded-full bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Category sections ─────────────────────────────────────────── */}
      <div className="container py-12 lg:py-16">
        {loading ? (
          <div className="space-y-14">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i}>
                <div className="h-7 w-36 rounded-lg bg-zinc-200 animate-pulse mb-6" />
                <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <div key={j} className="w-[calc(50%-0.5rem)] sm:w-[calc(33.333%-1rem)] md:w-[200px] lg:w-[220px] aspect-[4/3] rounded-xl bg-zinc-100 animate-pulse" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-14">
            {filteredParents.map((parent) => {
              const kids = filteredChildren(parent.id);
              if (kids.length === 0 && search.trim()) return null;

              const displayCards = kids.length > 0 ? kids : [parent];
              return (
                <div key={parent.id}>
                  {/* Section header — always centred */}
                  <div className="max-w-2xl mx-auto text-center mb-8">
                    <Link
                      to={`/category/${parent.slug}`}
                      className="inline-flex items-center gap-2 group mb-2"
                    >
                      <h2 className="text-2xl md:text-3xl font-black text-zinc-900 group-hover:text-primary transition-colors tracking-tight">
                        {parent.name}
                      </h2>
                      <ChevronRight className="h-5 w-5 text-zinc-400 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                    </Link>
                    <p className="text-sm text-zinc-400 mt-1">
                      {displayCards.length} {displayCards.length === 1 ? 'category' : 'categories'}
                      {' · '}
                      <Link to={`/category/${parent.slug}`} className="text-primary hover:underline font-medium">
                        View all →
                      </Link>
                    </p>
                  </div>

                  {/* Cards — always centred */}
                  <div className="flex flex-wrap gap-4 sm:gap-6 justify-center">
                    {displayCards.map((cat, i) => (
                      <div
                        key={cat.id}
                        className="w-[calc(50%-0.5rem)] sm:w-[calc(33.333%-1rem)] md:w-[200px] lg:w-[220px]"
                      >
                        <CategoryCard category={cat} index={i} />
                      </div>
                    ))}
                  </div>

                  {/* Divider */}
                  <div className="mt-14 h-px bg-gradient-to-r from-transparent via-zinc-200 to-transparent" />
                </div>
              );
            })}

            {/* No results */}
            {filteredParents.length === 0 && (
              <div className="text-center py-20 border-2 border-dashed border-zinc-200 rounded-2xl">
                <p className="text-lg font-bold text-zinc-700 mb-1">No categories found</p>
                <p className="text-sm text-zinc-400">Try a different search term</p>
                <button
                  onClick={() => setSearch('')}
                  className="mt-4 text-primary text-sm font-semibold hover:underline"
                >
                  Clear search
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Bottom CTA ────────────────────────────────────────────────── */}
      <section className="bg-primary/10 border-t border-primary/10 py-14">
        <div className="container text-center">
          <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 mb-3 tracking-tight">
            Can't find what you're looking for?
          </h2>
          <p className="text-zinc-500 text-sm mb-7 max-w-md mx-auto">
            Call our experts or book an installation — we'll help you find the perfect accessories for your car.
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

export default Categories;
