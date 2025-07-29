export interface Platform {
  id: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  promptCount: number;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  promptCount: number;
  createdAt: string;
}

export interface Prompt {
  id: string;
  title: string;
  content: string;
  preview: string;
  platformId?: string;
  categoryId?: string;
  type: string;
  tags: string[];
  views: number;
  copies: number;
  rating: number;
  ratingCount: number;
  isFeatured: boolean;
  isTrending: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  platform?: Platform;
  category?: Category;
}

export interface GeneratedPrompt {
  platform: string;
  type: string;
  content: string;
  preview: string;
  icon: string;
  color: string;
}

export interface GenerateResponse {
  success: boolean;
  prompts: GeneratedPrompt[];
  input: string;
}

export interface Stats {
  totalPrompts: number;
  totalCategories: number;
  totalPlatforms: number;
  categories: Category[];
  platforms: Platform[];
  featuredPrompts: Prompt[];
}
