import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ParseResult {
  parsed: number;
  saved: number;
  mods: any[];
  categories?: {
    parsed: number;
    saved: number;
    items: any[];
  };
}

const AdminPanel = () => {
  const { toast } = useToast();
  const [limit, setLimit] = useState<number>(10);
  const [activeTab, setActiveTab] = useState<string>('curseforge');
  const [modrinthPage, setModrinthPage] = useState<number>(1);
  const [result, setResult] = useState<ParseResult | null>(null);

  // Мутации для различных источников
  const curseforge = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('GET', `/api/parse/curseforge?limit=${limit}`, undefined);
      return res.json();
    },
    onSuccess: (data) => {
      setResult(data);
      toast({
        title: 'Парсинг CurseForge успешно выполнен',
        description: `Получено ${data.parsed} модов, сохранено ${data.saved} модов`,
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Ошибка парсинга CurseForge',
        description: error.message,
      });
    },
  });

  const modrinth = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('GET', `/api/parse/modrinth?limit=${limit}`, undefined);
      return res.json();
    },
    onSuccess: (data) => {
      setResult(data);
      toast({
        title: 'Парсинг Modrinth успешно выполнен',
        description: `Получено ${data.parsed} модов, сохранено ${data.saved} модов`,
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Ошибка парсинга Modrinth',
        description: error.message,
      });
    },
  });

  const minecraftinside = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('GET', `/api/parse/minecraftinside?limit=${limit}`, undefined);
      return res.json();
    },
    onSuccess: (data) => {
      setResult(data);
      toast({
        title: 'Парсинг MinecraftInside успешно выполнен',
        description: `Получено ${data.parsed} модов, сохранено ${data.saved} модов`,
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Ошибка парсинга MinecraftInside',
        description: error.message,
      });
    },
  });

  const allSources = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('GET', `/api/parse/all?limit=${limit}`, undefined);
      return res.json();
    },
    onSuccess: (data) => {
      setResult(data);
      toast({
        title: 'Парсинг всех источников успешно выполнен',
        description: `Получено ${data.parsed} модов, сохранено ${data.saved} модов`,
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Ошибка парсинга всех источников',
        description: error.message,
      });
    },
  });

  // Определяем активную мутацию
  const getActiveMutation = () => {
    switch (activeTab) {
      case 'curseforge':
        return curseforge;
      case 'modrinth':
        return modrinth;
      case 'minecraftinside':
        return minecraftinside;
      case 'all':
        return allSources;
      default:
        return curseforge;
    }
  };

  const activeMutation = getActiveMutation();
  const isPending = activeMutation.isPending;

  const handleParse = () => {
    // Сбрасываем предыдущий результат
    setResult(null);
    
    // Запускаем подходящую мутацию
    switch (activeTab) {
      case 'curseforge':
        curseforge.mutate();
        break;
      case 'modrinth':
        modrinth.mutate();
        break;
      case 'minecraftinside':
        minecraftinside.mutate();
        break;
      case 'all':
        allSources.mutate();
        break;
    }
  };

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Админ панель - Парсинг модов</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Настройки парсинга</CardTitle>
          <CardDescription>Выберите источник и настройте параметры для парсинга Minecraft модов</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-4 mb-6">
              <TabsTrigger value="curseforge">CurseForge</TabsTrigger>
              <TabsTrigger value="modrinth">Modrinth</TabsTrigger>
              <TabsTrigger value="minecraftinside">MinecraftInside</TabsTrigger>
              <TabsTrigger value="all">Все источники</TabsTrigger>
            </TabsList>
            
            <div className="mb-4">
              <Label htmlFor="limit">Количество модов для парсинга</Label>
              <Input
                id="limit"
                type="number"
                value={limit}
                onChange={(e) => setLimit(parseInt(e.target.value) || 10)}
                min={1}
                max={50}
                className="mt-1"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <Button 
                onClick={handleParse} 
                disabled={isPending}
                className="w-full"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Идет парсинг...
                  </>
                ) : (
                  `Парсинг из ${activeTab === 'all' ? 'всех источников' : activeTab}`
                )}
              </Button>
              
              {(activeTab === 'modrinth' || activeTab === 'all') && (
                <Button 
                  onClick={() => {
                    // Сбрасываем предыдущий результат
                    setResult(null);
                    // Используем больший лимит для пагинации
                    const extendedLimit = limit * 3; 
                    
                    // Выбираем правильный API endpoint в зависимости от активной вкладки
                    const endpoint = activeTab === 'modrinth' 
                      ? `/api/parse/modrinth?limit=${extendedLimit}`
                      : `/api/parse/all?limit=${extendedLimit}`;
                    
                    apiRequest('GET', endpoint, undefined)
                      .then((data) => {
                        setResult(data);
                        toast({
                          title: `Расширенный парсинг ${activeTab === 'all' ? 'всех источников' : 'Modrinth'} успешно выполнен`,
                          description: `Получено ${data.parsed} модов, сохранено ${data.saved} модов с нескольких страниц`,
                        });
                      })
                      .catch((error) => {
                        toast({
                          variant: 'destructive',
                          title: `Ошибка расширенного парсинга ${activeTab === 'all' ? 'всех источников' : 'Modrinth'}`,
                          description: error.message,
                        });
                      });
                  }}
                  disabled={isPending}
                  variant="outline"
                >
                  Расширенный парсинг с несколькими страницами
                </Button>
              )}
              
              {activeTab === 'modrinth' && (
                <div className="mt-4 border-t pt-4">
                  <div className="flex items-end gap-4">
                    <div className="flex-1">
                      <Label htmlFor="modrinthPage">Страница Modrinth</Label>
                      <Input
                        id="modrinthPage"
                        type="number"
                        value={modrinthPage}
                        onChange={(e) => setModrinthPage(parseInt(e.target.value) || 1)}
                        min={1}
                        max={10}
                        className="mt-1"
                      />
                    </div>
                    <Button
                      onClick={() => {
                        // Сбрасываем предыдущий результат
                        setResult(null);
                        
                        // Используем специальный endpoint для парсинга конкретной страницы
                        apiRequest('GET', `/api/parse/modrinth/page/${modrinthPage}`, undefined)
                          .then((data) => {
                            setResult(data);
                            toast({
                              title: `Парсинг страницы ${modrinthPage} Modrinth успешно выполнен`,
                              description: `Получено ${data.parsed} модов, сохранено ${data.saved} модов`,
                            });
                          })
                          .catch((error) => {
                            toast({
                              variant: 'destructive',
                              title: `Ошибка парсинга страницы ${modrinthPage} Modrinth`,
                              description: error.message,
                            });
                          });
                      }}
                      disabled={isPending}
                    >
                      Парсить страницу {modrinthPage} Modrinth
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Используйте эту опцию для парсинга конкретной страницы Modrinth, как на сайте https://modrinth.com/mods?page={modrinthPage}
                  </p>
                </div>
              )}
            </div>
          </Tabs>
        </CardContent>
      </Card>
      
      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Результаты парсинга</CardTitle>
            <CardDescription>
              Парсинг из {activeTab === 'all' ? 'всех источников' : activeTab} завершен
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className={result.parsed > 0 ? 'bg-green-50' : 'bg-amber-50'}>
              {result.parsed > 0 ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-amber-600" />
              )}
              <AlertTitle>
                {result.parsed > 0 ? 'Успешно' : 'Нет данных'}
              </AlertTitle>
              <AlertDescription>
                Обнаружено модов: {result.parsed}<br />
                Сохранено модов: {result.saved}<br />
                {result.categories && (
                  <>
                    Обнаружено категорий: {result.categories.parsed}<br />
                    Сохранено категорий: {result.categories.saved}
                  </>
                )}
              </AlertDescription>
            </Alert>
            
            {result.mods.length > 0 && (
              <div className="mt-4">
                <h3 className="text-lg font-medium mb-2">Сохраненные моды:</h3>
                <ul className="list-disc pl-5">
                  {result.mods.slice(0, 5).map((mod) => (
                    <li key={mod.id}>
                      {mod.name} - {mod.category} - {mod.downloadCount} загрузок
                    </li>
                  ))}
                  {result.mods.length > 5 && (
                    <li className="list-none font-medium mt-1">
                      ... и еще {result.mods.length - 5} модов
                    </li>
                  )}
                </ul>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="outline" onClick={() => setResult(null)}>
              Скрыть результаты
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default AdminPanel;