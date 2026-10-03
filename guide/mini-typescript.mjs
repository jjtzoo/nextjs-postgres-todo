// NOT part of the to-do app. Builds typescript-mini-guide.pdf.
// Outputs come from running guide/practice/typescript-basics.mts with node;
// error messages come from compiling deliberately broken code with tsc.
import { ps, ts, out, plain, tip, warn, interview, part, makeStep, page } from "./shared.mjs";

const step = makeStep();

const body = `
<h1>TypeScript Mini Guide</h1>
<div class="sub">JavaScript with a safety net: the parts you need for Next.js and interviews</div>

<p>TypeScript is JavaScript plus <b>types</b>: labels that say what kind of value something is. An editor and the <code>tsc</code> checker read those labels and warn you about mistakes <b>before</b> you run the code. When the code runs, the types are simply removed; it's plain JavaScript again.</p>
<table class="toc">
<tr><td>Part 1</td><td>How TypeScript works, and how to practise</td></tr>
<tr><td>Part 2</td><td>The core: basic types, objects, functions</td></tr>
<tr><td>Part 3</td><td>Unions and narrowing (the most useful idea)</td></tr>
<tr><td>Part 4</td><td>Generics, utility types, unknown</td></tr>
<tr><td>Part 5</td><td>TypeScript in React and Next.js</td></tr>
<tr><td>Part 6</td><td>Reading error messages, exercises, interview questions</td></tr>
</table>

${part("Part 1: How it works")}

<div class="flow">
<div class="n"><b>You write</b><small>.ts / .tsx with types</small></div><span class="a">&rarr;</span>
<div class="n"><b>tsc / editor checks</b><small>red squiggles = mistakes</small></div><span class="a">&rarr;</span>
<div class="n"><b>Types removed</b><small>plain JavaScript</small></div><span class="a">&rarr;</span>
<div class="n db"><b>Runs</b><small>browser or Node.js</small></div>
</div>
${plain(`<p>Types exist only <b>while you code</b>. They never check anything at runtime. If an API sends you <code>{"done":"yes"}</code> when your type says <code>done: boolean</code>, TypeScript can't stop that. That's why your API routes still check <code>typeof done !== "boolean"</code>.</p>`)}

${step("Practise with the runnable file")}
<p>Node.js can run TypeScript files directly (it strips the types out, no setup). From the <code>todo-app</code> folder:</p>
${ps("node guide/practice/typescript-basics.mts")}
${out(`1. Buy milk 3 false [ 'home', 'shopping' ] null
2. Cebu
3. { id: 1, text: 'Learn TS', done: false, createdBy: 'me' }
3b. Ana [ 'delete' ]
4. 5 Hi, Ana! Hello, Ben!
5. #7 ABC
5b. 1
6. got 1 todo(s) | failed: offline
7. 10 a
8. Walk dog { done: true } { all: 3, active: 2, done: 1 }
9. hi
10. 1 todo(s) loaded`)}
<p>Node <b>doesn't check</b> types; it only removes them. To check, run the TypeScript checker on the whole project:</p>
${ps("npx tsc --noEmit")}
<p>No output means no errors. <code>--noEmit</code> = check only, don't write any files. Practise by breaking things in the file (e.g. <code>city = 42;</code>) and running both commands.</p>

${part("Part 2: The core")}

${step("Basic types")}
${ts(`const title: string = "Buy milk";
const count: number = 3;            // no int/float split: all numbers are number
const isDone: boolean = false;
const tags: string[] = ["home", "shopping"];   // array of strings
const note: string | null = null;   // a string OR null`)}
${out(`1. Buy milk 3 false [ 'home', 'shopping' ] null`)}

${step("Inference: you rarely write the type")}
${ts(`let city = "Manila"; // TypeScript infers: string
city = "Cebu";       // fine
city = 42;           // error: Type 'number' is not assignable to type 'string'.`)}
${tip(`<p>Let TypeScript infer local variables. <b>Do</b> write types for function parameters, function return values, and object shapes you share between files. Those are the boundaries where mistakes sneak in.</p>`)}

