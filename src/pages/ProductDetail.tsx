import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCartStore } from '@/stores/cart';
import { formatPKR, getVariantMaximumPrice, getPlaceholderImage, getDiscountPercent } from '@/lib/format';
import VehicleSelector from '@/components/VehicleSelector';
import type { Product, ProductVariant, Review, Vehicle } from '@/types/database';
import { ShoppingCart, Check, X, Star, Minus, Plus, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { HIDDEN_STORE_CATEGORY_SLUGS } from '@/lib/catalog-visibility';
import SEO, { SITE_URL } from '@/components/SEO';

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
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

      if (data?.category?.slug && HIDDEN_STORE_CATEGORY_SLUGS.has(data.category.slug)) {
        navigate('/car-modification', { replace: true });
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
  }, [slug, navigate]);

  useEffect(() => {
    if (!selectedVehicle || !product) { setCompatible(null); return; }

    let cancelled = false;
    supabase
      .from('product_compatibility')
      .select('id')
      .eq('product_id', product.id)
      .eq('vehicle_id', selectedVehicle.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          console.error('Compatibility check failed:', error.message);
          setCompatible(null);
          return;
        }
        setCompatible(!!data);
      });

    return () => { cancelled = true; };
  }, [selectedVehicle, product]);

  const getSelectedItem = () => {
    if (!product || !selectedVariant) {
      toast.error('Please select a variant first');
      return null;
    }
    if (product.installable && !installType) {
      toast.error('Please choose self or professional installation');
      return null;
    }
    return {
      productId: product.id,
      variantId: selectedVariant.id,
      quantity,
      installType: product.installable ? installType : null,
      product,
      variant: selectedVariant,
    };
  };

  const handleAddToCart = () => {
    const item = getSelectedItem();
    if (!item) return;
    addItem(item);
    toast.success('Added to cart!');
  };

  const handleBuyNow = () => {
    const item = getSelectedItem();
    if (!item) return;
    navigate('/checkout', { state: { buyNowItem: item } });
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
  const seoDescription = product.description?.trim()
    ? product.description.slice(0, 155)
    : `Buy ${product.name} from Allah-Hu-Autos with nationwide delivery in Pakistan and expert support from Quetta and Lahore.`;
  const seoPrice = selectedVariant?.price ?? product.base_price;

  return (
    <div className="container py-5 sm:py-8">
      <SEO
        title={`${product.name} Price in Pakistan`}
        description={seoDescription}
        canonicalPath={`/product/${product.slug}`}
        image={images[0]}
        type="product"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: product.name,
          description: seoDescription,
          image: images.map(image => image.startsWith('http') ? image : `${SITE_URL}${image}`),
          category: product.category?.name,
          brand: {
            '@type': 'Brand',
            name: 'Allah-Hu-Autos',
          },
          offers: {
            '@type': 'Offer',
            url: `${SITE_URL}/product/${product.slug}`,
            priceCurrency: 'PKR',
            price: seoPrice,
            availability: 'https://schema.org/InStock',
            itemCondition: 'https://schema.org/NewCondition',
          },
          aggregateRating: avgRating ? {
            '@type': 'AggregateRating',
            ratingValue: avgRating,
            reviewCount: reviews.length,
          } : undefined,
        }}
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
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
              {selectedVariant && getVariantMaximumPrice(selectedVariant)
                ? `${formatPKR(selectedVariant.price)} – ${formatPKR(getVariantMaximumPrice(selectedVariant)!)}`
                : formatPKR(selectedVariant?.price ?? product.base_price)}
            </span>
            {(selectedVariant?.compare_price ?? product.compare_price) && (
              <span className="text-lg text-muted-foreground line-through">
                {formatPKR(selectedVariant?.compare_price ?? product.compare_price!)}
              </span>
            )}
          </div>

          <p className="text-sm font-semibold text-emerald-600">Free delivery across Pakistan</p>

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
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={installType === 'self' ? 'default' : 'outline'}
                  size="sm"
                  className="w-full px-2 text-xs sm:text-sm"
                  onClick={() => setInstallType('self')}
                >
                  Self Install
                </Button>
                <Button
                  variant={installType === 'professional' ? 'default' : 'outline'}
                  size="sm"
                  className="w-full px-2 text-xs sm:text-sm"
                  onClick={() => setInstallType('professional')}
                >
                  Professional Install
                </Button>
              </div>
            </div>
          )}

          {/* Quantity + purchase actions */}
          <div className="space-y-3 sm:flex sm:items-center sm:gap-3 sm:space-y-0">
            <div className="flex items-center justify-between sm:justify-start">
              <span className="text-sm font-medium text-muted-foreground sm:hidden">Quantity</span>
              <div className="flex h-11 w-[132px] items-center justify-between rounded-lg border">
                <Button variant="ghost" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-10 text-center font-medium">{quantity}</span>
                <Button variant="ghost" size="icon" onClick={() => setQuantity(Math.min(99, quantity + 1))}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-1 sm:gap-3">
              <Button onClick={handleAddToCart} variant="outline" className="w-full min-w-0 gap-1.5 px-2 text-xs sm:flex-1 sm:px-4 sm:text-sm" size="lg">
                <ShoppingCart className="h-4 w-4 shrink-0" /> <span className="truncate">Add to Cart</span>
              </Button>
              <Button onClick={handleBuyNow} className="w-full min-w-0 gap-1.5 px-2 text-xs sm:flex-1 sm:px-4 sm:text-sm" size="lg">
                <Zap className="h-4 w-4 shrink-0" /> <span className="truncate">Buy Now</span>
              </Button>
            </div>
          </div>

          {selectedVariant && getVariantMaximumPrice(selectedVariant) && (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
              Final price depends on vehicle fitment and will be confirmed after your order is placed.
            </p>
          )}

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
