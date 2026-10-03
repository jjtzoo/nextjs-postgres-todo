// NOT part of the to-do app. This script only builds the study guide.
// It reads the real project files, so the code in the guide always matches the app.
//
//   node guide/build-guide.mjs                      -> writes guide/guide.html
//   msedge --headless --print-to-pdf=... guide.html -> makes the PDF
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { explanations } from "./explanations.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(root, p), "utf8").trimEnd();
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// A plain code block, optionally with a label bar on top
const code = (s, label) =>
  `<div class="code">${label ? `<div class="label">${esc(label)}</div>` : ""}<pre>${esc(s)}</pre></div>`;

// Code on the left, plain-English explanation on the right, one row per chunk of lines
const explain = (p, label = p) => {
  const rows = explanations[p];
  if (!rows) throw new Error("no explanations for " + p);
  const lines = read(p).split(/\r?\n/);
  let i = 0;
  const starts = rows.map(([key]) => {
    while (i < lines.length && !lines[i].trim().startsWith(key)) i++;
    if (i >= lines.length) throw new Error(p + ": no line starting with " + key);
    return i++;
  });
  if (!lines.slice(0, starts[0]).every((l) => !l.trim())) throw new Error(p + ": lines before first row are unexplained");
  const body = rows
    .map(([, text], k) => {
      const chunk = lines.slice(starts[k], starts[k + 1] ?? lines.length).join("\n").trimEnd();
      return `<tr><td class="c"><pre>${esc(chunk)}</pre></td><td class="e">${text}</td></tr>`;
    })
    .join("");
  return `<div class="ex"><div class="label">${esc(label)}</div><table><tr><th>Code</th><th>What it means</th></tr>${body}</table></div>`;
};

const box = (kind, title, html) => `<div class="box ${kind}"><div class="bt">${title}</div>${html}</div>`;
const plain = (html) => box("plain", "In plain English", html);
const tip = (html) => box("tip", "Tip", html);
const warn = (html) => box("warn", "Watch out", html);
const mongo = (html) => box("mongo", "If you know Mongoose / Express", html);
const ps = (s) => code(s, "PowerShell");

let n = 0;
const step = (title) => `<h3 class="step"><span class="num">${++n}</span>${title}</h3>`;
const part = (title, sub) => `<h2 class="part">${title}${sub ? `<span>${sub}</span>` : ""}</h2>`;

const PSQL = "C:\\Program Files\\PostgreSQL\\17\\bin";

