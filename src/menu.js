import chalk from 'chalk';
import readline from 'readline';
import { 
  loadConfig, 
  setApiKey, 
  setActiveProvider, 
  getActiveProvider,
  getProviderConfig,
  setSystemPrompt,
  saveConfig
} from './config-manager.js';
import { startChat, resetChat } from './chat.js';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(query) {
  return new Promise(resolve => rl.question(chalk.white(query), resolve));
}

async function showMainMenu() {
  console.clear();
  console.log(chalk.bold('================================='));
  console.log(chalk.bold('           ContAI v1.0'));
  console.log(chalk.bold('================================='));
  console.log('1. Mulai Ngobrol dengan AI');
  console.log('2. Pengaturan');
  console.log('3. Lihat Status');
  console.log('4. Bantuan');
  console.log('5. Keluar');
  console.log('=================================');
}

async function showSettingsMenu() {
  console.clear();
  console.log(chalk.bold('========== PENGATURAN =========='));
  console.log('1. Ganti Provider AI');
  console.log('2. Ganti Model');
  console.log('3. Set API Key');
  console.log('4. Set System Prompt');
  console.log('5. Kembali');
  console.log('=================================');
}

async function showProviderMenu() {
  console.clear();
  console.log(chalk.bold('========== DAFTAR PROVIDER =========='));
  console.log('1. Groq');
  console.log('2. OpenAI');
  console.log('3. Google Gemini');
  console.log('4. Kembali');
  console.log('======================================');
}

async function showGroqModelMenu() {
  console.clear();
  console.log(chalk.bold('========== MODEL GROQ =========='));
  console.log('1. llama3-8b-8192');
  console.log('2. llama3-70b-8192');
  console.log('3. mixtral-8x7b-32768');
  console.log('4. Kembali');
  console.log('=================================');
}

export async function runMenu() {
  let running = true;
  
  while (running) {
    await showMainMenu();
    const choice = await askQuestion('Pilih (1-5): ');
    
    switch (choice) {
      case '1':
        resetChat();
        await startChat(() => runMenu());
        break;
      case '2':
        await handleSettings();
        break;
      case '3':
        await showStatus();
        break;
      case '4':
        await showHelp();
        break;
      case '5':
        console.log('\nTerima kasih telah menggunakan ContAI!\n');
        running = false;
        rl.close();
        process.exit(0);
        break;
      default:
        console.log('\nPilihan tidak valid!\n');
        await askQuestion('Tekan enter untuk melanjutkan...');
    }
  }
}

async function handleSettings() {
  let back = false;
  
  while (!back) {
    await showSettingsMenu();
    const choice = await askQuestion('Pilih (1-5): ');
    
    switch (choice) {
      case '1':
        await handleChangeProvider();
        break;
      case '2':
        await handleChangeModel();
        break;
      case '3':
        await handleSetApiKey();
        break;
      case '4':
        await handleSetSystemPrompt();
        break;
      case '5':
        back = true;
        break;
      default:
        console.log('\nPilihan tidak valid!\n');
        await askQuestion('Tekan enter untuk melanjutkan...');
    }
  }
}

async function handleChangeProvider() {
  await showProviderMenu();
  const choice = await askQuestion('Pilih provider (1-4): ');
  
  let provider = null;
  switch (choice) {
    case '1': provider = 'groq'; break;
    case '2': provider = 'openai'; break;
    case '3': provider = 'gemini'; break;
    case '4': return;
    default:
      console.log('\nProvider tidak dikenal!\n');
      await askQuestion('Tekan enter melanjutkan...');
      return;
  }
  
  setActiveProvider(provider);
  console.log(`\nProvider diubah ke ${provider}`);
  await askQuestion('\nTekan enter untuk melanjutkan...');
}

