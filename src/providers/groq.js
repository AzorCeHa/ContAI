import Groq from '@groq/groq-sdk';
import { BaseProvider } from './base.js';

export class GroqProvider extends BaseProvider {
  constructor(apiKey, model) {
    super(apiKey, model);
    this.client = new Groq({ apiKey });
  }

  async chat(messages, onChunk, systemPrompt) {
    const fullMessages = [];
    
    if (systemPrompt) {
      fullMessages.push({ role: 'system', content: systemPrompt });
    }
    
    fullMessages.push(...messages);

    try {
      const stream = await this.client.chat.completions.create({
        model: this.model,
        messages: fullMessages,
        stream: true,
      });

      let fullResponse = '';
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          fullResponse += content;
          if (onChunk) onChunk(content);
        }
      }
      return fullResponse;
    } catch (error) {
      throw new Error(`Groq API Error: ${error.message}`);
    }
  }
}