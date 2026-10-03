-- Practice data for the PostgreSQL mini guide.
-- Run it inside a separate database so it never touches your app's data:
--   psql -U postgres -h localhost -c "CREATE DATABASE practice_db;"
--   psql -U postgres -h localhost -d practice_db -f guide/practice/practice.sql
-- Running it again resets everything to this starting point.

DROP TABLE IF EXISTS todos;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id         INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE todos (
  id       INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text     TEXT NOT NULL CHECK (length(text) > 0),
  done     BOOLEAN NOT NULL DEFAULT false,
  priority INTEGER NOT NULL DEFAULT 2 CHECK (priority BETWEEN 1 AND 3)
);

INSERT INTO users (name, email) VALUES
  ('Ana', 'ana@example.com'),
  ('Ben', 'ben@example.com'),
  ('Cy',  'cy@example.com');   -- Cy has no todos on purpose

INSERT INTO todos (user_id, text, done, priority) VALUES
  (1, 'Learn SQL',           true,  1),
  (1, 'Build the to-do app', false, 1),
  (1, 'Buy milk',            false, 3),
  (2, 'Read Next.js docs',   true,  2),
  (2, 'Practice TypeScript', false, 2);
