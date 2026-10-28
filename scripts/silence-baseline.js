/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Script de neutralisation du warning non-bloquant baseline-browser-mapping
 * inliné dans le bundle pré-compilé de Next.js (next/dist/compiled/browserslist).
 * S'exécute automatiquement après chaque pnpm install via le hook postinstall.
 */
const fs = require('fs');
const path = require('path');

function silenceWarningInPath(targetPath) {
  if (!fs.existsSync(targetPath)) return;
  try {
    let content = fs.readFileSync(targetPath, 'utf8');
    const target = '1764339020978<(new Date).setMonth((new Date).getMonth()-2)&&console.warn';
    if (content.includes(target)) {
      content = content.replace(target, 'false&&console.warn');
      fs.writeFileSync(targetPath, content, 'utf8');
    }
  } catch {
    // Ne jamais bloquer le postinstall en cas de lecture seule
  }
}

function findAndPatch(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'compiled') {
        const browserslistIndex = path.join(fullPath, 'browserslist', 'index.js');
        silenceWarningInPath(browserslistIndex);
      } else if (entry.name !== '.git' && entry.name !== '.next') {
        findAndPatch(fullPath);
      }
    }
  }
}

const nextCompiled = path.join(__dirname, '..', 'node_modules', 'next', 'dist', 'compiled', 'browserslist', 'index.js');
silenceWarningInPath(nextCompiled);
findAndPatch(path.join(__dirname, '..', 'node_modules', '.pnpm'));