const html = `<!doctype html><html><head><meta charset="utf-8">
<title>To-Do App Study Guide: Next.js, TypeScript, PostgreSQL, Zustand</title>
<style>
@page { size: A4; margin: 15mm 14mm; }
body { font-family: "Segoe UI", Arial, sans-serif; font-size: 10.5pt; line-height: 1.55; color: #1b1b1b; }
h1 { font-size: 26pt; margin: 0 0 2px; letter-spacing: -0.5px; }
.sub { color: #555; font-size: 12pt; margin-bottom: 16px; }
h2.part { break-before: page; font-size: 18pt; margin: 0 0 10px; padding-bottom: 6px; border-bottom: 3px solid #1f4fd8; }
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
</style></head><body>

<h1>Build a To-Do App</h1>
<div class="sub">Next.js &middot; TypeScript &middot; Node.js &middot; PostgreSQL &middot; Zustand: a beginner's study guide</div>

<p>This guide walks you through a small but <b>real</b> full-stack app: a page where you add, tick and delete tasks, saved in a PostgreSQL database. It's about 150 lines of code in 7 files, small enough to memorize and big enough to teach the things LeetCode can't:</p>
<ul>
<li>how a browser talks to a server (<b>HTTP, APIs, JSON</b>)</li>
<li>how data is stored and queried (<b>databases, SQL</b>)</li>
<li>how a project is organised (<b>folders, config, secrets</b>)</li>
<li>how a UI keeps track of data (<b>state, Zustand</b>)</li>
</ul>
<p>Every file is shown with a <b>line-by-line explanation</b> table: code on the left, meaning on the right. All commands are for <b>Windows PowerShell</b>.</p>

<table class="toc">
<tr><td>Part 1</td><td>Understand before you type: the big picture, key words, folders, who creates which file</td></tr>
<tr><td>Part 2</td><td>Set up PostgreSQL: install, psql, create the database and table</td></tr>
<tr><td>Part 3</td><td>Create the Next.js project with one command, add libraries</td></tr>
<tr><td>Part 4</td><td>Write the code, back to front: database &rarr; model &rarr; API &rarr; store &rarr; page</td></tr>
<tr><td>Part 5</td><td>Compare with Express + Mongoose</td></tr>
<tr><td>Part 6</td><td>Memorize and practice, plus troubleshooting</td></tr>
</table>

${part("Part 1: Understand before you type", "Ten minutes here saves hours of confusion later.")}

<h3>The big picture</h3>
<p>When you click <b>Add</b>, your task travels through these pieces and back:</p>
<div class="flow">
<div class="n br"><b>Page</b><small>app/page.tsx</small></div><span class="a">&rarr;</span>
<div class="n br"><b>Store</b><small>store/todoStore.ts</small></div><span class="a">&rarr;</span>
<div class="n"><b>API route</b><small>app/api/todos/...</small></div><span class="a">&rarr;</span>
<div class="n"><b>Model</b><small>models/todo.ts</small></div><span class="a">&rarr;</span>
<div class="n"><b>Pool</b><small>lib/db.ts</small></div><span class="a">&rarr;</span>
<div class="n db"><b>PostgreSQL</b><small>todos table</small></div>
</div>
<p class="small">Purple = runs in the <b>browser</b>. Blue = runs on the <b>server</b> (Node.js). Green = the <b>database</b>.</p>

${plain(`<p>Think of a restaurant:</p>
<table>
<tr><th>Restaurant</th><th>Our app</th><th>Job</th></tr>
<tr><td>Dining room</td><td>Page</td><td>What the customer sees and clicks.</td></tr>
<tr><td>Order pad</td><td>Store (Zustand)</td><td>Remembers the current list; sends orders to the kitchen.</td></tr>
<tr><td>Waiter at the kitchen window</td><td>API route</td><td>Takes an order (request), checks it makes sense, returns the dish (response).</td></tr>
<tr><td>Cook</td><td>Model</td><td>Knows the recipes, i.e. the SQL for each job.</td></tr>
<tr><td>Phone lines to the pantry</td><td>Pool</td><td>A few always-open lines to the database, shared by everyone.</td></tr>
<tr><td>Pantry</td><td>PostgreSQL</td><td>Where everything is stored permanently.</td></tr>
</table>`)}

<h3>Words you'll see</h3>
<table>
<tr><th style="width:22%">Word</th><th>Meaning</th></tr>
<tr><td>Node.js</td><td>Runs JavaScript outside the browser, on your computer or a server. Next.js runs on it.</td></tr>
<tr><td>npm</td><td>Node's package manager. Downloads libraries into <code>node_modules/</code> and lists them in <code>package.json</code>.</td></tr>
<tr><td>Next.js</td><td>A framework that serves your <b>pages</b> and your <b>API</b> from one project. It replaces Express here.</td></tr>
<tr><td>React</td><td>The library for building the UI out of <b>components</b> (functions that return HTML-like JSX).</td></tr>
<tr><td>TypeScript</td><td>JavaScript plus <b>types</b>. Catches mistakes (like a typo in a field name) before you run the code.</td></tr>
<tr><td>State</td><td>Data that, when it changes, makes the screen redraw. <code>useState</code> (one component) or a store (shared).</td></tr>
<tr><td>Hook</td><td>A React function starting with <code>use...</code> (<code>useState</code>, <code>useEffect</code>, <code>useTodoStore</code>).</td></tr>
<tr><td>Zustand</td><td>A tiny library for <b>shared state</b>: one store any component can read and update.</td></tr>
<tr><td>API / endpoint</td><td>A URL that returns <b>data</b> (JSON) instead of a page, e.g. <code>/api/todos</code>.</td></tr>
<tr><td>HTTP method</td><td>The verb of a request: <b>GET</b> read, <b>POST</b> create, <b>PATCH</b> update, <b>DELETE</b> remove.</td></tr>
<tr><td>Status code</td><td>A number in each reply: 200 OK, 201 Created, 204 No Content, 400 Bad Request, 404 Not Found, 500 Server Error.</td></tr>
<tr><td>JSON</td><td>Text format for data: <code>{"id": 1, "text": "Buy milk", "done": false}</code>.</td></tr>
<tr><td>PostgreSQL</td><td>A <b>relational</b> database: data lives in <b>tables</b> with fixed <b>columns</b>; each item is a <b>row</b>.</td></tr>
<tr><td>SQL</td><td>The language for talking to the database: <code>SELECT</code>, <code>INSERT</code>, <code>UPDATE</code>, <code>DELETE</code>.</td></tr>
<tr><td>psql</td><td>PostgreSQL's terminal app for typing SQL. Like <code>mongosh</code> for MongoDB.</td></tr>
<tr><td>pg</td><td>The npm library your Node.js code uses to talk to PostgreSQL.</td></tr>
<tr><td>Connection pool</td><td>A few database connections kept open and shared, so each request doesn't open a new one.</td></tr>
<tr><td>Environment variable</td><td>A setting kept outside the code (in <code>.env.local</code>), e.g. the database password.</td></tr>
</table>

<h3>The folders: is this the standard design?</h3>
${code(`todo-app/
├─ app/                     ← REQUIRED by Next.js: pages and API routes
│  ├─ layout.tsx            ← frame around every page
│  ├─ page.tsx              ← the page at  /
│  └─ api/todos/
│     ├─ route.ts           ← API:  GET, POST    /api/todos
│     └─ [id]/route.ts      ← API:  PATCH, DELETE /api/todos/7
├─ lib/db.ts                ← convention: shared helpers (database pool)
├─ models/todo.ts           ← convention: all the SQL for todos
├─ store/todoStore.ts       ← convention: Zustand store
├─ schema.sql               ← the table definition (run once with psql)
├─ .env.local               ← secrets: database address + password
└─ package.json, tsconfig.json, next.config.ts ...  ← config (generated)`, "project structure")}
<table>
<tr><th>Folder</th><th>Required?</th><th>Why it's there</th></tr>
<tr><td><code>app/</code></td><td><b>Yes</b></td><td>Next.js's <b>App Router</b> turns this folder into URLs. <code>page.tsx</code> = a page, <code>route.ts</code> = an API endpoint, <code>[id]</code> = a changing part of the URL. Those file names are fixed.</td></tr>
<tr><td><code>lib/</code></td><td>No</td><td>Very common convention for helpers and setup code. You could call it <code>utils/</code>; Next.js doesn't care.</td></tr>
<tr><td><code>models/</code></td><td>No</td><td>Our choice: puts all SQL in one place, like Mongoose models. Keeps API routes short.</td></tr>
<tr><td><code>store/</code></td><td>No</td><td>Our choice: where Zustand stores live.</td></tr>
</table>
${plain(`<p>Next.js only cares about <code>app/</code> (and <code>public/</code> for images, which we don't use). Everything else is a tidy habit. Other projects often add <code>components/</code>, <code>hooks/</code>, <code>types/</code>, or put everything inside <code>src/</code>. All of those are normal.</p>`)}

<h3>Who creates which file?</h3>
<p>Many files appear "by magic". Here is where each one comes from and whether you touch it:</p>
<table>
<tr><th>File / folder</th><th>Created by</th><th>You edit it?</th><th>What it is</th></tr>
<tr><td><code>package.json</code></td><td>create-next-app</td><td>Rarely</td><td>Project name, scripts (<code>npm run dev</code>), list of libraries.</td></tr>
<tr><td><code>package-lock.json</code></td><td>npm install</td><td>Never</td><td>Exact versions of every library, so installs are repeatable.</td></tr>
<tr><td><code>node_modules/</code></td><td>npm install</td><td>Never</td><td>The downloaded libraries (Next.js, React, pg...). Huge; never commit it.</td></tr>
<tr><td><code>tsconfig.json</code></td><td>create-next-app</td><td>No</td><td>TypeScript settings. (If missing, <code>next dev</code> creates it. <code>npm init -y</code> does <b>not</b>; that only makes <code>package.json</code>.)</td></tr>
<tr><td><code>next.config.ts</code></td><td>create-next-app</td><td>Later</td><td>Next.js settings. Empty = defaults.</td></tr>
<tr><td><code>next-env.d.ts</code></td><td>Next.js</td><td>Never</td><td>Tells TypeScript about Next.js's types.</td></tr>
<tr><td><code>.git/</code></td><td>create-next-app (if Git is installed)</td><td>Never directly</td><td>Git's history of your project. Use <code>git status</code>, <code>git add</code> and <code>git commit</code> instead of touching it.</td></tr>
<tr><td><code>.next/</code></td><td>create-next-app, then <code>next dev</code> / <code>next build</code></td><td>Never</td><td>Next.js's <b>output and cache</b>: your code compiled for the browser and server. It is <i>not</i> the npm package (that's <code>node_modules/next</code>); it's what the package <i>produces</i> when it runs. Safe to delete; it's rebuilt.</td></tr>
<tr><td><code>tsconfig.tsbuildinfo</code></td><td>TypeScript</td><td>Never</td><td>Cache that makes type-checking faster.</td></tr>
<tr><td><code>.gitignore</code></td><td>create-next-app</td><td>Rarely</td><td>Files Git should never save (<code>node_modules</code>, <code>.next</code>, <code>.env*</code>).</td></tr>
<tr><td><code>AGENTS.md</code>, <code>CLAUDE.md</code>, <code>README.md</code></td><td>create-next-app</td><td>Optional</td><td>Notes for humans and AI coding assistants. Not used by the app.</td></tr>
<tr><td><code>app/layout.tsx</code>, <code>app/page.tsx</code></td><td>create-next-app</td><td><b>Yes</b></td><td>Generated as a "Hello world", then you replace them.</td></tr>
<tr><td><code>.env.local</code>, <code>schema.sql</code>, <code>lib/</code>, <code>models/</code>, <code>store/</code>, <code>app/api/</code></td><td><b>You</b></td><td><b>Yes</b></td><td>Your actual app.</td></tr>
<tr><td><code>guide/</code></td><td>-</td><td>-</td><td><b>Not part of the app.</b> <code>build-guide.mjs</code> and <code>explanations.mjs</code> only generate this PDF. You can delete the folder and the app still works.</td></tr>
</table>

