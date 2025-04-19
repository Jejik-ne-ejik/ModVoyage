import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type LanguageType = 'en' | 'ru';

interface Translations {
  [key: string]: {
    [key: string]: string;
  };
}

// Создаем набор переводов для разных языков
const translations: Translations = {
  // Общие тексты
  'common.search': {
    en: 'Search',
    ru: 'Поиск'
  },
  'common.filter': {
    en: 'Filter',
    ru: 'Фильтр'
  },
  'common.all': {
    en: 'All',
    ru: 'Все'
  },
  'common.view_all': {
    en: 'View All',
    ru: 'Смотреть все'
  },
  'common.categories': {
    en: 'Categories',
    ru: 'Категории'
  },
  'common.versions': {
    en: 'Versions',
    ru: 'Версии'
  },
  'common.download': {
    en: 'Download',
    ru: 'Скачать'
  },
  'common.new': {
    en: 'New',
    ru: 'Новое'
  },
  'common.login': {
    en: 'Login',
    ru: 'Вход'
  },
  'common.register': {
    en: 'Register',
    ru: 'Регистрация'
  },
  'common.logout': {
    en: 'Logout',
    ru: 'Выход'
  },
  'common.home': {
    en: 'Home',
    ru: 'Главная'
  },
  'common.about': {
    en: 'About',
    ru: 'О нас'
  },
  'common.mods': {
    en: 'Mods',
    ru: 'Моды'
  },

  // Категории
  'category.technology': {
    en: 'Technology',
    ru: 'Технологии'
  },
  'category.magic': {
    en: 'Magic',
    ru: 'Магия'
  },
  'category.adventure': {
    en: 'Adventure',
    ru: 'Приключения'
  },
  'category.world_generation': {
    en: 'World Generation',
    ru: 'Генерация мира'
  },
  'category.utility': {
    en: 'Utility',
    ru: 'Утилиты'
  },
  'category.quality_of_life': {
    en: 'Quality of Life',
    ru: 'Улучшение игры'
  },
  'category.storage': {
    en: 'Storage',
    ru: 'Хранение'
  },
  'category.api': {
    en: 'API/Library',
    ru: 'API/Библиотека'
  },
  'category.tools': {
    en: 'Tools',
    ru: 'Инструменты'
  },
  'category.building': {
    en: 'Building',
    ru: 'Строительство'
  },
  'category.mobs': {
    en: 'Mobs',
    ru: 'Мобы'
  },
  'category.dimension': {
    en: 'Dimension',
    ru: 'Измерения'
  },
  'category.transportation': {
    en: 'Transportation',
    ru: 'Транспорт'
  },
  'category.food': {
    en: 'Food',
    ru: 'Еда'
  },
  'category.library': {
    en: 'Library',
    ru: 'Библиотека'
  },

  // Поиск
  'search.clear': {
    en: 'Clear Search',
    ru: 'Очистить поиск'
  },
  'search.no_results': {
    en: 'No mods found matching your criteria. Try a different search or filter.',
    ru: 'Не найдено модов, соответствующих вашим критериям. Попробуйте другой поиск или фильтр.'
  },
  'page.search.title': {
    en: 'Search Results',
    ru: 'Результаты поиска'
  },

  // Заголовки страниц
  'page.home.title': {
    en: 'Discover Minecraft Mods',
    ru: 'Откройте для себя моды Minecraft'
  },
  'page.home.subtitle': {
    en: 'Explore thousands of mods to enhance your Minecraft experience',
    ru: 'Исследуйте тысячи модов для улучшения вашего опыта в Minecraft'
  },
  'page.popular.title': {
    en: 'Popular Mods',
    ru: 'Популярные моды'
  },
  'page.latest.title': {
    en: 'Latest Releases',
    ru: 'Последние релизы'
  },
  'page.categories.title': {
    en: 'Mod Categories',
    ru: 'Категории модов'
  },

  // Фильтры
  'filter.sort_by': {
    en: 'Sort by',
    ru: 'Сортировка'
  },
  'filter.popularity': {
    en: 'Popularity',
    ru: 'Популярность'
  },
  'filter.newest': {
    en: 'Newest',
    ru: 'Новизна'
  },
  'filter.name': {
    en: 'Name',
    ru: 'Название'
  },
  'filter.downloads': {
    en: 'Downloads',
    ru: 'Загрузки'
  },
  'filter.all_versions': {
    en: 'All Versions',
    ru: 'Все версии'
  },
  'filter.all_categories': {
    en: 'All Categories',
    ru: 'Все категории'
  },

  // Детали модов
  'mod.details': {
    en: 'Mod Details',
    ru: 'Информация о моде'
  },
  'mod.version': {
    en: 'Version',
    ru: 'Версия'
  },
  'mod.description': {
    en: 'Description',
    ru: 'Описание'
  },
  'mod.downloads': {
    en: 'Downloads',
    ru: 'Загрузки'
  },
  'mod.source': {
    en: 'Source',
    ru: 'Источник'
  },
  'mod.category': {
    en: 'Category',
    ru: 'Категория'
  },

  // Пагинация
  'pagination.prev': {
    en: 'Previous',
    ru: 'Предыдущая'
  },
  'pagination.next': {
    en: 'Next',
    ru: 'Следующая'
  },
  'pagination.page': {
    en: 'Page',
    ru: 'Страница'
  },
  'pagination.of': {
    en: 'of',
    ru: 'из'
  },
  'pagination.first': {
    en: 'First',
    ru: 'Первая'
  },
  'pagination.last': {
    en: 'Last',
    ru: 'Последняя'
  },
  'pagination.showing': {
    en: 'Showing ${current} of ${total} mods',
    ru: 'Показано ${current} из ${total} модов'
  },
  'pagination.page_info': {
    en: ' (Page ${current} of ${total})',
    ru: ' (Страница ${current} из ${total})'
  },

  // Footer
  'footer.description': {
    en: 'The best place to discover and download Minecraft mods to enhance your gaming experience.',
    ru: 'Лучшее место для поиска и скачивания модов Minecraft для улучшения вашего игрового опыта.'
  },
  'footer.explore': {
    en: 'Explore',
    ru: 'Навигация'
  },
  'footer.resources': {
    en: 'Resources',
    ru: 'Ресурсы'
  },
  'footer.modpacks': {
    en: 'Mod Packs',
    ru: 'Сборки модов'
  },
  'footer.installation': {
    en: 'Installation Guide',
    ru: 'Руководство по установке'
  },
  'footer.compatibility': {
    en: 'Mod Compatibility',
    ru: 'Совместимость модов'
  },
  'footer.tutorials': {
    en: 'Modding Tutorials',
    ru: 'Руководства по моддингу'
  },
  'footer.api': {
    en: 'Development API',
    ru: 'API для разработчиков'
  },
  'footer.faq': {
    en: 'FAQ',
    ru: 'Вопросы и ответы'
  },
  'footer.about_us': {
    en: 'About ModVoyage',
    ru: 'О ModVoyage'
  },
  'footer.contact': {
    en: 'Contact Us',
    ru: 'Связаться с нами'
  },
  'footer.terms': {
    en: 'Terms of Service',
    ru: 'Условия использования'
  },
  'footer.privacy': {
    en: 'Privacy Policy',
    ru: 'Политика конфиденциальности'
  },
  'footer.dmca': {
    en: 'DMCA',
    ru: 'DMCA'
  },
  'footer.rights': {
    en: 'All rights reserved.',
    ru: 'Все права защищены.'
  },
  'footer.not_affiliated': {
    en: 'Not affiliated with Mojang or Microsoft.',
    ru: 'Не связано с Mojang или Microsoft.'
  },
  
  // Страница "О нас"
  'about.back_to_home': {
    en: 'Back to Home',
    ru: 'Вернуться на главную'
  },
  'about.title': {
    en: 'About ModVoyage',
    ru: 'О ModVoyage'
  },
  'about.subtitle': {
    en: 'Your premier destination for discovering and downloading Minecraft mods',
    ru: 'Ваш лучший ресурс для поиска и скачивания модов Minecraft'
  },
  'about.mission.title': {
    en: 'Our Mission',
    ru: 'Наша миссия'
  },
  'about.mission.text1': {
    en: 'ModVoyage was created with a simple mission: to make finding and installing Minecraft mods as easy and enjoyable as possible. We believe that mods are what make Minecraft special, allowing players to customize their experience and expand the game in countless ways.',
    ru: 'ModVoyage был создан с простой миссией: сделать поиск и установку модов Minecraft максимально легкими и приятными. Мы считаем, что именно моды делают Minecraft особенным, позволяя игрокам настраивать свой опыт и расширять игру бесчисленными способами.'
  },
  'about.mission.text2': {
    en: 'We carefully curate our mod collection to ensure compatibility, safety, and quality. Our platform is designed to be intuitive and user-friendly, making it accessible to modders of all experience levels.',
    ru: 'Мы тщательно подбираем нашу коллекцию модов, чтобы обеспечить совместимость, безопасность и качество. Наша платформа разработана так, чтобы быть интуитивно понятной и удобной, делая её доступной для моддеров любого уровня опыта.'
  },
  'about.offer.title': {
    en: 'What We Offer',
    ru: 'Что мы предлагаем'
  },
  'about.offer.item1': {
    en: 'Carefully curated collection of high-quality Minecraft mods',
    ru: 'Тщательно подобранная коллекция высококачественных модов для Minecraft'
  },
  'about.offer.item2': {
    en: 'Detailed information about each mod, including version compatibility',
    ru: 'Подробная информация о каждом моде, включая совместимость версий'
  },
  'about.offer.item3': {
    en: 'Easy-to-use search and filter options to find exactly what you need',
    ru: 'Удобные опции поиска и фильтрации для нахождения именно того, что вам нужно'
  },
  'about.offer.item4': {
    en: 'Installation guides for all major mod loaders',
    ru: 'Руководства по установке для всех основных загрузчиков модов'
  },
  'about.offer.item5': {
    en: 'Regular updates to keep our mod collection current',
    ru: 'Регулярные обновления, чтобы наша коллекция модов оставалась актуальной'
  },
  'about.team.title': {
    en: 'Developer',
    ru: 'Разработчик'
  },
  'about.team.role.founder': {
    en: 'Founder & Lead Developer',
    ru: 'Основатель и ведущий разработчик'
  },
  'about.team.role.designer': {
    en: 'UI/UX Designer',
    ru: 'UI/UX Дизайнер'
  },
  'about.team.role.curator': {
    en: 'Content Curator',
    ru: 'Куратор контента'
  },
  'about.team.role.manager': {
    en: 'Community Manager',
    ru: 'Менеджер сообщества'
  },
  'about.values.title': {
    en: 'Our Values',
    ru: 'Наши ценности'
  },
  'about.values.innovation.title': {
    en: 'Innovation',
    ru: 'Инновации'
  },
  'about.values.innovation.text': {
    en: 'We strive to innovate and improve our platform continuously.',
    ru: 'Мы стремимся постоянно внедрять инновации и улучшать нашу платформу.'
  },
  'about.values.community.title': {
    en: 'Community',
    ru: 'Сообщество'
  },
  'about.values.community.text': {
    en: 'We believe in fostering a supportive community of Minecraft enthusiasts.',
    ru: 'Мы верим в развитие поддерживающего сообщества энтузиастов Minecraft.'
  },
  'about.contact.title': {
    en: 'Contact Us',
    ru: 'Связаться с нами'
  },
  'about.contact.text': {
    en: 'Have questions, suggestions, or feedback? We would love to hear from you! Get in touch with our team through any of the channels below.',
    ru: 'Есть вопросы, предложения или отзывы? Мы будем рады услышать вас! Свяжитесь с нашей командой через любой из каналов ниже.'
  },
  'about.contact.email': {
    en: 'Contact support via email',
    ru: 'Связаться с поддержкой по почте'
  },
  'about.contact.twitter': {
    en: 'Follow us on Twitter',
    ru: 'Подписывайтесь на нас в Twitter'
  },
  'about.contact.github': {
    en: 'Contribute on GitHub',
    ru: 'Внесите свой вклад на GitHub'
  }
};

interface LanguageContextType {
  language: LanguageType;
  setLanguage: (lang: LanguageType) => void;
  t: (key: string, params?: Record<string, any>) => string;
}

// Создаем контекст для языка
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Провайдер контекста языка
export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Получаем сохраненный язык из localStorage или используем русский по умолчанию
  const [language, setLanguage] = useState<LanguageType>(() => {
    const savedLanguage = localStorage.getItem('language');
    return (savedLanguage as LanguageType) || 'ru';
  });

  // Функция для получения перевода по ключу с поддержкой подстановки параметров
  const t = (key: string, params?: Record<string, any>): string => {
    if (translations[key] && translations[key][language]) {
      let text = translations[key][language];
      
      // Если есть параметры, заменяем плейсхолдеры в тексте
      if (params) {
        Object.entries(params).forEach(([paramKey, paramValue]) => {
          text = text.replace(`\${${paramKey}}`, String(paramValue));
        });
      }
      
      return text;
    }
    // Возвращаем ключ если перевода нет
    return key;
  };

  // Сохраняем выбранный язык в localStorage при его изменении
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Хук для использования языкового контекста
export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};