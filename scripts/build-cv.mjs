#!/usr/bin/env node
/**
 * Builds the CV artefacts from the two Markdown files, which are the only
 * hand-edited source.
 *
 *   frontend/public/docs/CV_Andreas_Klaeboe_EN.md ─┐
 *                                                  ├─> frontend/public/content/cv.json
 *   frontend/public/docs/CV_Andreas_Klaeboe_NO.md ─┘   (consumed by SoftwarePage)
 *                                                  └─> CV_Andreas_Klaeboe_{EN,NO}.pdf
 *
 * Usage:
 *   node scripts/build-cv.mjs              JSON + PDFs (PDFs need `npx playwright install chromium`)
 *   node scripts/build-cv.mjs --json-only  JSON only, no dependencies (safe in CI)
 *
 * The Markdown carries no machine-readable structure, so the parser below
 * depends on the shape of the files: `## Section`, `### Title, Org`, a
 * `*dates*` line, then bullets or a paragraph. Anything that does not match
 * throws, naming the file and the entry — a silent reflow is the one failure
 * mode that would ship wrong content.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const DOCS = new URL('../frontend/public/docs/', import.meta.url);
const CV_JSON = new URL('../frontend/public/content/cv.json', import.meta.url);

const MONTHS = {
  jan: 1, januar: 1, january: 1,
  feb: 2, februar: 2, february: 2,
  mar: 3, mars: 3, march: 3,
  apr: 4, april: 4,
  mai: 5, may: 5,
  jun: 6, juni: 6, june: 6,
  jul: 7, juli: 7, july: 7,
  aug: 8, august: 8,
  sep: 9, sept: 9, september: 9,
  okt: 10, oct: 10, oktober: 10, october: 10,
  nov: 11, november: 11,
  des: 12, dec: 12, desember: 12, december: 12,
};

// Canonical section names, so the two languages can be zipped by position.
const SECTION_ALIASES = {
  summary: 'summary', sammendrag: 'summary',
  contact: 'contact', kontakt: 'contact',
  'about me': 'about', 'om meg': 'about',
  education: 'education', utdanning: 'education',
  experience: 'experience', erfaring: 'experience',
  languages: 'languages', språk: 'languages',
  skills: 'skills', ferdigheter: 'skills',
};

const SOURCES = [
  { lang: 'en', file: 'CV_Andreas_Klaeboe_EN.md', present: ['present'] },
  { lang: 'no', file: 'CV_Andreas_Klaeboe_NO.md', present: ['nå', 'na', 'present'] },
];

const fail = (file, message) => {
  throw new Error(`${file}: ${message}`);
};

/** Split "Aug 2025" / "nå" into the "YYYY-MM" | "present" the site expects. */
function parseDateToken(raw, file, presentWords) {
  const token = raw.trim().replace(/\.$/, '').toLowerCase();
  if (presentWords.includes(token)) return 'present';

  const monthYear = token.match(/^([a-zæøå]+)\s+(\d{4})$/);
  if (monthYear) {
    const month = MONTHS[monthYear[1]];
    if (!month) fail(file, `unknown month "${monthYear[1]}" in date "${raw.trim()}"`);
    return `${monthYear[2]}-${String(month).padStart(2, '0')}`;
  }

  if (/^\d{4}$/.test(token)) return token;
  return fail(file, `cannot read date "${raw.trim()}" — expected "Mon YYYY – Mon YYYY" or "Mon YYYY – present"`);
}

function parseDateRange(raw, file, presentWords) {
  const parts = raw.trim().split(/\s+[–—]\s+|\s+-\s+/);
  if (parts.length !== 2) {
    return fail(file, `cannot read date range "${raw.trim()}" — expected "Mon YYYY – Mon YYYY"`);
  }
  return {
    start: parseDateToken(parts[0], file, presentWords),
    end: parseDateToken(parts[1], file, presentWords),
  };
}

/** "Software Engineer — Zypp" / "MSc in Informatics: …, University of Oslo" */
function splitEntryHeading(heading) {
  if (heading.includes(' — ')) {
    const [left, right] = heading.split(' — ');
    return { left: left.trim(), right: right.trim() };
  }
  const comma = heading.lastIndexOf(', ');
  if (comma === -1) return { left: heading.trim(), right: '' };
  return { left: heading.slice(0, comma).trim(), right: heading.slice(comma + 2).trim() };
}

