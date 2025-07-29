import { useCategories } from "@/hooks/use-prompts";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function CategoriesSection() {
  const { data: categories, isLoading } = useCategories();

  if (isLoading) {
    return (
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-12">
            Browse by Category
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-8 h-8 bg-white/20" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-20 mb-1 bg-white/20" />
                      <Skeleton className="h-3 w-16 bg-white/20" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-12">
            Browse by Category
          </h2>
          <div className="text-white/70">
            <i className="fas fa-exclamation-circle text-4xl mb-4"></i>
            <p>No categories available at the moment.</p>
          </div>
        </div>
      </section>
    );
  }

  const getCategoryIcon = (category: any) => {
    if (category.icon) return category.icon;
    
    const iconMap: Record<string, string> = {
      'Business': 'fas fa-briefcase',
      'Creative': 'fas fa-paint-brush',
      'Programming': 'fas fa-code',
      'Writing': 'fas fa-pen-fancy',
      'Marketing': 'fas fa-chart-line',
      'Education': 'fas fa-graduation-cap',
      'SEO': 'fas fa-search',
      'Research': 'fas fa-microscope'
    };
    
    return iconMap[category.name] || 'fas fa-folder';
  };

  const getCategoryColor = (category: any) => {
    if (category.color) return category.color;
    
    const colorMap: Record<string, string> = {
      'Business': 'blue',
      'Creative': 'purple',
      'Programming': 'green',
      'Writing': 'pink',
      'Marketing': 'cyan',
      'Education': 'yellow',
      'SEO': 'orange',
      'Research': 'teal'
    };
    
    return colorMap[category.name] || 'gray';
  };

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-12">
          Browse by Category
        </h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((category) => {
            const icon = getCategoryIcon(category);
            const color = getCategoryColor(category);
            
            return (
              <Card
                key={category.id}
                className="group bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-2 cursor-pointer"
              >
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center gap-3">
                    <i className={`${icon} text-2xl text-${color}-400 group-hover:scale-110 transition-transform duration-300`}></i>
                    <div>
                      <h3 className="font-semibold text-white">{category.name}</h3>
                      <p className="text-white/60 text-sm">
                        {category.promptCount} prompts
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
