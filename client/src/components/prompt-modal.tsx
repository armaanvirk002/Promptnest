import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useRecordAnalytics } from "@/hooks/use-prompts";
import type { Prompt } from "@/types/prompt";

interface PromptModalProps {
  prompt: Prompt;
  isOpen: boolean;
  onClose: () => void;
  isGenerated?: boolean;
}

export function PromptModal({ prompt, isOpen, onClose, isGenerated = false }: PromptModalProps) {
  const { toast } = useToast();
  const recordAnalytics = useRecordAnalytics();

  useEffect(() => {
    if (isOpen && !isGenerated && prompt.id) {
      // Record view analytics when modal opens
      recordAnalytics.mutate({
        promptId: prompt.id,
        action: 'view',
        userAgent: navigator.userAgent
      });
    }
  }, [isOpen, prompt.id, isGenerated, recordAnalytics]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt.content);
      toast({
        title: "Copied!",
        description: "Full prompt copied to clipboard",
      });

      // Record analytics for existing prompts
      if (!isGenerated && prompt.id) {
        recordAnalytics.mutate({
          promptId: prompt.id,
          action: 'copy',
          userAgent: navigator.userAgent
        });
      }
      
      onClose();
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Could not copy prompt to clipboard",
        variant: "destructive",
      });
    }
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900/95 backdrop-blur-md border-slate-700">
        <DialogHeader className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold text-white mb-2">
                {prompt.title}
              </DialogTitle>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 bg-${getPlatformColor()}-400/20 text-${getPlatformColor()}-300 text-sm rounded-full flex items-center gap-2`}>
                  <i className={getPlatformIcon()}></i>
                  {prompt.platform?.name || 'Unknown'}
                </span>
                <span className="px-3 py-1 bg-blue-400/20 text-blue-300 text-sm rounded-full">
                  {prompt.type}
                </span>
                {prompt.category && (
                  <span className="px-3 py-1 bg-purple-400/20 text-purple-300 text-sm rounded-full">
                    {prompt.category.name}
                  </span>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="bg-black/20 rounded-xl p-4 border border-white/10">
            <div className="mb-3">
              <h4 className="text-white font-semibold mb-2">Full Prompt:</h4>
            </div>
            <p className="text-white/90 whitespace-pre-wrap leading-relaxed">
              {prompt.content}
            </p>
          </div>
          
          {prompt.tags && prompt.tags.length > 0 && (
            <div>
              <h4 className="text-white font-semibold mb-2">Tags:</h4>
              <div className="flex flex-wrap gap-2">
                {prompt.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-white/10 text-white/80 text-xs rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            {!isGenerated && (
              <div className="flex items-center gap-4 text-sm text-white/60">
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
                    <span>{(prompt.rating / 10).toFixed(1)} rating</span>
                  </span>
                )}
                <span className="text-xs">
                  Added {new Date(prompt.createdAt).toLocaleDateString()}
                </span>
              </div>
            )}
            
            <Button
              onClick={handleCopy}
              className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-semibold transition-all duration-300 flex items-center gap-2 ml-auto"
            >
              <i className="fas fa-copy"></i>
              Copy Prompt
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
