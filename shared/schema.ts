import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  description: text("description"),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
  promptCount: integer("prompt_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const platforms = pgTable("platforms", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  description: text("description"),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
  promptCount: integer("prompt_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const prompts = pgTable("prompts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  content: text("content").notNull(),
  preview: text("preview").notNull(),
  platformId: varchar("platform_id").references(() => platforms.id),
  categoryId: varchar("category_id").references(() => categories.id),
  type: text("type").notNull(),
  tags: jsonb("tags").$type<string[]>().default([]),
  views: integer("views").notNull().default(0),
  copies: integer("copies").notNull().default(0),
  rating: integer("rating").notNull().default(0),
  ratingCount: integer("rating_count").notNull().default(0),
  isFeatured: boolean("is_featured").notNull().default(false),
  isTrending: boolean("is_trending").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const promptAnalytics = pgTable("prompt_analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  promptId: varchar("prompt_id").references(() => prompts.id),
  action: text("action").notNull(), // 'view', 'copy', 'rate'
  userAgent: text("user_agent"),
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const generatedPrompts = pgTable("generated_prompts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userInput: text("user_input").notNull(),
  generatedContent: jsonb("generated_content").$type<{
    platform: string;
    type: string;
    content: string;
    preview: string;
  }[]>(),
  sessionId: text("session_id"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Relations
export const promptsRelations = relations(prompts, ({ one }) => ({
  platform: one(platforms, {
    fields: [prompts.platformId],
    references: [platforms.id],
  }),
  category: one(categories, {
    fields: [prompts.categoryId],
    references: [categories.id],
  }),
}));

export const platformsRelations = relations(platforms, ({ many }) => ({
  prompts: many(prompts),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  prompts: many(prompts),
}));

export const promptAnalyticsRelations = relations(promptAnalytics, ({ one }) => ({
  prompt: one(prompts, {
    fields: [promptAnalytics.promptId],
    references: [prompts.id],
  }),
}));

// Schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertPromptSchema = createInsertSchema(prompts).omit({
  id: true,
  views: true,
  copies: true,
  rating: true,
  ratingCount: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  promptCount: true,
  createdAt: true,
});

export const insertPlatformSchema = createInsertSchema(platforms).omit({
  id: true,
  promptCount: true,
  createdAt: true,
});

export const insertGeneratedPromptSchema = createInsertSchema(generatedPrompts).omit({
  id: true,
  createdAt: true,
});

export const insertPromptAnalyticsSchema = createInsertSchema(promptAnalytics).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertPrompt = z.infer<typeof insertPromptSchema>;
export type Prompt = typeof prompts.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;
export type InsertPlatform = z.infer<typeof insertPlatformSchema>;
export type Platform = typeof platforms.$inferSelect;
export type InsertGeneratedPrompt = z.infer<typeof insertGeneratedPromptSchema>;
export type GeneratedPrompt = typeof generatedPrompts.$inferSelect;
export type InsertPromptAnalytics = z.infer<typeof insertPromptAnalyticsSchema>;
export type PromptAnalytics = typeof promptAnalytics.$inferSelect;

export type PromptWithRelations = Prompt & {
  platform?: Platform;
  category?: Category;
};
