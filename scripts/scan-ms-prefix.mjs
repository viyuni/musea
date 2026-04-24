import { readdir, readFile } from 'node:fs/promises';
import { extname, join, relative } from 'node:path';

const PREFIX = 'ms:';
const ROOTS = process.argv.slice(2);
const SCAN_ROOTS = ROOTS.length > 0 ? ROOTS : ['src/client'];
const EXTENSIONS = new Set(['.vue', '.css', '.ts', '.tsx', '.js', '.jsx']);

const CLASS_ATTRS = [
  'class',
  'enter-active-class',
  'enter-from-class',
  'enter-to-class',
  'leave-active-class',
  'leave-from-class',
  'leave-to-class',
];

const CLASS_HINTS = [
  'absolute',
  'alert',
  'animate-',
  'antialiased',
  'backdrop:',
  'badge',
  'bg-',
  'block',
  'border',
  'bottom-',
  'btn',
  'card',
  'checkbox',
  'cursor-',
  'divider',
  'drawer',
  'duration-',
  'ease-',
  'flex',
  'focus:',
  'font-',
  'gap-',
  'grid',
  'group',
  'h-',
  'hidden',
  'hover:',
  'input',
  'items-',
  'justify-',
  'kbd',
  'leading-',
  'left-',
  'lg:',
  'link',
  'm-',
  'max-',
  'menu',
  'min-',
  'modal',
  'object-',
  'opacity-',
  'order-',
  'outline-',
  'overflow-',
  'p-',
  'placeholder:',
  'pointer-',
  'prose',
  'relative',
  'resize-',
  'right-',
  'rounded',
  'select',
  'shadow',
  'shrink-',
  'size-',
  'sm:',
  'space-',
  'stats',
  'sticky',
  'table',
  'text-',
  'top-',
  'tracking-',
  'transition',
  'truncate',
  'uppercase',
  'w-',
  'whitespace-',
  'xl:',
  'z-',
];

const attrPattern = new RegExp(`(?<![:@])\\b(?:${CLASS_ATTRS.join('|')})="([^"]+)"`, 'g');
const applyPattern = /@apply\s+([^;]+);/g;
const quotedPattern = /(['"`])([^'"`\n]*?(?:[-:/[\].][^'"`\n]*?))\1/g;

const findings = [];

for (const root of SCAN_ROOTS) {
  await scan(root);
}

for (const finding of findings) {
  console.log(`${finding.file}:${finding.line}:${finding.column} ${finding.kind} ${finding.value}`);
}

console.log(`\n${findings.length} candidate(s) found.`);

async function scan(path) {
  const entries = await readdir(path, { withFileTypes: true });

  for (const entry of entries) {
    const next = join(path, entry.name);

    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === 'dist') {
        continue;
      }

      await scan(next);
      continue;
    }

    if (entry.isFile() && EXTENSIONS.has(extname(entry.name))) {
      await scanFile(next);
    }
  }
}

async function scanFile(path) {
  const text = await readFile(path, 'utf8');
  const file = relative(process.cwd(), path).replaceAll('\\', '/');

  findMatches(text, attrPattern, file, 'attr');
  findMatches(text, applyPattern, file, 'apply');
  findMatches(text, quotedPattern, file, 'literal');
}

function findMatches(text, pattern, file, kind) {
  pattern.lastIndex = 0;

  for (const match of text.matchAll(pattern)) {
    if (kind === 'literal' && isAttributeValue(text, match.index ?? 0)) {
      continue;
    }

    const value = match[kind === 'literal' ? 2 : 1];

    if (!hasUnprefixedClass(value)) {
      continue;
    }

    const { line, column } = getLocation(text, match.index ?? 0);
    findings.push({ file, line, column, kind, value: value.trim() });
  }
}

function isAttributeValue(text, index) {
  const lineStart = text.lastIndexOf('\n', index) + 1;
  const before = text.slice(lineStart, index);

  return new RegExp(`(?:${CLASS_ATTRS.join('|')}|:class)\\s*=\\s*$`).test(before);
}

function hasUnprefixedClass(value) {
  return value
    .trim()
    .split(/\s+/)
    .some((token) => token && !token.startsWith(PREFIX) && looksLikeClass(token));
}

function looksLikeClass(token) {
  if (token.includes('://') || token.includes('${') || token.includes('{{')) {
    return false;
  }

  return CLASS_HINTS.some(
    (hint) => token === hint || token.startsWith(hint) || token.includes(`:${hint}`),
  );
}

function getLocation(text, index) {
  const before = text.slice(0, index);
  const lines = before.split('\n');

  return {
    line: lines.length,
    column: lines.at(-1).length + 1,
  };
}
