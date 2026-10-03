"use client"; // runs in the browser: needed for hooks and click handlers

import { useEffect, useState } from "react";
import { useTodoStore } from "@/store/todoStore";

export default function Home() {
  // Shared state + actions come from the Zustand store
  const { todos, loadTodos, addTodo, toggleTodo, removeTodo } = useTodoStore();

  // Local state: only this page cares what's typed in the box
  const [text, setText] = useState("");

  // Load todos from the database once, when the page opens
  useEffect(() => {
    loadTodos();
  }, [loadTodos]);

  async function handleAdd() {
    if (!text.trim()) return;
    await addTodo(text);
    setText("");
  }

  return (
    <main>
      <h1>To-Do</h1>

      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        placeholder="New task..."
      />
      <button onClick={handleAdd}>Add</button>

      <ul>
        {todos.map((t) => (
          <li key={t.id}>
            <input type="checkbox" checked={t.done} onChange={() => toggleTodo(t)} />
            <span style={{ textDecoration: t.done ? "line-through" : "none" }}>{t.text}</span>
            <button onClick={() => removeTodo(t.id)}>x</button>
          </li>
        ))}
      </ul>
    </main>
  );
}
