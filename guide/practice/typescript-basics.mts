// TypeScript basics: run with   node guide/practice/typescript-basics.mts
// Node.js 22.18+ runs .ts files directly by stripping the types out.
// Change things, break things, then run `npx tsc --noEmit` to see TypeScript's errors.

// 1. Basic types
const title: string = "Buy milk";
const count: number = 3;
const isDone: boolean = false;
const tags: string[] = ["home", "shopping"];
const note: string | null = null;
console.log("1.", title, count, isDone, tags, note);

// 2. Inference: TypeScript works out the type from the value
let city = "Manila"; // city is a string
city = "Cebu"; // fine
// city = 42;    // Error: Type 'number' is not assignable to type 'string'.
console.log("2.", city);

// 3. Object types
type Todo = {
  id: number;
  text: string;
  done: boolean;
  dueDate?: string; // optional: may be missing
  readonly createdBy: string; // can't be changed after creation
};
const todo: Todo = { id: 1, text: "Learn TS", done: false, createdBy: "me" };
console.log("3.", todo);

// interface: another way to describe an object; can extend other interfaces
interface User {
  id: number;
  name: string;
}
interface Admin extends User {
  permissions: string[];
}
const admin: Admin = { id: 1, name: "Ana", permissions: ["delete"] };
console.log("3b.", admin.name, admin.permissions);

// 4. Functions: type the inputs and the output
function add(a: number, b: number): number {
  return a + b;
}
const greet = (name: string, greeting = "Hi"): string => `${greeting}, ${name}!`;
console.log("4.", add(2, 3), greet("Ana"), greet("Ben", "Hello"));

// 5. Union types + narrowing
type Id = number | string;
function formatId(id: Id): string {
  if (typeof id === "number") return `#${id}`; // here id is a number
  return id.toUpperCase(); // here id must be a string
}
console.log("5.", formatId(7), formatId("abc"));

// Literal union: only these exact strings are allowed
type Filter = "all" | "active" | "done";
function filterTodos(todos: Todo[], filter: Filter): Todo[] {
  if (filter === "active") return todos.filter((t) => !t.done);
  if (filter === "done") return todos.filter((t) => t.done);
  return todos;
}
console.log("5b.", filterTodos([todo], "active").length);

// 6. Discriminated union: one shared field (ok) tells you which shape you have
type Result = { ok: true; data: Todo[] } | { ok: false; error: string };
function describe(result: Result): string {
  if (result.ok) return `got ${result.data.length} todo(s)`;
  return `failed: ${result.error}`;
}
console.log("6.", describe({ ok: true, data: [todo] }), "|", describe({ ok: false, error: "offline" }));

// 7. Generics: one function, any type, still type-safe
function first<T>(items: T[]): T | undefined {
  return items[0];
}
const firstNumber = first([10, 20]); // number | undefined
const firstWord = first(["a", "b"]); // string | undefined
console.log("7.", firstNumber, firstWord);

// 8. Utility types: build new types from existing ones
type NewTodo = Omit<Todo, "id">; // everything except id
type TodoUpdate = Partial<Pick<Todo, "text" | "done">>; // text and/or done, both optional
const draft: NewTodo = { text: "Walk dog", done: false, createdBy: "me" };
const update: TodoUpdate = { done: true };
const counts: Record<Filter, number> = { all: 3, active: 2, done: 1 };
console.log("8.", draft.text, update, counts);

// 9. unknown: like any, but you must check before using it
function parse(json: string): unknown {
  return JSON.parse(json);
}
const data = parse('{"text":"hi"}');
if (typeof data === "object" && data !== null && "text" in data) {
  console.log("9.", data.text);
}

// 10. async functions return Promise<T>
async function loadTodos(): Promise<Todo[]> {
  return [todo];
}
loadTodos().then((todos) => console.log("10.", todos.length, "todo(s) loaded"));
