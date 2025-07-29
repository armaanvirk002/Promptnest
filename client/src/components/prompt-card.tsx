import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useRecordAnalytics } from "@/hooks/use-prompts";
import type { Prompt } from "@/types/prompt";
import { PromptModal } from "./prompt-modal";

interface PromptCardProps {
  prompt: Prompt;
  isGenerated?: boolean;
}

export function PromptCard({ prompt, isGenerated = false }: PromptCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();
  const recordAnalytics = useRecordAnalytics();

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      await navigator.clipboard.writeText(prompt.content);
      toast({
        title: "Copied!",
        description: "Prompt copied to clipboard",
      });

      // Record analytics for existing prompts
      if (!isGenerated && prompt.id) {
        recordAnalytics.mutate({
          promptId: prompt.id,
          action: 'copy',
          userAgent: navigator.userAgent
        });
      }
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Could not copy prompt to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsModalOpen(true);
  };

  const getPlatformIcon = () => {
    const iconMap: Record<string, string> = {
      'ChatGPT': 'fab fa-openai',
      'Midjourney': 'fas fa-palette',
      'Claude': 'fas fa-robot',
      'Gemini': 'fas fa-gem',
      'DALL-E': 'fas fa-image',
      'Veo3': 'fas fa-video'
    };
    
    return prompt.platform?.icon || iconMap[prompt.platform?.name || ''] || 'fas fa-robot';
  };

  const getPlatformColor = () => {
    const colorMap: Record<string, string> = {
      'ChatGPT': 'green',
      'Midjourney': 'purple',
      'Claude': 'orange',
      'Gemini': 'cyan',
      'DALL-E': 'blue',
      'Veo3': 'red'
    };
    
    return prompt.platform?.color || colorMap[prompt.platform?.name || ''] || 'blue';
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  return (
    <>
      <Card className="group bg-white/15 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <i className={`${getPlatformIcon()} text-${getPlatformColor()}-400`}></i>
              <span className="font-semibold text-white">{prompt.platform?.name || 'Unknown'}</span>
              <span className={`px-3 py-1 bg-${getPlatformColor()}-400/20 text-${getPlatformColor()}-300 text-xs rounded-full font-medium`}>
                {prompt.type}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopy}
              className="text-white/60 hover:text-white hover:bg-white/10 transition-colors h-8 w-8"
            >
              <i className="fas fa-copy"></i>
            </Button>
          </div>
          
          <h3 className="font-semibold text-white mb-3 group-hover:text-cyan-300 transition-colors line-clamp-2">
            {prompt.title}
          </h3>
          
          <p className="text-white/80 text-sm mb-4 line-clamp-3">
            {prompt.preview}
          </p>
          
          <div className="flex items-center justify-between">
            {!isGenerated && (
              <div className="flex items-center gap-4 text-xs text-white/60">
                <span className="flex items-center gap-1">
                  <i className="fas fa-eye"></i>
                  <span>{formatNumber(prompt.views)} views</span>
                </span>
                <span className="flex items-center gap-1">
                  <i className="fas fa-copy"></i>
                  <span>{formatNumber(prompt.copies)} copies</span>
                </span>
                {prompt.rating > 0 && (
                  <span className="flex items-center gap-1">
                    <i className="fas fa-star"></i>
                    <span>{(prompt.rating / 10).toFixed(1)}</span>
                  </span>
                )}
              </div>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExpand}
              className="text-cyan-400 hover:text-cyan-300 hover:bg-white/10 transition-colors ml-auto"
            >
              Expand →
            </Button>
          </div>
        </CardContent>
      </Card>

      <PromptModal
        prompt={prompt}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isGenerated={isGenerated}
      />
    </>
  );
}
