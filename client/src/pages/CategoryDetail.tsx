import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { type Mod } from "@shared/schema";
import ModCard from "@/components/home/ModCard";

const CategoryDetail = () => {
  const { name } = useParams();
  const decodedName = name ? decodeURIComponent(name) : "";
  
  const { data: mods, isLoading } = useQuery<Mod[]>({
    queryKey: ['/api/mods', { category: decodedName }],
    enabled: !!decodedName
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link href="/categories" className="text-sm text-primary hover:underline">
          &larr; Back to Categories
        </Link>
      </div>
      
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-primary mb-4">{decodedName} Mods</h1>
        <p className="text-xl text-white max-w-3xl mx-auto">
          {decodedName === "Technology" && "Automate and engineer your Minecraft world with tech mods"}
          {decodedName === "Magic" && "Discover magical powers, spells, and artifacts to enhance your gameplay"}
          {decodedName === "Adventure" && "Embark on epic journeys and quests in your Minecraft world"}
          {decodedName === "Utility" && "Essential tools and utilities to make your Minecraft life easier"}
          {decodedName === "Cosmetic" && "Make your Minecraft world more beautiful with decorative mods"}
          {decodedName === "Worldgen" && "Transform your Minecraft world generation with these mods"}
          {!["Technology", "Magic", "Adventure", "Utility", "Cosmetic", "Worldgen"].includes(decodedName) && 
            `Browse all mods in the ${decodedName} category`}
        </p>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array(8).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-lg" />
          ))}
        </div>
      ) : mods && mods.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {mods.map((mod) => (
            <ModCard key={mod.id} mod={mod} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-black border-2 border-primary/50 rounded-lg minecraft-border">
          <h2 className="text-2xl font-bold text-white mb-2">No Mods Found</h2>
          <p className="text-white mb-4">
            We couldn't find any mods in the {decodedName} category.
          </p>
          <Link href="/categories">
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-black bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
              Browse All Categories
            </button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default CategoryDetail;