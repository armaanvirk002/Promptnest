import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSearchPrompts, useStats } from "@/hooks/use-prompts";
import { AIGenerator } from "./ai-generator";

export function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: stats } = useStats();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Handle search - this could navigate to a search results page
      console.log("Search for:", searchQuery);
    }
  };

  return (
    <section className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto text-center">
        {/* Hero Content */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Generate Custom AI Prompts
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-300">
              {" "}Instantly
            </span>
          </h1>
          <p className="text-xl sm:text-2xl text-white/90 mb-8 max-w-4xl mx-auto leading-relaxed">
            Create perfect prompts for any project with our AI Prompt Generator. 
            Daily updated library with viral prompts for GPT-4, Midjourney, Claude, writing, SEO, and content creation
          </p>
          
          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 mb-12">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-white">
                {stats?.totalPrompts ? `${stats.totalPrompts}+` : '1900+'}
              </div>
              <div className="text-white/80 text-sm sm:text-base">AI Prompts</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-white">
                {stats?.totalCategories ? `${stats.totalCategories}+` : '20+'}
              </div>
              <div className="text-white/80 text-sm sm:text-base">Categories</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-white">50+</div>
              <div className="text-white/80 text-sm sm:text-base">Daily Updates</div>
            </div>
          </div>
        </div>

        {/* AI Prompt Generator */}
        <div className="mb-12">
          <AIGenerator />
        </div>

        {/* Quick Search */}
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSearch} className="relative">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${stats?.totalPrompts || '1900'}+ prompts by keywords...`}
              className="w-full px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent text-lg"
            />
            <Button
              type="submit"
              variant="ghost"
              size="icon"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
            >
              <i className="fas fa-search text-xl"></i>
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
