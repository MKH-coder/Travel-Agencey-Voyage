#!/usr/bin/env node

/**
 * verify_env.js
 * Validates that all keys listed in .env.example are present in .env
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const envExamplePath = path.join(rootDir, '.env.example');
const envPath = path.join(rootDir, '.env');

function parseEnvKeys(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const content = fs.readFileSync(filePath, 'utf-8');
  return content
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#') && line.includes('='))
    .map(line => line.split('=')[0].trim());
}

console.log('🔍 Checking environment configuration...');

if (!fs.existsSync(envExamplePath)) {
  console.log('⚠️  No .env.example found. Skipping check.');
  process.exit(0);
}

const exampleKeys = parseEnvKeys(envExamplePath);

if (!fs.existsSync(envPath)) {
  console.log('⚠️  Notice: Local .env file does not exist yet.');
  console.log('👉 Create a .env file from .env.example before launching external integrations:');
  console.log(`   cp .env.example .env\n`);
  process.exit(0);
}

const activeKeys = new Set(parseEnvKeys(envPath));
const missingKeys = exampleKeys.filter(key => !activeKeys.has(key));

if (missingKeys.length > 0) {
  console.warn(`⚠️  Missing ${missingKeys.length} keys in .env:`);
  missingKeys.forEach(k => console.warn(`   - ${k}`));
  process.exit(1);
} else {
  console.log(`✅ All ${exampleKeys.length} required environment keys found in .env.`);
  process.exit(0);
}
