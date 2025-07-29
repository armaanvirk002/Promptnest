import { AIGenerator } from "@/components/ai-generator";
import { useStats } from "@/hooks/use-prompts";

export default function Home() {
  const { data: stats } = useStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-purple-800">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <i className="fas fa-brain text-purple-600 text-lg"></i>
              </div>
              <span className="text-white font-bold text-xl">PromptNest</span>
            </div>
            
            <button className="md:hidden text-white">
              <i className="fas fa-bars"></i>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          {/* Hero Content */}
          <div className="mb-8 animate-fade-in">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-300">
                PromptNest
              </span>
              <span className="block text-2xl sm:text-3xl lg:text-4xl mt-2 text-white/90">
                AI Prompt Generator
              </span>
            </h1>
            <h2 className="text-xl sm:text-2xl text-white/90 mb-8 max-w-4xl mx-auto leading-relaxed">
              Generate Custom AI Prompts Instantly + 
              <br />264+ Free ChatGPT, Midjourney & Claude Prompts
            </h2>
            
            <p className="text-lg text-white/80 mb-12 max-w-4xl mx-auto">
              Create perfect prompts for any project with our <strong>AI Prompt Generator</strong>. Daily updated library with viral 
              prompts for <strong>ChatGPT</strong>, <strong>Midjourney</strong>, <strong>Claude</strong>, <strong>Gemini</strong>, writing, SEO, coding, and content creation. 
              Free AI prompts for professionals, marketers, writers, and developers.
            </p>
            
            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 mb-12">
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-white">264+</div>
                <div className="text-white/80 text-sm sm:text-base">AI Prompts</div>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-white">50+</div>
                <div className="text-white/80 text-sm sm:text-base">Daily Updates</div>
              </div>
            </div>
          </div>



          {/* AI Prompt Generator - Main Feature */}
          <div className="mb-12">
            <AIGenerator />
          </div>
        </div>
      </main>

      {/* Clarity Tracking Code (Preserved from existing implementation) */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "YOUR_CLARITY_ID");
          `,
        }}
      />
    </div>
  );
}
