-- Run this once to create the table.
CREATE TABLE IF NOT EXISTS todos (
  id    SERIAL PRIMARY KEY,
  text  TEXT NOT NULL,
  done  BOOLEAN NOT NULL DEFAULT FALSE
);
