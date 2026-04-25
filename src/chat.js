import chalk from 'chalk';
import { createInterface } from 'readline';
import { loadConfig, getActiveProvider, getProviderConfig } from './config-manager.js';
import { GroqProvider } from './providers/groq.js';

let chatHistory = [];
let currentProvider = null;

function getProviderInstance(providerName) {
  const providerConfig = getProviderConfig(providerName);
  if (!providerConfig || !providerConfig.apiKey) {
    return null;
  }

  switch (providerName) {
    case 'groq':
      return new GroqProvider(providerConfig.apiKey, providerConfig.model);
    default:
      return null;
  }
}

function printStreamingResponse(text) {
  process.stdout.write(chalk.green(text));
}

export async function startChat(onBack) {
  const config = loadConfig();
  const activeProvider = getActiveProvider();
  const providerConfig = getProviderConfig(activeProvider);
  
  if (!providerConfig.apiKey) {
    console.log(`\nBelum set API key untuk provider: ${activeProvider}`);
    console.log('Silakan kembali ke menu Pengaturan > Set API Key dulu.\n');
    onBack();
    return;
  }

  currentProvider = getProviderInstance(activeProvider);
  if (!currentProvider) {
    console.log(`\nProvider ${activeProvider} belum siap (API key tidak valid)\n`);
    onBack();
    return;
  }

  console.log(`\nMode Ngobrol dengan ${activeProvider} (${providerConfig.model})`);
  console.log(`System prompt: ${config.systemPrompt || '(kosong)'}`);
  console.log('Ketik /back untuk kembali ke menu, /new untuk reset chat\n');

  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '> '
  });

  rl.prompt();

  rl.on('line', async (input) => {
    const trimmed = input.trim();
    
    if (trimmed === '/back') {
      rl.close();
      onBack();
      return;
    }
    
    if (trimmed === '/new') {
      chatHistory = [];
      console.log('Chat history telah direset\n');
      rl.prompt();
      return;
    }
    
    if (trimmed === '/status') {
      console.log(`\nProvider: ${activeProvider}`);
      console.log(`Model: ${providerConfig.model}`);
      console.log(`System prompt: ${config.systemPrompt || '(kosong)'}`);
      console.log(`History length: ${chatHistory.length} pesan\n`);
      rl.prompt();
      return;
    }
    
    if (trimmed) {
      chatHistory.push({ role: 'user', content: trimmed });
      
      process.stdout.write('\nAI: ');
      
      try {
        const response = await currentProvider.chat(
          chatHistory,
          printStreamingResponse,
          config.systemPrompt
        );
        
        console.log('\n');
        chatHistory.push({ role: 'assistant', content: response });
      } catch (error) {
        console.log(`\nError: ${error.message}\n`);
      }
      
      rl.prompt();
    } else {
      rl.prompt();
    }
  });

  rl.on('close', () => {
    console.log('\nKembali ke menu utama...\n');
  });
}

export function resetChat() {
  chatHistory = [];
}