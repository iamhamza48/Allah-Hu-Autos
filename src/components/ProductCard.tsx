import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { formatPKR, getPlaceholderImage, getDiscountPercent } from '@/lib/format';
import type { Product } from '@/types/database';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const discount = getDiscountPercent(product.base_price, product.compare_price);
  const image = product.images?.[0]?.url || getPlaceholderImage(product.name, 0);

  return (
    <Link to={`/product/${product.slug}`}>
      <div className="group overflow-hidden rounded-xl border bg-card hover:border-primary/40 hover:shadow-md transition-all duration-200">
        <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
          <img
            src={image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          {discount && (
            <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs">
              -{discount}%
            </Badge>
          )}
          {product.installable && (
            <Badge variant="secondary" className="absolute top-2 right-2 text-xs">
              🔧 Installable
            </Badge>
          )}
        </div>
        <div className="p-3">
          <p className="text-xs text-muted-foreground mb-1 truncate">{product.category?.name}</p>
          <h3 className="text-sm font-semibold line-clamp-2 mb-2 group-hover:text-primary transition-colors leading-snug">
            {product.name}
          </h3>
          <div className="flex items-center gap-2">
            <span className="font-bold text-primary">{formatPKR(product.base_price)}</span>
            {product.compare_price && (
              <span className="text-xs text-muted-foreground line-through">
                {formatPKR(product.compare_price)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
