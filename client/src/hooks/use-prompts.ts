import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export function usePrompts(limit = 20, offset = 0) {
  return useQuery({
    queryKey: ["/api/prompts", limit, offset],
    queryFn: () => api.getPrompts(limit, offset),
  });
}

export function useTrendingPrompts(limit = 10) {
  return useQuery({
    queryKey: ["/api/prompts/trending", limit],
    queryFn: () => api.getTrendingPrompts(limit),
  });
}

export function useFeaturedPrompts(limit = 10) {
  return useQuery({
    queryKey: ["/api/prompts/featured", limit],
    queryFn: () => api.getFeaturedPrompts(limit),
  });
}

export function usePromptsByPlatform(platformId: string, limit = 20) {
  return useQuery({
    queryKey: ["/api/prompts/platform", platformId, limit],
    queryFn: () => api.getPromptsByPlatform(platformId, limit),
    enabled: !!platformId,
  });
}

export function usePromptsByCategory(categoryId: string, limit = 20) {
  return useQuery({
    queryKey: ["/api/prompts/category", categoryId, limit],
    queryFn: () => api.getPromptsByCategory(categoryId, limit),
    enabled: !!categoryId,
  });
}

export function useSearchPrompts(query: string, limit = 20) {
  return useQuery({
    queryKey: ["/api/prompts/search", query, limit],
    queryFn: () => api.searchPrompts(query, limit),
    enabled: !!query && query.length > 0,
  });
}

export function usePrompt(id: string) {
  return useQuery({
    queryKey: ["/api/prompts", id],
    queryFn: () => api.getPrompt(id),
    enabled: !!id,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["/api/categories"],
    queryFn: () => api.getCategories(),
  });
}

export function usePlatforms() {
  return useQuery({
    queryKey: ["/api/platforms"],
    queryFn: () => api.getPlatforms(),
  });
}

export function useStats() {
  return useQuery({
    queryKey: ["/api/stats"],
    queryFn: () => api.getStats(),
  });
}

export function useGeneratePrompts() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ prompt, sessionId }: { prompt: string; sessionId?: string }) =>
      api.generatePrompts(prompt, sessionId),
    onSuccess: () => {
      // Invalidate and refetch any related queries
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Success!",
        description: "AI prompts generated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate prompts. Please try again.",
        variant: "destructive",
      });
    },
  });
}

export function useRecordAnalytics() {
  return useMutation({
    mutationFn: ({ 
      promptId, 
      action, 
      userAgent 
    }: { 
      promptId: string; 
      action: 'view' | 'copy' | 'rate'; 
      userAgent?: string; 
    }) =>
      api.recordAnalytics(promptId, action, userAgent),
    onError: (error: Error) => {
      console.error("Failed to record analytics:", error);
      // Don't show user toast for analytics errors
    },
  });
}
