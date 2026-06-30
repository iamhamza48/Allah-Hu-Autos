import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCartStore } from '@/stores/cart';
import { formatPKR, getPlaceholderImage, getDiscountPercent } from '@/lib/format';
import VehicleSelector from '@/components/VehicleSelector';
import type { Product, ProductVariant, Review, Vehicle } from '@/types/database';
import { ShoppingCart, Check, X, Star, Minus, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [installType, setInstallType] = useState<'self' | 'professional' | null>(null);
  const [compatible, setCompatible] = useState<boolean | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    if (!slug) return;
    const fetch = async () => {
      setLoading(true);
      const { data, error: productError } = await supabase
        .from('products')
        .select('*, category:categories(*), variants:product_variants(*), images:product_images(*)')
        .eq('slug', slug)
        .single();

      if (productError) {
        setProduct(null);
        setLoading(false);
        return;
      }

      const sortedVariants = [...(data?.variants || [])].sort((a, b) => a.name.localeCompare(b.name));
      const normalizedProduct = { ...data, variants: sortedVariants };
      setProduct(normalizedProduct);
      setSelectedVariant(sortedVariants[0] || null);
      setSelectedImage(0);
      setQuantity(1);

      if (normalizedProduct) {
        const { data: revsData, error: revsError } = await supabase
          .from('reviews')
          .select('*')
          .eq('product_id', normalizedProduct.id)
          .eq('is_approved', true)
          .order('created_at', { ascending: false });

        if (revsError) {
          console.error('Supabase Error loading reviews:', revsError.message);
          setReviews([]);
        } else if (revsData && revsData.length > 0) {
          const userIds = Array.from(new Set(revsData.map(r => r.user_id).filter(Boolean)));
          const profileMap: Record<string, any> = {};

          if (userIds.length > 0) {
            const { data: profilesData, error: profilesError } = await supabase
              .from('profiles')
              .select('*')
              .in('id', userIds);

            if (profilesError) {
              console.error('Supabase Error loading review profiles:', profilesError.message);
            } else {
              profilesData?.forEach(p => {
                profileMap[p.id] = p;
              });
            }
          }

          const mappedRevs = revsData.map(r => ({
            ...r,
            profile: profileMap[r.user_id] || null
          }));
          setReviews(mappedRevs);
        } else {
          setReviews([]);
        }
      }
      setLoading(false);
    };
    fetch();
  }, [slug]);

  useEffect(() => {
    if (!selectedVehicle || !product) { setCompatible(null); return; }
    supabase
      .from('product_compatibility')
      .select('id')
      .eq('product_id', product.id)
      .eq('vehicle_id', selectedVehicle.id)
      .then(({ data }) => {
        setCompatible(data && data.length > 0);
      });
  }, [selectedVehicle, product]);

  const handleAddToCart = () => {
    if (!product || !selectedVariant) {
      toast.error('Please select a variant first');
      return;
    }
    addItem({
      productId: product.id,
      variantId: selectedVariant.id,
      quantity,
      installType: product.installable ? installType : null,
      product,
      variant: selectedVariant,
    });
    toast.success('Added to cart!');
  };

  if (loading) {
    return (
      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="aspect-square rounded-lg bg-secondary animate-pulse" />
          <div className="space-y-4">
            <div className="h-8 w-3/4 rounded bg-secondary animate-pulse" />
            <div className="h-6 w-1/2 rounded bg-secondary animate-pulse" />
            <div className="h-32 rounded bg-secondary animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return <div className="container py-20 text-center text-muted-foreground">Product not found.</div>;
  }

  const images = product.images?.length
    ? product.images.map((img) => img.url)
    : [getPlaceholderImage(product.name, 0), getPlaceholderImage(product.name, 1)];

  const discount = getDiscountPercent(
    selectedVariant?.price ?? product.base_price,
    selectedVariant?.compare_price ?? product.compare_price
  );

  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div className="container py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Images */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="relative aspect-square overflow-hidden rounded-lg bg-secondary mb-3">
            <img
              src={images[selectedImage]}
              alt={product.name}
              className="h-full w-full object-cover"
            />
            {discount && (
              <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground text-sm">
                -{discount}%
              </Badge>
            )}
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedImage(i)}
                className={`h-16 w-16 shrink-0 rounded-md overflow-hidden border-2 transition-colors ${i === selectedImage ? 'border-primary' : 'border-transparent'
                  }`}
              >
                <img src={img} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </motion.div>

        {/* Details */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{product.category?.name}</p>
            <h1 className="text-2xl lg:text-3xl font-bold">{product.name}</h1>
            {avgRating && (
              <div className="flex items-center gap-1 mt-2 text-sm">
                <Star className="h-4 w-4 fill-warning text-warning" />
                <span className="font-medium">{avgRating}</span>
                <span className="text-muted-foreground">({reviews.length} reviews)</span>
              </div>
            )}
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-primary">
              {formatPKR(selectedVariant?.price ?? product.base_price)}
            </span>
            {(selectedVariant?.compare_price ?? product.compare_price) && (
              <span className="text-lg text-muted-foreground line-through">
                {formatPKR(selectedVariant?.compare_price ?? product.compare_price!)}
              </span>
            )}
          </div>

          <p className="text-muted-foreground">{product.description}</p>

          {/* Variant selector */}
          <div>
            <label className="text-sm font-medium mb-2 block">Variant</label>
            {product.variants && product.variants.length > 1 ? (
              <Select
                value={selectedVariant?.id}
                onValueChange={(v) => setSelectedVariant(product.variants!.find((vr) => vr.id === v) || null)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {product.variants.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.name} — {formatPKR(v.price)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : product.variants && product.variants.length === 1 ? (
              <div className="h-10 px-3 rounded-md border bg-secondary/40 flex items-center text-sm">
                {product.variants[0].name} — {formatPKR(product.variants[0].price)}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground border border-dashed rounded-md px-3 py-2">
                No variants configured yet.
              </p>
            )}
          </div>

          {/* Install type */}
          {product.installable && (
            <div>
              <label className="text-sm font-medium mb-2 block">Installation</label>
              <div className="flex gap-2">
                <Button
                  variant={installType === 'self' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setInstallType('self')}
                >
                  Self Install
                </Button>
                <Button
                  variant={installType === 'professional' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setInstallType('professional')}
                >
                  Professional Install
                </Button>
              </div>
            </div>
          )}

          {/* Quantity + Add to cart */}
          <div className="flex items-center gap-4">
            <div className="flex items-center border rounded-md">
              <Button variant="ghost" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-10 text-center font-medium">{quantity}</span>
              <Button variant="ghost" size="icon" onClick={() => setQuantity(quantity + 1)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <Button onClick={handleAddToCart} className="flex-1 gap-2" size="lg">
              <ShoppingCart className="h-4 w-4" /> Add to Cart
            </Button>
          </div>

          {/* Vehicle compatibility */}
          <Card>
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold mb-3">Check Vehicle Compatibility</h3>
              <VehicleSelector onSelect={setSelectedVehicle} />
              {compatible === true && (
                <div className="mt-3 flex items-center gap-2 text-success text-sm font-medium">
                  <Check className="h-4 w-4" /> Fits your vehicle
                </div>
              )}
              {compatible === false && (
                <div className="mt-3 flex items-center gap-2 text-destructive text-sm font-medium">
                  <X className="h-4 w-4" /> May not fit your vehicle
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Reviews */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
        {reviews.length === 0 ? (
          <p className="text-muted-foreground">No reviews yet.</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((r) => (
              <Card key={r.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{r.profile?.full_name || 'Anonymous'}</span>
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${i < r.rating ? 'fill-warning text-warning' : 'text-muted'}`}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {r.created_at ? new Date(r.created_at).toLocaleDateString() : '—'}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{r.comment}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default ProductDetail;
