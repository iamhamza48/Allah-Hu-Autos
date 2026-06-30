import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Product, Category } from '@/types/database';
import { Search } from 'lucide-react';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [reloadTick, setReloadTick] = useState(0);

  useEffect(() => {
    supabase.from('categories').select('*').order('name').then(({ data }) => {
      setCategories(data || []);
    });
  }, []);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      let query = supabase
        .from('products')
        .select('*, category:categories(*), images:product_images(*), variants:product_variants(*)');

      if (search) {
        query = query.ilike('name', `%${search}%`);
      }
      if (categoryFilter !== 'all') {
        query = query.eq('category_id', categoryFilter);
      }

      query = query.order(
        sortBy === 'price_asc' || sortBy === 'price_desc' ? 'base_price' : 'name',
        { ascending: sortBy !== 'price_desc' }
      );

      const { data } = await query.limit(50);
      setProducts(data || []);
      setLoading(false);
    };
    fetch();
  }, [search, categoryFilter, sortBy, reloadTick]);

  useEffect(() => {
    const channel = supabase
      .channel('products-page-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        setReloadTick((v) => v + 1);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'product_images' }, () => {
        setReloadTick((v) => v + 1);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'product_variants' }, () => {
        setReloadTick((v) => v + 1);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="container py-5 sm:py-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-5 sm:mb-6">All Products</h1>

      <div className="flex flex-col sm:flex-row gap-3 mb-5 sm:mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name A-Z</SelectItem>
            <SelectItem value="price_asc">Price: Low to High</SelectItem>
            <SelectItem value="price_desc">Price: High to Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-72 rounded-lg bg-secondary animate-pulse" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <p className="text-center text-muted-foreground py-20">No products found.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Products;
