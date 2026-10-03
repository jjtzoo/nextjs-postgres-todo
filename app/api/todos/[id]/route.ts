import { NextResponse } from "next/server";
import { deleteTodo, updateTodoDone } from "@/models/todo";

type Ctx = { params: Promise<{ id: string }> };

// PATCH /api/todos/:id  body: { done } -> update a todo
export async function PATCH(req: Request, { params }: Ctx) {
  const { id } = await params;
  const { done } = await req.json();
  if (typeof done !== "boolean") {
    return NextResponse.json({ error: "done must be true or false" }, { status: 400 });
  }
  const todo = await updateTodoDone(Number(id), done);
  if (!todo) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json(todo);
}

// DELETE /api/todos/:id -> remove a todo
export async function DELETE(_req: Request, { params }: Ctx) {
  const { id } = await params;
  await deleteTodo(Number(id));
  return new NextResponse(null, { status: 204 });
}