${step("Object types: type and interface")}
${ts(`type Todo = {
  id: number;
  text: string;
  done: boolean;
  dueDate?: string;           // ? = optional (may be missing)
  readonly createdBy: string; // can't be reassigned
};
const todo: Todo = { id: 1, text: "Learn TS", done: false, createdBy: "me" };

interface User { id: number; name: string }
interface Admin extends User { permissions: string[] }   // Admin = User + more
const admin: Admin = { id: 1, name: "Ana", permissions: ["delete"] };`)}
${out(`3. { id: 1, text: 'Learn TS', done: false, createdBy: 'me' }
3b. Ana [ 'delete' ]`)}
<table>
<tr><th></th><th><code>type</code></th><th><code>interface</code></th></tr>
<tr><td>Describe an object</td><td>Yes</td><td>Yes</td></tr>
<tr><td>Unions like <code>"a" | "b"</code></td><td><b>Yes</b></td><td>No</td></tr>
<tr><td>Extend another</td><td><code>A &amp; { more }</code></td><td><code>extends</code></td></tr>
</table>
<p>Both are fine. A simple rule: use <code>type</code> by default (our app does), and <code>interface</code> when you want <code>extends</code>.</p>

${step("Functions")}
${ts(`function add(a: number, b: number): number {   // inputs and output typed
  return a + b;
}
const greet = (name: string, greeting = "Hi"): string => \`\${greeting}, \${name}!\`;
// greeting has a default value, so its type (string) is inferred and it's optional

add(2, 3);           // 5
greet("Ana");        // "Hi, Ana!"
greet("Ben", "Hello");`)}
${out(`4. 5 Hi, Ana! Hello, Ben!`)}
<p>A function that returns nothing has return type <code>void</code>. An <code>async</code> function returning a <code>Todo[]</code> has return type <code>Promise&lt;Todo[]&gt;</code>, like <code>findAllTodos()</code> in your model.</p>

${part("Part 3: Unions and narrowing", "The idea you'll use every day.")}

${step("Union types: one of several")}
${ts(`type Id = number | string;

function formatId(id: Id): string {
  if (typeof id === "number") return \`#\${id}\`; // inside this if: id is number
  return id.toUpperCase();                      // after it: id must be string
}`)}
${out(`5. #7 ABC`)}
${plain(`<p><b>Narrowing</b> means TypeScript follows your <code>if</code> checks. After <code>typeof id === "number"</code> it <i>knows</i> id is a number inside that branch, so number methods are allowed. Other checks that narrow: <code>if (x)</code> (not null/undefined), <code>x === "done"</code>, <code>"text" in obj</code>, <code>Array.isArray(x)</code>.</p>`)}

${step("Literal types: only these exact values")}
${ts(`type Filter = "all" | "active" | "done";

function filterTodos(todos: Todo[], filter: Filter): Todo[] {
  if (filter === "active") return todos.filter((t) => !t.done);
  if (filter === "done") return todos.filter((t) => t.done);
  return todos;
}
filterTodos(list, "active");   // ok
filterTodos(list, "finished"); // error: not one of the three allowed strings`)}
<p>Your editor autocompletes the three options. This is perfect for the "filter" practice exercise in the main guide.</p>

${step("Discriminated unions: shapes with a tag")}
${ts(`type Result =
  | { ok: true; data: Todo[] }
  | { ok: false; error: string };

function describe(result: Result): string {
  if (result.ok) return \`got \${result.data.length} todo(s)\`; // here: has data
  return \`failed: \${result.error}\`;                         // here: has error
}`)}
${out(`6. got 1 todo(s) | failed: offline`)}
<p>The shared <code>ok</code> field tells TypeScript which shape you have. You <i>can't</i> read <code>result.data</code> without checking <code>ok</code> first, so it's impossible to forget error handling.</p>

${part("Part 4: Generics and friends")}

