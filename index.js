#!/usr/bin/env node

import { runMenu } from './src/menu.js';

console.clear();
console.log('Memulai ContAI...\n');

runMenu().catch(console.error);