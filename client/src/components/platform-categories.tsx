import { usePlatforms } from "@/hooks/use-prompts";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function PlatformCategories() {
  const { data: platforms, isLoading } = usePlatforms();

  if (isLoading) {
    return (
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-12">
            Browse by AI Platform
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-4 sm:p-6 text-center">
                  <Skeleton className="w-12 h-12 mx-auto mb-4 bg-white/20" />
                  <Skeleton className="h-4 w-20 mx-auto mb-2 bg-white/20" />
                  <Skeleton className="h-3 w-16 mx-auto bg-white/20" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!platforms || platforms.length === 0) {
    return (
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-12">
            Browse by AI Platform
          </h2>
          <div className="text-white/70">
            <i className="fas fa-exclamation-circle text-4xl mb-4"></i>
            <p>No platforms available at the moment.</p>
          </div>
        </div>
      </section>
    );
  }

  const getPlatformIcon = (platform: any) => {
    if (platform.icon) return platform.icon;
    
    const iconMap: Record<string, string> = {
      'ChatGPT': 'fab fa-openai',
      'Midjourney': 'fas fa-palette',
      'Claude': 'fas fa-robot',
      'Gemini': 'fas fa-gem',
      'DALL-E': 'fas fa-image',
      'Veo3': 'fas fa-video'
    };
    
    return iconMap[platform.name] || 'fas fa-robot';
  };

  const getPlatformColor = (platform: any) => {
    if (platform.color) return platform.color;
    
    const colorMap: Record<string, string> = {
      'ChatGPT': 'green',
      'Midjourney': 'purple',
      'Claude': 'orange',
      'Gemini': 'cyan',
      'DALL-E': 'blue',
      'Veo3': 'red'
    };
    
    return colorMap[platform.name] || 'blue';
  };

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-12">
          Browse by AI Platform
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
          {platforms.map((platform) => {
            const icon = getPlatformIcon(platform);
            const color = getPlatformColor(platform);
            
            return (
              <Card
                key={platform.id}
                className="group bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-2 cursor-pointer"
              >
                <CardContent className="p-4 sm:p-6 text-center">
                  <div className="mb-4">
                    <i className={`${icon} text-3xl sm:text-4xl text-${color}-400 group-hover:scale-110 transition-transform duration-300`}></i>
                  </div>
                  <h3 className="font-semibold text-white mb-2">{platform.name}</h3>
                  <p className="text-white/70 text-sm">
                    {platform.promptCount}+ prompts
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