${step("Generics: types as parameters")}
${ts(`function first<T>(items: T[]): T | undefined {
  return items[0];
}
const n = first([10, 20]);    // T = number  → n: number | undefined
const s = first(["a", "b"]);  // T = string  → s: string | undefined`)}
${out(`7. 10 a`)}
<p><code>&lt;T&gt;</code> is a placeholder filled in when the function is used. You already use generics everywhere:</p>
<table>
<tr><th>Code in your app</th><th>Meaning</th></tr>
<tr><td><code>Todo[]</code> (= <code>Array&lt;Todo&gt;</code>)</td><td>An array of Todos</td></tr>
<tr><td><code>Promise&lt;Todo[]&gt;</code></td><td>"Later, you'll get an array of Todos"</td></tr>
<tr><td><code>pool.query&lt;Todo&gt;(...)</code></td><td>"Each row from this query is a Todo"</td></tr>
<tr><td><code>create&lt;TodoStore&gt;(...)</code></td><td>"This Zustand store has the TodoStore shape"</td></tr>
<tr><td><code>useState&lt;Todo[]&gt;([])</code></td><td>"This state is an array of Todos" (needed because <code>[]</code> alone says nothing)</td></tr>
</table>

${step("Utility types: build new types from old ones")}
${ts(`type NewTodo    = Omit<Todo, "id">;                       // everything except id
type TodoUpdate = Partial<Pick<Todo, "text" | "done">>;   // text and/or done, optional
type Counts     = Record<Filter, number>;                 // { all, active, done }: numbers

const draft: NewTodo = { text: "Walk dog", done: false, createdBy: "me" };
const update: TodoUpdate = { done: true };
const counts: Counts = { all: 3, active: 2, done: 1 };`)}
${out(`8. Walk dog { done: true } { all: 3, active: 2, done: 1 }`)}
<table>
<tr><th>Utility</th><th>Makes</th></tr>
<tr><td><code>Partial&lt;T&gt;</code></td><td>Every field optional (great for "update" data)</td></tr>
<tr><td><code>Required&lt;T&gt;</code></td><td>Every field required</td></tr>
<tr><td><code>Pick&lt;T, "a" | "b"&gt;</code></td><td>Only those fields</td></tr>
<tr><td><code>Omit&lt;T, "a"&gt;</code></td><td>All fields except those (great for "create" data with no id yet)</td></tr>
<tr><td><code>Record&lt;K, V&gt;</code></td><td>An object with keys K and values V</td></tr>
</table>

${step("any vs unknown")}
${ts(`function parse(json: string): unknown {
  return JSON.parse(json);
}
const data = parse('{"text":"hi"}');
// data.text;  ← error: you must check what it is first
if (typeof data === "object" && data !== null && "text" in data) {
  console.log(data.text);   // allowed after the checks
}`)}
${out(`9. hi`)}
${warn(`<p><code>any</code> switches TypeScript <b>off</b> for that value: anything goes, no help, no errors. <code>unknown</code> means "I don't know yet, make me check". Use <code>unknown</code> for data from outside (JSON, APIs, user input). Avoid <code>any</code>.</p>`)}

${step("Type-only imports")}
${ts(`import type { Todo } from "@/models/todo";`)}
<p>Brings in <b>only the type</b>; it's erased completely when the code runs. That's how your Zustand store (browser code) safely uses <code>Todo</code> from the model file, which also imports the database library. That library never ends up in the browser.</p>

${part("Part 5: TypeScript in React and Next.js")}

${step("Typing component props")}
${ts(`"use client";

import type { Todo } from "@/models/todo";

type TodoItemProps = {
  todo: Todo;
  onToggle: (todo: Todo) => void;   // a function prop: takes a Todo, returns nothing
  onDelete: (id: number) => void;
};

export function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    console.log("checked is now", e.target.checked);
    onToggle(todo);
  }

  return (
    <li>
      <input type="checkbox" checked={todo.done} onChange={handleChange} />
      {todo.text}
      <button onClick={() => onDelete(todo.id)}>x</button>
    </li>
  );
}`, "components/TodoItem.tsx (type-checked in a test copy of the app)")}
<p>Now <code>&lt;TodoItem todo={t} /&gt;</code> without <code>onToggle</code> and <code>onDelete</code> is an error, and so is a typo like <code>todo.txt</code> inside.</p>

