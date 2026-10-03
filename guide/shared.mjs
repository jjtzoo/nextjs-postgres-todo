// NOT part of the to-do app. Shared helpers and styles for all study guides.
import { existsSync, mkdirSync, readFileSync, statSync, unlinkSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const guideDir = dirname(fileURLToPath(import.meta.url));
export const root = join(guideDir, "..");
export const read = (p) => readFileSync(join(root, p), "utf8").trimEnd();
export const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// A plain code block, optionally with a label bar on top
export const code = (s, label) =>
  `<div class="code">${label ? `<div class="label">${esc(label)}</div>` : ""}<pre>${esc(s)}</pre></div>`;
export const ps = (s) => code(s, "PowerShell");
export const sql = (s) => code(s, "SQL");
export const ts = (s, label = "TypeScript") => code(s, label);
// What the computer printed back
export const out = (s, label = "Output") =>
  `<div class="code out"><div class="label">${esc(label)}</div><pre>${esc(s)}</pre></div>`;
// Command + its real output, side by side in one box
export const run = (cmd, result, label = "SQL") => code(cmd, label) + out(result);

export const box = (kind, title, html) => `<div class="box ${kind}"><div class="bt">${title}</div>${html}</div>`;
export const plain = (html) => box("plain", "In plain English", html);
export const tip = (html) => box("tip", "Tip", html);
export const warn = (html) => box("warn", "Watch out", html);
export const mongo = (html) => box("mongo", "If you know Mongoose / Express", html);
export const interview = (html) => box("mongo", "Interview angle", html);

export const part = (title, sub) => `<h2 class="part">${title}${sub ? `<span>${sub}</span>` : ""}</h2>`;
// Each guide gets its own numbered steps: const step = makeStep();
export const makeStep = () => {
  let n = 0;
  return (title) => `<h3 class="step"><span class="num">${++n}</span>${title}</h3>`;
};

export const CSS = `
@page { size: A4; margin: 15mm 14mm; }
body { font-family: "Segoe UI", Arial, sans-serif; font-size: 10.5pt; line-height: 1.55; color: #1b1b1b; }
h1 { font-size: 26pt; margin: 0 0 2px; letter-spacing: -0.5px; }
.sub { color: #555; font-size: 12pt; margin-bottom: 16px; }
h2.part { break-before: page; font-size: 18pt; margin: 0 0 10px; padding-bottom: 6px; border-bottom: 3px solid #1f4fd8; }
.compact h2.part { break-before: auto; margin-top: 28px; }
h2.part span { display: block; font-size: 10.5pt; font-weight: 400; color: #555; margin-top: 2px; }
h3 { font-size: 13pt; margin: 20px 0 6px; break-after: avoid; }
h3.step { border-bottom: 1px solid #e3e3e3; padding-bottom: 4px; }
h4 { font-size: 11pt; margin: 14px 0 4px; break-after: avoid; }
.num { display: inline-block; min-width: 24px; height: 24px; line-height: 24px; text-align: center; border-radius: 12px; background: #1f4fd8; color: #fff; font-size: 10pt; margin-right: 8px; padding: 0 4px; }
p { margin: 6px 0; }
code { background: #f0f0f0; padding: 1px 4px; border-radius: 3px; font-family: Consolas, monospace; font-size: 9.5pt; }
.code, .ex { border: 1px solid #d6d6d6; border-radius: 6px; margin: 8px 0 10px; overflow: hidden; }
.code { break-inside: avoid; }
.label { background: #eef1f6; font-family: Consolas, monospace; font-size: 8.5pt; padding: 3px 10px; border-bottom: 1px solid #d6d6d6; color: #333; }
pre { margin: 0; padding: 7px 10px; background: #fafafa; font-family: Consolas, monospace; font-size: 8.8pt; line-height: 1.4; white-space: pre-wrap; word-break: break-word; }
.code + .code.out { margin-top: -10px; border-top: 0; border-top-left-radius: 0; border-top-right-radius: 0; }
.code.out .label { background: #f3f3f3; color: #666; }
.code.out pre { background: #fff; color: #222; }
table { border-collapse: collapse; width: 100%; margin: 6px 0 10px; font-size: 9.5pt; }
th, td { border: 1px solid #d3d3d3; padding: 4px 7px; text-align: left; vertical-align: top; }
th { background: #eef1f6; }
tr { break-inside: avoid; }
.ex table { margin: 0; }
.ex th, .ex td { border-left: 0; border-right: 0; }
.ex td.c { width: 48%; background: #fafafa; padding: 3px 7px; }
.ex td.c pre { padding: 0; background: none; }
.ex td.e { font-size: 9.3pt; }
.box { border-radius: 6px; padding: 7px 11px; margin: 9px 0; break-inside: avoid; border: 1px solid; }
.box .bt { font-weight: 700; font-size: 9pt; text-transform: uppercase; letter-spacing: .4px; margin-bottom: 2px; }
.box p:first-of-type { margin-top: 0; }
.plain { background: #eef6ff; border-color: #bcd6fb; } .plain .bt { color: #1f4fd8; }
.tip { background: #edf9f0; border-color: #b9e3c4; } .tip .bt { color: #1d7a3a; }
.warn { background: #fff7e6; border-color: #f1d48a; } .warn .bt { color: #9a6a00; }
.mongo { background: #f5efff; border-color: #d6c4f7; } .mongo .bt { color: #6b3fc4; }
.flow { display: flex; flex-wrap: wrap; align-items: center; gap: 4px; margin: 10px 0; font-size: 9pt; }
.flow div.n { border: 1.5px solid #1f4fd8; border-radius: 6px; padding: 5px 7px; background: #f4f8ff; text-align: center; }
.flow div.n b { display: block; font-size: 9.5pt; }
.flow div.n small { color: #555; }
.flow div.n.db { border-color: #2f7d4f; background: #f1faf4; }
.flow div.n.br { border-color: #8a5cd6; background: #f8f4ff; }
.flow span.a { color: #888; font-size: 13pt; }
.side { display: flex; gap: 8px; } .side > div { flex: 1; min-width: 0; }
ol.journey li { margin-bottom: 2px; }
li { margin-bottom: 3px; }
.toc td { border: 0; padding: 2px 4px; } .toc td:first-child { width: 70px; color: #1f4fd8; font-weight: 600; }
.small { font-size: 9pt; color: #555; }
`;

// compact: parts flow on without starting a new page (for the short guides)
export const page = (title, body, { compact = false } = {}) =>
  `<!doctype html><html><head><meta charset="utf-8">\n<title>${title}</title>\n<style>${CSS}</style></head><body${compact ? ' class="compact"' : ""}>\n${body}\n</body></html>`;

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

// Write guide/html/<name>.html, then print it to guide/<name>.pdf with Edge
export function publish(name, html) {
  const htmlDir = join(guideDir, "html");
  mkdirSync(htmlDir, { recursive: true });
  const htmlPath = join(htmlDir, `${name}.html`);
  const pdfPath = join(guideDir, `${name}.pdf`);
  writeFileSync(htmlPath, html);

  if (!existsSync(EDGE)) {
    console.log(`${name}.html written (Edge not found, so no PDF)`);
    return;
  }
  if (existsSync(pdfPath)) unlinkSync(pdfPath);
  spawnSync(EDGE, ["--headless", "--disable-gpu", "--no-pdf-header-footer", `--print-to-pdf=${pdfPath}`, pathToFileURL(htmlPath).href]);
  // Edge can return before the file is fully written, so wait until its size stops changing
  let last = -1;
  for (let i = 0; i < 60; i++) {
    const size = existsSync(pdfPath) ? statSync(pdfPath).size : 0;
    if (size > 0 && size === last) break;
    last = size;
    spawnSync(process.execPath, ["-e", "setTimeout(() => {}, 500)"]);
  }
  const pages = (readFileSync(pdfPath, "latin1").match(/\/Type\s*\/Page[^s]/g) || []).length;
  console.log(`${name}.pdf written (${pages} pages)`);
}
