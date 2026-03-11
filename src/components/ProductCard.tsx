import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatPKR, getPlaceholderImage, getDiscountPercent } from '@/lib/format';
import type { Product } from '@/types/database';
import { motion } from 'framer-motion';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const discount = getDiscountPercent(product.base_price, product.compare_price);
  const image = product.images?.[0]?.url || getPlaceholderImage(product.name, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Link to={`/product/${product.slug}`}>
        <Card className="group overflow-hidden border hover:shadow-lg transition-all duration-300">
          <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
            <img
              src={image}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
            />
            {discount && (
              <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground">
                -{discount}%
              </Badge>
            )}
            {product.installable && (
              <Badge variant="secondary" className="absolute top-2 right-2">
                🔧 Installable
              </Badge>
            )}
          </div>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">{product.category?.name}</p>
            <h3 className="font-semibold text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors">
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
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
