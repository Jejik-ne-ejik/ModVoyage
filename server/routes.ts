import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertUserSchema } from "@shared/schema";
import { parseCurseForge, parseModrinth, parseModrinthPage, parseAllSources } from "./services/parser";
import { log } from "./vite";

// Используем in-memory хранилище
const dataStorage = storage;

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth Routes
  
  // Register a new user
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      // Validate request body
      const validatedData = insertUserSchema.safeParse(req.body);
      
      if (!validatedData.success) {
        return res.status(400).json({ 
          message: "Invalid user data", 
          errors: validatedData.error.format() 
        });
      }
      
      // Check if user already exists
      const existingUser = await dataStorage.getUserByUsername(validatedData.data.username);
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }
      
      // Create the user
      const newUser = await dataStorage.createUser(validatedData.data);
      
      // Return user without password
      const { password, ...userWithoutPassword } = newUser;
      res.status(201).json({ 
        message: "User registered successfully", 
        user: userWithoutPassword 
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to register user" });
    }
  });
  
  // Login user
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      // Validate request body
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      // Check if user exists
      const user = await dataStorage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // Check password
      if (user.password !== password) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      res.json({ 
        message: "Login successful", 
        user: userWithoutPassword 
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to login" });
    }
  });
  
  // Get current user
  app.get("/api/auth/user", async (req: Request, res: Response) => {
    // This is a simplified version without proper sessions
    // In a real app, you would use sessions/JWT tokens
    // For now, we'll just return a 401 since we don't have a way to store session state
    res.status(401).json({ message: "Not authenticated" });
  });
  
  // API Routes
  
  // Get all minecraft versions
  app.get("/api/versions", async (req: Request, res: Response) => {
    try {
      const versions = await dataStorage.getMinecraftVersions();
      res.json(versions);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve Minecraft versions" });
    }
  });
  
  // Get all categories
  app.get("/api/categories", async (req: Request, res: Response) => {
    try {
      const categories = await dataStorage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve categories" });
    }
  });
  
  // Get popular mods
  app.get("/api/mods/popular", async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 4;
      const mods = await dataStorage.getPopularMods(limit);
      res.json(mods);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve popular mods" });
    }
  });
  
  // Get latest mods
  app.get("/api/mods/latest", async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 4;
      const mods = await dataStorage.getLatestMods(limit);
      res.json(mods);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve latest mods" });
    }
  });
  
  // Get a specific mod by ID
  app.get("/api/mods/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const mod = await dataStorage.getMod(id);
      
      if (!mod) {
        return res.status(404).json({ message: "Mod not found" });
      }
      
      res.json(mod);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve mod" });
    }
  });
  
  // Search and filter mods with pagination
  app.get("/api/mods", async (req: Request, res: Response) => {
    try {
      const searchParams = {
        search: req.query.search as string | undefined,
        version: req.query.version as string | undefined,
        category: req.query.category as string | undefined,
        source: req.query.source as string | undefined,
        sortBy: req.query.sortBy as 'popular' | 'recent' | 'name' | 'downloads' | undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        pageSize: req.query.pageSize ? parseInt(req.query.pageSize as string) : 10
      };
      
      const paginatedMods = await dataStorage.getMods(searchParams);
      res.json(paginatedMods);
    } catch (error) {
      res.status(500).json({ message: "Failed to search mods" });
    }
  });
  
  // Increment download count for a mod и вернуть ссылку на источник
  app.post("/api/mods/:id/download", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const updatedMod = await dataStorage.incrementDownloadCount(id);
      
      if (!updatedMod) {
        return res.status(404).json({ message: "Mod not found" });
      }
      
      // Возвращаем модифицированный объект с redirectUrl
      res.json({
        ...updatedMod,
        redirectUrl: updatedMod.sourceUrl // Перенаправление на страницу источника
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to increment download count" });
    }
  });

  // === Parsers API Endpoints ===
  
  // Parse mods from CurseForge
  app.get("/api/parse/curseforge", async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const result = await parseCurseForge(limit);
      
      // Сохраняем данные в хранилище
      const savedMods = [];
      for (const mod of result.mods) {
        try {
          savedMods.push(await dataStorage.createMod(mod));
        } catch (error) {
          console.error("Failed to save mod:", mod.name, error);
        }
      }
      
      res.json({
        parsed: result.mods.length,
        saved: savedMods.length,
        mods: savedMods
      });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to parse CurseForge", error: error.message });
    }
  });
  
  // Parse mods from Modrinth
  app.get("/api/parse/modrinth", async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const result = await parseModrinth(limit);
      
      // Сохраняем данные в хранилище
      const savedMods = [];
      for (const mod of result.mods) {
        try {
          savedMods.push(await dataStorage.createMod(mod));
        } catch (error) {
          console.error("Failed to save mod:", mod.name, error);
        }
      }
      
      // Сохраняем категории, если они есть
      const savedCategories = [];
      if (result.categories && result.categories.length > 0) {
        for (const category of result.categories) {
          try {
            // Проверяем, существует ли категория
            const existingCategory = await dataStorage.getCategoryByName(category.name);
            if (!existingCategory) {
              savedCategories.push(await dataStorage.createCategory(category));
            }
          } catch (error) {
            console.error("Failed to save category:", category.name, error);
          }
        }
      }
      
      res.json({
        parsed: result.mods.length,
        saved: savedMods.length,
        mods: savedMods,
        categories: {
          parsed: result.categories?.length || 0,
          saved: savedCategories.length,
          items: savedCategories
        }
      });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to parse Modrinth", error: error.message });
    }
  });
  
  // Parse mods from specific Modrinth page to match website behavior
  app.get("/api/parse/modrinth/page/:page", async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.params.page) || 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      
      log(`Parsing Modrinth page ${page} with limit ${limit}`, 'express');
      
      const result = await parseModrinthPage(page, limit);
      
      // Сохраняем данные в хранилище
      const savedMods = [];
      for (const mod of result.mods) {
        try {
          savedMods.push(await dataStorage.createMod(mod));
        } catch (error) {
          console.error("Failed to save mod:", mod.name, error);
        }
      }
      
      // Сохраняем категории, если они есть
      const savedCategories = [];
      if (result.categories && result.categories.length > 0) {
        for (const category of result.categories) {
          try {
            // Проверяем, существует ли категория
            const existingCategory = await dataStorage.getCategoryByName(category.name);
            if (!existingCategory) {
              savedCategories.push(await dataStorage.createCategory(category));
            }
          } catch (error) {
            console.error("Failed to save category:", category.name, error);
          }
        }
      }
      
      res.json({
        page,
        parsed: result.mods.length,
        saved: savedMods.length,
        mods: savedMods,
        categories: {
          parsed: result.categories?.length || 0,
          saved: savedCategories.length,
          items: savedCategories
        }
      });
    } catch (error: any) {
      res.status(500).json({ message: `Failed to parse Modrinth page ${req.params.page}`, error: error.message });
    }
  });
  
  // Parse mods from all sources
  app.get("/api/parse/all", async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const result = await parseAllSources(limit);
      
      // Сохраняем данные в хранилище
      const savedMods = [];
      for (const mod of result.mods) {
        try {
          savedMods.push(await dataStorage.createMod(mod));
        } catch (error) {
          console.error("Failed to save mod:", mod.name, error);
        }
      }
      
      // Сохраняем категории, если они есть
      const savedCategories = [];
      if (result.categories && result.categories.length > 0) {
        for (const category of result.categories) {
          try {
            // Проверяем, существует ли категория
            const existingCategory = await dataStorage.getCategoryByName(category.name);
            if (!existingCategory) {
              savedCategories.push(await dataStorage.createCategory(category));
            }
          } catch (error) {
            console.error("Failed to save category:", category.name, error);
          }
        }
      }
      
      res.json({
        parsed: result.mods.length,
        saved: savedMods.length,
        mods: savedMods,
        categories: {
          parsed: result.categories?.length || 0,
          saved: savedCategories.length,
          items: savedCategories
        }
      });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to parse from all sources", error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
