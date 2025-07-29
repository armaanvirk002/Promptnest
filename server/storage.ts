import { 
  prompts, 
  categories, 
  platforms, 
  promptAnalytics,
  generatedPrompts,
  type Prompt, 
  type Category, 
  type Platform, 
  type InsertPrompt, 
  type InsertCategory, 
  type InsertPlatform,
  type InsertGeneratedPrompt,
  type InsertPromptAnalytics,
  type PromptWithRelations,
  type GeneratedPrompt
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, like, or, sql, and } from "drizzle-orm";

export interface IStorage {
  // Categories
  getCategories(): Promise<Category[]>;
  getCategoryByName(name: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Platforms
  getPlatforms(): Promise<Platform[]>;
  getPlatformByName(name: string): Promise<Platform | undefined>;
  createPlatform(platform: InsertPlatform): Promise<Platform>;
  
  // Prompts
  getPrompts(limit?: number, offset?: number): Promise<PromptWithRelations[]>;
  getPromptById(id: string): Promise<PromptWithRelations | undefined>;
  getPromptsByPlatform(platformId: string, limit?: number): Promise<PromptWithRelations[]>;
  getPromptsByCategory(categoryId: string, limit?: number): Promise<PromptWithRelations[]>;
  getTrendingPrompts(limit?: number): Promise<PromptWithRelations[]>;
  getFeaturedPrompts(limit?: number): Promise<PromptWithRelations[]>;
  searchPrompts(query: string, limit?: number): Promise<PromptWithRelations[]>;
  createPrompt(prompt: InsertPrompt): Promise<Prompt>;
  updatePromptStats(id: string, views?: number, copies?: number): Promise<void>;
  
  // Analytics
  recordPromptAction(analytics: InsertPromptAnalytics): Promise<void>;
  
  // Generated Prompts
  saveGeneratedPrompts(generatedPrompt: InsertGeneratedPrompt): Promise<GeneratedPrompt>;
  getRecentGenerations(limit?: number): Promise<GeneratedPrompt[]>;
}

export class DatabaseStorage implements IStorage {
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(categories.name);
  }

