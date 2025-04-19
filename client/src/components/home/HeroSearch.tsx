import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { FaSearch } from "react-icons/fa";
import { MinecraftButton } from "@/components/ui/minecraft-button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";

const quickFilters = [
  { name: "Technology", type: "category" },
  { name: "Magic", type: "category" },
  { name: "Adventure", type: "category" },
  { name: "1.20+", type: "version" },
  { name: "Most Popular", type: "sort" },
];

interface HeroSearchProps {
  onSearch: (query: string) => void;
  onQuickFilter: (filter: { name: string; type: string }) => void;
}

const HeroSearch = ({ onSearch, onQuickFilter }: HeroSearchProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const { t } = useLanguage();

  // Переводим названия фильтров для быстрого доступа
  const getFilterTranslatedName = (filter: { name: string; type: string }) => {
    if (filter.type === "category") {
      return t(`category.${filter.name.toLowerCase()}`);
    } else if (filter.type === "sort" && filter.name === "Most Popular") {
      return t('filter.popularity');
    }
    return filter.name; // Версии не переводим
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery);
    } else {
      toast({
        title: t('common.search'),
        description: "Please enter a search term",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="relative bg-black">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/40 to-black/90"></div>
      <div className="relative max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-primary text-shadow-primary text-center sm:text-5xl lg:text-6xl">
          {t('page.home.title')}
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-xl text-white/80 text-center">
          {t('page.home.subtitle')}
        </p>
        
        <div className="mt-10 max-w-xl mx-auto">
          <form onSubmit={handleSubmit} className="flex rounded-md shadow-sm">
            <div className="relative flex items-stretch flex-grow">
              <Input
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="focus:ring-2 focus:ring-primary block w-full rounded-none rounded-l-md pl-10 bg-card/80 border-gray-700 text-foreground"
                placeholder={t('common.search') + "..."}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-primary/70" />
              </div>
            </div>
            <MinecraftButton 
              type="submit"
              className="rounded-r-md"
            >
              {t('common.search')}
            </MinecraftButton>
          </form>
          
          <div className="flex flex-wrap gap-2 mt-4 justify-center text-sm">
            {quickFilters.map((filter, index) => (
              <MinecraftButton
                key={index}
                size="xs"
                onClick={() => onQuickFilter(filter)}
              >
                {getFilterTranslatedName(filter)}
              </MinecraftButton>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSearch;
