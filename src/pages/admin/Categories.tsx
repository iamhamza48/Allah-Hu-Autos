import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import CategoryCard from '@/components/CategoryCard';
import { Input } from '@/components/ui/input';
import type { Category } from '@/types/database';
import { Search } from 'lucide-react';

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filtered, setFiltered] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('categories').select('*').order('name').then(({ data }) => {
      setCategories(data || []);
      setFiltered(data || []);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(q ? categories.filter(c => c.name.toLowerCase().includes(q)) : categories);
  }, [search, categories]);

  return (
    <div className="container py-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-lg font-bold">All Categories</h1>
          <p className="text-xs text-muted-foreground">{filtered.length} of {categories.length} categories</p>
        </div>
        <div className="relative w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-8 text-sm" />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 24 }).map((_, i) => <div key={i} className="aspect-[4/3] rounded-lg bg-secondary animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((cat, i) => <CategoryCard key={cat.id} category={cat} index={i} />)}
        </div>
      )}
    </div>
  );
};

export default Categories;
