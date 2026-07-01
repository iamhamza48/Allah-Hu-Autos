import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2, ArrowLeft } from 'lucide-react';
import { useWishlistStore } from '@/stores/wishlist';
import { formatPKR, formatProductPrice, getPlaceholderImage, getDiscountPercent } from '@/lib/format';
import { isPublicStoreProduct } from '@/lib/catalog-visibility';
import SEO from '@/components/SEO';

const Wishlist = () => {
  const { items, removeItem, clear } = useWishlistStore();
  const visibleItems = items.filter(isPublicStoreProduct);

  return (
    <div className="container py-12 min-h-[60vh]">
      <SEO
        title="My Wishlist"
        description="Your saved Allah-Hu-Autos products and accessories."
        canonicalPath="/wishlist"
        noindex
      />
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-3xl font-black text-foreground mb-1">My Wishlist</h1>
            <p className="text-sm text-muted-foreground">{visibleItems.length} {visibleItems.length === 1 ? 'item' : 'items'} saved</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {visibleItems.length > 0 && (
            <button
              type="button"
              onClick={clear}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-destructive transition-colors px-3 py-1.5 rounded-lg hover:bg-destructive/10 border border-transparent"
            >
              <Trash2 className="h-4 w-4" />
              Clear all
            </button>
          )}
          <Link
            to="/categories"
            className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Continue shopping
          </Link>
        </div>
      </div>

      {visibleItems.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Heart className="h-16 w-16 text-muted-foreground mb-6" strokeWidth={1.5} />
          <h2 className="text-2xl font-bold text-foreground mb-2">Your wishlist is empty</h2>
          <p className="text-muted-foreground mb-8 max-w-sm">
            Save products you love by clicking the heart icon on any product.
          </p>
          <Link
            to="/categories"
            className="flex items-center gap-2 px-8 py-3.5 rounded-full bg-primary text-white hover:bg-primary/90 font-semibold text-sm shadow-lg shadow-primary/25 transition-all"
          >
            Browse Products
          </Link>
        </div>
      )}

      {visibleItems.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          {visibleItems.map((product) => {
            const discount = getDiscountPercent(product.base_price, product.compare_price);
            const image = product.images?.[0]?.url || getPlaceholderImage(product.name, 0);

            return (
              <div key={product.id} className="group relative overflow-hidden rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-lg transition-all duration-200">
                <button
                  type="button"
                  onClick={() => removeItem(product.id)}
                  className="absolute top-2 right-2 z-20 flex items-center justify-center w-8 h-8 rounded-full bg-card/95 shadow-sm border border-border text-muted-foreground hover:text-destructive hover:border-destructive/30 hover:bg-destructive/10 transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                  aria-label="Remove from wishlist"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>

                <Link to={`/product/${product.slug}`}>
                  <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                    <img
                      src={image}
                      alt={product.name}
                      width="400"
                      height="300"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                      decoding="async"
                    />
                    {discount && (
                      <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-destructive text-destructive-foreground text-[10px] font-bold shadow-sm">
                        -{discount}%
                      </span>
                    )}
                  </div>
                </Link>

                <div className="p-2.5 sm:p-3">
                  <p className="text-[10px] text-muted-foreground mb-1 truncate">{(product as { category?: { name?: string } }).category?.name}</p>
                  <Link to={`/product/${product.slug}`}>
                    <h3 className="text-xs sm:text-sm font-semibold text-foreground line-clamp-2 mb-2 hover:text-primary transition-colors leading-snug min-h-[2.5rem] sm:min-h-0">
                      {product.name}
                    </h3>
                  </Link>
                  <div className="flex items-center gap-1.5 mb-3">
                    <span className="font-bold text-primary text-sm">{formatProductPrice(product)}</span>
                    {product.compare_price && (
                      <span className="text-xs text-muted-foreground line-through">{formatPKR(product.compare_price)}</span>
                    )}
                  </div>

                  <Link
                    to={`/product/${product.slug}`}
                    className="w-full flex items-center justify-center gap-1.5 h-8 rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-primary-foreground hover:border-primary text-xs font-semibold transition-all"
                  >
                    <ShoppingCart className="h-3.5 w-3.5" />
                    View Product
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
