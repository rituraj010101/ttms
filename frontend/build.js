const fs = require('node:fs');
const path = require('node:path');

const sourceDir = __dirname;
const outputDir = path.join(sourceDir, 'dist');
const apiBase = process.env.TTMS_API_BASE || 'http://localhost:4000/api';

fs.rmSync(outputDir, { recursive: true, force: true });
fs.mkdirSync(outputDir, { recursive: true });

for (const entry of fs.readdirSync(sourceDir, { withFileTypes: true })) {
  if (['dist', 'node_modules', 'Dockerfile', 'build.js', 'package.json', '.DS_Store'].includes(entry.name)) continue;
  fs.cpSync(path.join(sourceDir, entry.name), path.join(outputDir, entry.name), { recursive: true });
}

const configPath = path.join(outputDir, 'js', 'config.runtime.js');
fs.writeFileSync(configPath, `window.TTMS_API_BASE = ${JSON.stringify(apiBase)};\n`);
console.log(`Built TTMS frontend with API base ${apiBase}`);
