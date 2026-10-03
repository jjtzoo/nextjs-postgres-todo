// NOT part of the to-do app. Builds nextjs-mini-guide.pdf (Next.js 16, App Router).
// Every example file below was built and run in a test copy of the app
// (next build + browser test) before being added here.
import { code, ps, ts, out, plain, tip, warn, interview, mongo, part, makeStep, page } from "./shared.mjs";

const step = makeStep();

const body = `
<h1>Next.js Mini Guide</h1>
<div class="sub">The App Router in Next.js 16: routing, Server vs Client Components, and three ways to handle data</div>

<p>Your to-do app already uses Next.js. This guide explains the framework itself and shows what else it can do, using small additions to the same app. Every example was built and tested in a copy of the project first.</p>
<table class="toc">
<tr><td>Part 1</td><td>What Next.js adds to React; the three commands</td></tr>
<tr><td>Part 2</td><td>Routing: folders become URLs; special files</td></tr>
<tr><td>Part 3</td><td>Server Components vs Client Components (the key idea)</td></tr>
<tr><td>Part 4</td><td>Three ways to read and change data</td></tr>
<tr><td>Part 5</td><td>Dynamic pages, loading and error screens</td></tr>
<tr><td>Part 6</td><td>Route handlers, environment variables, and more</td></tr>
<tr><td>Part 7</td><td>Common errors, exercises, interview questions</td></tr>
</table>
${warn(`<p><b>Next.js changes fast.</b> This guide matches <b>Next.js 16</b> (the version in your project). Older tutorials may show things that no longer apply: <code>pages/</code> instead of <code>app/</code>, <code>getServerSideProps</code>, <code>middleware.ts</code> (now called <code>proxy.ts</code>), or <code>params.id</code> without <code>await</code>. The docs for your exact version ship inside the project at <code>node_modules/next/dist/docs/</code>.</p>`)}

${part("Part 1: What Next.js adds to React")}

<table>
<tr><th>Job</th><th>React alone (e.g. Vite)</th><th>Next.js</th></tr>
<tr><td>Pages and URLs</td><td>Add a router library</td><td>Folders in <code>app/</code> become URLs</td></tr>
<tr><td>Backend / API</td><td>Separate server (Express)</td><td><code>route.ts</code> files in the same project</td></tr>
<tr><td>Where code runs</td><td>Browser only</td><td>Server <b>and</b> browser, per component</td></tr>
<tr><td>First page load</td><td>Empty HTML, then JavaScript draws the page</td><td>HTML arrives already filled in (faster, better for search engines)</td></tr>
<tr><td>Reading a database</td><td>Only through an API</td><td>Server Components can read it directly</td></tr>
</table>

${step("The three commands")}
<table>
<tr><th>Command</th><th>What it does</th><th>When</th></tr>
<tr><td><code>npm run dev</code></td><td>Development server with instant reload and detailed errors</td><td>While coding</td></tr>
<tr><td><code>npm run build</code></td><td>Checks types and compiles an optimised version into <code>.next/</code></td><td>Before deploying; to catch errors</td></tr>
<tr><td><code>npm run start</code></td><td>Runs the built version (needs <code>build</code> first)</td><td>Production</td></tr>
</table>
<p><code>npm run build</code> ends with a list of every route. From a test copy of the app with this guide's examples added:</p>
${out(`Route (app)
┌ ○ /
├ ○ /_not-found
├ ƒ /api/search
├ ƒ /api/todos
├ ƒ /api/todos/[id]
├ ƒ /todos
└ ƒ /todos/[id]