${part("Part 2: Set up PostgreSQL", "Install the database, meet psql, create the database and the table.")}

${step("Install Node.js")}
<p>Download the LTS version from <b>nodejs.org</b> and install it. Check it in PowerShell:</p>
${ps("node -v\nnpm -v")}

${step("Install PostgreSQL")}
<p>PostgreSQL is a program that runs in the background (a Windows <b>service</b>) and waits for connections on <b>port 5432</b>. Pick one way to install it:</p>
<h4>Option A: one command (what we did)</h4>
<p>Choose a password first: letters and numbers only, no spaces. Then run:</p>
${ps(`winget install --id PostgreSQL.PostgreSQL.17 --source winget --override "--mode unattended --unattendedmodeui none --superpassword YOUR_PASSWORD --serverport 5432"`)}
<table>
<tr><th>Part</th><th>Meaning</th></tr>
<tr><td><code>winget install --id PostgreSQL.PostgreSQL.17</code></td><td>Use Windows' package manager to install PostgreSQL version 17.</td></tr>
<tr><td><code>--override "..."</code></td><td>Pass these options straight to the PostgreSQL installer:</td></tr>
<tr><td><code>--mode unattended --unattendedmodeui none</code></td><td>Install without asking any questions.</td></tr>
<tr><td><code>--superpassword YOUR_PASSWORD</code></td><td>Password for the main database user, called <code>postgres</code>.</td></tr>
<tr><td><code>--serverport 5432</code></td><td>The standard PostgreSQL port.</td></tr>
</table>
${warn(`<p>Windows will show an <b>administrator (UAC) prompt</b>; click Yes. It may hide behind other windows (look for a flashing shield on the taskbar). The download plus install took us about 15 minutes. <b>Write the password down</b>; you need it in step 10.</p>`)}
<h4>Option B: the normal installer</h4>
<p>Download the Windows installer from <b>postgresql.org/download/windows</b> and click Next through it. Set a password when asked, keep port <b>5432</b>, and untick "Stack Builder" at the end.</p>
<h4>Check that it's running</h4>
${ps("sc.exe query postgresql-x64-17")}
<p>Look for <code>STATE : 4 RUNNING</code>. It starts automatically every time Windows starts. The installer also adds <b>pgAdmin 4</b>, a point-and-click app for browsing your data (like MongoDB Compass).</p>

