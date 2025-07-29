import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { openRouterService } from "./services/openrouter";
import { z } from "zod";

const generatePromptsSchema = z.object({
  prompt: z.string().min(1).max(500),
  sessionId: z.string().optional(),
});

const recordAnalyticsSchema = z.object({
  promptId: z.string(),
  action: z.enum(['view', 'copy', 'rate']),
  userAgent: z.string().optional(),
});

const searchSchema = z.object({
  q: z.string().min(1),
  limit: z.number().optional(),
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Initialize default data if needed
  await initializeDefaultData();

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Get all categories
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  // Get all platforms
  app.get("/api/platforms", async (req, res) => {
    try {
      const platforms = await storage.getPlatforms();
      res.json(platforms);
    } catch (error) {
      console.error('Error fetching platforms:', error);
      res.status(500).json({ error: "Failed to fetch platforms" });
    }
  });

  // Get prompts with pagination
  app.get("/api/prompts", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      const prompts = await storage.getPrompts(limit, offset);
      res.json(prompts);
    } catch (error) {
      console.error('Error fetching prompts:', error);
      res.status(500).json({ error: "Failed to fetch prompts" });
    }
  });

  // Get trending prompts
  app.get("/api/prompts/trending", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const prompts = await storage.getTrendingPrompts(limit);
      res.json(prompts);
    } catch (error) {
      console.error('Error fetching trending prompts:', error);
      res.status(500).json({ error: "Failed to fetch trending prompts" });
    }
  });

  // Get featured prompts
  app.get("/api/prompts/featured", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const prompts = await storage.getFeaturedPrompts(limit);
      res.json(prompts);
    } catch (error) {
      console.error('Error fetching featured prompts:', error);
      res.status(500).json({ error: "Failed to fetch featured prompts" });
    }
  });

  // Get prompts by platform
  app.get("/api/prompts/platform/:platformId", async (req, res) => {
    try {
      const { platformId } = req.params;
      const limit = parseInt(req.query.limit as string) || 20;
      const prompts = await storage.getPromptsByPlatform(platformId, limit);
      res.json(prompts);
    } catch (error) {
      console.error('Error fetching prompts by platform:', error);
      res.status(500).json({ error: "Failed to fetch prompts by platform" });
    }
  });

  // Get prompts by category
  app.get("/api/prompts/category/:categoryId", async (req, res) => {
    try {
      const { categoryId } = req.params;
      const limit = parseInt(req.query.limit as string) || 20;
      const prompts = await storage.getPromptsByCategory(categoryId, limit);
      res.json(prompts);
    } catch (error) {
      console.error('Error fetching prompts by category:', error);
      res.status(500).json({ error: "Failed to fetch prompts by category" });
    }
  });

  // Search prompts
  app.get("/api/prompts/search", async (req, res) => {
    try {
      const validation = searchSchema.safeParse(req.query);
      if (!validation.success) {
        return res.status(400).json({ error: "Invalid search parameters" });
      }

      const { q, limit = 20 } = validation.data;
      const prompts = await storage.searchPrompts(q, limit);
      res.json(prompts);
    } catch (error) {
      console.error('Error searching prompts:', error);
      res.status(500).json({ error: "Failed to search prompts" });
    }
  });

  // Get single prompt
  app.get("/api/prompts/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const prompt = await storage.getPromptById(id);
      
      if (!prompt) {
        return res.status(404).json({ error: "Prompt not found" });
      }

      // Record view
      await storage.recordPromptAction({
        promptId: id,
        action: 'view',
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip
      });

      // Update view count
      await storage.updatePromptStats(id, 1);

      res.json(prompt);
    } catch (error) {
      console.error('Error fetching prompt:', error);
      res.status(500).json({ error: "Failed to fetch prompt" });
    }
  });

  // Generate AI prompts (TOP PRIORITY)
  app.post("/api/generate", async (req, res) => {
    try {
      const validation = generatePromptsSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          error: "Invalid request",
          details: validation.error.issues
        });
      }

      const { prompt, sessionId } = validation.data;

      // Generate prompts using OpenRouter
      const generatedPrompts = await openRouterService.generatePrompts(prompt);

      // Save generation to database
      await storage.saveGeneratedPrompts({
        userInput: prompt,
        generatedContent: generatedPrompts,
        sessionId: sessionId || `session_${Date.now()}`
      });

      res.json({
        success: true,
        prompts: generatedPrompts,
        input: prompt
      });

    } catch (error) {
      console.error('Error generating prompts:', error);
      res.status(500).json({ 
        error: "Failed to generate prompts",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Record prompt analytics (copy, rate, etc.)
  app.post("/api/analytics", async (req, res) => {
    try {
      const validation = recordAnalyticsSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: "Invalid analytics data" });
      }

      const { promptId, action, userAgent } = validation.data;

      await storage.recordPromptAction({
        promptId,
        action,
        userAgent: userAgent || req.headers['user-agent'],
        ipAddress: req.ip
      });

      // Update copy count if action is copy
      if (action === 'copy') {
        await storage.updatePromptStats(promptId, undefined, 1);
      }

      res.json({ success: true });
    } catch (error) {
      console.error('Error recording analytics:', error);
      res.status(500).json({ error: "Failed to record analytics" });
    }
  });

  // Get stats for dashboard
  app.get("/api/stats", async (req, res) => {
    try {
      const [categories, platforms, featuredPrompts] = await Promise.all([
        storage.getCategories(),
        storage.getPlatforms(),
        storage.getFeaturedPrompts(5)
      ]);

      const totalPrompts = categories.reduce((sum, cat) => sum + cat.promptCount, 0);

      res.json({
        totalPrompts,
        totalCategories: categories.length,
        totalPlatforms: platforms.length,
        categories,
        platforms,
        featuredPrompts
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

async function initializeDefaultData() {
  try {
    // Check if platforms exist
    const existingPlatforms = await storage.getPlatforms();
    if (existingPlatforms.length === 0) {
      // Create default platforms
      const defaultPlatforms = [
        { name: 'ChatGPT', description: 'OpenAI\'s conversational AI', icon: 'fab fa-openai', color: 'green' },
        { name: 'Midjourney', description: 'AI image generation', icon: 'fas fa-palette', color: 'purple' },
        { name: 'Claude', description: 'Anthropic\'s AI assistant', icon: 'fas fa-robot', color: 'orange' },
        { name: 'Gemini', description: 'Google\'s AI model', icon: 'fas fa-gem', color: 'cyan' },
        { name: 'DALL-E', description: 'OpenAI\'s image generator', icon: 'fas fa-image', color: 'blue' },
        { name: 'Veo3', description: 'Google\'s video AI', icon: 'fas fa-video', color: 'red' }
      ];

      for (const platform of defaultPlatforms) {
        await storage.createPlatform(platform);
      }
    }

    // Check if categories exist
    const existingCategories = await storage.getCategories();
    if (existingCategories.length === 0) {
      // Create default categories
      const defaultCategories = [
        { name: 'Business', description: 'Professional and business prompts', icon: 'fas fa-briefcase', color: 'blue' },
        { name: 'Creative', description: 'Art and creative prompts', icon: 'fas fa-paint-brush', color: 'purple' },
        { name: 'Programming', description: 'Coding and development', icon: 'fas fa-code', color: 'green' },
        { name: 'Writing', description: 'Content and copywriting', icon: 'fas fa-pen-fancy', color: 'pink' },
        { name: 'Marketing', description: 'Marketing and advertising', icon: 'fas fa-chart-line', color: 'cyan' },
        { name: 'Education', description: 'Learning and teaching', icon: 'fas fa-graduation-cap', color: 'yellow' },
        { name: 'SEO', description: 'Search optimization', icon: 'fas fa-search', color: 'orange' },
        { name: 'Research', description: 'Analysis and research', icon: 'fas fa-microscope', color: 'teal' }
      ];

      for (const category of defaultCategories) {
        await storage.createCategory(category);
      }
    }

    console.log('Default data initialization completed');
  } catch (error) {
    console.error('Error initializing default data:', error);
  }
}
