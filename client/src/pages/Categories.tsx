import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { type Category } from "@shared/schema";

const Categories = () => {
  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link href="/" className="text-sm text-primary hover:underline">
          &larr; Back to Home
        </Link>
      </div>
      
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-primary mb-4">Mod Categories</h1>
        <p className="text-xl text-white max-w-3xl mx-auto">
          Explore Minecraft mods by category to find exactly what you're looking for
        </p>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array(9).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-lg" />
          ))}
        </div>
      ) : categories ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category) => (
            <Link key={category.id} href={`/category/${category.name}`}>
              <div className="relative h-64 rounded-lg overflow-hidden minecraft-border glow-effect cursor-pointer transform transition-transform hover:scale-[1.02]">
                <img 
                  src={category.imageUrl} 
                  alt={category.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-6">
                  <h2 className="text-2xl font-bold text-white mb-2">{category.name}</h2>
                  <div className="bg-primary/30 w-12 h-1 mb-3 rounded-sm"></div>
                  <p className="text-white text-opacity-90">
                    {category.name === "Technology" && "Automate your world with tech mods"}
                    {category.name === "Magic" && "Discover magical powers and artifacts"}
                    {category.name === "Adventure" && "Embark on epic journeys and quests"}
                    {category.name === "Utility" && "Enhance gameplay with useful tools"}
                    {category.name === "Cosmetic" && "Beautify your Minecraft experience"}
                    {category.name === "Worldgen" && "Transform how worlds are generated"}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-black border-2 border-primary/50 rounded-lg minecraft-border">
          <h2 className="text-2xl font-bold text-white mb-2">No Categories Found</h2>
          <p className="text-white">Sorry, we couldn't find any categories. Please try again later.</p>
        </div>
      )}
    </div>
  );
};

export default Categories;