${step("Meet psql")}
${plain(`<p><b>psql</b> is a terminal "chat window" with your database: you type SQL or commands, it answers. It's the PostgreSQL version of <code>mongosh</code>. You use it to set things up and peek at data; your <b>app</b> doesn't use psql, it uses the <code>pg</code> library.</p>`)}
<p>psql lives in <code>${PSQL}</code>. Windows doesn't know that folder yet, so typing <code>psql</code> gives "not recognized". Fix it once by adding the folder to your <b>PATH</b>:</p>
<ol>
<li>Press Start, type <b>environment variables</b>, open "Edit the system environment variables".</li>
<li>Click <b>Environment Variables...</b>, select <b>Path</b> under "User variables", then <b>Edit</b>, then <b>New</b>.</li>
<li>Paste <code>${PSQL}</code>, click OK three times, then <b>open a new PowerShell window</b>.</li>
</ol>
<p>(Without PATH, you can always type the full path: <code>&amp; "${PSQL}\\psql.exe" ...</code>)</p>
<p>The flags you'll use:</p>
<table>
<tr><th>Flag</th><th>Meaning</th><th>Our value</th></tr>
<tr><td><code>-U</code></td><td>User to log in as</td><td><code>postgres</code></td></tr>
<tr><td><code>-h</code></td><td>Host (which computer)</td><td><code>localhost</code> (this one)</td></tr>
<tr><td><code>-d</code></td><td>Database to open</td><td><code>todo_app</code></td></tr>
<tr><td><code>-c</code></td><td>Run one command and exit</td><td><code>"SELECT * FROM todos;"</code></td></tr>
<tr><td><code>-f</code></td><td>Run all commands in a file</td><td><code>schema.sql</code></td></tr>
</table>
${tip(`<p>psql asks for the password every time. To skip that in the current window only, run <code>$env:PGPASSWORD = "YOUR_PASSWORD"</code> first. It's forgotten when you close the window.</p>`)}

${step("Create the database")}
<p>One PostgreSQL server can hold many databases (one per project). Create ours:</p>
${ps(`psql -U postgres -h localhost -c "CREATE DATABASE todo_app;"`)}
<p>It answers <code>CREATE DATABASE</code>. Do this once; running it again says "already exists", which is harmless.</p>

