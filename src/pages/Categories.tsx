import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import CategoryCard from '@/components/CategoryCard';
import { Input } from '@/components/ui/input';
import type { Category } from '@/types/database';
import { Search, ChevronRight } from 'lucide-react';

interface CategoryRow extends Category {
  parent_id: string | null;
  sort_order: number | null;
}

const Categories = () => {
  const [parents, setParents] = useState<CategoryRow[]>([]);
  const [children, setChildren] = useState<CategoryRow[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('categories').select('*').order('sort_order', { ascending: true }).order('name').then(({ data }) => {
      const all = (data || []) as CategoryRow[];
      setParents(all.filter(c => !c.parent_id));
      setChildren(all.filter(c => !!c.parent_id));
      setLoading(false);
    });
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

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold">All Categories</h1>
          <p className="text-sm text-muted-foreground">{children.length} categories across {parents.length} departments</p>
        </div>
        <div className="relative w-52">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search categories..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9" />
        </div>
      </div>

      {loading ? (
        <div className="space-y-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i}>
              <div className="h-6 w-32 rounded bg-secondary animate-pulse mb-3" />
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                {Array.from({ length: 6 }).map((_, j) => <div key={j} className="aspect-[4/3] rounded-xl bg-secondary animate-pulse" />)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          {filteredParents.map(parent => {
            const kids = filteredChildren(parent.id);
            if (kids.length === 0 && search.trim()) return null;
            return (
              <div key={parent.id}>
                <div className="flex items-center justify-between mb-3">
                  <Link to={`/category/${parent.slug}`} className="flex items-center gap-2 group">
                    <span className="text-lg">{parent.icon}</span>
                    <h2 className="text-base font-bold group-hover:text-primary transition-colors">{parent.name}</h2>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </Link>
                  <span className="text-xs text-muted-foreground">{kids.length} categories</span>
                </div>
                {kids.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                    {kids.map((cat, i) => <CategoryCard key={cat.id} category={cat} index={i} />)}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                    <CategoryCard key={parent.id} category={parent} index={0} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Categories;