function parseDocument(file, raw, presentWords) {
  const lines = raw.replace(/\r\n/g, '\n').split('\n');
  const nameLine = lines.find((line) => /^#\s+/.test(line));
  if (!nameLine) fail(file, 'no "# Name" title line');
  const name = nameLine.replace(/^#\s+/, '').trim();

  const titleIndex = lines.indexOf(nameLine);
  const role = lines.slice(titleIndex + 1).find((line) => line.trim() && !line.startsWith('#'))?.trim();
  if (!role) fail(file, 'no role line under the name');

  const sections = new Map();
  let current = null;
  const body = [];
  for (const line of lines.slice(titleIndex + 1)) {
    const heading = line.match(/^##\s+(.+?)\s*$/);
    if (heading) {
      if (current) sections.set(current, body.splice(0).join('\n'));
      const canonical = SECTION_ALIASES[heading[1].trim().toLowerCase()];
      if (!canonical) fail(file, `unrecognised section heading "## ${heading[1]}"`);
      if (sections.has(canonical)) fail(file, `duplicate section "## ${heading[1]}"`);
      current = canonical;
      continue;
    }
    if (!current || /^-{3,}$/.test(line.trim())) continue;
    body.push(line);
  }
  if (current) sections.set(current, body.join('\n'));

  for (const required of ['summary', 'contact', 'education', 'experience']) {
    if (!sections.has(required)) fail(file, `missing the "${required}" section`);
  }

  return { name, role, sections };
}

/** Entries inside Education / Experience: `### Heading`, `*dates*`, bullets. */
function parseEntries(raw, file, presentWords) {
  return raw
    .split(/^###\s+/m)
    .slice(1)
    .map((chunk) => {
      const lines = chunk.split('\n');
      const { left, right } = splitEntryHeading(lines[0].trim());
      const entryLines = lines.slice(1);

      const dateIndex = entryLines.findIndex((line) => /^\*[^*].*\*$/.test(line.trim()));
      if (dateIndex === -1) fail(file, `entry "${left}" has no *dates* line`);
      const { start, end } = parseDateRange(entryLines[dateIndex].replace(/\*/g, ''), file, presentWords);

      const rest = entryLines.slice(dateIndex + 1);
      const bullets = rest
        .filter((line) => /^\s*-\s+/.test(line))
        .map((line) => line.replace(/^\s*-\s+/, '').trim())
        .filter(Boolean);
      const paragraphs = rest
        .filter((line) => line.trim() && !/^\s*-\s+/.test(line) && !/^---+$/.test(line.trim()))
        .map((line) => line.trim())
        .join(' ');

      return { left, right, start, end, bullets, paragraphs };
    });
}

function parseContact(raw) {
  const emails = [...raw.matchAll(/[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g)].map((m) => m[0]);
  // Link targets first, then bare URLs; a link's text is not a second URL.
  const targets = [...raw.matchAll(/\]\((https?:\/\/[^\s)]+)\)/g)].map((m) => m[1]);
  const bare = [...raw.matchAll(/(?:^|[\s(<])(https?:\/\/[^\s)]+)/gm)].map((m) => m[1]);
  const urls = [...new Set([...targets, ...bare])];
  const phone = raw.match(/\+\d[\d\s]{6,}\d/)?.[0]?.trim();
  return {
    emails,
    phone,
    github: urls.find((url) => url.includes('github.com')),
    linkedin: urls.find((url) => url.includes('linkedin.com')),
    site: urls.find((url) => url.includes('andreasklaeboe.com')),
  };
}

function parseBulletKeyValues(raw) {
  return raw
    .split('\n')
    .filter((line) => /^\s*-\s+/.test(line))
    .map((line) => {
      const text = line.replace(/^\s*-\s+/, '').trim();
      // Both `- **Key:** value` (English) and `- Key: value` (Norwegian).
      const bold = text.match(/^\*\*(.+?)\*\*\s*(.+)$/);
      if (bold) return [bold[1].replace(/:$/, '').trim(), bold[2].trim()];
      const plain = text.match(/^(.+?):\s*(.+)$/);
      return plain ? [plain[1].trim(), plain[2].trim()] : null;
    })
    .filter(Boolean);
}

/** Drops trailing ")" left over from stripping an outer wrapper. */
function trimUnbalancedParens(text) {
  let open = 0;
  let close = 0;
  for (const char of text) {
    if (char === '(') open += 1;
    else if (char === ')') close += 1;
  }
  let result = text;
  while (close > open && result.endsWith(')')) {
    result = result.slice(0, -1).trim();
    close -= 1;
  }
  return result;
}

function parseLanguages(raw) {
  return raw
    .split('\n')
    .filter((line) => /^\s*-\s+/.test(line))
    .map((line) => {
      const text = line.replace(/^\s*-\s+/, '').trim();
      const bold = text.match(/^\*\*(.+?)\*\*\s*(.*)$/);
      const pair = bold
        ? { language: bold[1].trim(), rest: bold[2].trim() }
        : (() => {
            const [language, ...rest] = text.split(' — ');
            return { language: language.trim(), rest: rest.join(' — ').trim() };
          })();
      let rest = pair.rest.trim();
      if (/^\(.*\)$/.test(rest)) rest = rest.slice(1, -1).trim();

      const certification = trimUnbalancedParens(rest.match(/TOEFL[^,]*/)?.[0]?.trim() ?? '') || null;
      const proficiency = rest
        .replace(/\((?:[^()]|\([^()]*\))*\)/g, '')
        .replace(/TOEFL[^,]*/g, '')
        .replace(/,.*$/, '')
        .replace(/\(\s*$/g, '')
        .trim();
      return { language: pair.language, proficiency, certification };
    });
}

function parseList(raw) {
  return raw
    .split('\n')
    .filter((line) => /^\s*-\s+/.test(line))
    .map((line) => line.replace(/^\s*-\s+/, '').replace(/\*\*/g, '').trim())
    .filter(Boolean);
}

async function readSource({ file, lang, present }) {
  const path = fileURLToPath(new URL(file, DOCS));
  const raw = await readFile(path, 'utf8');
  const doc = parseDocument(file, raw, present);
  return {
    ...doc,
    file,
    lang,
    raw,
    education: parseEntries(doc.sections.get('education'), file, present),
    experience: parseEntries(doc.sections.get('experience'), file, present),
    contact: parseContact(doc.sections.get('contact') ?? ''),
    about: parseBulletKeyValues(doc.sections.get('about') ?? ''),
    languages: parseLanguages(doc.sections.get('languages') ?? ''),
    skills: parseList(doc.sections.get('skills') ?? ''),
  };
}

function zipByIndex(english, norwegian, section) {
  const a = english[section];
  const b = norwegian[section];
  if (a.length !== b.length) {
    throw new Error(
      `${section}: ${english.file} has ${a.length} entries but ${norwegian.file} has ${b.length} — ` +
        'the two files must list the same entries in the same order',
    );
  }
  return a.map((entry, index) => [entry, b[index]]);
}

/** Bullets if the entry has them; otherwise its prose, so nothing is dropped. */
const entryPoints = (entry) =>
  entry.bullets.length > 0 ? entry.bullets : entry.paragraphs ? [entry.paragraphs] : [];

function zipEntries(english, norwegian, section, leftKey, rightKey) {
  return zipByIndex(english, norwegian, section).map(([en, no]) => ({
    [leftKey]: { en: en.left, no: no.left },
    [rightKey]: { en: en.right, no: no.right },
    start: en.start,
    end: en.end,
    bullets: { en: entryPoints(en), no: entryPoints(no) },
  }));
}

/** Picks the value for a key from one language's `- **Key:** value` bullets. */
function aboutValue(entries, keys) {
  for (const [key, value] of entries) {
    if (keys.includes(key.toLowerCase())) return value;
  }
  return null;
}

function buildCvData(english, norwegian) {
  const lives = aboutValue(english.about, ['currently living in', 'living', 'bor nå i']);
  return {
    _generated:
      'Generated by scripts/build-cv.mjs from frontend/public/docs/CV_Andreas_Klaeboe_{EN,NO}.md. ' +
      'Edit the Markdown, then run `npm run cv`. Do not edit this file.',
    name: { en: english.name, no: norwegian.name },
    role: { en: english.role, no: norwegian.role },
    summary: { en: english.sections.get('summary').trim(), no: norwegian.sections.get('summary').trim() },
    contacts: {
      location: {
        en: aboutValue(english.about, ['currently living in', 'living']),
        no: aboutValue(norwegian.about, ['bor nå i', 'bor i']),
      },
      email: english.contact.emails[0] ?? null,
      phone: english.contact.phone ?? null,
      github: english.contact.github ?? null,
      linkedin: english.contact.linkedin ?? null,
      site: english.contact.site ?? null,
    },
    aboutMe: {
      dateOfBirth: {
        en: aboutValue(english.about, ['date of birth']),
        no: aboutValue(norwegian.about, ['fødselsdato']),
      },
      from: { en: aboutValue(english.about, ['from']), no: aboutValue(norwegian.about, ['fra']) },
      gender: { en: aboutValue(english.about, ['gender']), no: aboutValue(norwegian.about, ['kjønn']) },
      living: { en: lives, no: aboutValue(norwegian.about, ['bor nå i', 'bor i']) },
    },
    languagesSpoken: zipByIndex(english, norwegian, 'languages').map(([en, no]) => ({
      language: { en: en.language, no: no.language },
      proficiency: { en: en.proficiency, no: no.proficiency },
      ...(en.certification || no.certification ? { certification: en.certification ?? no.certification } : {}),
    })),
    skills: {
      en: { General: english.skills },
      no: { Generelt: norwegian.skills },
    },
    experience: zipEntries(english, norwegian, 'experience', 'title', 'org'),
    education: zipEntries(english, norwegian, 'education', 'degree', 'school'),
  };
}

// The CSS reproduces the look of the previous PDFs: A4, generous margins,
// large bold section headings, hairline rules between sections, blue links.
const PDF_CSS = `
  @page { size: A4; margin: 20mm 10mm 18mm; }
  body {
    font-family: "Noto Sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
    font-size: 11pt; line-height: 1.55; color: #1a1a1a; margin: 0;
  }
  h1 { font-size: 28pt; line-height: 1.15; margin: 0 0 8pt; letter-spacing: -0.4pt; break-after: avoid; }
  h2 { font-size: 20pt; line-height: 1.2; margin: 26pt 0 10pt; break-after: avoid; }
  h3 { font-size: 13pt; line-height: 1.3; margin: 16pt 0 2pt; break-after: avoid; }
  p { margin: 4pt 0 10pt; orphans: 3; widows: 3; }
  h3 + p em, p > em:only-child { color: #1a1a1a; }
  ul { margin: 4pt 0 10pt; padding-left: 16pt; }
  li { margin: 2pt 0; }
  hr { border: 0; border-top: 1pt solid #bfbfbf; margin: 20pt 0; }
  a { color: #1155cc; text-decoration: underline; overflow-wrap: anywhere; }
  strong { font-weight: 700; }
`;

async function buildPdfs(sources) {
  const { marked } = await import('marked');
  const { chromium } = await import('playwright');

  let browser;
  try {
    browser = await chromium.launch();
  } catch (error) {
    throw new Error(
      'Chromium is not available for Playwright. Run `npx playwright install chromium` once, then retry.\n' +
        `(${error.message.split('\n')[0]})`,
    );
  }

  try {
    for (const source of sources) {
      const page = await browser.newPage();
      // breaks: the date line and the line under it are separated by a single
      // newline in the Markdown, and they must not run together in the PDF.
      const html = marked.parse(source.raw, { breaks: true });
      await page.setContent(
        `<!doctype html><html lang="${source.lang}"><head><meta charset="utf-8">` +
          `<title>Andreas Klæboe — CV (${source.lang.toUpperCase()})</title>` +
          `<style>${PDF_CSS}</style></head><body>${html}</body></html>`,
        { waitUntil: 'load' },
      );
      const target = fileURLToPath(new URL(source.file.replace(/\.md$/, '.pdf'), DOCS));
      await page.pdf({ path: target, preferCSSPageSize: true, printBackground: true });
      await page.close();
      console.log(`  pdf   ${source.file.replace(/\.md$/, '.pdf')}`);
    }
  } finally {
    await browser.close();
  }
}

async function main() {
  const jsonOnly = process.argv.includes('--json-only');

  const sources = await Promise.all(SOURCES.map((source) => readSource(source)));
  const [english, norwegian] = sources;

  const data = buildCvData(english, norwegian);
  await writeFile(fileURLToPath(CV_JSON), `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  console.log(`  json  frontend/public/content/cv.json (${data.experience.length} experience, ${data.education.length} education)`);

  if (!jsonOnly) {
    await buildPdfs(sources);
  }
}

main().catch((error) => {
  console.error(`\nCV build failed — ${error.message}\n`);
  process.exit(1);
});
