import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { FaDownload, FaCalendarAlt, FaTag } from "react-icons/fa";
import { MinecraftButton } from "@/components/ui/minecraft-button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { type Mod } from "@shared/schema";

const ModDetail = () => {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  
  const { data: mod, isLoading, error } = useQuery<Mod>({
    queryKey: [`/api/mods/${id}`],
  });
  
  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const formatDownloads = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };
  
  const handleDownload = async () => {
    if (!mod) return;
    
    try {
      // API возвращает данные с redirectUrl для перенаправления на источник
      const data = await apiRequest('POST', `/api/mods/${id}/download`, null);
      // Invalidate queries to refresh download count
      queryClient.invalidateQueries({ queryKey: [`/api/mods/${id}`] });
      
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
  
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="bg-black p-6 rounded-lg border-2 border-red-500 minecraft-border">
          <h1 className="text-2xl font-bold text-red-500">Error</h1>
          <p className="mt-2 text-white">Failed to load mod details. Please try again later.</p>
          <MinecraftButton 
            className="mt-4"
            onClick={() => setLocation("/")}
          >
            Return to Home
          </MinecraftButton>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <button 
          onClick={() => setLocation("/")}
          className="text-sm text-primary hover:underline"
        >
          &larr; Back to Home
        </button>
      </div>
      
      {isLoading ? (
        <div className="bg-black rounded-lg shadow-lg overflow-hidden border-2 border-primary/50">
          <Skeleton className="h-80 w-full" />
          <div className="p-6">
            <Skeleton className="h-10 w-3/4 mb-4" />
            <div className="flex space-x-2 mb-6">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4 mb-6" />
            <div className="flex justify-between">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </div>
      ) : mod ? (
        <div className="bg-black rounded-lg shadow-lg overflow-hidden border-2 border-primary/50 minecraft-border glow-effect">
          <div className="relative">
            <img 
              src={mod.imageUrl} 
              alt={mod.name} 
              className="w-full h-80 object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null; // Prevent infinite loops
                target.src = `https://placehold.co/800x400/333333/FFFFFF.png?text=${encodeURIComponent(mod.name)}`;
              }}
            />
            {mod.isNew && (
              <div className="absolute top-4 right-4 bg-primary text-white px-3 py-1 rounded-full font-bold text-sm minecraft-border">NEW</div>
            )}
          </div>
          
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-3xl font-bold text-primary">{mod.name}</h1>
              <Badge variant="outline" className="bg-primary/20 text-white hover:bg-primary/30 text-sm px-3">
                {mod.version}
              </Badge>
            </div>
            
            <div className="flex flex-wrap gap-3 mb-6">
              <div className="flex items-center text-sm text-white">
                <FaTag className="mr-1 text-primary" />
                <span>{mod.category}</span>
              </div>
              <div className="flex items-center text-sm text-white">
                <FaCalendarAlt className="mr-1 text-primary" />
                <span>Added {formatDate(mod.createdAt)}</span>
              </div>
              <div className="flex items-center text-sm text-white">
                <FaDownload className="mr-1 text-primary" />
                <span>{formatDownloads(mod.downloadCount)} downloads</span>
              </div>
            </div>
            
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-2 text-primary">Description</h2>
              <p className="text-white">{mod.description}</p>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="text-white">
                Minecraft {mod.version}
              </div>
              <MinecraftButton onClick={handleDownload}>
                Download Mod
              </MinecraftButton>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-black p-6 rounded-lg shadow text-center border-2 border-primary/50 minecraft-border">
          <h1 className="text-2xl font-bold text-primary">Mod not found</h1>
          <p className="mt-2 text-white">The mod you're looking for doesn't exist or has been removed.</p>
          <MinecraftButton 
            className="mt-4"
            onClick={() => setLocation("/")}
          >
            Return to Home
          </MinecraftButton>
        </div>
      )}
    </div>
  );
};

export default ModDetail;
