import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2, ArrowLeft } from 'lucide-react';
import { useWishlistStore } from '@/stores/wishlist';
import { formatPKR, getPlaceholderImage, getDiscountPercent } from '@/lib/format';

const Wishlist = () => {
  const { items, removeItem, clear } = useWishlistStore();

  return (
    <div className="container py-12 min-h-[60vh]">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-zinc-200">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-3xl font-black text-zinc-900 mb-1">My Wishlist</h1>
            <p className="text-sm text-zinc-500">{items.length} {items.length === 1 ? 'item' : 'items'} saved</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {items.length > 0 && (
            <button
              onClick={clear}
              className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-red-500 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50 border border-transparent"
            >
              <Trash2 className="h-4 w-4" />
              Clear all
            </button>
          )}
          <Link
            to="/categories"
            className="flex items-center gap-1.5 text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Continue shopping
          </Link>
        </div>
      </div>

      {/* Empty state */}
      {items.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Heart className="h-16 w-16 text-zinc-500 mb-6" strokeWidth={1.5} />
          <h2 className="text-2xl font-bold text-zinc-900 mb-2">Your wishlist is empty</h2>
          <p className="text-zinc-500 mb-8 max-w-sm">
            Save products you love by clicking the heart icon on any product.
          </p>
          <Link
            to="/categories"
            className="flex items-center gap-2 px-8 py-3.5 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm shadow-lg shadow-orange-500/25 transition-all"
          >
            Browse Products
          </Link>
        </div>
      )}

      {/* Grid */}
      {items.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {items.map((product) => {
            const discount = getDiscountPercent(product.base_price, product.compare_price);
            const image = product.images?.[0]?.url || getPlaceholderImage(product.name, 0);

            return (
              <div key={product.id} className="group relative overflow-hidden rounded-xl border border-zinc-200 bg-white hover:border-orange-500/30 hover:shadow-lg transition-all duration-200">
                {/* Remove button */}
                <button
                  onClick={() => removeItem(product.id)}
                  className="absolute top-2 right-2 z-20 flex items-center justify-center w-7 h-7 rounded-full bg-white/90 shadow-sm border border-zinc-200 text-zinc-500 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                  aria-label="Remove from wishlist"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>

                {/* Image */}
                <Link to={`/product/${product.slug}`}>
                  <div className="relative aspect-[4/3] overflow-hidden bg-zinc-100">
                    <img
                      src={image}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                    {discount && (
                      <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-orange-500 text-white text-[10px] font-bold shadow-sm">
                        -{discount}%
                      </span>
                    )}
                  </div>
                </Link>

                {/* Info */}
                <div className="p-3">
                  <p className="text-[10px] text-zinc-500 mb-1 truncate">{(product as any).category?.name}</p>
                  <Link to={`/product/${product.slug}`}>
                    <h3 className="text-sm font-semibold text-zinc-900 line-clamp-2 mb-2 hover:text-orange-500 transition-colors leading-snug">
                      {product.name}
                    </h3>
                  </Link>
                  <div className="flex items-center gap-1.5 mb-3">
                    <span className="font-bold text-orange-500 text-sm">{formatPKR(product.base_price)}</span>
                    {product.compare_price && (
                      <span className="text-xs text-zinc-400 line-through">{formatPKR(product.compare_price)}</span>
                    )}
                  </div>

                  {/* TURNED INTO A DIRECT LINK */}
                  <Link
                    to={`/product/${product.slug}`}
                    className="w-full flex items-center justify-center gap-1.5 h-8 rounded-lg bg-orange-50 text-orange-600 border border-orange-100 hover:bg-orange-500 hover:text-white hover:border-orange-500 text-xs font-semibold transition-all"
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