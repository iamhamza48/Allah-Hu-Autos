import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatPKR, formatProductPrice, getPlaceholderImage, getDiscountPercent } from '@/lib/format';
import { useWishlistStore } from '@/stores/wishlist';
import { useCartStore } from '@/stores/cart';
import type { Product } from '@/types/database';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const navigate = useNavigate();
  const discount = getDiscountPercent(product.base_price, product.compare_price);
  const image = product.images?.[0]?.url || getPlaceholderImage(product.name, 0);

  const { toggleItem, isWishlisted } = useWishlistStore();
  const wishlisted = isWishlisted(product.id);
  const addToCart = useCartStore((s) => s.addItem);

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleItem(product);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // No variants loaded means we can't add to cart from here — send user to product page
    if (!product.variants || product.variants.length === 0) {
      navigate(`/product/${product.slug}`);
      return;
    }
    const firstVariant = product.variants[0];
    addToCart({
      productId: product.id,
      variantId: firstVariant.id,
      quantity: 1,
      installType: null,
      product,
      variant: firstVariant,
    });
  };

  return (
    <Link to={`/product/${product.slug}`}>
      <div className="group h-full overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-primary/40 hover:shadow-lg sm:hover:-translate-y-0.5 transition-all duration-200">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
          <img
            src={image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = getPlaceholderImage(product.name, 0);
            }}
          />
          {discount && (
            <Badge className="absolute top-1.5 sm:top-2 left-1.5 sm:left-2 bg-destructive text-destructive-foreground text-[10px] sm:text-xs z-10 border-0 px-1.5 sm:px-2">
              -{discount}%
            </Badge>
          )}
          {product.installable && (
            <Badge variant="secondary" className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2 text-[9px] sm:text-xs z-10 px-1.5 sm:px-2">
              🔧 Installable
            </Badge>
          )}

          {/* Hover action overlay */}
          <div className="absolute inset-x-0 bottom-0 hidden sm:flex items-center gap-2 p-2 translate-y-full group-hover:translate-y-0 transition-transform duration-200 ease-out z-20">
            <button
              onClick={handleAddToCart}
              className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-lg bg-primary text-white hover:bg-primary/90 text-xs font-semibold shadow-md shadow-primary/20 transition-colors"
              aria-label="Add to cart"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              Add to Cart
            </button>
            <button
              onClick={handleWishlist}
              className={`flex items-center justify-center h-9 w-9 rounded-lg border transition-all shrink-0 ${wishlisted
                ? 'bg-primary/15 border-primary/50 text-primary'
                : 'bg-background/90 border-border text-muted-foreground hover:border-primary/40 hover:text-primary'
                }`}
              aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart className="h-4 w-4" fill={wishlisted ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="p-2.5 sm:p-3">
          <p className="text-[10px] sm:text-xs text-muted-foreground mb-1 truncate">{product.category?.name}</p>
          <h3 className="text-xs sm:text-sm font-semibold line-clamp-2 mb-2 group-hover:text-primary transition-colors leading-snug min-h-[2.5rem] sm:min-h-0">
            {product.name}
          </h3>
          <div className="flex items-center justify-between gap-1.5">
            <div className="flex min-w-0 flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2">
              <span className="font-bold text-xs sm:text-base text-primary truncate">{formatProductPrice(product)}</span>
              {product.compare_price && (
                <span className="text-xs text-muted-foreground line-through">
                  {formatPKR(product.compare_price)}
                </span>
              )}
            </div>
            <button
              onClick={handleWishlist}
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${wishlisted ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-primary bg-secondary/60'
                }`}
              aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart className="h-4 w-4" fill={wishlisted ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