${step("Common React and Next.js types")}
<table>
<tr><th>Type</th><th>Use it for</th></tr>
<tr><td><code>React.ReactNode</code></td><td>Anything renderable: the type of <code>children</code> (see your <code>layout.tsx</code>)</td></tr>
<tr><td><code>React.ChangeEvent&lt;HTMLInputElement&gt;</code></td><td>The <code>e</code> in an input's <code>onChange</code></td></tr>
<tr><td><code>React.FormEvent&lt;HTMLFormElement&gt;</code></td><td>The <code>e</code> in a form's <code>onSubmit</code></td></tr>
<tr><td><code>React.MouseEvent&lt;HTMLButtonElement&gt;</code></td><td>The <code>e</code> in a button's <code>onClick</code></td></tr>
<tr><td><code>useState&lt;Todo | null&gt;(null)</code></td><td>State that starts empty and holds a Todo later</td></tr>
<tr><td><code>{ params: Promise&lt;{ id: string }&gt; }</code></td><td>Props of a Next.js page or route in an <code>[id]</code> folder</td></tr>
<tr><td><code>Request</code> / <code>NextRequest</code>, <code>NextResponse</code></td><td>Route handler input and output (<code>app/api/.../route.ts</code>)</td></tr>
</table>
${tip(`<p>Don't memorise event types. Write the handler inline once, e.g. <code>onChange={(e) =&gt; ...}</code>, hover over <code>e</code> in VS Code, and copy the type it shows you.</p>`)}

${step("The tsconfig settings that matter")}
<table>
<tr><th>Setting</th><th>Effect</th></tr>
<tr><td><code>"strict": true</code></td><td>Turns on the important checks, including the two below. Keep it on.</td></tr>
<tr><td>strictNullChecks (part of strict)</td><td><code>null</code> and <code>undefined</code> aren't allowed unless the type says so. Catches the #1 JavaScript bug: "cannot read properties of undefined".</td></tr>
<tr><td>noImplicitAny (part of strict)</td><td>A parameter with no type and nothing to infer from is an error, not a silent <code>any</code>.</td></tr>
<tr><td><code>"paths": { "@/*": ["./*"] }</code></td><td>The <code>@/</code> import shortcut.</td></tr>
</table>

${part("Part 6: Errors, exercises, interviews")}

<h3>Reading error messages</h3>
<p>These are real messages from compiling broken code. Each has a code (TS + number) you can search for.</p>
<table>
<tr><th style="width:38%">Code that's wrong</th><th>What tsc says, and the fix</th></tr>
<tr><td><code>let city = "Manila";<br>city = 42;</code></td><td><code>TS2322: Type 'number' is not assignable to type 'string'.</code><br>The variable was inferred as a string. Use a string, or type it <code>string | number</code> if both are really allowed.</td></tr>
<tr><td><code>const a: Todo = { id: 1, text: "Walk dog" };</code></td><td><code>TS2741: Property 'done' is missing in type '{ id: number; text: string; }' but required in type 'Todo'.</code><br>Add <code>done</code>, or make it optional in the type (<code>done?: boolean</code>).</td></tr>
<tr><td><code>{ id: 2, text: "Feed cat", done: false, colour: "red" }</code></td><td><code>TS2353: Object literal may only specify known properties, and 'colour' does not exist in type 'Todo'.</code><br>A typo or a field the type doesn't have.</td></tr>
<tr><td><code>return todo.dueDate.length;</code></td><td><code>TS18048: 'todo.dueDate' is possibly 'undefined'.</code><br>It's optional. Check first (<code>if (todo.dueDate)</code>) or use <code>todo.dueDate?.length ?? 0</code>.</td></tr>
<tr><td><code>function echo(x) { return x; }</code></td><td><code>TS7006: Parameter 'x' implicitly has an 'any' type.</code><br>Give the parameter a type: <code>(x: string)</code>.</td></tr>
<tr><td><code>todos[0].txt</code></td><td><code>TS2551: Property 'txt' does not exist on type 'Todo'. Did you mean 'text'?</code><br>A typo. TypeScript even suggests the fix.</td></tr>
<tr><td><code>function getText(todo: Todo): string {<br>&nbsp;&nbsp;if (todo.done) return todo.text;<br>}</code></td><td><code>TS2366: Function lacks ending return statement and return type does not include 'undefined'.</code><br>Some paths return nothing. Add a final <code>return</code>, or change the return type to <code>string | undefined</code>.</td></tr>
</table>
${tip(`<p>Read the message <b>right to left</b>: "X is not assignable to <b>Y</b>" = "you promised Y, but gave X".</p>`)}

