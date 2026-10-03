import { create } from "zustand";
import type { Todo } from "@/models/todo";

// What the store holds: data (todos) + actions (functions that change it)
type TodoStore = {
  todos: Todo[];
  loadTodos: () => Promise<void>;
  addTodo: (text: string) => Promise<void>;
  toggleTodo: (todo: Todo) => Promise<void>;
  removeTodo: (id: number) => Promise<void>;
};

// create() makes a hook. Any component can call useTodoStore() to read or change it.
// set = replace part of the state; get = read the current state.
export const useTodoStore = create<TodoStore>((set, get) => ({
  todos: [],

  loadTodos: async () => {
    const res = await fetch("/api/todos");
    set({ todos: await res.json() });
  },

  addTodo: async (text) => {
    await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    await get().loadTodos();
  },

  toggleTodo: async (todo) => {
    await fetch(`/api/todos/${todo.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done: !todo.done }),
    });
    await get().loadTodos();
  },

  removeTodo: async (id) => {
    await fetch(`/api/todos/${id}`, { method: "DELETE" });
    await get().loadTodos();
  },
}));
