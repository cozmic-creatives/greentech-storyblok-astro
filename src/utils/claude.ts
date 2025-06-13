import Anthropic from '@anthropic-ai/sdk';

interface ClaudeConfig {
  model?: string;
  maxTokens?: number;
}

class ClaudeClient {
  private anthropic: Anthropic;
  private model: string;
  private maxTokens: number;

  constructor(apiKey: string, config: ClaudeConfig = {}) {
    this.anthropic = new Anthropic({ apiKey });
    this.model = config.model || 'claude-3-7-sonnet-20250219';
    this.maxTokens = config.maxTokens || 4000;
  }

  async generateText(prompt: string, systemPrompt?: string): Promise<string> {
    const response = await this.anthropic.messages.create({
      model: this.model,
      max_tokens: this.maxTokens,
      system: systemPrompt,
      messages: [{ role: 'user', content: prompt }],
    });

    return response.content[0].type === 'text' ? response.content[0].text : '';
  }
}

export function createClaudeClient(config: ClaudeConfig = {}): ClaudeClient {
  const apiKey = process.env.CLAUDE_API_KEY;
  if (!apiKey) throw new Error('CLAUDE_API_KEY environment variable is required');

  return new ClaudeClient(apiKey, config);
}