○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand`, "npm run build")}
${plain(`<p><b>○ Static</b> = built <b>once</b>, at build time, then the same HTML is sent to everyone (fast). <b>ƒ Dynamic</b> = built <b>fresh on every request</b> (needed when data changes). Your home page is ○: its HTML is a shell, and the list is fetched later in the browser. Part 4 shows why this matters.</p>`)}

${part("Part 2: Routing", "The folder structure IS the URL structure.")}

${step("Folders become URLs")}
<table>
<tr><th>File</th><th>URL</th></tr>
<tr><td><code>app/page.tsx</code></td><td><code>/</code></td></tr>
<tr><td><code>app/about/page.tsx</code></td><td><code>/about</code></td></tr>
<tr><td><code>app/todos/page.tsx</code></td><td><code>/todos</code></td></tr>
<tr><td><code>app/todos/[id]/page.tsx</code></td><td><code>/todos/1</code>, <code>/todos/2</code>, ... (<b>dynamic segment</b>)</td></tr>
<tr><td><code>app/api/todos/route.ts</code></td><td><code>/api/todos</code> (returns data, not a page)</td></tr>
<tr><td><code>app/(marketing)/pricing/page.tsx</code></td><td><code>/pricing</code>: a folder in <b>(brackets)</b> groups files without adding to the URL</td></tr>
</table>
<p>A folder is only a public URL if it contains a <code>page.tsx</code> or <code>route.ts</code>. Other files in it (components, helpers) are private.</p>

${step("Special file names")}
<table>
<tr><th>File</th><th>Purpose</th></tr>
<tr><td><code>page.tsx</code></td><td>The page for that URL</td></tr>
<tr><td><code>layout.tsx</code></td><td>Wraps the page <i>and all pages in sub-folders</i>; stays on screen while navigating between them (nav bars, sidebars)</td></tr>
<tr><td><code>route.ts</code></td><td>API endpoint: export <code>GET</code>, <code>POST</code>, <code>PATCH</code>, <code>DELETE</code>... (a folder can't have both <code>page.tsx</code> and <code>route.ts</code>)</td></tr>
<tr><td><code>loading.tsx</code></td><td>Shown instantly while the page in that folder loads</td></tr>
<tr><td><code>error.tsx</code></td><td>Shown if the page in that folder crashes</td></tr>
<tr><td><code>not-found.tsx</code></td><td>Custom 404 page (when <code>notFound()</code> is called or no route matches)</td></tr>
<tr><td><code>proxy.ts</code> (project root)</td><td>Runs before matching requests, e.g. redirect logged-out users. Called <code>middleware.ts</code> before Next.js 16.</td></tr>
</table>

${step("Moving between pages")}
${ts(`import Link from "next/link";

<Link href="/todos">All todos</Link>          // like <a>, but no full page reload
<Link href={\`/todos/\${todo.id}\`}>{todo.text}</Link>`)}
<table>
<tr><th>Need</th><th>Use</th><th>Import from</th></tr>
<tr><td>A clickable link</td><td><code>&lt;Link href="..."&gt;</code></td><td><code>next/link</code></td></tr>
<tr><td>Navigate in code (after a click, in a Client Component)</td><td><code>const router = useRouter(); router.push("/todos")</code></td><td><code>next/navigation</code></td></tr>
<tr><td>Send the user elsewhere from server code</td><td><code>redirect("/login")</code></td><td><code>next/navigation</code></td></tr>
<tr><td>Show the 404 page</td><td><code>notFound()</code></td><td><code>next/navigation</code></td></tr>
</table>
${warn(`<p>Import <code>useRouter</code> from <code>next/navigation</code>, <b>not</b> <code>next/router</code>. The second one is for the old <code>pages/</code> system, and many older tutorials still use it.</p>`)}

${part("Part 3: Server vs Client Components", "The single most important Next.js idea.")}

${plain(`<p>In the App Router, every component is a <b>Server Component</b> unless its file starts with <code>"use client"</code>. Server Components run on the server: they can read the database and secrets, then send finished HTML. <b>Client Components</b> also run in the browser, so they can react to clicks and typing.</p>`)}
<table>
<tr><th>Can it...</th><th>Server Component (default)</th><th>Client Component (<code>"use client"</code>)</th></tr>
<tr><td>Read the database / secrets directly</td><td>✅</td><td>❌</td></tr>
<tr><td>Be an <code>async</code> function and <code>await</code> data</td><td>✅</td><td>❌</td></tr>
<tr><td><code>useState</code>, <code>useEffect</code>, Zustand stores</td><td>❌</td><td>✅</td></tr>
<tr><td><code>onClick</code>, <code>onChange</code> handlers</td><td>❌</td><td>✅</td></tr>
<tr><td>Browser things: <code>window</code>, <code>localStorage</code></td><td>❌</td><td>✅</td></tr>
<tr><td>Add JavaScript to the download</td><td>No</td><td>Yes</td></tr>
</table>
${code(`app/todos/page.tsx          SERVER: reads the database, builds the list
└─ <TodoForm />             CLIENT ("use client"): the input box with useState
   <TodoList todos={...} /> SERVER: just displays what it's given
      └─ <DeleteButton />   CLIENT: needs onClick`, "a typical mix")}
