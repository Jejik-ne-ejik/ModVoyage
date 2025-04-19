import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import HeroSearch from "@/components/home/HeroSearch";
import FilterSection from "@/components/home/FilterSection";
import ModCard from "@/components/home/ModCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { type Mod } from "@shared/schema";
import { useLanguage } from "@/contexts/LanguageContext";

// Определяем интерфейс для пагинированного результата
interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

const Home = () => {
  const [searchParams, setSearchParams] = useState<{
    search?: string;
    version?: string;
    category?: string;
    sortBy?: string;
    source?: string;
    page?: number;
  }>({
    page: 1
  });
  
  const { toast } = useToast();
  const { t } = useLanguage();

  const { data: popularMods, isLoading: popularLoading } = useQuery<Mod[]>({
    queryKey: ["/api/mods/popular"],
  });

  const { data: latestMods, isLoading: latestLoading } = useQuery<Mod[]>({
    queryKey: ["/api/mods/latest"],
  });

  const { data: searchResults, isLoading: searchLoading } = useQuery<PaginatedResult<Mod>>({
    queryKey: [
      `/api/mods?${new URLSearchParams({
        ...(searchParams.search ? { search: searchParams.search } : {}),
        ...(searchParams.version ? { version: searchParams.version } : {}),
        ...(searchParams.category ? { category: searchParams.category } : {}),
        ...(searchParams.sortBy ? { sortBy: searchParams.sortBy } : {}),
        ...(searchParams.source ? { source: searchParams.source } : {}),
        ...(searchParams.page ? { page: searchParams.page.toString() } : { page: '1' }),
        pageSize: '12' // По 12 модов на страницу
      }).toString()}`
    ],
    enabled: !!searchParams.search || !!searchParams.version || !!searchParams.category || !!searchParams.sortBy || !!searchParams.source || !!searchParams.page,
  });

  const handleSearch = (query: string) => {
    setSearchParams((prev) => ({ ...prev, search: query, page: 1 }));
  };

  const handleQuickFilter = (filter: { name: string; type: string }) => {
    switch (filter.type) {
      case "category":
        setSearchParams((prev) => ({ ...prev, category: filter.name, page: 1 }));
        break;
      case "version":
        // Handle "1.20+" specially
        if (filter.name === "1.20+") {
          setSearchParams((prev) => ({ ...prev, version: "1.20.1", page: 1 }));
        } else {
          setSearchParams((prev) => ({ ...prev, version: filter.name, page: 1 }));
        }
        break;
      case "sort":
        if (filter.name === "Most Popular") {
          setSearchParams((prev) => ({ ...prev, sortBy: "popular", page: 1 }));
        }
        break;
    }
    
    toast({
      title: "Filter Applied",
      description: `Showing results for ${filter.name}`,
    });
  };

  const handleFilterChange = (filters: {
    version?: string;
    category?: string;
    sortBy?: string;
    source?: string;
  }) => {
    setSearchParams((prev) => ({ ...prev, ...filters, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setSearchParams((prev) => ({ ...prev, page: newPage }));
    
    // Прокрутим страницу вверх при смене страницы
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Render loading skeletons
  const renderSkeletons = (count: number) => {
    return Array(count)
      .fill(0)
      .map((_, i) => (
        <div key={i} className="bg-card rounded-lg overflow-hidden shadow-md minecraft-border">
          <Skeleton className="h-48 w-full" />
          <div className="p-4">
            <div className="flex justify-between items-start">
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-4 w-full mt-2" />
            <Skeleton className="h-4 w-full mt-1" />
            <div className="flex justify-between items-center mt-4">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-8 w-24 rounded-md" />
            </div>
          </div>
        </div>
      ));
  };

  // Рендерим пагинацию
  const renderPagination = () => {
    if (!searchResults || searchResults.pageCount <= 1) return null;
    
    return (
      <div className="flex justify-center items-center gap-2 mt-8">
        <Button 
          variant="outline" 
          size="sm"
          disabled={searchResults.page <= 1}
          onClick={() => handlePageChange(searchResults.page - 1)}
        >
          {t('pagination.prev')}
        </Button>
        
        {/* Отображаем номера страниц */}
        <div className="flex items-center gap-1">
          {Array.from({ length: searchResults.pageCount }, (_, i) => i + 1)
            .filter(pageNum => {
              // Показываем только ближайшие страницы к текущей (+-2), первую и последнюю
              return pageNum === 1 || 
                    pageNum === searchResults.pageCount || 
                    Math.abs(pageNum - searchResults.page) <= 2;
            })
            .map((pageNum, index, array) => {
              // Если между отображаемыми страницами есть разрыв, показываем многоточие
              if (index > 0 && array[index - 1] !== pageNum - 1) {
                return (
                  <div key={`ellipsis-${pageNum}`} className="flex items-center">
                    <span className="mx-1">...</span>
                    <Button
                      key={pageNum}
                      variant={pageNum === searchResults.page ? "default" : "outline"}
                      size="sm"
                      className="w-8 h-8 p-0"
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  </div>
                );
              }
              
              return (
                <Button
                  key={pageNum}
                  variant={pageNum === searchResults.page ? "default" : "outline"}
                  size="sm"
                  className="w-8 h-8 p-0"
                  onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}
        </div>
        
        <Button 
          variant="outline" 
          size="sm"
          disabled={searchResults.page >= searchResults.pageCount}
          onClick={() => handlePageChange(searchResults.page + 1)}
        >
          {t('pagination.next')}
        </Button>
      </div>
    );
  };

  return (
    <div>
      <HeroSearch onSearch={handleSearch} onQuickFilter={handleQuickFilter} />
      <FilterSection onFilterChange={handleFilterChange} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Results Section (only shows when search is active) */}
        {(!!searchParams.search || !!searchParams.version || !!searchParams.category || !!searchParams.sortBy || !!searchParams.source) && (
          <section className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-primary text-shadow-primary">{t('page.search.title')}</h2>
              {searchResults && searchResults.data.length > 0 && (
                <button 
                  className="text-primary hover:text-primary/80 glow-effect px-3 py-1 rounded-md"
                  onClick={() => setSearchParams({ page: 1 })}
                >
                  {t('search.clear')}
                </button>
              )}
            </div>
            {searchLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {renderSkeletons(12)}
              </div>
            ) : searchResults && searchResults.data.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {searchResults.data.map((mod) => (
                    <ModCard key={mod.id} mod={mod} />
                  ))}
                </div>
                
                {/* Пагинация */}
                {renderPagination()}
                
                {/* Информация о пагинации */}
                <div className="text-center text-sm text-gray-500 mt-4">
                  {t('pagination.showing', { 
                    current: searchResults.data.length, 
                    total: searchResults.total 
                  })}
                  {searchResults.total > 0 && t('pagination.page_info', {
                    current: searchResults.page,
                    total: searchResults.pageCount
                  })}
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">{t('search.no_results')}</p>
              </div>
            )}
          </section>
        )}
        
        {/* Popular Mods Section */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-primary text-shadow-primary">{t('page.popular.title')}</h2>
            <a href="#" className="text-primary hover:text-primary/80 glow-effect px-3 py-1 rounded-md">{t('common.view_all')}</a>
          </div>
          {popularLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {renderSkeletons(4)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {popularMods?.map((mod) => (
                <ModCard key={mod.id} mod={mod} />
              ))}
            </div>
          )}
        </section>
        
        {/* Latest Mods Section */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-primary text-shadow-primary">{t('page.latest.title')}</h2>
            <a href="#" className="text-primary hover:text-primary/80 glow-effect px-3 py-1 rounded-md">{t('common.view_all')}</a>
          </div>
          {latestLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {renderSkeletons(4)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {latestMods?.map((mod) => (
                <ModCard key={mod.id} mod={mod} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Home;