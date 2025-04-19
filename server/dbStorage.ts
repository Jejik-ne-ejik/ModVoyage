import { db } from "./db";
import { eq, like, desc, asc, count } from "drizzle-orm";
import { users, mods, categories, minecraftVersions } from "../shared/schema";
import type { InsertUser, User, InsertMod, Mod, InsertCategory, Category, InsertMinecraftVersion, MinecraftVersion } from "../shared/schema";
import { IStorage, PaginatedResult } from "./storage";

// Реализация интерфейса IStorage, использующая PostgreSQL через Drizzle
export class DbStorage implements IStorage {
  
  // === User methods ===
  
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }
  
  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }
  
  // === Mod methods ===
  
  async getMod(id: number): Promise<Mod | undefined> {
    const result = await db.select().from(mods).where(eq(mods.id, id)).limit(1);
    return result[0];
  }
  
  async getMods(params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    version?: string;
    category?: string;
    source?: string;
    sortBy?: 'popular' | 'recent' | 'name' | 'downloads';
  }): Promise<PaginatedResult<Mod>> {
    // Подсчитываем общее количество модов для пагинации
    let countQuery = db.select({ count: count() }).from(mods);
    
    // Строим запрос модов
    let query = db.select().from(mods);
    
    // Применяем фильтры к обоим запросам
    if (params) {
      // Поиск по имени/описанию
      if (params.search) {
        const searchCondition = like(mods.name, `%${params.search}%`);
        query = query.where(searchCondition);
        countQuery = countQuery.where(searchCondition);
      }
      
      // Фильтр по версии
      if (params.version && params.version !== 'All Versions') {
        const versionCondition = eq(mods.version, params.version);
        query = query.where(versionCondition);
        countQuery = countQuery.where(versionCondition);
      }
      
      // Фильтр по категории
      if (params.category && params.category !== 'All Categories') {
        const categoryCondition = eq(mods.category, params.category);
        query = query.where(categoryCondition);
        countQuery = countQuery.where(categoryCondition);
      }
      
      // Фильтр по источнику
      if (params.source && params.source !== 'All Sources') {
        const sourceCondition = eq(mods.source, params.source);
        query = query.where(sourceCondition);
        countQuery = countQuery.where(sourceCondition);
      }
      
      // Сортировка
      if (params.sortBy) {
        switch (params.sortBy) {
          case 'popular':
            query = query.orderBy(desc(mods.downloadCount));
            break;
          case 'recent':
            query = query.orderBy(desc(mods.createdAt));
            break;
          case 'name':
            query = query.orderBy(asc(mods.name));
            break;
          case 'downloads':
            query = query.orderBy(desc(mods.downloadCount));
            break;
        }
      } else {
        // По умолчанию сортируем по популярности
        query = query.orderBy(desc(mods.downloadCount));
      }
      
      // Применяем пагинацию
      const page = params.page || 1;
      const pageSize = params.pageSize || 10;
      const offset = (page - 1) * pageSize;
      
      query = query.limit(pageSize).offset(offset);
    }
    
    // Выполняем запросы
    const [countResult, modsResult] = await Promise.all([
      countQuery,
      query
    ]);
    
    // Получаем общее количество модов
    const total = Number(countResult[0]?.count || 0);
    
    // Вычисляем параметры пагинации
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 10;
    const pageCount = Math.ceil(total / pageSize);
    
    // Возвращаем пагинированный результат
    return {
      data: modsResult,
      total,
      page,
      pageSize,
      pageCount
    };
  }
  
  async getPopularMods(limit = 4): Promise<Mod[]> {
    const result = await db.select()
      .from(mods)
      .orderBy(desc(mods.downloadCount))
      .limit(limit);
    return result;
  }
  
  async getLatestMods(limit = 4): Promise<Mod[]> {
    const result = await db.select()
      .from(mods)
      .orderBy(desc(mods.createdAt))
      .limit(limit);
    return result;
  }
  
  async createMod(mod: InsertMod): Promise<Mod> {
    const result = await db.insert(mods).values(mod).returning();
    return result[0];
  }
  
  async incrementDownloadCount(id: number): Promise<Mod | undefined> {
    const mod = await this.getMod(id);
    if (!mod) return undefined;
    
    const result = await db.update(mods)
      .set({ downloadCount: mod.downloadCount + 1 })
      .where(eq(mods.id, id))
      .returning();
    
    return result[0];
  }
  
  async clearMods(): Promise<void> {
    await db.delete(mods);
  }
  
  // === Category methods ===
  
  async getCategories(): Promise<Category[]> {
    const result = await db.select().from(categories);
    return result;
  }
  
  async getCategory(id: number): Promise<Category | undefined> {
    const result = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
    return result[0];
  }
  
  async getCategoryByName(name: string): Promise<Category | undefined> {
    const result = await db.select().from(categories).where(eq(categories.name, name)).limit(1);
    return result[0];
  }
  
  async createCategory(category: InsertCategory): Promise<Category> {
    const result = await db.insert(categories).values(category).returning();
    return result[0];
  }
  
  async clearCategories(): Promise<void> {
    await db.delete(categories);
  }
  
  // === Minecraft Version methods ===
  
  async getMinecraftVersions(): Promise<MinecraftVersion[]> {
    const result = await db.select().from(minecraftVersions);
    return result;
  }
  
  async createMinecraftVersion(version: InsertMinecraftVersion): Promise<MinecraftVersion> {
    const result = await db.insert(minecraftVersions).values(version).returning();
    return result[0];
  }
  
  // Инициализация базы данных начальными данными
  async initSampleData(): Promise<void> {
    // Проверяем, есть ли уже версии Minecraft
    const existingVersions = await this.getMinecraftVersions();
    if (existingVersions.length === 0) {
      // Добавляем базовые версии Minecraft
      await this.createMinecraftVersion({ version: '1.20.1' });
      await this.createMinecraftVersion({ version: '1.19.2' });
      await this.createMinecraftVersion({ version: '1.18.2' });
      await this.createMinecraftVersion({ version: '1.16.5' });
      console.log('Sample Minecraft versions initialized');
    }
    
    // Проверяем, есть ли уже категории
    const existingCategories = await this.getCategories();
    if (existingCategories.length === 0) {
      // Добавляем базовые категории
      await this.createCategory({ 
        name: 'Utility', 
        imageUrl: 'https://via.placeholder.com/200x150?text=Utility' 
      });
      await this.createCategory({ 
        name: 'Technology', 
        imageUrl: 'https://via.placeholder.com/200x150?text=Technology' 
      });
      await this.createCategory({ 
        name: 'Magic', 
        imageUrl: 'https://via.placeholder.com/200x150?text=Magic' 
      });
      await this.createCategory({ 
        name: 'Adventure', 
        imageUrl: 'https://via.placeholder.com/200x150?text=Adventure' 
      });
      console.log('Sample categories initialized');
    }
  }
}

// Инициализируем хранилище
export const dbStorage = new DbStorage();