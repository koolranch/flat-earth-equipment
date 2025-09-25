/*
 * READ-ONLY diagnostics for tabbed/flashcard UI regression
 * Run:  npx ts-node scripts/diagnostics/tabbed-regression-audit.ts
 * Or add script in package.json: "diag:tabbed": "ts-node scripts/diagnostics/tabbed-regression-audit.ts"
 */
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const PROJECT = process.cwd();
const outDir = path.join(PROJECT, 'reports');
const ts = new Date().toISOString().replace(/[:.]/g, '-');
const outFile = path.join(outDir, `tabbed-regression-${ts}.md`);

function ensureDir(p: string) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function exists(p: string) {
  return fs.existsSync(p);
}

function read(p: string) {
  try { return fs.readFileSync(p, 'utf8'); } catch { return ''; }
}

function grepFiles(globs: string[], patterns: RegExp[]) {
  const results: { file: string; hits: { line: number; text: string }[] }[] = [];
  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (['node_modules', '.next', 'reports', '.git'].includes(entry.name)) continue;
        walk(full);
      } else if (globs.some(g => full.includes(g))) {
        const src = read(full);
        if (!src) continue;
        const lines = src.split(/\r?\n/);
        let hits: { line: number; text: string }[] = [];
        lines.forEach((line, i) => {
          if (patterns.some(rx => rx.test(line))) hits.push({ line: i + 1, text: line.trim() });
        });
        if (hits.length) results.push({ file: full, hits });
      }
    }
  };
  walk(PROJECT);
  return results;
}

function gitLog(paths: string[]) {
  try {
    const cmd = `git log -n 15 --date=iso -- ${paths.map(p => `'${p}'`).join(' ')}`;
    return execSync(cmd, { stdio: ['ignore', 'pipe', 'pipe'] }).toString();
  } catch { return ''; }
}

// Candidate files to inspect
const candidates = [
  'components/training/module/TabbedModuleLayout.tsx',
  'components/training/unified/TabbedModuleLayout.tsx',
  'components/training/FlashCardDeck',
  'components/training/unified/UnifiedQuizFlow.tsx',
  'components/training/unified/OSHACallout.tsx',
  'components/training/unified/ModuleProgressTracker.tsx',
  'lib/training/flashcards.ts',
  'lib/training/getModuleByOrder.ts',
  'app/training/module/[order]/page.tsx',
  'app/training/page.tsx'
];

// Read primary files
const files = candidates.map(p => ({ path: p, content: read(path.join(PROJECT, p)) }));

// Heuristics: detect early returns / placeholders and slug usage
const earlyReturnPatterns = [
  /return\s+null[;)]?/,
  /props\.render\s*\?\s*props\.render\([^)]*\)\s*:\s*null/,
  /if\s*\(\s*!\s*\w+Slug\s*\)\s*return/,
  /TODO:\s*plug into your existing/i,
  /\beffectiveSlug\b/,
  /moduleSlugForCards\s*\(/,
  /getModuleFlashcards\s*\(/,
  /markDone\(\"cards\"\)/
];

const grep = grepFiles(['components', 'app', 'lib'], earlyReturnPatterns);

// Quick import resolution: which TabbedModuleLayout is used by the page
const page = files.find(f => f.path.endsWith('app/training/module/[order]/page.tsx'))?.content || '';
const tabbedImportLine = page.split(/\r?\n/).find(l => /TabbedModuleLayout/.test(l) && /from\s+['"]/.test(l)) || '';

// Summaries
function summarizeTabbed(content: string) {
  if (!content) return 'MISSING';
  const lines = content.split(/\r?\n/);
  const header = lines.slice(0, 40).join('\n');
  const hasEffective = /effectiveSlug/.test(content);
  const hasFlash = /getModuleFlashcards|FlashCardDeck/.test(content);
  const hasEarlyNull = /return\s+null[;)]?/.test(content);
  return `Top(40):\n${header}\n\nFlags: effectiveSlug=${hasEffective} flashDeps=${hasFlash} earlyNull=${hasEarlyNull}`;
}

const tabbedCandidates = files.filter(f => f.path.includes('TabbedModuleLayout.tsx'));

// Build report
ensureDir(outDir);
let md = `# Tabbed/Flashcard Regression Report\n\nGenerated: ${new Date().toISOString()}\n\n`;
md += `## Which TabbedModuleLayout is imported by page.tsx?\n\n\`${tabbedImportLine}\`\n\n`;

md += `## File Snapshots (top excerpts)\n`;
for (const f of tabbedCandidates) {
  md += `\n### ${f.path}\n\n${summarizeTabbed(f.content)}\n\n`;
}

md += `\n## UnifiedQuizFlow flags\n`;
const uqf = files.find(f => f.path.endsWith('UnifiedQuizFlow.tsx'));
if (uqf) {
  const lns = uqf.content.split(/\r?\n/);
  const top = lns.slice(0, 60).join('\n');
  const hasRenderNull = /props\.render\s*\?\s*props\.render\([^)]*\)\s*:\s*null/.test(uqf.content);
  md += `\nTop(60):\n${top}\n\nFlags: renderNull=${hasRenderNull}\n`;
} else {
  md += `\nUnifiedQuizFlow.tsx: MISSING\n`;
}

md += `\n## Grep for risky patterns (early returns, placeholders, slug lookups)\n`;
for (const g of grep) {
  md += `\n**${g.file}**\n`;
  g.hits.forEach(h => { md += `- L${h.line}: ${h.text}\n`; });
}

// Git history for the key files
const gitTargets = [
  'components/training/module/TabbedModuleLayout.tsx',
  'components/training/unified/TabbedModuleLayout.tsx',
  'app/training/module/[order]/page.tsx',
  'components/training/unified/UnifiedQuizFlow.tsx'
].filter(p => exists(path.join(PROJECT, p)));

md += `\n## Recent Git history (last 15 commits for key files)\n`;
if (gitTargets.length) {
  md += `\n\`\n${gitLog(gitTargets)}\n\`\n`;
} else {
  md += `\n(No git targets found)\n`;
}

fs.writeFileSync(outFile, md, 'utf8');
console.log(`\n✅ Diagnostics report written to: ${outFile}\n`);