async function handleChangeModel() {
  const activeProvider = getActiveProvider();
  
  if (activeProvider === 'groq') {
    await showGroqModelMenu();
    const choice = await askQuestion('Pilih model (1-4): ');
    
    let model = null;
    switch (choice) {
      case '1': model = 'llama3-8b-8192'; break;
      case '2': model = 'llama3-70b-8192'; break;
      case '3': model = 'mixtral-8x7b-32768'; break;
      case '4': return;
      default:
        console.log('\nModel tidak dikenal!\n');
        await askQuestion('Tekan enter melanjutkan...');
        return;
    }
    
    const config = loadConfig();
    config.providers.groq.model = model;
    saveConfig(config);
    console.log(`\nModel diubah ke ${model}`);
  } else {
    console.log(`\nGanti model untuk provider ${activeProvider} belum diimplementasikan`);
  }
  
  await askQuestion('\nTekan enter untuk melanjutkan...');
}

async function handleSetApiKey() {
  console.clear();
  console.log('========== SET API KEY ==========');
  console.log('1. Groq');
  console.log('2. OpenAI');
  console.log('3. Google Gemini');
  console.log('4. Kembali');
  
  const choice = await askQuestion('Pilih provider (1-4): ');
  
  let provider = null;
  switch (choice) {
    case '1': provider = 'groq'; break;
    case '2': provider = 'openai'; break;
    case '3': provider = 'gemini'; break;
    case '4': return;
    default:
      console.log('\nProvider tidak dikenal!\n');
      await askQuestion('Tekan enter melanjutkan...');
      return;
  }
  
  const apiKey = await askQuestion(`Masukkan API Key untuk ${provider}: `);
  
  if (apiKey.trim()) {
    setApiKey(provider, apiKey.trim());
    console.log(`\nAPI Key untuk ${provider} berhasil disimpan!`);
  } else {
    console.log('\nAPI Key tidak boleh kosong!');
  }
  
  await askQuestion('\nTekan enter untuk melanjutkan...');
}

async function handleSetSystemPrompt() {
  console.clear();
  console.log('========== SET SYSTEM PROMPT ==========');
  console.log('System prompt akan mengarahkan perilaku AI');
  console.log('Contoh: "Kamu adalah asisten yang ramah"');
  console.log('Ketik kosong untuk menghapus\n');
  
  const prompt = await askQuestion('System prompt: ');
  setSystemPrompt(prompt);
  
  if (prompt) {
    console.log('\nSystem prompt berhasil diset!');
  } else {
    console.log('\nSystem prompt dihapus!');
  }
  
  await askQuestion('\nTekan enter untuk melanjutkan...');
}

async function showStatus() {
  console.clear();
  const config = loadConfig();
  const activeProvider = getActiveProvider();
  const providerConfig = getProviderConfig(activeProvider);
  
  console.log('========== STATUS SISTEM ==========');
  console.log(`Provider aktif: ${activeProvider}`);
  console.log(`Model: ${providerConfig?.model || '-'}`);
  console.log(`API Key: ${providerConfig?.apiKey ? 'sudah diset' : 'belum diset'}`);
  console.log(`System prompt: ${config.systemPrompt || '(kosong)'}`);
  console.log('====================================');
  
  await askQuestion('\nTekan enter untuk kembali...');
}

async function showHelp() {
  console.clear();
  console.log('========== BANTUAN CONTAI ==========');
  console.log('Menu Utama:');
  console.log('   - Pilih nomor 1-5 untuk navigasi');
  console.log('');
  console.log('Mode Ngobrol:');
  console.log('   - Langsung ketik pesan untuk bertanya ke AI');
  console.log('   - Ketik /back untuk kembali ke menu utama');
  console.log('   - Ketik /new untuk reset percakapan');
  console.log('   - Ketik /status untuk lihat info saat ini');
  console.log('');
  console.log('Pengaturan:');
  console.log('   - Ganti provider: pilih AI yang ingin dipakai');
  console.log('   - Set API Key: simpan 1 kali, tersimpan di config.json');
  console.log('   - Set System Prompt: atur karakter AI');
  console.log('');
  console.log('Tips:');
  console.log('   - API key cukup diset sekali, akan tersimpan permanen');
  console.log('   - Streaming response membuat AI mengetik seolah-olah sedang berpikir');
  console.log('======================================');
  
  await askQuestion('\nTekan enter untuk kembali...');
}