${step("Create the table")}
<p>Unlike MongoDB, PostgreSQL needs to know the <b>shape</b> of your data before you store any: a table with named, typed columns. Save this as <code>schema.sql</code> in your project folder (you'll create the folder in step 6, so you can also come back to this step):</p>
${explain("schema.sql")}
<p>Run the file against the <code>todo_app</code> database, then check the result with <code>\\d</code> (describe):</p>
${ps(`psql -U postgres -h localhost -d todo_app -f schema.sql
psql -U postgres -h localhost -d todo_app -c "\\d todos"`)}
${code(` Column |  Type   | Nullable |              Default
--------+---------+----------+-----------------------------------
 id     | integer | not null | nextval('todos_id_seq'::regclass)
 text   | text    | not null |
 done   | boolean | not null | false
Indexes:
    "todos_pkey" PRIMARY KEY, btree (id)`, "expected output")}
<h4>Handy psql commands (inside <code>psql -U postgres -h localhost -d todo_app</code>)</h4>
<table>
<tr><th>Type this</th><th>It does</th><th>Mongo shell equivalent</th></tr>
<tr><td><code>\\l</code></td><td>List databases</td><td><code>show dbs</code></td></tr>
<tr><td><code>\\c todo_app</code></td><td>Switch database</td><td><code>use todo_app</code></td></tr>
<tr><td><code>\\dt</code></td><td>List tables</td><td><code>show collections</code></td></tr>
<tr><td><code>\\d todos</code></td><td>Show a table's columns</td><td>(no schema in Mongo)</td></tr>
<tr><td><code>SELECT * FROM todos;</code></td><td>Show all rows (don't forget the <code>;</code>)</td><td><code>db.todos.find()</code></td></tr>
<tr><td><code>\\q</code></td><td>Quit</td><td><code>exit</code></td></tr>
</table>

${part("Part 3: Create the Next.js project", "One command makes the skeleton; two more add our libraries.")}

${step("Generate the project (boilerplate)")}
<p>Go to the folder where you keep projects, then run:</p>
${ps(`npx create-next-app@latest todo-app --ts --app --empty --no-tailwind --no-eslint --no-src-dir --no-react-compiler --import-alias "@/*" --use-npm
cd todo-app`)}
<table>
<tr><th>Part</th><th>Meaning</th></tr>
<tr><td><code>npx create-next-app@latest todo-app</code></td><td>Download and run Next.js's official project generator; make a folder <code>todo-app</code>.</td></tr>
<tr><td><code>--ts</code></td><td>Use TypeScript.</td></tr>
<tr><td><code>--app</code></td><td>Use the App Router (the <code>app/</code> folder).</td></tr>
<tr><td><code>--empty</code></td><td>Minimal starter: just a "Hello world!" page, no demo images or CSS.</td></tr>
<tr><td><code>--no-tailwind --no-eslint --no-react-compiler</code></td><td>Skip extra tools, to keep it simple for learning.</td></tr>
<tr><td><code>--no-src-dir</code></td><td>Put <code>app/</code> at the top level, not inside <code>src/</code>.</td></tr>
<tr><td><code>--import-alias "@/*"</code></td><td>Make <code>@/</code> mean "project root" in imports.</td></tr>
<tr><td><code>--use-npm</code></td><td>Use npm (not yarn/pnpm/bun).</td></tr>
</table>
${tip(`<p>Prefer questions? Run just <code>npx create-next-app@latest todo-app</code> and pick custom settings that match the flags above: TypeScript <b>yes</b>, App Router <b>yes</b>, Tailwind / ESLint / <code>src/</code> <b>no</b>, import alias <b>@/*</b>.</p>`)}
${plain(`<p><b>Know Vite?</b> This is the same idea as <code>npm create vite@latest my-app -- --template react-ts</code>: one command makes a ready-to-run starter. The difference is that Vite gives you a browser-only React app (you'd still need a separate backend like Express), while Next.js gives you pages <i>and</i> API routes in one project.</p>`)}
<p><b>What it creates</b> (this project was made with exactly this command):</p>
${code(`todo-app/
├─ .git/               ← a Git repository with one commit (if Git is installed)
├─ .next/              ← generated route types (more appears when you run the app)
├─ app/
│  ├─ layout.tsx       ← you'll replace this
│  └─ page.tsx         ← "Hello world!", you'll replace this
├─ node_modules/       ← next, react, react-dom, typescript, @types/...
├─ .gitignore
├─ AGENTS.md, CLAUDE.md, README.md
├─ next-env.d.ts
├─ next.config.ts
├─ package.json
├─ package-lock.json
└─ tsconfig.json`, "created by create-next-app")}
<p>It also runs <code>npm install</code> for you and, if Git is installed, makes a first commit called "Initial commit from Create Next App". From then on, <code>git status</code> shows exactly which files <b>you</b> changed or added.</p>

${step("Add our three libraries")}
${ps(`npm install pg zustand
npm install -D @types/pg`)}
<table>
<tr><th>Package</th><th>What for</th></tr>
<tr><td><code>pg</code></td><td>Lets Node.js talk to PostgreSQL.</td></tr>
<tr><td><code>zustand</code></td><td>Shared state in the browser.</td></tr>
<tr><td><code>@types/pg</code></td><td>Type descriptions for <code>pg</code>, so TypeScript understands it. <code>-D</code> = a <b>dev</b>-dependency: only needed while coding, not to run the app.</td></tr>
</table>
${plain(`<p><b>Why isn't the install command long anymore?</b> Without create-next-app you'd have to install everything by hand: <code>npm install next react react-dom pg zustand</code> plus <code>npm install -D typescript @types/node @types/react @types/react-dom @types/pg</code>. Every <code>@types/...</code> package teaches TypeScript about one JavaScript library. create-next-app already installed all of them except <code>@types/pg</code>, so that's all you add.</p>
<p>Some libraries ship their own types and need no <code>@types</code> package. <code>zustand</code> is one; <code>pg</code> isn't.</p>`)}
<p>These commands change <code>package.json</code> (new lines under <code>dependencies</code> / <code>devDependencies</code>), <code>package-lock.json</code> and <code>node_modules/</code>.</p>

${step("Run it once")}
${ps("npm run dev")}
<p>Open <b>http://localhost:3000</b> and you'll see "Hello world!". Next.js just filled the <code>.next/</code> folder with the compiled app. Leave it running: it reloads automatically as you save files. Press <b>Ctrl+C</b> to stop it.</p>

${step("Understand the generated config (no changes needed)")}
<p>You won't edit these, but you should know what they say.</p>
${explain("tsconfig.json")}
${explain("next.config.ts")}

${part("Part 4: Write the code", "Back to front: secret → database connection → model → API → store → page.")}

${step("Store the database address in .env.local")}
<p>Create a file named exactly <code>.env.local</code> in the project root. Use the password from step 2:</p>
${explain(".env.example", ".env.local")}
${plain(`<p>Next.js loads <code>.env.local</code> automatically when it starts, and only server code can read it, so the password never reaches the browser. <code>.gitignore</code> already lists <code>.env*</code>, so it won't be uploaded to GitHub. <b>If you change this file, restart <code>npm run dev</code>.</b></p>`)}

${step("Connect to the database: lib/db.ts")}
<p>Create a folder <code>lib</code> and this file:</p>
${explain("lib/db.ts")}
<h4>Deep dive: what is a connection pool?</h4>
${plain(`<p>Opening a connection to PostgreSQL is slow: the network handshake plus logging in with a password. And Postgres only accepts about <b>100</b> connections at once by default. If every request opened its own connection, the app would be slow, and under load it would run out.</p>
<p>A <b>pool</b> is like a taxi rank. It keeps a few connections (taxis) open. Each query takes a free one, uses it, and puts it back. If all are busy, the next query waits a moment in line.</p>`)}
${code(`pool.query("SELECT ...")
  1. borrow a free connection   (or open one, up to 10)
  2. send the SQL to PostgreSQL
  3. wait for the answer
  4. give the connection back   (closed if unused for ~10 s)
  5. hand you the result: { rows: [...] }`, "what pool.query() does for you")}
<p><b>Why the <code>globalThis</code> trick?</b> In development, Next.js re-runs a file each time you save it. Without the trick, every save would create a <i>new</i> pool while the old ones keep their connections open. After a few dozen saves Postgres says <code>sorry, too many clients already</code>. Parking the pool on <code>globalThis</code>, which survives reloads, means there is always just one. In production files aren't reloaded, so the trick isn't needed there.</p>
${mongo(`<p>This file is your <code>mongoose.connect(process.env.MONGODB_URI)</code>. Mongoose also keeps a pool behind the scenes; <code>pg</code> just makes it visible.</p>`)}

${step("Write the model: models/todo.ts")}
<p>Create a folder <code>models</code> and this file. It's the <b>only</b> file that contains SQL. Each function does one job:</p>
${explain("models/todo.ts")}
${mongo(`<p>This is your <code>Todo</code> model. Same jobs, different words:</p>
<div class="side"><div>${code(`// models/Todo.js (Mongoose)
const todoSchema = new Schema({
  text: { type: String, required: true },
  done: { type: Boolean, default: false },
});
const Todo = model("Todo", todoSchema);

Todo.find().sort({ _id: 1 });
Todo.create({ text });
Todo.findByIdAndUpdate(id, { done }, { new: true });
Todo.findByIdAndDelete(id);`, "Mongoose, for comparison only")}</div>
<div>${code(`-- schema.sql (run once in psql)
CREATE TABLE todos (
  id   SERIAL PRIMARY KEY,
  text TEXT NOT NULL,
  done BOOLEAN NOT NULL DEFAULT FALSE
);

SELECT * FROM todos ORDER BY id
INSERT INTO todos (text) VALUES ($1) RETURNING *
UPDATE todos SET done = $1 WHERE id = $2 RETURNING *
DELETE FROM todos WHERE id = $1`, "PostgreSQL (this project)")}</div></div>
<p>The big difference: Mongoose's schema lives in your <b>code</b>. A Postgres schema lives <b>inside the database</b> (you made it in step 5), and the database itself rejects bad data. Our <code>Todo</code> type just mirrors it for TypeScript.</p>`)}

${step("Write the API routes (your controllers)")}
${plain(`<p>An <b>API route</b> is a URL that returns data instead of a page. In Next.js you create one by making a file called <code>route.ts</code>; its <b>folder path</b> becomes the URL, and each exported function named after an HTTP method handles that method. No router setup and no <code>app.listen()</code>: <code>npm run dev</code> already serves it.</p>`)}
<p>Our four endpoints:</p>
<table>
<tr><th>Method + URL</th><th>Send (body)</th><th>Get back</th><th>File</th></tr>
<tr><td><b>GET</b> /api/todos</td><td>nothing</td><td>200 + list of todos</td><td rowspan="2"><code>app/api/todos/route.ts</code></td></tr>
<tr><td><b>POST</b> /api/todos</td><td><code>{"text":"Buy milk"}</code></td><td>201 + the new todo (or 400)</td></tr>
<tr><td><b>PATCH</b> /api/todos/7</td><td><code>{"done":true}</code></td><td>200 + updated todo (or 400/404)</td><td rowspan="2"><code>app/api/todos/[id]/route.ts</code></td></tr>
<tr><td><b>DELETE</b> /api/todos/7</td><td>nothing</td><td>204, empty</td></tr>
</table>
<p>Each handler does three things: <b>read</b> the request, <b>check</b> it, <b>call the model</b> and reply. Create the folders <code>app/api/todos/</code> and <code>app/api/todos/[id]/</code> (yes, with square brackets in the folder name).</p>
${explain("app/api/todos/route.ts")}
${explain("app/api/todos/[id]/route.ts")}
<h4>Try the API before building the page</h4>
<p>With <code>npm run dev</code> running, open <b>http://localhost:3000/api/todos</b> in the browser: you'll see <code>[]</code>, the JSON for an empty list. To send other methods, use PowerShell:</p>
${ps(`Invoke-RestMethod -Method Post -Uri http://localhost:3000/api/todos -ContentType "application/json" -Body '{"text":"Buy milk"}'
Invoke-RestMethod http://localhost:3000/api/todos
Invoke-RestMethod -Method Patch -Uri http://localhost:3000/api/todos/1 -ContentType "application/json" -Body '{"done":true}'
Invoke-RestMethod -Method Delete -Uri http://localhost:3000/api/todos/1`)}
${tip(`<p>Use <code>Invoke-RestMethod</code> in PowerShell instead of <code>curl</code>: in Windows PowerShell, <code>curl</code> is a different command and the JSON quotes get mangled.</p>`)}

${step("Write the Zustand store: store/todoStore.ts")}
${plain(`<p>A <b>store</b> is a shared whiteboard for the browser side of the app. It holds the todo list and the actions that change it. Any component can read it with <code>useTodoStore()</code>, and when the list changes, every component using it redraws.</p>
<p>With one page you <i>could</i> keep everything in <code>useState</code>. The store pays off when a second component (say, a counter in a header) needs the same list: no passing props down through layers. It also moves the <code>fetch</code> calls out of the page, so the page only handles display.</p>`)}
${explain("store/todoStore.ts")}

${step("Replace app/layout.tsx")}
<p>Replace the generated file with this simpler version. (The generated one uses <code>LayoutProps&lt;"/"&gt;</code>, a newer Next.js helper type; both work.)</p>
${explain("app/layout.tsx")}

${step("Replace app/page.tsx")}
<p>The page only <b>displays</b> things and <b>calls store actions</b>. It never talks to the API or the database directly.</p>
${explain("app/page.tsx")}

${step("Run and test")}
${ps("npm run dev")}
<p>Open <b>http://localhost:3000</b>, then check:</p>
<ol>
<li>Type a task and press Enter. It appears and the box clears.</li>
<li>Tick it. It's crossed out.</li>
<li><b>Refresh the page.</b> It's still there, because it came back from PostgreSQL.</li>
<li>Click <b>x</b>. It's gone.</li>
<li>Look in the database directly: <code>psql -U postgres -h localhost -d todo_app -c "SELECT * FROM todos;"</code></li>
</ol>

${part("Part 5: Express + Mongoose vs Next.js + PostgreSQL", "Same ideas, different places.")}
<table>
<tr><th>Job</th><th>Express + Mongoose</th><th>This project</th></tr>
<tr><td>Start the server</td><td><code>app.listen(3000)</code> in <code>server.js</code></td><td><code>npm run dev</code> (Next.js is the server)</td></tr>
<tr><td>Connect to the database</td><td><code>mongoose.connect(uri)</code></td><td><code>new Pool({ connectionString })</code> in <code>lib/db.ts</code></td></tr>
<tr><td>Define the data shape</td><td><code>new Schema({...})</code> in code</td><td><code>CREATE TABLE</code> in <code>schema.sql</code>, run once + <code>Todo</code> type</td></tr>
<tr><td>Model / queries</td><td><code>Todo.find()</code>, <code>Todo.create()</code>...</td><td>Functions in <code>models/todo.ts</code> running SQL</td></tr>
<tr><td>Routes</td><td><code>router.get("/todos", ctrl.list)</code></td><td>Folder <code>app/api/todos/</code> + exported <code>GET</code></td></tr>
<tr><td>Controllers</td><td><code>(req, res) =&gt; res.json(...)</code></td><td><code>GET(req)</code> returning <code>NextResponse.json(...)</code></td></tr>
<tr><td>URL parameter</td><td><code>req.params.id</code></td><td><code>[id]</code> folder + <code>await params</code></td></tr>
<tr><td>Request body</td><td><code>req.body</code> (needs <code>express.json()</code>)</td><td><code>await req.json()</code></td></tr>
<tr><td>IDs</td><td><code>_id</code>: ObjectId string</td><td><code>id</code>: 1, 2, 3... (SERIAL)</td></tr>
<tr><td>Shell</td><td><code>mongosh</code></td><td><code>psql</code></td></tr>
<tr><td>GUI</td><td>MongoDB Compass</td><td>pgAdmin 4</td></tr>
<tr><td>Frontend</td><td>separate React app + CORS setup</td><td>same project, same address; no CORS</td></tr>
</table>
<div class="side">
<div>${code(`// Express: routes + controller
router.post("/todos", async (req, res) => {
  const { text } = req.body;
  if (!text?.trim())
    return res.status(400).json({ error: "text is required" });
  const todo = await Todo.create({ text });
  res.status(201).json(todo);
});`, "Express + Mongoose, for comparison only")}</div>
<div>${code(`// Next.js: app/api/todos/route.ts
export async function POST(req: Request) {
  const { text } = await req.json();
  if (typeof text !== "string" || !text.trim())
    return NextResponse.json({ error: "text is required" }, { status: 400 });
  const todo = await createTodo(text.trim());
  return NextResponse.json(todo, { status: 201 });
}`, "this project (shortened)")}</div>
</div>
${plain(`<p><b>Do I need Express?</b> No. Next.js route handlers already do Express's job (routing, reading requests, sending JSON), and they run on Node.js. You'd add Express only if you wanted a separate backend server.</p>
<p><b>Want Mongoose-style models with Postgres?</b> That's what an <b>ORM</b> is. <b>Prisma</b> and <b>Drizzle</b> are the popular ones: you describe tables in code and write <code>db.todo.findMany()</code> instead of SQL. Learn raw SQL first (this project); ORMs make more sense once you know what they generate.</p>`)}

${part("Part 6: Memorize and practice")}

<h3>The journey of one click</h3>
<p>What happens when you type "Buy milk" and press Enter:</p>
<ol class="journey">
<li><code>page.tsx</code>: <code>onKeyDown</code> sees Enter and calls <code>handleAdd()</code>.</li>
<li><code>handleAdd()</code> calls the store action <code>addTodo("Buy milk")</code>.</li>
<li><code>todoStore.ts</code>: <code>fetch("/api/todos", { method: "POST", body: '{"text":"Buy milk"}' })</code>.</li>
<li>The request crosses from browser to server. Next.js finds <code>app/api/todos/route.ts</code> and runs <code>POST</code>.</li>
<li><code>POST</code> reads the JSON, checks <code>text</code>, calls <code>createTodo("Buy milk")</code>.</li>
<li><code>models/todo.ts</code>: <code>pool.query("INSERT ... VALUES ($1) RETURNING *", ["Buy milk"])</code>.</li>
<li>The pool lends a connection; PostgreSQL saves the row and returns <code>{id: 1, text: "Buy milk", done: false}</code>.</li>
<li><code>POST</code> replies <b>201</b> with that JSON.</li>
<li>Back in the store: <code>loadTodos()</code> does a GET and calls <code>set({ todos })</code>.</li>
<li>React sees the store changed and redraws the list. "Buy milk" appears.</li>
</ol>

<h3>One table to rule them all</h3>
<table>
<tr><th>Action</th><th>Page</th><th>Store action</th><th>HTTP</th><th>Route function</th><th>Model function</th><th>SQL</th></tr>
<tr><td>Read</td><td>useEffect</td><td>loadTodos</td><td>GET /api/todos</td><td>GET</td><td>findAllTodos</td><td>SELECT</td></tr>
<tr><td>Create</td><td>handleAdd</td><td>addTodo</td><td>POST /api/todos</td><td>POST</td><td>createTodo</td><td>INSERT</td></tr>
<tr><td>Update</td><td>checkbox</td><td>toggleTodo</td><td>PATCH /api/todos/:id</td><td>PATCH</td><td>updateTodoDone</td><td>UPDATE</td></tr>
<tr><td>Delete</td><td>x button</td><td>removeTodo</td><td>DELETE /api/todos/:id</td><td>DELETE</td><td>deleteTodo</td><td>DELETE</td></tr>
</table>

<h3>Rules to remember</h3>
<ul>
<li><code>app/</code> folder path = URL. <code>page.tsx</code> = page. <code>route.ts</code> = API. <code>[id]</code> = changing part.</li>
<li>Exported function name in <code>route.ts</code> = HTTP method.</li>
<li><code>"use client"</code> = runs in the browser. Needed for hooks and clicks. Database code must <b>never</b> be in a client file.</li>
<li>Only the model writes SQL. Routes check input and call the model. The page only calls the store.</li>
<li>SQL values always go in <code>$1, $2</code> placeholders, never glued into the string.</li>
<li>Secrets go in <code>.env.local</code>, read as <code>process.env.NAME</code>, on the server only. Restart after changing.</li>
<li>One component needs it: <code>useState</code>. Many components share it: the store.</li>
<li>One pool for the whole app; <code>pool.query()</code> borrows and returns connections for you.</li>
</ul>

<h3>Practice ladder (do them in order)</h3>
<ol>
<li><b>Rebuild from memory.</b> Delete <code>lib</code>, <code>models</code>, <code>store</code>, <code>app/api</code> and <code>page.tsx</code>, then rebuild using only the table above.</li>
<li><b>Count.</b> Show "2 of 5 done" above the list. Compute it from <code>todos</code> in the page (no new state).</li>
<li><b>Filter (Zustand).</b> Add <code>filter: "all" | "active" | "done"</code> and a <code>setFilter</code> action to the store; add three buttons. Browser-only, no API change.</li>
<li><b>Created date (SQL).</b> In psql: <code>ALTER TABLE todos ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT now();</code> then add it to the <code>Todo</code> type and show it.</li>
<li><b>Edit text (full stack).</b> Model <code>updateTodoText</code>, accept <code>text</code> in PATCH, a store action, and an Edit button.</li>
<li><b>Clear completed.</b> <code>DELETE FROM todos WHERE done = true</code>: a model function, a <code>DELETE /api/todos</code> handler, a store action and a button.</li>
<li><b>Errors and loading.</b> Add <code>loading</code> and <code>error</code> to the store; check <code>res.ok</code> after each fetch; show "Loading..." and error messages.</li>
<li><b>Optimistic update.</b> In <code>toggleTodo</code>, flip it in the store <i>first</i>, then call the API; undo if it fails.</li>
<li><b>Try an ORM.</b> Rebuild <code>models/todo.ts</code> with Prisma or Drizzle and compare.</li>
</ol>

<h3>Troubleshooting</h3>
<table>
<tr><th>You see</th><th>Fix</th></tr>
<tr><td><code>psql</code> is not recognized</td><td>Add <code>${PSQL}</code> to PATH (step 3) and open a <b>new</b> terminal.</td></tr>
<tr><td><code>password authentication failed for user "postgres"</code></td><td>The password in <code>.env.local</code> (or what you typed) is wrong. Restart <code>npm run dev</code> after fixing.</td></tr>
<tr><td><code>ECONNREFUSED 127.0.0.1:5432</code></td><td>PostgreSQL isn't running. Run <code>sc.exe query postgresql-x64-17</code>; start it in the Services app.</td></tr>
<tr><td><code>database "todo_app" does not exist</code></td><td>Do step 4.</td></tr>
<tr><td><code>relation "todos" does not exist</code></td><td>Do step 5, and make sure you used <code>-d todo_app</code>.</td></tr>
<tr><td><code>sorry, too many clients already</code></td><td>Something creates many pools. Make sure only <code>lib/db.ts</code> calls <code>new Pool</code>.</td></tr>
<tr><td>Cannot find module '@/...'</td><td>Check the file path and the <code>paths</code> entry in <code>tsconfig.json</code>.</td></tr>
<tr><td>An error saying <code>useState</code> / <code>useEffect</code> only works in a Client Component</td><td>Add <code>"use client";</code> as the first line of the page.</td></tr>
<tr><td>Page loads but the list stays empty</td><td>Open http://localhost:3000/api/todos. If it shows an error, read the <code>npm run dev</code> terminal; the real error is printed there.</td></tr>
</table>

<p class="small" style="margin-top:18px">Generated from the project's real source files by <code>guide/build-guide.mjs</code>. The <code>guide/</code> folder is not part of the app.</p>
</body></html>`;

writeFileSync(join(root, "guide", "guide.html"), html);
console.log("guide.html written");
