import { apiRequest } from "./queryClient";
import type { 
  Prompt, 
  Category, 
  Platform, 
  GenerateResponse, 
  Stats 
} from "../types/prompt";

export const api = {
  // Health check
  async health() {
    const res = await apiRequest("GET", "/api/health");
    return res.json();
  },

  // Categories
  async getCategories(): Promise<Category[]> {
    const res = await apiRequest("GET", "/api/categories");
    return res.json();
  },

  // Platforms
  async getPlatforms(): Promise<Platform[]> {
    const res = await apiRequest("GET", "/api/platforms");
    return res.json();
  },

  // Prompts
  async getPrompts(limit = 20, offset = 0): Promise<Prompt[]> {
    const res = await apiRequest("GET", `/api/prompts?limit=${limit}&offset=${offset}`);
    return res.json();
  },

  async getTrendingPrompts(limit = 10): Promise<Prompt[]> {
    const res = await apiRequest("GET", `/api/prompts/trending?limit=${limit}`);
    return res.json();
  },

  async getFeaturedPrompts(limit = 10): Promise<Prompt[]> {
    const res = await apiRequest("GET", `/api/prompts/featured?limit=${limit}`);
    return res.json();
  },

  async getPromptsByPlatform(platformId: string, limit = 20): Promise<Prompt[]> {
    const res = await apiRequest("GET", `/api/prompts/platform/${platformId}?limit=${limit}`);
    return res.json();
  },

  async getPromptsByCategory(categoryId: string, limit = 20): Promise<Prompt[]> {
    const res = await apiRequest("GET", `/api/prompts/category/${categoryId}?limit=${limit}`);
    return res.json();
  },

  async searchPrompts(query: string, limit = 20): Promise<Prompt[]> {
    const res = await apiRequest("GET", `/api/prompts/search?q=${encodeURIComponent(query)}&limit=${limit}`);
    return res.json();
  },

  async getPrompt(id: string): Promise<Prompt> {
    const res = await apiRequest("GET", `/api/prompts/${id}`);
    return res.json();
  },

  // AI Generation (TOP PRIORITY)
  async generatePrompts(prompt: string, sessionId?: string): Promise<GenerateResponse> {
    const res = await apiRequest("POST", "/api/generate", { 
      prompt, 
      sessionId 
    });
    return res.json();
  },

  // Analytics
  async recordAnalytics(promptId: string, action: 'view' | 'copy' | 'rate', userAgent?: string) {
    const res = await apiRequest("POST", "/api/analytics", {
      promptId,
      action,
      userAgent
    });
    return res.json();
  },

  // Stats
  async getStats(): Promise<Stats> {
    const res = await apiRequest("GET", "/api/stats");
    return res.json();
  }
};
