import { useTrendingPrompts } from "@/hooks/use-prompts";
import { PromptCard } from "./prompt-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function TrendingPrompts() {
  const { data: trendingPrompts, isLoading, error } = useTrendingPrompts(6);

  if (isLoading) {
    return (
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              🔥 Trending Prompts
            </h2>
            <div className="text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-2">
              View all <i className="fas fa-arrow-right"></i>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Skeleton className="w-16 h-6 bg-white/20" />
                      <Skeleton className="w-12 h-6 bg-white/20" />
                    </div>
                    <Skeleton className="w-6 h-6 bg-white/20" />
                  </div>
                  <Skeleton className="h-6 w-3/4 mb-3 bg-white/20" />
                  <Skeleton className="h-16 w-full mb-4 bg-white/20" />
                  <div className="flex items-center justify-between">
                    <div className="flex gap-4">
                      <Skeleton className="h-4 w-16 bg-white/20" />
                      <Skeleton className="h-4 w-16 bg-white/20" />
                      <Skeleton className="h-4 w-12 bg-white/20" />
                    </div>
                    <Skeleton className="h-6 w-16 bg-white/20" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-8">
            🔥 Trending Prompts
          </h2>
          <div className="text-white/70">
            <i className="fas fa-exclamation-triangle text-4xl mb-4"></i>
            <p>Failed to load trending prompts. Please try again later.</p>
          </div>
        </div>
      </section>
    );
  }

  if (!trendingPrompts || trendingPrompts.length === 0) {
    return (
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-8">
            🔥 Trending Prompts
          </h2>
          <div className="text-white/70">
            <i className="fas fa-fire text-4xl mb-4"></i>
            <p>No trending prompts available yet. Check back soon!</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            🔥 Trending Prompts
          </h2>
          <a href="#" className="text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-2">
            View all <i className="fas fa-arrow-right"></i>
          </a>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trendingPrompts.map((prompt) => (
            <PromptCard key={prompt.id} prompt={prompt} />
          ))}
        </div>
      </div>
    </section>
  );
}
