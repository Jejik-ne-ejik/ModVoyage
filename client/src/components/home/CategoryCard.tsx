import { Link } from "wouter";
import { type Category } from "@shared/schema";

interface CategoryCardProps {
  category: Category;
}

const CategoryCard = ({ category }: CategoryCardProps) => {
  return (
    <Link href={`/category/${category.name}`} className="group">
      <div className="relative h-32 rounded-lg overflow-hidden border-2 minecraft-border glow-effect">
        <img 
          src={category.imageUrl} 
          alt={category.name} 
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null; // Prevent infinite loops
            target.src = `https://placehold.co/200x150/333333/FFFFFF.png?text=${encodeURIComponent(category.name)}`;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end p-3">
          <span className="text-white font-bold text-shadow-primary group-hover:text-white/90">{category.name}</span>
        </div>
      </div>
    </Link>
  );
};

export default CategoryCard;
