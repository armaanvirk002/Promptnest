import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useGeneratePrompts } from "@/hooks/use-prompts";
import { PromptCard } from "./prompt-card";
import type { GeneratedPrompt } from "@/types/prompt";

export function AIGenerator() {
  const [input, setInput] = useState("");
  const [generatedPrompts, setGeneratedPrompts] = useState<GeneratedPrompt[]>([]);
  const generateMutation = useGeneratePrompts();

  const handleGenerate = async () => {
    if (!input.trim()) {
      return;
    }

    try {
      const response = await generateMutation.mutateAsync({
        prompt: input.trim(),
        sessionId: `session_${Date.now()}`
      });
      
      setGeneratedPrompts(response.prompts);
    } catch (error) {
      console.error("Generation failed:", error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleGenerate();
    }
  };

  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
      <CardContent className="p-6 sm:p-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 flex items-center justify-center gap-3">
            <i className="fas fa-magic text-cyan-400"></i>
            AI Prompt Generator - Create Custom Prompts Instantly
          </h2>
          <p className="text-white/80 text-sm sm:text-base">
            Enter your idea and get optimized prompts for ChatGPT, Midjourney, Claude, and Gemini
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter your idea (e.g., 'help me write professional emails')"
                className="w-full px-6 py-4 bg-white/30 backdrop-blur-sm border border-white/40 rounded-xl text-white placeholder-white/90 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent text-lg"
                disabled={generateMutation.isPending}
              />
              <i className="fas fa-lightbulb absolute right-4 top-1/2 transform -translate-y-1/2 text-white/40"></i>
            </div>
            <Button
              onClick={handleGenerate}
              disabled={!input.trim() || generateMutation.isPending}
              className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-2 whitespace-nowrap h-auto"
            >
              {generateMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Generating...
                </>
              ) : (
                <>
                  <i className="fas fa-sparkles"></i>
                  Generate
                </>
              )}
            </Button>
          </div>
          
          {/* Loading State */}
          {generateMutation.isPending && (
            <div className="animate-pulse mb-6">
              <div className="flex items-center justify-center gap-3 text-white/80">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-400"></div>
                <span>Generating prompts with AI...</span>
              </div>
            </div>
          )}
          
          {/* Generated Prompts Display */}
          {generatedPrompts.length > 0 && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid md:grid-cols-2 gap-4">
                {generatedPrompts.map((prompt, index) => (
                  <PromptCard
                    key={index}
                    prompt={{
                      id: `generated-${index}`,
                      title: `${prompt.platform} ${prompt.type} Prompt`,
                      content: prompt.content,
                      preview: prompt.preview,
                      type: prompt.type,
                      tags: [],
                      views: 0,
                      copies: 0,
                      rating: 0,
                      ratingCount: 0,
                      isFeatured: false,
                      isTrending: false,
                      isActive: true,
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                      platform: {
                        id: prompt.platform.toLowerCase(),
                        name: prompt.platform,
                        icon: prompt.icon,
                        color: prompt.color,
                        promptCount: 0,
                        createdAt: new Date().toISOString(),
                      }
                    }}
                    isGenerated={true}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* Error State */}
          {generateMutation.isError && (
            <div className="text-center py-6">
              <div className="text-red-400 mb-2">
                <i className="fas fa-exclamation-triangle text-2xl"></i>
              </div>
              <p className="text-white/80">
                Failed to generate prompts. Please try again.
              </p>
              <Button
                onClick={handleGenerate}
                variant="outline"
                className="mt-3 border-white/30 text-white hover:bg-white/10"
              >
                Retry
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
