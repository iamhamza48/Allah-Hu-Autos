import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';
import CategoryCard from '@/components/CategoryCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import type { Product, Category } from '@/types/database';

interface CategoryRow extends Category {
  parent_id: string | null;
}

const CategoryDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<CategoryRow | null>(null);
  const [subcategories, setSubcategories] = useState<CategoryRow[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('name');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!slug) return;
    const fetchData = async () => {
      setLoading(true);

      // Get this category
      const { data: cat } = await supabase.from('categories').select('*').eq('slug', slug).single();
      if (!cat) { setLoading(false); return; }
      setCategory(cat as CategoryRow);

      // Check if it has subcategories
      const { data: subs } = await supabase.from('categories').select('*').eq('parent_id', cat.id).order('name');
      const subList = (subs || []) as CategoryRow[];
      setSubcategories(subList);

      if (subList.length > 0) {
        // Parent category — fetch products from ALL subcategories
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
        // Leaf category — fetch products directly
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

  if (loading) return (
    <div className="container py-6">
      <div className="h-8 w-48 rounded bg-secondary animate-pulse mb-6" />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => <div key={i} className="aspect-[4/3] rounded-xl bg-secondary animate-pulse" />)}
      </div>
    </div>
  );

  if (!category) return <div className="container py-20 text-center text-muted-foreground">Category not found.</div>;

  const isParent = subcategories.length > 0;

  return (
    <div className="container py-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
        <span>/</span>
        <Link to="/categories" className="hover:text-foreground transition-colors">Categories</Link>
        <span>/</span>
        <span className="text-foreground font-medium">{category.name}</span>
      </div>

      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <span>{category.icon}</span> {category.name}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isParent
              ? `${subcategories.length} subcategories · ${products.length} products`
              : `${filteredProducts.length} products`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!isParent && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 w-48" />
            </div>
          )}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-44 h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name A–Z</SelectItem>
              <SelectItem value="price_asc">Price: Low–High</SelectItem>
              <SelectItem value="price_desc">Price: High–Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Subcategory grid for parent categories */}
      {isParent && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Browse by subcategory</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-8">
            {subcategories.map((sub, i) => <CategoryCard key={sub.id} category={sub} index={i} />)}
          </div>
          <div className="border-t pt-6">
            <h2 className="text-base font-bold mb-4">All Products in {category.name}</h2>
          </div>
        </div>
      )}

      {/* Products */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground border rounded-xl border-dashed">
          <p className="font-medium">No products found</p>
          <p className="text-sm mt-1">Try a different search or browse subcategories</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredProducts.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
};

export default CategoryDetail;