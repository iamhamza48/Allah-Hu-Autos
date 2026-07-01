import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';
import { Input } from '@/components/ui/input';
import type { Product } from '@/types/database';
import { Search as SearchIcon } from 'lucide-react';
import { isPublicStoreProduct } from '@/lib/catalog-visibility';
import SEO from '@/components/SEO';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const [query, setQuery] = useState(q);
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    setLoading(true);
    supabase
      .from('products')
      .select('*, category:categories(*), images:product_images(*), variants:product_variants(*)')
      .ilike('name', `%${query}%`)
      .limit(100)
      .then(({ data }) => {
        setResults((data || []).filter(isPublicStoreProduct).slice(0, 30));
        setLoading(false);
      });
  }, [query]);

  useEffect(() => {
    setQuery(q);
  }, [q]);

  return (
    <div className="container py-8">
      <SEO
        title="Search Products"
        description="Search car accessories, lighting, mats, audio products and styling upgrades at Allah-Hu-Autos."
        canonicalPath="/search"
        noindex
      />
      <h1 className="text-3xl font-bold mb-6">Search Products</h1>
      <div className="relative max-w-lg mb-8">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search for accessories..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 text-lg h-12"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-72 rounded-lg bg-secondary animate-pulse" />
          ))}
        </div>
      ) : results.length === 0 ? (
        <p className="text-muted-foreground py-10">
          {query.trim() ? `No results for "${query}"` : 'Type to search products...'}
        </p>
      ) : (
        <>
          <p className="text-muted-foreground mb-4">{results.length} results for "{query}"</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {results.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default SearchPage;
