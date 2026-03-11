import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ProductCard from '@/components/ProductCard';
import CategoryCard from '@/components/CategoryCard';
import VehicleSelector from '@/components/VehicleSelector';
import type { Product, Category } from '@/types/database';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, Truck, Wrench, Star } from 'lucide-react';

const Index = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [featuredCategories, setFeaturedCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [productsRes, categoriesRes] = await Promise.all([
        supabase
          .from('products')
          .select('*, category:categories(*), images:product_images(*)')
          .eq('featured', true)
          .limit(8),
        supabase
          .from('categories')
          .select('*')
          .eq('featured', true)
          .limit(12),
      ]);
      setFeaturedProducts(productsRes.data || []);
      setFeaturedCategories(categoriesRes.data || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-dark text-dark-foreground overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent" />
        <div className="container relative py-20 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
              🚗 Pakistan's #1 Auto Accessories
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-4 leading-tight">
              We Take Pride in{' '}
              <span className="text-primary">Your Ride</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-lg">
              Premium automotive accessories for every car on Pakistani roads. From LED lights to body kits — upgrade your vehicle today.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/products">
                <Button size="lg" className="gap-2">
                  Shop Now <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/categories">
                <Button size="lg" variant="outline" className="border-muted-foreground/30 text-dark-foreground hover:bg-muted/10">
                  Browse Categories
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Vehicle Finder */}
      <section className="border-b bg-card">
        <div className="container py-8">
          <h2 className="text-lg font-bold mb-4 text-center">🔍 Find Parts for Your Vehicle</h2>
          <div className="max-w-2xl mx-auto">
            <VehicleSelector />
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="container py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold">Shop by Category</h2>
            <p className="text-muted-foreground">43 categories of premium accessories</p>
          </div>
          <Link to="/categories">
            <Button variant="ghost" className="gap-1">
              View All <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="h-28 rounded-lg bg-secondary animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {featuredCategories.map((cat, i) => (
              <CategoryCard key={cat.id} category={cat} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* Featured Products */}
      <section className="bg-secondary/50">
        <div className="container py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold">Featured Products</h2>
              <p className="text-muted-foreground">Handpicked bestsellers</p>
            </div>
            <Link to="/products">
              <Button variant="ghost" className="gap-1">
                View All <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-72 rounded-lg bg-card animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="container py-16">
        <h2 className="text-2xl font-bold text-center mb-12">Why Choose Allah-Hu-Autos?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: Shield, title: 'Genuine Products', desc: '100% authentic accessories with warranty' },
            { icon: Truck, title: 'Fast Delivery', desc: 'Nationwide delivery across Pakistan' },
            { icon: Wrench, title: 'Expert Installation', desc: 'Professional fitting at our branches' },
            { icon: Star, title: 'Customer Rated', desc: 'Trusted by thousands of car enthusiasts' },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                <item.icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-semibold mb-1">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Index;