<ul>
<li><b>Put <code>"use client"</code> as low as possible</b>: on the small interactive pieces, not the whole page.</li>
<li>Everything a Client Component <b>imports</b> also becomes client code. That's why database code must never be imported there (see the error in Part 7).</li>
<li>A Server Component can render a Client Component and pass it <b>props</b>, but only data (strings, numbers, plain objects, arrays), not functions. The exception is Server Actions (Part 4).</li>
</ul>
${tip(`<p>Your app's <code>page.tsx</code> is a Client Component (it needs <code>useState</code>, Zustand and clicks), so it gets its data via <code>fetch</code> to the API. Part 4 shows the alternative where the server reads the database itself.</p>`)}

${part("Part 4: Three ways to read and change data")}

<table>
<tr><th></th><th>A. Client + API route</th><th>B. Server Component</th><th>C. Server Action</th></tr>
<tr><td>Used for</td><td>Reading <b>and</b> changing</td><td><b>Reading</b></td><td><b>Changing</b> (forms, buttons)</td></tr>
<tr><td>How</td><td><code>fetch("/api/todos")</code> from the browser</td><td><code>await findAllTodos()</code> in the component</td><td><code>&lt;form action={addTodoAction}&gt;</code></td></tr>
<tr><td>Needs <code>route.ts</code>?</td><td>Yes</td><td>No</td><td>No</td></tr>
<tr><td>Other apps (mobile) can call it?</td><td><b>Yes</b>: it's a real URL</td><td>No</td><td>No</td></tr>
<tr><td>In your app</td><td>✅ what you built</td><td>example below</td><td>example below</td></tr>
</table>
<p>None is "the right one". A is the classic pattern every web developer must know (and it's what Express apps do). B and C are newer, need less code, and are what Next.js recommends inside one app. Knowing all three is a strong interview answer.</p>

${step("B. Read the database in a Server Component")}
<p>A new page at <code>/todos</code>. No <code>"use client"</code>, no API route, no <code>fetch</code>, no <code>useEffect</code>:</p>
${ts(`import Link from "next/link";
import { connection } from "next/server";
import { findAllTodos } from "@/models/todo";
import { addTodoAction } from "./actions";

// A Server Component: no "use client", so it runs on the server
// and can read the database directly. No API route, no fetch.
export default async function TodosPage() {
  await connection(); // render on every request, not once at build time
  const todos = await findAllTodos();

  return (
    <main>
      <h1>Todos (Server Component)</h1>

      <form action={addTodoAction}>
        <input name="text" placeholder="New task..." />
        <button type="submit">Add</button>
      </form>

      <ul>
        {todos.map((t) => (
          <li key={t.id}>
            <Link href={\`/todos/\${t.id}\`}>{t.text}</Link> {t.done ? "✓" : ""}
          </li>
        ))}
      </ul>
    </main>
  );
}`, "app/todos/page.tsx")}
${warn(`<p><b>Why <code>await connection()</code>?</b> We tested it: without that line, the build marks <code>/todos</code> as <b>○ Static</b>. Next.js would query the database <b>once while building</b> and show that same old list forever, even after you add tasks. <code>connection()</code> says "this page depends on the live request", which makes it <b>ƒ Dynamic</b>.</p>`)}
${out(`without connection():   ├ ○ /todos     ← frozen at build time
with connection():      ├ ƒ /todos     ← fresh on every visit`, "npm run build, both versions")}

${step("C. Change data with a Server Action")}
${ts(`"use server";

import { revalidatePath } from "next/cache";
import { createTodo } from "@/models/todo";

// A Server Action: runs on the server, called straight from a <form>.
export async function addTodoAction(formData: FormData) {
  const text = formData.get("text");
  if (typeof text !== "string" || !text.trim()) return;
  await createTodo(text.trim());
  revalidatePath("/todos"); // show the fresh list
}`, "app/todos/actions.ts")}
${plain(`<p><code>"use server"</code> at the top makes every exported function a <b>Server Action</b>. Pass one to a form's <code>action</code>, and on submit Next.js sends the form data to the server, runs the function, and (thanks to <code>revalidatePath</code>) re-renders <code>/todos</code> with the new list. The input's <code>name="text"</code> is how <code>formData.get("text")</code> finds it. We tested it in the browser: typing a task and pressing Enter saved it and refreshed the list.</p>`)}
${warn(`<p>A Server Action is still a public endpoint underneath (a POST request anyone can send). <b>Validate the input</b> (like the <code>typeof</code> check above), and in a real app with logins, check the user is allowed inside every action.</p>`)}
${mongo(`<p>Pattern A is exactly Express: routes + JSON. Patterns B and C have no Express equivalent; they remove the API layer when only your own pages need the data.</p>`)}

${part("Part 5: Dynamic pages, loading and errors")}

${step("A page per todo: app/todos/[id]/page.tsx")}
<p>First add a model function (in <code>models/todo.ts</code>):</p>
${ts(`// Find one todo by id (undefined if it doesn't exist)
export async function findTodoById(id: number): Promise<Todo | undefined> {
  const { rows } = await pool.query<Todo>("SELECT * FROM todos WHERE id = $1", [id]);
  return rows[0];
}`, "models/todo.ts (add)")}
${ts(`import Link from "next/link";
import { notFound } from "next/navigation";
import { findTodoById } from "@/models/todo";

type Props = { params: Promise<{ id: string }> };

// /todos/1, /todos/2, ... one page file for every id
export default async function TodoPage({ params }: Props) {
  const { id } = await params;
  const todo = await findTodoById(Number(id));
  if (!todo) notFound(); // shows the 404 page

  return (
    <main>
      <h1>{todo.text}</h1>
      <p>Status: {todo.done ? "done" : "not done"}</p>
      <Link href="/todos">← Back</Link>
    </main>
  );
}`, "app/todos/[id]/page.tsx")}
<p>Same idea as your API's <code>[id]</code> folder: <code>params</code> is a Promise, so <code>await</code> it, and the id arrives as text, so convert it with <code>Number()</code>. After <code>if (!todo) notFound();</code> TypeScript knows <code>todo</code> exists, because <code>notFound()</code> never returns.</p>

${step("loading.tsx and error.tsx")}
<div class="side">
<div>${ts(`// Shown instantly while a page in this folder is still loading
export default function Loading() {
  return <p>Loading todos...</p>;
}`, "app/todos/loading.tsx")}</div>
<div>${ts(`"use client"; // error pages must be Client Components

// Shown instead of the page if it throws (e.g. the database is down)
export default function Error({ error, retry }: { error: Error; retry: () => void }) {
  return (
    <main>
      <h2>Something went wrong</h2>
      <p>{error.message}</p>
      <button onClick={() => retry()}>Try again</button>
    </main>
  );
}`, "app/todos/error.tsx")}</div>
</div>
<p>Both apply to the folder they're in and its sub-folders (<code>/todos</code> and <code>/todos/[id]</code>). In Next.js 16 the error page's button prop is called <code>retry</code>; older tutorials call it <code>reset</code>.</p>
${tip(`<p>A detail we found while testing: with a <code>loading.tsx</code>, a missing todo (<code>/todos/999999</code>) shows the "could not be found" page, but the HTTP status is <b>200</b>, not 404. The loading screen had already started sending the page, and a status can't change mid-way. Next.js adds a <code>noindex</code> tag so search engines ignore it. This is called a <b>soft 404</b>; it's fine for learning, but good to know about.</p>`)}

${part("Part 6: Route handlers, env variables and more")}

${step("Route handlers: query strings")}
<p>Your API already uses route handlers. To read <code>?q=milk</code> from the URL, type the request as <code>NextRequest</code> and use <code>nextUrl.searchParams</code>:</p>
${ts(`import { NextRequest, NextResponse } from "next/server";
import { searchTodos } from "@/models/todo";

// GET /api/search?q=milk
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  const todos = await searchTodos(q);
  return NextResponse.json(todos);
}`, "app/api/search/route.ts")}
${ts(`// Case-insensitive search. The % wildcards are added to the VALUE, not the SQL.
export async function searchTodos(q: string): Promise<Todo[]> {
  const { rows } = await pool.query<Todo>(
    "SELECT * FROM todos WHERE text ILIKE $1 ORDER BY id",
    [\`%\${q}%\`]
  );
  return rows;
}`, "models/todo.ts (add)")}
${out(`GET /api/search?q=MILK
[{"id":8,"text":"Buy milk","done":false}]`, "tested")}

${step("Environment variables")}
<table>
<tr><th>Rule</th><th>Example</th></tr>
<tr><td>Put them in <code>.env.local</code> (never committed to Git)</td><td><code>DATABASE_URL=postgres://...</code></td></tr>
<tr><td>Server code reads them with <code>process.env</code></td><td><code>process.env.DATABASE_URL</code></td></tr>
<tr><td>The browser <b>can't</b> see them, unless the name starts with <code>NEXT_PUBLIC_</code></td><td><code>NEXT_PUBLIC_APP_NAME=Todo</code></td></tr>
<tr><td><code>NEXT_PUBLIC_</code> values are copied into the browser JavaScript at build time</td><td>So <b>never</b> put a password in a <code>NEXT_PUBLIC_</code> variable</td></tr>
<tr><td>After changing them, restart <code>npm run dev</code></td><td>Our database pool is created once, with the old value</td></tr>
</table>

${step("Sharing state between Client Components (Zustand)")}
${ts(`"use client";

import { useTodoStore } from "@/store/todoStore";

type Props = { label?: string };

// A second component reading the SAME Zustand store as the page.
// No props passed down: both just call useTodoStore().
export function TodoCounter({ label = "Open" }: Props) {
  const openCount = useTodoStore((state) => state.todos.filter((t) => !t.done).length);
  return <p>{label}: {openCount}</p>;
}`, "components/TodoCounter.tsx")}
<p>Put <code>&lt;TodoCounter /&gt;</code> anywhere on the page and it updates whenever the list changes (tested: it showed "Open: 3" once the list loaded). The <code>(state) =&gt; ...</code> part is a <b>selector</b>: the component re-draws only when that number changes.</p>

${step("Smaller things worth knowing")}
<table>
<tr><th>Feature</th><th>How</th></tr>
<tr><td>Page title</td><td><code>export const metadata = { title: "Todos" };</code> in a <code>page.tsx</code> or <code>layout.tsx</code> (Server Components only)</td></tr>
<tr><td>Global CSS</td><td><code>import "./globals.css";</code> in <code>app/layout.tsx</code></td></tr>
<tr><td>Per-component CSS</td><td><code>Button.module.css</code> + <code>import styles from "./Button.module.css"</code>, then <code>className={styles.primary}</code></td></tr>
<tr><td>Images</td><td><code>&lt;Image src="/logo.png" width={100} height={40} alt="" /&gt;</code> from <code>next/image</code>; files go in <code>public/</code></td></tr>
<tr><td>Static files</td><td>Anything in <code>public/</code> is served at <code>/</code>: <code>public/logo.png</code> becomes <code>/logo.png</code></td></tr>
</table>

${part("Part 7: Errors, exercises, interviews")}

<h3>Common errors</h3>
<table>
<tr><th style="width:34%">You see</th><th>Cause and fix</th></tr>
<tr><td><code>Module not found: Can't resolve 'dns'</code> (or <code>'fs'</code>, <code>'net'</code>, <code>'tls'</code>), with "Client Component Browser" in the trace</td><td>Database code got imported into a <code>"use client"</code> file (we caused this on purpose to capture the message). The browser has no network sockets or files. Call an API route or a Server Action instead, and import types with <code>import type</code>.</td></tr>
<tr><td>An error saying <code>useState</code> / <code>useEffect</code> / <code>onClick</code> only works in a Client Component</td><td>Add <code>"use client";</code> at the top of that file, or move the interactive part into its own small client component.</td></tr>
<tr><td>An error saying <code>async</code> Client Components aren't supported</td><td>Only Server Components can be <code>async</code>. In a Client Component, load data in <code>useEffect</code> or a store action.</td></tr>
<tr><td>The page shows old data after adding items</td><td>The page was built as static (○). Add <code>await connection()</code>, or call <code>revalidatePath</code> after changes.</td></tr>
<tr><td>A "hydration" error: the server's HTML didn't match the browser's</td><td>The server HTML and the browser's first draw differ, e.g. rendering <code>Date.now()</code>, <code>Math.random()</code> or <code>localStorage</code> values directly. Read browser-only values inside <code>useEffect</code>.</td></tr>
<tr><td>Type error on <code>params.id</code></td><td><code>params</code> is a Promise in current Next.js: <code>const { id } = await params;</code></td></tr>
<tr><td><code>process.env.X</code> is <code>undefined</code> in the browser</td><td>Only <code>NEXT_PUBLIC_</code> variables reach the browser. Also restart the dev server after editing <code>.env.local</code>.</td></tr>
</table>

<h3>Exercises (build them in your app)</h3>
<ol>
<li><b>About page.</b> Create <code>app/about/page.tsx</code> with a <code>&lt;Link&gt;</code> back to <code>/</code>, and a link to it from the home page.</li>
<li><b>Server-rendered list.</b> Add <code>app/todos/page.tsx</code> from Part 4. Then remove <code>await connection()</code>, run <code>npm run build</code>, and find <code>○ /todos</code> in the output. Put it back.</li>
<li><b>Detail page.</b> Add <code>findTodoById</code> and <code>app/todos/[id]/page.tsx</code>. Visit <code>/todos/1</code> and <code>/todos/999999</code>.</li>
<li><b>See the loading screen.</b> Add <code>loading.tsx</code>, then temporarily put <code>await new Promise((r) =&gt; setTimeout(r, 2000));</code> at the start of the <code>/todos</code> page.</li>
<li><b>See the error screen.</b> Add <code>error.tsx</code>, then temporarily <code>throw new Error("Database is down")</code> in the page. Click Try again.</li>
<li><b>Mark done with a Server Action.</b> In <code>actions.ts</code>, write <code>toggleTodoAction(formData)</code> that reads a hidden <code>&lt;input type="hidden" name="id" value={t.id} /&gt;</code>, calls <code>updateTodoDone</code>, and revalidates <code>/todos</code>. Add a small form with a button to each list item.</li>
<li><b>Search page.</b> Add the search API from Part 6, then a client page <code>app/search/page.tsx</code> with an input that fetches <code>/api/search?q=...</code> as you type.</li>
</ol>

<h3>Interview questions, short answers</h3>
<table>
<tr><th style="width:32%">Question</th><th>Short answer</th></tr>
<tr><td>What is Next.js, versus React?</td><td>React builds UI components. Next.js is a framework on top: file-based routing, server rendering, API routes, and build optimisation in one project.</td></tr>
<tr><td>Server vs Client Components?</td><td>Server Components (the default) run on the server, can read data directly, and send no JavaScript for themselves. Client Components (<code>"use client"</code>) also run in the browser and handle interactivity and state.</td></tr>
<tr><td>Static vs dynamic rendering?</td><td>Static pages are built once at build time and reused (fast). Dynamic pages are rendered per request (fresh data). The build output marks them ○ and ƒ.</td></tr>
<tr><td>How do you fetch data in the App Router?</td><td>In Server Components, by awaiting it directly (database or <code>fetch</code>). In Client Components, via route handlers (API) with <code>fetch</code>, often in a store or hook.</td></tr>
<tr><td>What are Server Actions?</td><td><code>"use server"</code> functions that client forms and buttons can call directly. Used for changing data; they run on the server and can revalidate pages.</td></tr>
<tr><td>Route handler vs Server Action?</td><td>A route handler is a real HTTP API, usable by anyone (mobile apps, other services). A Server Action is for your own app's forms and buttons, with less code.</td></tr>
<tr><td>What is hydration?</td><td>The browser attaching React's interactivity to HTML the server already sent. A mismatch between the two causes hydration errors.</td></tr>
<tr><td>How are secrets kept safe?</td><td>They live in <code>.env.local</code> and are only readable by server code. Anything prefixed <code>NEXT_PUBLIC_</code> is public.</td></tr>
</table>
${interview(`<p>Explaining your own project is the best answer to "walk me through something you built": <i>"The page is a Client Component using a Zustand store. The store calls REST route handlers, which validate input and call a model layer that runs parameterized SQL through a pg pool. I also know the Server Component and Server Action approach, which removes the API layer when only my own pages need the data."</i></p>`)}
`;

export default page("Next.js Mini Guide", body, { compact: true });
