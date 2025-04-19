import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "../shared/schema";

const { Pool } = pg;

// Настройка подключения к базе данных PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Инициализация drizzle с нашим пулом соединений и схемой
export const db = drizzle(pool, { schema });

// Функция для подготовки базы данных (создание таблиц)
export async function setupDatabase() {
  console.log("Setting up database connection...");
  try {
    // Проверяем соединение
    await pool.query("SELECT NOW()");
    console.log("Database connection successful");
    
    // Создаем таблицы согласно схеме
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS mods (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        version TEXT NOT NULL,
        category TEXT NOT NULL,
        download_count INTEGER NOT NULL DEFAULT 0,
        image_url TEXT NOT NULL,
        download_url TEXT NOT NULL,
        source_url TEXT NOT NULL,
        is_new BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        image_url TEXT NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS minecraft_versions (
        id SERIAL PRIMARY KEY,
        version TEXT NOT NULL UNIQUE
      );
    `);
    console.log("Database tables created or already exist");
  } catch (error) {
    console.error("Error setting up database:", error);
    throw error;
  }
}