import { parseAllSources } from './parser';
import { storage } from '../storage';
import { log } from '../vite';

// Используем in-memory хранилище
const dataStorage = storage;

// Автоматический парсинг из всех источников при инициализации
export async function initializeAutoParsing() {
  try {
    log('Starting automatic parsing initialization', 'autoParser');
    
    // Получаем существующие категории
    const existingCategories = await dataStorage.getCategories();
    
    // Для демонстрации всегда выполняем парсинг, чтобы получить актуальные данные
    // Но в реальном приложении можно раскомментировать эту проверку
    // if (existingCategories.length > 0) {
    //   log('Database already contains categories, skipping auto-parsing', 'autoParser');
    //   return;
    // }
    
    // Очищаем существующие данные для демонстрации
    log('Clearing existing data for demonstration', 'autoParser');
    await dataStorage.clearMods();
    await dataStorage.clearCategories();
    
    // Проверяем наличие API ключей
    const hasCurseForgeKey = Boolean(process.env.CURSEFORGE_API_KEY);
    const hasModrinthKey = Boolean(process.env.MODRINTH_API_KEY);
    
    if (!hasCurseForgeKey) {
      log('Warning: CURSEFORGE_API_KEY not found in environment variables. CurseForge parsing might fail.', 'autoParser');
    }
    
    if (!hasModrinthKey) {
      log('Warning: MODRINTH_API_KEY not found in environment variables. Modrinth parsing might fail.', 'autoParser');
    }
    
    log('Starting auto-parsing to populate data with real API data', 'autoParser');
    
    // Парсим данные из всех источников
    const result = await parseAllSources(20); // Получаем до 20 модов из каждого источника
    
    // Сохраняем категории
    if (result.categories && result.categories.length > 0) {
      log(`Saving ${result.categories.length} categories to database`, 'autoParser');
      for (const category of result.categories) {
        try {
          await dataStorage.createCategory(category);
        } catch (error) {
          log(`Failed to save category: ${category.name}`, 'autoParser');
        }
      }
    }
    
    // Сохраняем моды
    if (result.mods.length > 0) {
      log(`Saving ${result.mods.length} mods to database`, 'autoParser');
      for (const mod of result.mods) {
        try {
          await dataStorage.createMod(mod);
        } catch (error) {
          log(`Failed to save mod: ${mod.name}`, 'autoParser');
        }
      }
    }
    
    log('Auto-parsing completed successfully', 'autoParser');
  } catch (error: any) {
    log(`Error during auto-parsing: ${error.message}`, 'autoParser');
  }
}