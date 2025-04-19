import { Link } from "wouter";
import { FaDownload } from "react-icons/fa";
import { MinecraftButton } from "@/components/ui/minecraft-button";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { type Mod } from "@shared/schema";

interface ModCardProps {
  mod: Mod;
}

const formatDownloads = (count: number): string => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
};

const ModCard = ({ mod }: ModCardProps) => {
  const handleDownload = async (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      // API возвращает данные с redirectUrl для перенаправления на источник
      const data = await apiRequest('POST', `/api/mods/${id}/download`, null);
      // Invalidate popular mods to refresh counts
      queryClient.invalidateQueries({ queryKey: ['/api/mods/popular'] });
      queryClient.invalidateQueries({ queryKey: ['/api/mods'] });
      
      // Перенаправление на страницу источника
      if (data && data.redirectUrl) {
        window.open(data.redirectUrl, '_blank'); // Открываем в новой вкладке
      } else {
        // Запасной вариант - используем старый метод, если redirectUrl отсутствует
        window.location.href = mod.downloadUrl;
      }
    } catch (error) {
      console.error("Error incrementing download count:", error);
    }
  };

  return (
    <Link href={`/mod/${mod.id}`}>
      <div className="bg-card rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 border-2 cursor-pointer minecraft-border glow-effect">
        <div className="relative">
          <img 
            className="h-48 w-full object-cover" 
            src={mod.imageUrl} 
            alt={mod.name}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null; // Prevent infinite loops
              target.src = `https://placehold.co/400x300/333333/FFFFFF.png?text=${encodeURIComponent(mod.name)}`;
            }}
          />
          {mod.isNew && (
            <div className="absolute top-0 right-0 bg-primary text-white font-bold px-2 py-1 text-xs minecraft-border">NEW</div>
          )}
        </div>
        <div className="p-4">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-semibold text-primary">{mod.name}</h3>
            <div className="flex gap-2">
              <Badge variant="outline" className="bg-secondary/20 text-white hover:bg-secondary/30">
                {mod.source || "Unknown"}
              </Badge>
              <Badge variant="outline" className="bg-primary/20 text-white hover:bg-primary/30">
                {mod.version}
              </Badge>
            </div>
          </div>
          <p className="text-white text-sm mt-2">{mod.description}</p>
          <div className="flex justify-between items-center mt-4">
            <div className="flex items-center text-white/80 text-sm">
              <FaDownload className="mr-1 text-primary/90" />
              <span>{formatDownloads(mod.downloadCount)} downloads</span>
            </div>
            <MinecraftButton 
              size="xs"
              onClick={(e) => handleDownload(e, mod.id)}
            >
              Download
            </MinecraftButton>
          </div>
        </div>
      </div>
    </Link>
  );
};

export { ModCard };
export default ModCard;
