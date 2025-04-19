import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Minecraft mod schema
export const mods = pgTable("mods", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  version: text("version").notNull(),
  category: text("category").notNull(),
  downloadCount: integer("download_count").notNull().default(0),
  imageUrl: text("image_url").notNull(),
  downloadUrl: text("download_url").notNull(),
  sourceUrl: text("source_url").notNull(), // URL источника мода для перенаправления
  source: text("source").notNull().default("unknown"), // Источник мода (CurseForge, Modrinth, и т.д.)
  isNew: boolean("is_new").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertModSchema = createInsertSchema(mods).omit({
  id: true,
  createdAt: true,
});

export type InsertMod = z.infer<typeof insertModSchema>;
export type Mod = typeof mods.$inferSelect;

// Categories for mods
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  imageUrl: text("image_url").notNull(),
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
});

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

// Minecraft versions
export const minecraftVersions = pgTable("minecraft_versions", {
  id: serial("id").primaryKey(),
  version: text("version").notNull().unique(),
});

export const insertMinecraftVersionSchema = createInsertSchema(minecraftVersions).omit({
  id: true,
});

export type InsertMinecraftVersion = z.infer<typeof insertMinecraftVersionSchema>;
export type MinecraftVersion = typeof minecraftVersions.$inferSelect;
