import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { commitList, filesChanged, isRepo } from "../utils/git.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUTDIR = path.join(ROOT, "changelog");

// Only log content changes, not deps/build
const PATHS = ["index.njk", "pages/", "liturgy/", "_includes/", "_data/"];

if (!isRepo()) {
  if (!fs.existsSync(OUTDIR)) fs.mkdirSync(OUTDIR, { recursive: true });
  fs.writeFileSync(path.join(OUTDIR, "index.md"), `---
title: Changelog
layout: layout.njk
---

Version history is available when this directory is inside a Git repository.
`);
  process.exit(0);
}

// Collect all commits (you can scope by time if you wish)
const commits = commitList({ paths: PATHS });
if (!fs.existsSync(OUTDIR)) fs.mkdirSync(OUTDIR, { recursive: true });

// Group by YYYY-MM
const byMonth = new Map();
for (const c of commits) {
  const ym = c.iso.slice(0,7);
  if (!byMonth.has(ym)) byMonth.set(ym, []);
  byMonth.get(ym).push(c);
}

// Write month pages
for (const [ym, list] of byMonth) {
  const [y, m] = ym.split("-");
  // Group by date
  const byDay = new Map();
  for (const c of list) {
    const day = c.iso.slice(0,10);
    if (!byDay.has(day)) byDay.set(day, []);
    byDay.get(day).push(c);
  }
  let body = `---
title: Changelog — ${y}-${m}
layout: layout.njk
---

`;

  const sortedDays = Array.from(byDay.keys()).sort().reverse();
  for (const day of sortedDays) {
    body += `## ${day}\n\n`;
    for (const c of byDay.get(day)) {
      const short = c.hash.slice(0,7);
      const changed = filesChanged(c.hash)
        .filter(f => PATHS.some(p => f.startsWith(p)))
        .map(f => `\`${f}\``)
        .slice(0, 12); // keep it tidy
      body += `- **${c.subject}** — ${c.author} \`(${short})\`\n`;
      if (changed.length) body += `  - files: ${changed.join(", ")}\n`;
    }
    body += `\n`;
  }
  fs.writeFileSync(path.join(OUTDIR, `${ym}.md`), body);
}

// Write index page with month links (newest first)
const months = Array.from(byMonth.keys()).sort().reverse();
const idx = `---
title: Changelog
layout: layout.njk
---

A monthly roll-up of notable changes (derived from Git commit history).

${months.map(m => `- [${m}](/changelog/${m}/)`).join("\n")}
`;

fs.writeFileSync(path.join(OUTDIR, "index.md"), idx);