<h3>Exercises</h3>
<p>Write these in <code>guide/practice/typescript-basics.mts</code>, then run <code>node</code> and <code>npx tsc --noEmit</code>.</p>
<ol>
<li>Write <code>type Priority = 1 | 2 | 3</code> and add <code>priority: Priority</code> to <code>Todo</code>. What happens if you set 5?</li>
<li>Write <code>countOpen(todos: Todo[]): number</code> that returns how many are not done.</li>
<li>Write <code>type TodoPatch = Partial&lt;Omit&lt;Todo, "id" | "createdBy"&gt;&gt;</code>. Which fields can it hold?</li>
<li>Write a generic <code>last&lt;T&gt;(items: T[]): T | undefined</code>.</li>
<li>Write <code>type ApiResult&lt;T&gt; = { ok: true; data: T } | { ok: false; error: string }</code> and a function that turns it into a message.</li>
</ol>
<h4>Answers</h4>
${ts(`// 1. Setting priority: 5 → TS2322: Type '5' is not assignable to type 'Priority'.
type Priority = 1 | 2 | 3;

// 2.
function countOpen(todos: Todo[]): number {
  return todos.filter((t) => !t.done).length;
}

// 3. text, done, dueDate (and priority, after exercise 1), all optional; id and createdBy removed

// 4.
function last<T>(items: T[]): T | undefined {
  return items[items.length - 1];
}

// 5.
type ApiResult<T> = { ok: true; data: T } | { ok: false; error: string };
function message<T>(result: ApiResult<T>): string {
  return result.ok ? "Success" : \`Error: \${result.error}\`;
}`)}

<h3>Interview questions, short answers</h3>
<table>
<tr><th style="width:32%">Question</th><th>Short answer</th></tr>
<tr><td>Why use TypeScript?</td><td>Catches mistakes before running the code, gives autocomplete, and documents the shape of data. Refactoring is safer because the checker finds every place that breaks.</td></tr>
<tr><td>Does TypeScript check at runtime?</td><td>No. Types are erased. Data from outside (APIs, forms) still needs runtime checks or a validation library like Zod.</td></tr>
<tr><td><code>type</code> vs <code>interface</code>?</td><td>Both describe objects. Only <code>type</code> can do unions; <code>interface</code> uses <code>extends</code> and can be reopened. Pick one style and be consistent.</td></tr>
<tr><td><code>any</code> vs <code>unknown</code>?</td><td><code>any</code> disables checking. <code>unknown</code> forces you to narrow before use. Prefer <code>unknown</code>.</td></tr>
<tr><td>What are generics?</td><td>Type parameters, like <code>Array&lt;T&gt;</code> or <code>Promise&lt;T&gt;</code>, so one function or type works with many types and stays safe.</td></tr>
<tr><td>What is narrowing?</td><td>TypeScript refining a type from your checks (<code>typeof</code>, <code>in</code>, <code>===</code>, truthiness), e.g. <code>string | number</code> becomes <code>number</code> inside <code>if (typeof x === "number")</code>.</td></tr>
<tr><td>What does <code>?</code> do in a type?</td><td>Marks a property optional: it may be missing, so its type includes <code>undefined</code>.</td></tr>
</table>
${interview(`<p>A good line to have ready: <i>"I keep types at the boundaries: the database row type in the model, request checks in the API routes, and props on components. Inside functions I let TypeScript infer."</i></p>`)}
`;

export default page("TypeScript Mini Guide", body, { compact: true });
