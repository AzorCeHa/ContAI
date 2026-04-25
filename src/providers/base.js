export class BaseProvider {
  constructor(apiKey, model) {
    this.apiKey = apiKey;
    this.model = model;
  }

  async chat(messages, onChunk, systemPrompt) {
    throw new Error('Method chat harus diimplementasikan oleh provider');
  }
}