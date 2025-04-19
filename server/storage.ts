import { 
  users, type User, type InsertUser,
  mods, type Mod, type InsertMod,
  categories, type Category, type InsertCategory,
  minecraftVersions, type MinecraftVersion, type InsertMinecraftVersion
} from "@shared/schema";

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Mod methods
  getMod(id: number): Promise<Mod | undefined>;
  getMods(params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    version?: string;
    category?: string;
    source?: string;
    sortBy?: 'popular' | 'recent' | 'name' | 'downloads';
  }): Promise<PaginatedResult<Mod>>;
  getPopularMods(limit?: number): Promise<Mod[]>;
  getLatestMods(limit?: number): Promise<Mod[]>;
  createMod(mod: InsertMod): Promise<Mod>;
  incrementDownloadCount(id: number): Promise<Mod | undefined>;
  clearMods(): Promise<void>; // Метод для очистки модов
  
  // Category methods
  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  getCategoryByName(name: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  clearCategories(): Promise<void>; // Метод для очистки категорий
  
  // Minecraft Version methods
  getMinecraftVersions(): Promise<MinecraftVersion[]>;
  createMinecraftVersion(version: InsertMinecraftVersion): Promise<MinecraftVersion>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private mods: Map<number, Mod>;
  private categories: Map<number, Category>;
  private minecraftVersions: Map<number, MinecraftVersion>;
  
  private currentUserId: number;
  private currentModId: number;
  private currentCategoryId: number;
  private currentVersionId: number;

  constructor() {
    this.users = new Map();
    this.mods = new Map();
    this.categories = new Map();
    this.minecraftVersions = new Map();
    
    this.currentUserId = 1;
    this.currentModId = 1;
    this.currentCategoryId = 1;
    this.currentVersionId = 1;
    
    // Initialize with sample data
    this.initSampleData();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Mod methods
  async getMod(id: number): Promise<Mod | undefined> {
    return this.mods.get(id);
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
    let mods = Array.from(this.mods.values());
    
    // Apply search filter
    if (params?.search) {
      const searchLower = params.search.toLowerCase();
      mods = mods.filter(mod => 
        mod.name.toLowerCase().includes(searchLower) || 
        mod.description.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply version filter
    if (params?.version && params.version !== 'All Versions') {
      mods = mods.filter(mod => mod.version === params.version);
    }
    
    // Apply category filter
    if (params?.category && params.category !== 'All Categories') {
      mods = mods.filter(mod => mod.category === params.category);
    }
    
    // Apply source filter
    if (params?.source && params.source !== 'All Sources') {
      mods = mods.filter(mod => mod.source === params.source);
    }
    
    // Apply sorting
    if (params?.sortBy) {
      switch (params.sortBy) {
        case 'popular':
          mods.sort((a, b) => b.downloadCount - a.downloadCount);
          break;
        case 'recent':
          mods.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
        case 'name':
          mods.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'downloads':
          mods.sort((a, b) => b.downloadCount - a.downloadCount);
          break;
      }
    } else {
      // Default sort by download count (popular)
      mods.sort((a, b) => b.downloadCount - a.downloadCount);
    }
    
    // Calculate pagination parameters
    const total = mods.length;
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 10; // Default to 10 mods per page
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const pageCount = Math.ceil(total / pageSize);
    
    // Get the mods for the current page
    const paginatedMods = mods.slice(start, end);
    
    return {
      data: paginatedMods,
      total,
      page,
      pageSize,
      pageCount
    };
  }
  
  async getPopularMods(limit = 4): Promise<Mod[]> {
    const result = await this.getMods({ 
      sortBy: 'popular', 
      pageSize: limit, 
      page: 1 
    });
    return result.data;
  }
  
  async getLatestMods(limit = 4): Promise<Mod[]> {
    const result = await this.getMods({ 
      sortBy: 'recent', 
      pageSize: limit, 
      page: 1 
    });
    return result.data;
  }
  
  async createMod(insertMod: InsertMod): Promise<Mod> {
    const id = this.currentModId++;
    const now = new Date();
    const mod: Mod = { 
      ...insertMod, 
      id,
      createdAt: now,
      // Убедимся, что обязательные поля имеют значения по умолчанию
      downloadCount: insertMod.downloadCount || 0,
      isNew: insertMod.isNew || false,
      source: insertMod.source || 'Unknown'
    };
    this.mods.set(id, mod);
    return mod;
  }
  
  async incrementDownloadCount(id: number): Promise<Mod | undefined> {
    const mod = await this.getMod(id);
    if (!mod) return undefined;
    
    const updatedMod = { 
      ...mod, 
      downloadCount: mod.downloadCount + 1 
    };
    this.mods.set(id, updatedMod);
    return updatedMod;
  }
  
  // Метод для очистки всех модов
  async clearMods(): Promise<void> {
    this.mods.clear();
    this.currentModId = 1;
  }
  
  // Category methods
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }
  
  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }
  
  async getCategoryByName(name: string): Promise<Category | undefined> {
    return Array.from(this.categories.values()).find(
      (category) => category.name === name,
    );
  }
  
  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.currentCategoryId++;
    const category: Category = { ...insertCategory, id };
    this.categories.set(id, category);
    return category;
  }
  
  // Метод для очистки всех категорий
  async clearCategories(): Promise<void> {
    this.categories.clear();
    this.currentCategoryId = 1;
  }
  
  // Minecraft Version methods
  async getMinecraftVersions(): Promise<MinecraftVersion[]> {
    return Array.from(this.minecraftVersions.values());
  }
  
  async createMinecraftVersion(insertVersion: InsertMinecraftVersion): Promise<MinecraftVersion> {
    const id = this.currentVersionId++;
    const version: MinecraftVersion = { ...insertVersion, id };
    this.minecraftVersions.set(id, version);
    return version;
  }
  
  // Helper method to initialize sample data
  private async initSampleData() {
    // Initialize Minecraft versions
    const versions = ['1.20.1', '1.19.2', '1.18.2', '1.17.1', '1.16.5', '1.15.2', '1.14.4', '1.12.2'];
    for (const version of versions) {
      await this.createMinecraftVersion({ version });
    }
    
    // Initialize categories with better images
    const categoryData = [
      { name: 'Technology', imageUrl: 'https://i.imgur.com/sFBc8RC.jpg' }, // Tech machinery
      { name: 'Magic', imageUrl: 'https://i.imgur.com/wPD9Tza.jpg' }, // Magic crystals
      { name: 'Adventure', imageUrl: 'https://i.imgur.com/PqaI5HO.jpg' }, // Adventure landscape
      { name: 'World Generation', imageUrl: 'https://i.imgur.com/4Rmmfzu.jpg' }, // Beautiful landscape
      { name: 'Utility', imageUrl: 'https://i.imgur.com/J3lMPOw.jpg' }, // Tools
      { name: 'Quality of Life', imageUrl: 'https://i.imgur.com/wUMR6Ea.jpg' }, // Comfort items
      { name: 'Storage', imageUrl: 'https://i.imgur.com/BPzjvJp.jpg' }, // Storage systems
      { name: 'API/Library', imageUrl: 'https://i.imgur.com/IFVnrfS.jpg' }, // Code/library
      { name: 'Tools', imageUrl: 'https://i.imgur.com/nqWLwEj.jpg' }, // Diamond tools
      { name: 'Building', imageUrl: 'https://i.imgur.com/nUc2fMG.jpg' }, // Beautiful building
      { name: 'Mobs', imageUrl: 'https://i.imgur.com/MU3sP22.jpg' }, // Crowd of mobs
      { name: 'Dimension', imageUrl: 'https://i.imgur.com/YGhrSyF.jpg' }, // Portal to other dimension
      { name: 'Transportation', imageUrl: 'https://i.imgur.com/QdBBG3b.jpg' }, // Minecart and rails
      { name: 'Food', imageUrl: 'https://i.imgur.com/uoGW5st.jpg' }, // Various food items
      { name: 'Library', imageUrl: 'https://i.imgur.com/GAbHnT9.jpg' } // Bookshelves
    ];
    
    for (const category of categoryData) {
      await this.createCategory(category);
    }
    
    // Initialize popular mods
    const popularMods = [
      {
        name: 'Applied Energistics 2',
        description: 'A mod about matter, energy and using them to conquer the world.',
        version: '1.20.1',
        category: 'Technology',
        downloadCount: 25600000,
        imageUrl: 'https://via.placeholder.com/400x200?text=Applied+Energistics+2',
        downloadUrl: '/download/applied-energistics-2',
        sourceUrl: 'https://www.curseforge.com/minecraft/mc-mods/applied-energistics-2',
        source: 'CurseForge',
        isNew: false
      },
      {
        name: 'Just Enough Items',
        description: 'View items and recipes for all installed mods in an easy-to-use interface.',
        version: '1.20.1',
        category: 'Utility',
        downloadCount: 42300000,
        imageUrl: 'https://via.placeholder.com/400x200?text=JEI',
        downloadUrl: '/download/jei',
        sourceUrl: 'https://www.curseforge.com/minecraft/mc-mods/jei',
        source: 'CurseForge',
        isNew: false
      },
      {
        name: 'Create',
        description: 'A steampunk technology mod focused on rotational power and aesthetics.',
        version: '1.19.2',
        category: 'Technology',
        downloadCount: 18700000,
        imageUrl: 'https://via.placeholder.com/400x200?text=Create',
        downloadUrl: '/download/create',
        sourceUrl: 'https://www.curseforge.com/minecraft/mc-mods/create',
        source: 'CurseForge',
        isNew: false
      },
      {
        name: 'Botania',
        description: 'A tech mod themed around natural magic and flowers.',
        version: '1.20.1',
        category: 'Magic',
        downloadCount: 15900000,
        imageUrl: 'https://via.placeholder.com/400x200?text=Botania',
        downloadUrl: '/download/botania',
        sourceUrl: 'https://www.curseforge.com/minecraft/mc-mods/botania',
        source: 'CurseForge',
        isNew: false
      }
    ];
    
    for (const mod of popularMods) {
      await this.createMod(mod);
    }
    
    // Initialize latest mods
    const latestMods = [
      {
        name: 'More Structures+',
        description: 'Adds 50+ new structures to make exploration more exciting.',
        version: '1.20.1',
        category: 'World Generation',
        downloadCount: 156000,
        imageUrl: 'https://via.placeholder.com/400x200?text=MoreStructures+',
        downloadUrl: '/download/more-structures-plus',
        sourceUrl: 'https://www.curseforge.com/minecraft/mc-mods/more-structures-plus',
        source: 'CurseForge',
        isNew: true
      },
      {
        name: 'Enchanted Combat',
        description: 'Revamps the combat system with magic spells and new weapons.',
        version: '1.20.1',
        category: 'Adventure',
        downloadCount: 89000,
        imageUrl: 'https://via.placeholder.com/400x200?text=EnchantedCombat',
        downloadUrl: '/download/enchanted-combat',
        sourceUrl: 'https://www.curseforge.com/minecraft/mc-mods/enchanted-combat',
        source: 'CurseForge',
        isNew: true
      },
      {
        name: 'Biome Tweaker',
        description: 'Customize Minecraft biomes with new flora, fauna, and terrain generation.',
        version: '1.20.1',
        category: 'World Generation',
        downloadCount: 63000,
        imageUrl: 'https://via.placeholder.com/400x200?text=BiomeTweaker',
        downloadUrl: '/download/biome-tweaker',
        sourceUrl: 'https://www.curseforge.com/minecraft/mc-mods/biome-tweaker',
        source: 'Modrinth',
        isNew: true
      },
      {
        name: 'Simple Storage',
        description: 'A lightweight storage solution for organizing your items.',
        version: '1.19.2',
        category: 'Storage',
        downloadCount: 42000,
        imageUrl: 'https://via.placeholder.com/400x200?text=SimpleStorage',
        downloadUrl: '/download/simple-storage',
        sourceUrl: 'https://www.curseforge.com/minecraft/mc-mods/simple-storage',
        source: 'Modrinth',
        isNew: true
      }
    ];
    
    for (const mod of latestMods) {
      await this.createMod(mod);
    }
    
    // Больше модов будет добавлено через API парсинга
  }
}

export const storage = new MemStorage();
