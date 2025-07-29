interface OpenRouterResponse {
  id: string;
  choices: {
    message: {
      content: string;
    };
  }[];
}

interface GeneratedPrompt {
  platform: string;
  type: string;
  content: string;
  preview: string;
  icon: string;
  color: string;
}

export class OpenRouterService {
  private apiKey: string;
  private baseUrl = 'https://openrouter.ai/api/v1';

  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY || '';
    if (!this.apiKey) {
      console.warn('OPENROUTER_API_KEY not provided. AI generation will not work.');
    }
  }

  async generatePrompts(userInput: string): Promise<GeneratedPrompt[]> {
    if (!this.apiKey) {
      throw new Error('OpenRouter API key not configured');
    }

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.REPLIT_DOMAINS?.split(',')[0] || 'http://localhost:5000',
          'X-Title': 'PromptNest'
        },
        body: JSON.stringify({
          model: 'anthropic/claude-3.5-sonnet',
          messages: [
            {
              role: 'system',
              content: `You are an expert AI prompt engineer. Generate 4 high-quality, specific prompts based on the user's input for different AI platforms. 

For each platform, create a detailed, actionable prompt that would produce excellent results. Make sure each prompt is platform-optimized:

- ChatGPT: Conversational, detailed instructions with clear role definition
- Midjourney: Visual description with artistic parameters and technical specs
- Claude: Analytical, structured approach with clear reasoning steps  
- Gemini: Research-focused with comprehensive analysis requirements

Return your response as a JSON array with exactly this structure:
[
  {
    "platform": "ChatGPT",
    "type": "Professional/Creative/Technical/etc",
    "content": "Full detailed prompt here...",
    "preview": "First 150 characters of the prompt...",
    "icon": "fab fa-openai",
    "color": "green"
  },
  {
    "platform": "Midjourney", 
    "type": "Visual/Artistic/etc",
    "content": "Full prompt with parameters...",
    "preview": "First 150 characters...",
    "icon": "fas fa-palette",
    "color": "purple"
  },
  {
    "platform": "Claude",
    "type": "Analytical/Research/etc", 
    "content": "Full structured prompt...",
    "preview": "First 150 characters...",
    "icon": "fas fa-robot",
    "color": "orange"
  },
  {
    "platform": "Gemini",
    "type": "Research/Analysis/etc",
    "content": "Full comprehensive prompt...", 
    "preview": "First 150 characters...",
    "icon": "fas fa-gem",
    "color": "cyan"
  }
]

Make each prompt unique, valuable, and tailored to the platform's strengths.`
            },
            {
              role: 'user',
              content: `Generate 4 optimized AI prompts for: ${userInput}`
            }
          ],
          response_format: { type: "json_object" },
          max_tokens: 2000,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
      }

      const data: OpenRouterResponse = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('No content received from OpenRouter API');
      }

      // Parse the JSON response
      let parsedContent;
      try {
        // Try to parse directly first
        parsedContent = JSON.parse(content);
      } catch (e) {
        // If that fails, try to extract JSON from the content
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          parsedContent = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('Could not parse JSON from OpenRouter response');
        }
      }

      // Validate and format the response
      if (!Array.isArray(parsedContent) || parsedContent.length !== 4) {
        throw new Error('Invalid response format from OpenRouter API');
      }

      return parsedContent.map((prompt: any) => ({
        platform: prompt.platform || 'Unknown',
        type: prompt.type || 'General',
        content: prompt.content || '',
        preview: prompt.preview || prompt.content?.substring(0, 150) + '...' || '',
        icon: prompt.icon || 'fas fa-robot',
        color: prompt.color || 'blue'
      }));

    } catch (error) {
      console.error('OpenRouter generation error:', error);
      throw new Error(`Failed to generate prompts: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateSinglePrompt(userInput: string, platform: string): Promise<GeneratedPrompt> {
    if (!this.apiKey) {
      throw new Error('OpenRouter API key not configured');
    }

    const platformConfigs = {
      'ChatGPT': {
        instructions: 'Create a conversational prompt with clear role definition and step-by-step instructions',
        icon: 'fab fa-openai',
        color: 'green'
      },
      'Midjourney': {
        instructions: 'Create a visual prompt with artistic style, composition, lighting, and technical parameters like --ar 16:9 --v 6',
        icon: 'fas fa-palette', 
        color: 'purple'
      },
      'Claude': {
        instructions: 'Create an analytical prompt with structured reasoning and clear methodology',
        icon: 'fas fa-robot',
        color: 'orange'
      },
      'Gemini': {
        instructions: 'Create a research-focused prompt with comprehensive analysis requirements',
        icon: 'fas fa-gem',
        color: 'cyan'
      }
    };

    const config = platformConfigs[platform as keyof typeof platformConfigs] || platformConfigs['ChatGPT'];

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.REPLIT_DOMAINS?.split(',')[0] || 'http://localhost:5000',
          'X-Title': 'PromptNest'
        },
        body: JSON.stringify({
          model: 'anthropic/claude-3.5-sonnet',
          messages: [
            {
              role: 'system',
              content: `You are an expert prompt engineer for ${platform}. ${config.instructions}. 
              
              Return a JSON object with this exact structure:
              {
                "platform": "${platform}",
                "type": "categorize the prompt type",
                "content": "the full detailed prompt",
                "preview": "first 150 characters of the prompt...",
                "icon": "${config.icon}",
                "color": "${config.color}"
              }`
            },
            {
              role: 'user',
              content: `Create an optimized ${platform} prompt for: ${userInput}`
            }
          ],
          response_format: { type: "json_object" },
          max_tokens: 1000,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status}`);
      }

      const data: OpenRouterResponse = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('No content received from OpenRouter API');
      }

      const parsedContent = JSON.parse(content);
      
      return {
        platform: parsedContent.platform || platform,
        type: parsedContent.type || 'General',
        content: parsedContent.content || '',
        preview: parsedContent.preview || parsedContent.content?.substring(0, 150) + '...' || '',
        icon: config.icon,
        color: config.color
      };

    } catch (error) {
      console.error('OpenRouter single prompt generation error:', error);
      throw new Error(`Failed to generate ${platform} prompt: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const openRouterService = new OpenRouterService();
