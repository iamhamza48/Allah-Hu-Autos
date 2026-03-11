import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import type { Category } from '@/types/database';
import { motion } from 'framer-motion';

interface CategoryCardProps {
  category: Category;
  index?: number;
}

const CategoryCard = ({ category, index = 0 }: CategoryCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Link to={`/category/${category.slug}`}>
        <Card className="group text-center hover:shadow-lg hover:border-primary/30 transition-all duration-300">
          <CardContent className="p-6">
            <div className="text-3xl mb-3">{category.icon}</div>
            <h3 className="text-sm font-semibold group-hover:text-primary transition-colors">
              {category.name}
            </h3>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
};

export default CategoryCard;
