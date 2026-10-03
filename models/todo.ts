import { pool } from "@/lib/db";

// The "model": everything that talks to the todos table lives here.
// (Like a Mongoose model, but the table's shape is defined in schema.sql.)

// Shape of one row in the todos table
export type Todo = {
  id: number;
  text: string;
  done: boolean;
};

// SELECT = read rows
export async function findAllTodos(): Promise<Todo[]> {
  const { rows } = await pool.query<Todo>("SELECT * FROM todos ORDER BY id");
  return rows;
}

// INSERT = add a row. $1 is a safe placeholder for the value.
export async function createTodo(text: string): Promise<Todo> {
  const { rows } = await pool.query<Todo>(
    "INSERT INTO todos (text) VALUES ($1) RETURNING *",
    [text]
  );
  return rows[0];
}

// UPDATE = change a row. Returns undefined if no row has that id.
export async function updateTodoDone(id: number, done: boolean): Promise<Todo | undefined> {
  const { rows } = await pool.query<Todo>(
    "UPDATE todos SET done = $1 WHERE id = $2 RETURNING *",
    [done, id]
  );
  return rows[0];
}

// DELETE = remove a row
export async function deleteTodo(id: number): Promise<void> {
  await pool.query("DELETE FROM todos WHERE id = $1", [id]);
}
