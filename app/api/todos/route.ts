import { NextResponse } from "next/server";
import { createTodo, findAllTodos } from "@/models/todo";

// GET /api/todos -> list all todos
export async function GET() {
  const todos = await findAllTodos();
  return NextResponse.json(todos);
}

// POST /api/todos  body: { text } -> create a todo
export async function POST(req: Request) {
  const { text } = await req.json();
  if (typeof text !== "string" || !text.trim()) {
    return NextResponse.json({ error: "text is required" }, { status: 400 });
  }
  const todo = await createTodo(text.trim());
  return NextResponse.json(todo, { status: 201 });
}