  async getCategoryByName(name: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.name, name));
    return category || undefined;
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const [category] = await db
      .insert(categories)
      .values(insertCategory)
      .returning();
    return category;
  }

  async getPlatforms(): Promise<Platform[]> {
    return await db.select().from(platforms).orderBy(platforms.name);
  }

  async getPlatformByName(name: string): Promise<Platform | undefined> {
    const [platform] = await db.select().from(platforms).where(eq(platforms.name, name));
    return platform || undefined;
  }

  async createPlatform(insertPlatform: InsertPlatform): Promise<Platform> {
    const [platform] = await db
      .insert(platforms)
      .values(insertPlatform)
      .returning();
    return platform;
  }

  async getPrompts(limit = 50, offset = 0): Promise<PromptWithRelations[]> {
    const results = await db
      .select({
        id: prompts.id,
        title: prompts.title,
        content: prompts.content,
        preview: prompts.preview,
        platformId: prompts.platformId,
        categoryId: prompts.categoryId,
        type: prompts.type,
        tags: prompts.tags,
        views: prompts.views,
        copies: prompts.copies,
        rating: prompts.rating,
        ratingCount: prompts.ratingCount,
        isFeatured: prompts.isFeatured,
        isTrending: prompts.isTrending,
        isActive: prompts.isActive,
        createdAt: prompts.createdAt,
        updatedAt: prompts.updatedAt,
        platform: platforms,
        category: categories,
      })
      .from(prompts)
      .leftJoin(platforms, eq(prompts.platformId, platforms.id))
      .leftJoin(categories, eq(prompts.categoryId, categories.id))
      .where(eq(prompts.isActive, true))
      .orderBy(desc(prompts.createdAt))
      .limit(limit)
      .offset(offset);

    return results.map(result => ({
      ...result,
      platform: result.platform || undefined,
      category: result.category || undefined,
    }));
  }

  async getPromptById(id: string): Promise<PromptWithRelations | undefined> {
    const [result] = await db
      .select({
        id: prompts.id,
        title: prompts.title,
        content: prompts.content,
        preview: prompts.preview,
        platformId: prompts.platformId,
        categoryId: prompts.categoryId,
        type: prompts.type,
        tags: prompts.tags,
        views: prompts.views,
        copies: prompts.copies,
        rating: prompts.rating,
        ratingCount: prompts.ratingCount,
        isFeatured: prompts.isFeatured,
        isTrending: prompts.isTrending,
        isActive: prompts.isActive,
        createdAt: prompts.createdAt,
        updatedAt: prompts.updatedAt,
        platform: platforms,
        category: categories,
      })
      .from(prompts)
      .leftJoin(platforms, eq(prompts.platformId, platforms.id))
      .leftJoin(categories, eq(prompts.categoryId, categories.id))
      .where(and(eq(prompts.id, id), eq(prompts.isActive, true)));
    
    return result ? {
      ...result,
      platform: result.platform || undefined,
      category: result.category || undefined,
    } : undefined;
  }

  async getPromptsByPlatform(platformId: string, limit = 20): Promise<PromptWithRelations[]> {
    const results = await db
      .select({
        id: prompts.id,
        title: prompts.title,
        content: prompts.content,
        preview: prompts.preview,
        platformId: prompts.platformId,
        categoryId: prompts.categoryId,
        type: prompts.type,
        tags: prompts.tags,
        views: prompts.views,
        copies: prompts.copies,
        rating: prompts.rating,
        ratingCount: prompts.ratingCount,
        isFeatured: prompts.isFeatured,
        isTrending: prompts.isTrending,
        isActive: prompts.isActive,
        createdAt: prompts.createdAt,
        updatedAt: prompts.updatedAt,
        platform: platforms,
        category: categories,
      })
      .from(prompts)
      .leftJoin(platforms, eq(prompts.platformId, platforms.id))
      .leftJoin(categories, eq(prompts.categoryId, categories.id))
      .where(and(eq(prompts.platformId, platformId), eq(prompts.isActive, true)))
      .orderBy(desc(prompts.rating), desc(prompts.views))
      .limit(limit);

    return results.map(result => ({
      ...result,
      platform: result.platform || undefined,
      category: result.category || undefined,
    }));
  }

  async getPromptsByCategory(categoryId: string, limit = 20): Promise<PromptWithRelations[]> {
    const results = await db
      .select({
        id: prompts.id,
        title: prompts.title,
        content: prompts.content,
        preview: prompts.preview,
        platformId: prompts.platformId,
        categoryId: prompts.categoryId,
        type: prompts.type,
        tags: prompts.tags,
        views: prompts.views,
        copies: prompts.copies,
        rating: prompts.rating,
        ratingCount: prompts.ratingCount,
        isFeatured: prompts.isFeatured,
        isTrending: prompts.isTrending,
        isActive: prompts.isActive,
        createdAt: prompts.createdAt,
        updatedAt: prompts.updatedAt,
        platform: platforms,
        category: categories,
      })
      .from(prompts)
      .leftJoin(platforms, eq(prompts.platformId, platforms.id))
      .leftJoin(categories, eq(prompts.categoryId, categories.id))
      .where(and(eq(prompts.categoryId, categoryId), eq(prompts.isActive, true)))
      .orderBy(desc(prompts.rating), desc(prompts.views))
      .limit(limit);

    return results.map(result => ({
      ...result,
      platform: result.platform || undefined,
      category: result.category || undefined,
    }));
  }

  async getTrendingPrompts(limit = 10): Promise<PromptWithRelations[]> {
    const results = await db
      .select({
        id: prompts.id,
        title: prompts.title,
        content: prompts.content,
        preview: prompts.preview,
        platformId: prompts.platformId,
        categoryId: prompts.categoryId,
        type: prompts.type,
        tags: prompts.tags,
        views: prompts.views,
        copies: prompts.copies,
        rating: prompts.rating,
        ratingCount: prompts.ratingCount,
        isFeatured: prompts.isFeatured,
        isTrending: prompts.isTrending,
        isActive: prompts.isActive,
        createdAt: prompts.createdAt,
        updatedAt: prompts.updatedAt,
        platform: platforms,
        category: categories,
      })
      .from(prompts)
      .leftJoin(platforms, eq(prompts.platformId, platforms.id))
      .leftJoin(categories, eq(prompts.categoryId, categories.id))
      .where(and(eq(prompts.isTrending, true), eq(prompts.isActive, true)))
      .orderBy(desc(prompts.views), desc(prompts.copies))
      .limit(limit);

    return results.map(result => ({
      ...result,
      platform: result.platform || undefined,
      category: result.category || undefined,
    }));
  }

  async getFeaturedPrompts(limit = 10): Promise<PromptWithRelations[]> {
    const results = await db
      .select({
        id: prompts.id,
        title: prompts.title,
        content: prompts.content,
        preview: prompts.preview,
        platformId: prompts.platformId,
        categoryId: prompts.categoryId,
        type: prompts.type,
        tags: prompts.tags,
        views: prompts.views,
        copies: prompts.copies,
        rating: prompts.rating,
        ratingCount: prompts.ratingCount,
        isFeatured: prompts.isFeatured,
        isTrending: prompts.isTrending,
        isActive: prompts.isActive,
        createdAt: prompts.createdAt,
        updatedAt: prompts.updatedAt,
        platform: platforms,
        category: categories,
      })
      .from(prompts)
      .leftJoin(platforms, eq(prompts.platformId, platforms.id))
      .leftJoin(categories, eq(prompts.categoryId, categories.id))
      .where(and(eq(prompts.isFeatured, true), eq(prompts.isActive, true)))
      .orderBy(desc(prompts.rating))
      .limit(limit);

    return results.map(result => ({
      ...result,
      platform: result.platform || undefined,
      category: result.category || undefined,
    }));
  }

  async searchPrompts(query: string, limit = 20): Promise<PromptWithRelations[]> {
    const searchTerm = `%${query}%`;
    const results = await db
      .select({
        id: prompts.id,
        title: prompts.title,
        content: prompts.content,
        preview: prompts.preview,
        platformId: prompts.platformId,
        categoryId: prompts.categoryId,
        type: prompts.type,
        tags: prompts.tags,
        views: prompts.views,
        copies: prompts.copies,
        rating: prompts.rating,
        ratingCount: prompts.ratingCount,
        isFeatured: prompts.isFeatured,
        isTrending: prompts.isTrending,
        isActive: prompts.isActive,
        createdAt: prompts.createdAt,
        updatedAt: prompts.updatedAt,
        platform: platforms,
        category: categories,
      })
      .from(prompts)
      .leftJoin(platforms, eq(prompts.platformId, platforms.id))
      .leftJoin(categories, eq(prompts.categoryId, categories.id))
      .where(
        and(
          or(
            like(prompts.title, searchTerm),
            like(prompts.content, searchTerm),
            like(prompts.preview, searchTerm)
          ),
          eq(prompts.isActive, true)
        )
      )
      .orderBy(desc(prompts.rating), desc(prompts.views))
      .limit(limit);

    return results.map(result => ({
      ...result,
      platform: result.platform || undefined,
      category: result.category || undefined,
    }));
  }

  async createPrompt(insertPrompt: InsertPrompt): Promise<Prompt> {
    const [prompt] = await db
      .insert(prompts)
      .values(insertPrompt)
      .returning();
    return prompt;
  }

  async updatePromptStats(id: string, views?: number, copies?: number): Promise<void> {
    const updates: any = { updatedAt: sql`now()` };
    if (views !== undefined) {
      updates.views = sql`${prompts.views} + ${views}`;
    }
    if (copies !== undefined) {
      updates.copies = sql`${prompts.copies} + ${copies}`;
    }
    
    await db
      .update(prompts)
      .set(updates)
      .where(eq(prompts.id, id));
  }

  async recordPromptAction(analytics: InsertPromptAnalytics): Promise<void> {
    await db.insert(promptAnalytics).values(analytics);
  }

  async saveGeneratedPrompts(generatedPrompt: InsertGeneratedPrompt): Promise<GeneratedPrompt> {
    const [result] = await db
      .insert(generatedPrompts)
      .values(generatedPrompt)
      .returning();
    return result;
  }

  async getRecentGenerations(limit = 10): Promise<GeneratedPrompt[]> {
    return await db
      .select()
      .from(generatedPrompts)
      .orderBy(desc(generatedPrompts.createdAt))
      .limit(limit);
  }
}

export const storage = new DatabaseStorage();
