import { Link } from 'react-router-dom';
import { getCategoryImage } from '@/lib/categoryImages';
import type { Category } from '@/types/database';

interface CategoryCardProps {
  category: Category & { image_url?: string };
  index?: number;
}

const CategoryCard = ({ category }: CategoryCardProps) => {
  const img = (category as any).image_url || getCategoryImage(category.slug);

  return (
    <Link to={`/category/${category.slug}`}>
      <div className="group relative cursor-pointer overflow-hidden rounded-xl ring-0 transition-all duration-300 ease-out hover:-translate-y-1 hover:ring-2 hover:ring-primary/60 hover:ring-offset-2 hover:shadow-xl active:translate-y-0 active:scale-[0.98]">
        <div className="aspect-[4/3] overflow-hidden bg-secondary">
          <img
            src={img}
            alt={category.name}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1493238792000-8113da705763?w=400&q=80&fit=crop';
            }}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent group-hover:from-[#0B4DAE]/80 group-hover:via-[#0B4DAE]/20 transition-all duration-300" />
        <div className="absolute bottom-0 left-0 right-0 p-2">
          <p className="text-white text-xs font-semibold text-center leading-tight line-clamp-2 drop-shadow">
            {category.name}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default CategoryCard;
