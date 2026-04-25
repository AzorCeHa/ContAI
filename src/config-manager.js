import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const configPath = path.join(__dirname, '..', 'config.json');

export function loadConfig() {
  if (!fs.existsSync(configPath)) {
    const defaultConfig = {
      defaultProvider: 'groq',
      providers: {
        groq: { apiKey: '', model: 'llama3-8b-8192' },
        openai: { apiKey: '', model: 'gpt-3.5-turbo' },
        gemini: { apiKey: '', model: 'gemini-pro' }
      },
      systemPrompt: ''
    };
    fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
    return defaultConfig;
  }
  return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
}

export function saveConfig(config) {
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

export function getProviderConfig(providerName) {
  const config = loadConfig();
  return config.providers[providerName];
}

export function setApiKey(provider, apiKey) {
  const config = loadConfig();
  if (config.providers[provider]) {
    config.providers[provider].apiKey = apiKey;
    saveConfig(config);
    return true;
  }
  return false;
}

export function setModel(provider, model) {
  const config = loadConfig();
  if (config.providers[provider]) {
    config.providers[provider].model = model;
    saveConfig(config);
    return true;
  }
  return false;
}

export function setSystemPrompt(prompt) {
  const config = loadConfig();
  config.systemPrompt = prompt;
  saveConfig(config);
}

export function getActiveProvider() {
  const config = loadConfig();
  return config.defaultProvider;
}

export function setActiveProvider(provider) {
  const config = loadConfig();
  if (config.providers[provider]) {
    config.defaultProvider = provider;
    saveConfig(config);
    return true;
  }
  return false;
}