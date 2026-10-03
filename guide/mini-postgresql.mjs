// NOT part of the to-do app. Builds postgresql-mini-guide.pdf.
// Every output below was captured by running the query against practice_db
// (loaded from guide/practice/practice.sql).
import { code, ps, sql, ts, out, run, plain, tip, warn, interview, part, makeStep, page } from "./shared.mjs";

const step = makeStep();

const body = `
<h1>PostgreSQL Mini Guide</h1>
<div class="sub">Just enough SQL to build apps and pass interviews, with real outputs to compare against</div>

<p>This guide teaches PostgreSQL with a tiny practice database: <b>users</b> who own <b>todos</b>. Every query has its <b>real output</b> printed underneath, so you can type it yourself and check that you got the same thing.</p>
<table class="toc">
<tr><td>Part 1</td><td>How PostgreSQL is organised, and setting up the practice database</td></tr>
<tr><td>Part 2</td><td>Reading data: SELECT, WHERE, ORDER BY, LIMIT</td></tr>
<tr><td>Part 3</td><td>Counting and grouping: COUNT, GROUP BY, HAVING</td></tr>
<tr><td>Part 4</td><td>JOINs: combining tables</td></tr>
<tr><td>Part 5</td><td>Changing data, constraints, transactions</td></tr>
<tr><td>Part 6</td><td>Changing tables, indexes, using SQL from Node.js</td></tr>
<tr><td>Part 7</td><td>Exercises (with answers) and interview questions</td></tr>
</table>

${part("Part 1: The big picture", "Server → databases → tables → rows.")}

<h3>How it's organised</h3>
${code(`PostgreSQL server   (one program, port 5432, installed once per computer)
├─ todo_app         (a database: your app's data)
│  └─ todos         (a table)
└─ practice_db      (another database: this guide)
   ├─ users         (a table: columns id, name, email, created_at)
   └─ todos         (a table: columns id, user_id, text, done, priority)`, "the layers")}
<table>
<tr><th>Word</th><th>Meaning</th><th>MongoDB word</th></tr>
<tr><td>Database</td><td>A container for one app's tables</td><td>Database</td></tr>
<tr><td>Table</td><td>A list of things of one kind, with fixed columns</td><td>Collection</td></tr>
<tr><td>Row</td><td>One thing (one user, one todo)</td><td>Document</td></tr>
<tr><td>Column</td><td>One field, with one type, the same in every row</td><td>Field</td></tr>
<tr><td>Primary key</td><td>The column that uniquely identifies a row (<code>id</code>)</td><td><code>_id</code></td></tr>
<tr><td>Foreign key</td><td>A column pointing at another table's primary key (<code>todos.user_id</code> &rarr; <code>users.id</code>)</td><td>A stored ObjectId reference</td></tr>
</table>

${step("Set up the practice database")}
<p>Create a separate database so you never touch your app's data, then load the practice file. Run these from the <code>todo-app</code> folder:</p>
${ps(`psql -U postgres -h localhost -c "CREATE DATABASE practice_db;"
psql -U postgres -h localhost -d practice_db -f guide/practice/practice.sql`)}
<p>Then open it and type the queries in this guide:</p>
${ps("psql -U postgres -h localhost -d practice_db")}
${tip(`<p><b>Made a mess? Run the <code>-f guide/practice/practice.sql</code> command again.</b> It deletes and recreates both tables with the starting data. In pgAdmin you can also open the file in the Query Tool and press F5.</p>`)}

${step("Read the practice tables")}
${code(`CREATE TABLE users (
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
);`, "guide/practice/practice.sql (tables)")}
<table>
<tr><th>Piece</th><th>Meaning</th></tr>
<tr><td><code>GENERATED ALWAYS AS IDENTITY</code></td><td>Postgres numbers the rows 1, 2, 3... The modern version of <code>SERIAL</code> (your app uses <code>SERIAL</code>; both work).</td></tr>
<tr><td><code>PRIMARY KEY</code></td><td>Unique and never empty. Every table should have one.</td></tr>
<tr><td><code>NOT NULL</code></td><td>A value is required.</td></tr>
<tr><td><code>UNIQUE</code></td><td>No two rows can have the same value (no duplicate emails).</td></tr>
<tr><td><code>DEFAULT ...</code></td><td>The value used when you don't give one.</td></tr>
<tr><td><code>CHECK (...)</code></td><td>A rule every row must pass, e.g. priority must be 1, 2 or 3.</td></tr>
<tr><td><code>REFERENCES users(id)</code></td><td><b>Foreign key</b>: <code>user_id</code> must be a real user's id.</td></tr>
<tr><td><code>ON DELETE CASCADE</code></td><td>When a user is deleted, delete their todos too.</td></tr>
</table>
<p>The starting data: Ana has 3 todos, Ben has 2, and <b>Cy has none</b> (on purpose, for the JOIN section).</p>

<h3>Data types you'll actually use</h3>
<table>
<tr><th>Type</th><th>Holds</th><th>Example</th></tr>
<tr><td><code>INTEGER</code> / <code>BIGINT</code></td><td>Whole numbers (BIGINT for huge ones)</td><td><code>42</code></td></tr>
<tr><td><code>NUMERIC(10,2)</code></td><td>Exact decimals: use for <b>money</b></td><td><code>19.99</code></td></tr>
<tr><td><code>TEXT</code></td><td>Any string. <code>VARCHAR(n)</code> = with a max length</td><td><code>'Buy milk'</code></td></tr>
<tr><td><code>BOOLEAN</code></td><td>true / false (psql prints <code>t</code> / <code>f</code>)</td><td><code>true</code></td></tr>
<tr><td><code>DATE</code></td><td>A calendar day</td><td><code>'2026-10-03'</code></td></tr>
<tr><td><code>TIMESTAMPTZ</code></td><td>A moment in time, with time zone. Prefer it over <code>TIMESTAMP</code></td><td><code>now()</code></td></tr>
<tr><td><code>UUID</code></td><td>A random unique id</td><td><code>gen_random_uuid()</code></td></tr>
<tr><td><code>JSONB</code></td><td>Any JSON: Mongo-style data inside Postgres</td><td><code>'{"tags":["home"]}'</code></td></tr>
</table>
${plain(`<p>Strings use <b>single quotes</b>: <code>'Ana'</code>. Double quotes mean a <i>name</i> (of a table or column), not text. This trips up almost everyone coming from JavaScript.</p>`)}

${part("Part 2: Reading data", "SELECT is 80% of what you'll write.")}

${step("SELECT: pick columns")}
${run("SELECT id, name, email FROM users;", ` id | name |      email
----+------+-----------------
  1 | Ana  | ana@example.com
  2 | Ben  | ben@example.com
  3 | Cy   | cy@example.com
(3 rows)`)}
<p><code>SELECT *</code> means "all columns". In app code, list the columns you need; it's clearer and faster.</p>

${step("WHERE + ORDER BY: filter and sort")}
${run("SELECT text, priority FROM todos WHERE done = false ORDER BY priority, text;", `        text         | priority
---------------------+----------
 Build the to-do app |        1
 Practice TypeScript |        2
 Buy milk            |        3
(3 rows)`)}
<p><code>ORDER BY priority, text</code> sorts by priority first, then by text when priorities tie. Add <code>DESC</code> for largest first.</p>

${step("More ways to filter")}
${run("SELECT text FROM todos WHERE text ILIKE '%next%';", `       text
-------------------
 Read Next.js docs
(1 row)`)}
${run("SELECT text FROM todos WHERE priority IN (1, 3) AND NOT done;", `        text
---------------------
 Build the to-do app
 Buy milk
(2 rows)`)}
<table>
<tr><th>Operator</th><th>Meaning</th></tr>
<tr><td><code>=</code>, <code>&lt;&gt;</code>, <code>&lt;</code>, <code>&gt;=</code></td><td>Equal, not equal, less, greater-or-equal (one <code>=</code>, not <code>===</code>)</td></tr>
<tr><td><code>AND</code>, <code>OR</code>, <code>NOT</code></td><td>Combine conditions</td></tr>
<tr><td><code>IN (1, 3)</code></td><td>Equals any value in the list</td></tr>
<tr><td><code>BETWEEN 1 AND 3</code></td><td>In a range, ends included</td></tr>
<tr><td><code>LIKE 'Buy%'</code></td><td>Pattern: <code>%</code> = any characters. <code>ILIKE</code> = ignore upper/lower case</td></tr>
<tr><td><code>IS NULL</code>, <code>IS NOT NULL</code></td><td>Check for empty values. <code>= NULL</code> never works!</td></tr>
</table>

${step("LIMIT: only the first few")}
${run("SELECT id, text FROM todos ORDER BY id DESC LIMIT 2;", ` id |        text
----+---------------------
  5 | Practice TypeScript
  4 | Read Next.js docs
(2 rows)`)}
<p>"The 2 newest todos." Always pair <code>LIMIT</code> with <code>ORDER BY</code>, otherwise "first" means "whatever order the database felt like". For page 2, 3...: <code>LIMIT 10 OFFSET 10</code>.</p>

${part("Part 3: Counting and grouping", "Turning many rows into a few numbers.")}

${step("COUNT and friends")}
${run("SELECT COUNT(*) FROM todos;", ` count
-------
     5
(1 row)`)}
<p>Other <b>aggregate</b> functions: <code>SUM(x)</code>, <code>AVG(x)</code>, <code>MIN(x)</code>, <code>MAX(x)</code>.</p>

${step("GROUP BY: one result per group")}
${run("SELECT done, COUNT(*) AS how_many FROM todos GROUP BY done ORDER BY done;", ` done | how_many
------+----------
 f    |        3
 t    |        2
(2 rows)`)}
${plain(`<p>GROUP BY sorts the rows into piles (here: done = false, done = true), then <code>COUNT(*)</code> counts each pile. <code>AS how_many</code> names the result column.</p>`)}

${step("HAVING: filter the groups")}
${run("SELECT user_id, COUNT(*) AS total FROM todos GROUP BY user_id HAVING COUNT(*) > 2;", ` user_id | total
---------+-------
       1 |     3
(1 row)`)}
<p><b>WHERE</b> filters rows <i>before</i> grouping; <b>HAVING</b> filters groups <i>after</i>. "Users with more than 2 todos" needs HAVING, because the count only exists after grouping.</p>

${part("Part 4: JOINs", "The reason relational databases exist.")}

${step("JOIN: combine rows from two tables")}
<p>A todo stores only <code>user_id</code>. To show the user's <b>name</b> next to each todo, join the two tables where the ids match:</p>
${run(`SELECT users.name, todos.text
FROM todos
JOIN users ON users.id = todos.user_id
ORDER BY users.name, todos.id;`, ` name |        text
------+---------------------
 Ana  | Learn SQL
 Ana  | Build the to-do app
 Ana  | Buy milk
 Ben  | Read Next.js docs
 Ben  | Practice TypeScript
(5 rows)`)}
${plain(`<p>Read <code>JOIN users ON users.id = todos.user_id</code> as: "for each todo, find the user whose id equals this todo's user_id, and glue that user's columns onto the row". Write <code>table.column</code> when both tables have a column with the same name (both have <code>id</code>).</p>`)}

${step("LEFT JOIN: keep rows with no match")}
<p>Count todos per user. Compare the two kinds of join:</p>
<div class="side">
<div>${run(`SELECT users.name,
  COUNT(todos.id) AS todo_count
FROM users
JOIN todos
  ON todos.user_id = users.id
GROUP BY users.name
ORDER BY users.name;`, ` name | todo_count
------+------------
 Ana  |          3
 Ben  |          2
(2 rows)`, "SQL: JOIN (inner)")}</div>
<div>${run(`SELECT users.name,
  COUNT(todos.id) AS todo_count
FROM users
LEFT JOIN todos
  ON todos.user_id = users.id
GROUP BY users.name
ORDER BY users.name;`, ` name | todo_count
------+------------
 Ana  |          3
 Ben  |          2
 Cy   |          0
(3 rows)`, "SQL: LEFT JOIN")}</div>
</div>
<table>
<tr><th>Join</th><th>Keeps</th><th>Cy (no todos)</th></tr>
<tr><td><code>JOIN</code> (= <code>INNER JOIN</code>)</td><td>Only rows that match on both sides</td><td>Disappears</td></tr>
<tr><td><code>LEFT JOIN</code></td><td>Every row of the left table (<code>users</code>); missing right side becomes NULL</td><td>Kept, with 0</td></tr>
</table>
${tip(`<p>Use <code>COUNT(todos.id)</code>, not <code>COUNT(*)</code>, with a LEFT JOIN. <code>COUNT(column)</code> skips NULLs, so Cy gets 0. <code>COUNT(*)</code> counts the row itself and would give Cy 1.</p>`)}

${part("Part 5: Changing data", "INSERT, UPDATE, DELETE, and the rules that protect your data.")}
${warn(`<p>The queries in this part <b>change</b> the data, and each one continues from the previous. Run them in order. To start over, reload <code>practice.sql</code>.</p>`)}

${step("INSERT ... RETURNING")}
${run("INSERT INTO todos (user_id, text) VALUES (3, 'Say hi') RETURNING id, text, done, priority;", ` id |  text  | done | priority
----+--------+------+----------
  6 | Say hi | f    |        2
(1 row)

INSERT 0 1`)}
<p>Columns you leave out get their <code>DEFAULT</code> (done = false, priority = 2). <code>RETURNING</code> hands back the new row, which is how your app's <code>createTodo</code> gets the new <code>id</code>.</p>

${step("UPDATE")}
${run("UPDATE todos SET done = true WHERE id = 2 RETURNING id, text, done;", ` id |        text         | done
----+---------------------+------
  2 | Build the to-do app | t
(1 row)

UPDATE 1`)}

${step("DELETE")}
${run("DELETE FROM todos WHERE done = true;", "DELETE 3")}
${warn(`<p><b>UPDATE or DELETE without WHERE changes every row.</b> <code>DELETE FROM todos;</code> empties the table, with no undo. Write the WHERE first, or test it as a SELECT: <code>SELECT * FROM todos WHERE done = true;</code>, then swap SELECT * for DELETE.</p>`)}

${step("Constraints say no")}
<p>This is the big win over plain JavaScript objects: the database itself refuses bad data, even if your app has a bug. Each of these fails:</p>
${run("INSERT INTO users (name, email) VALUES ('Ana Two', 'ana@example.com');", `ERROR:  duplicate key value violates unique constraint "users_email_key"
DETAIL:  Key (email)=(ana@example.com) already exists.`, "SQL: UNIQUE")}
${run("INSERT INTO todos (user_id, text) VALUES (99, 'Ghost task');", `ERROR:  insert or update on table "todos" violates foreign key constraint "todos_user_id_fkey"
DETAIL:  Key (user_id)=(99) is not present in table "users".`, "SQL: FOREIGN KEY")}
${run("INSERT INTO todos (user_id, text, priority) VALUES (1, 'Too urgent', 5);", `ERROR:  new row for relation "todos" violates check constraint "todos_priority_check"
DETAIL:  Failing row contains (8, 1, Too urgent, f, 5).`, "SQL: CHECK")}
${run("INSERT INTO todos (user_id) VALUES (1);", `ERROR:  null value in column "text" of relation "todos" violates not-null constraint
DETAIL:  Failing row contains (9, 1, null, f, 2).`, "SQL: NOT NULL")}
${plain(`<p>Notice the ids <b>8</b> and <b>9</b> in the last two errors, although the last successful insert was 6. Every attempt takes the next number, even if it fails. <b>Ids can have gaps</b>; never assume they're 1, 2, 3 with nothing missing.</p>`)}

${step("ON DELETE CASCADE")}
${run("DELETE FROM users WHERE email = 'ben@example.com';", "DELETE 1")}
${run("SELECT COUNT(*) FROM todos WHERE user_id = 2;", ` count
-------
     0
(1 row)`)}
<p>Deleting Ben deleted Ben's todos automatically. Without <code>ON DELETE CASCADE</code>, the delete would fail with a foreign key error instead. Both are valid designs.</p>

${step("Transactions: all or nothing")}
${run(`BEGIN;
UPDATE todos SET text = 'OOPS';
ROLLBACK;
SELECT id, text FROM todos ORDER BY id;`, `BEGIN
UPDATE 2
ROLLBACK
 id |   text
----+----------
  3 | Buy milk
  6 | Say hi
(2 rows)`)}
${plain(`<p>Between <code>BEGIN</code> and <code>COMMIT</code>, changes are temporary. <code>ROLLBACK</code> throws them all away; that "oops, no WHERE" update never happened. The classic example is a bank transfer: take money from A <i>and</i> give it to B. Both must happen, or neither.</p>`)}

${part("Part 6: Tables, indexes and Node.js")}

${step("ALTER TABLE: change a table that already has data")}
${run("ALTER TABLE todos ADD COLUMN due_date DATE;", "ALTER TABLE")}
<p>Existing rows get NULL in the new column. Others: <code>DROP COLUMN due_date</code>, <code>RENAME COLUMN text TO title</code>, and <code>DROP TABLE todos;</code> to delete a whole table.</p>

${step("Indexes: make lookups fast")}
${run("CREATE INDEX todos_user_id_idx ON todos (user_id);", "CREATE INDEX")}
${run("EXPLAIN SELECT * FROM todos WHERE user_id = 1;", `                      QUERY PLAN
------------------------------------------------------
 Seq Scan on todos  (cost=0.00..1.02 rows=1 width=49)
   Filter: (user_id = 1)
(2 rows)`)}
${plain(`<p>An <b>index</b> is like the index at the back of a book: instead of reading every page (<b>Seq Scan</b> = check every row), jump straight to the right ones. <code>EXPLAIN</code> shows Postgres's plan.</p>
<p>Here it <i>still</i> chose a Seq Scan, because the table has 2 rows and reading them all is faster than using the index. With thousands of rows, the plan switches to an <b>Index Scan</b>. Indexes speed up reads but slow down writes slightly and take space, so add them on columns you search or join by (like <code>user_id</code>), not everywhere. Primary keys and UNIQUE columns get one automatically.</p>`)}

${step("Inspect a table: \\d")}
${run("\\d todos", `                           Table "public.todos"
  Column  |  Type   | Collation | Nullable |           Default
----------+---------+-----------+----------+------------------------------
 id       | integer |           | not null | generated always as identity
 user_id  | integer |           | not null |
 text     | text    |           | not null |
 done     | boolean |           | not null | false
 priority | integer |           | not null | 2
 due_date | date    |           |          |
Indexes:
    "todos_pkey" PRIMARY KEY, btree (id)
    "todos_user_id_idx" btree (user_id)
Check constraints:
    "todos_priority_check" CHECK (priority >= 1 AND priority <= 3)
    "todos_text_check" CHECK (length(text) > 0)
Foreign-key constraints:
    "todos_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE`, "psql")}
<p>Everything you defined, and the names Postgres gave your constraints. Those names are what you saw in the error messages.</p>

${step("Using SQL from Node.js (the pg library)")}
<table>
<tr><th>You write</th><th>You get back</th></tr>
<tr><td><code>await pool.query("SELECT ...")</code></td><td><code>result.rows</code>: an array of plain objects, like <code>[{ id: 1, text: "Buy milk", done: false }]</code></td></tr>
<tr><td><code>await pool.query("UPDATE ...")</code></td><td><code>result.rowCount</code>: how many rows changed</td></tr>
<tr><td><code>pool.query("... WHERE id = $1", [id])</code></td><td>Values go in the array, never inside the SQL string</td></tr>
</table>
${warn(`<p><b>SQL injection.</b> Never build SQL by gluing strings: <code>"... WHERE email = '" + email + "'"</code>. A user could type <code>' OR '1'='1</code> and change your query. With <code>$1</code>, the value is sent separately and can never become SQL. For LIKE searches, add the <code>%</code> to the value: <code>pool.query("... WHERE text ILIKE $1", ["%" + q + "%"])</code>.</p>`)}
<p>A <b>transaction</b> needs one connection for every statement, so borrow one from the pool:</p>
${ts(`import { pool } from "@/lib/db";

// Move every unfinished todo from one user to another: all or nothing.
export async function reassignTodos(fromUserId: number, toUserId: number): Promise<number> {
  const client = await pool.connect(); // borrow ONE connection for the whole transaction
  try {
    await client.query("BEGIN");
    const result = await client.query(
      "UPDATE todos SET user_id = $1 WHERE user_id = $2 AND NOT done",
      [toUserId, fromUserId]
    );
    await client.query("COMMIT");
    return result.rowCount ?? 0;
  } catch (err) {
    await client.query("ROLLBACK"); // undo everything since BEGIN
    throw err;
  } finally {
    client.release(); // always give the connection back
  }
}`, "lib/transfer-example.ts (type-checked)")}

${part("Part 7: Practice", "Reload practice.sql first, so you start from the original data.")}

<h3>Exercises</h3>
<p>Try each one yourself before looking at the answers on the next page.</p>
<ol>
<li>List the names of users who have at least one <b>unfinished</b> todo (each name once).</li>
<li>How many todos are there per priority, priority 1 first?</li>
<li>Which users have <b>no</b> todos at all?</li>
<li>Show every user with their number of <b>unfinished</b> todos, <b>including</b> users with zero.</li>
<li>Mark all of Ben's todos as done, finding Ben by his email (not by typing his id).</li>
</ol>

<h3 style="break-before: page">Answers</h3>
<h4>1. Users with unfinished todos</h4>
${run(`SELECT DISTINCT users.name
FROM users
JOIN todos ON todos.user_id = users.id
WHERE NOT todos.done
ORDER BY users.name;`, ` name
------
 Ana
 Ben
(2 rows)`)}
<p><code>DISTINCT</code> removes duplicates; Ana has two unfinished todos but appears once.</p>
<h4>2. Todos per priority</h4>
${run(`SELECT priority, COUNT(*) AS how_many
FROM todos
GROUP BY priority
ORDER BY priority;`, ` priority | how_many
----------+----------
        1 |        2
        2 |        2
        3 |        1
(3 rows)`)}
<h4>3. Users with no todos</h4>
${run(`SELECT users.name
FROM users
LEFT JOIN todos ON todos.user_id = users.id
WHERE todos.id IS NULL;`, ` name
------
 Cy
(1 row)`)}
<p>LEFT JOIN keeps Cy with NULLs on the todo side; <code>WHERE todos.id IS NULL</code> keeps only those.</p>
<h4>4. Unfinished todos per user, including zero (the classic trap)</h4>
<div class="side">
<div>${run(`SELECT users.name,
  COUNT(todos.id) AS open_todos
FROM users
LEFT JOIN todos
  ON todos.user_id = users.id
  AND NOT todos.done
GROUP BY users.name
ORDER BY users.name;`, ` name | open_todos
------+------------
 Ana  |          2
 Ben  |          1
 Cy   |          0
(3 rows)`, "SQL: correct (condition in ON)")}</div>
<div>${run(`SELECT users.name,
  COUNT(todos.id) AS open_todos
FROM users
LEFT JOIN todos
  ON todos.user_id = users.id
WHERE NOT todos.done
GROUP BY users.name
ORDER BY users.name;`, ` name | open_todos
------+------------
 Ana  |          2
 Ben  |          1
(2 rows)`, "SQL: wrong (condition in WHERE)")}</div>
</div>
${plain(`<p>Both look almost the same, but in the wrong version <b>Cy disappears</b>. The LEFT JOIN gives Cy a row with NULLs, then <code>WHERE NOT todos.done</code> runs, and NULL isn't "not done", so the row is thrown away. Putting the condition in <code>ON</code> filters the todos <i>while joining</i>, so Cy survives with 0. This exact bug is a favourite interview question.</p>`)}
<h4>5. Update using a subquery</h4>
${run(`UPDATE todos SET done = true
WHERE user_id = (SELECT id FROM users WHERE email = 'ben@example.com')
RETURNING text, done;`, `        text         | done
---------------------+------
 Read Next.js docs   | t
 Practice TypeScript | t
(2 rows)

UPDATE 2`)}
<p>The query in brackets runs first and returns Ben's id. Real apps rarely know ids by heart, so this pattern is common.</p>

<h3>Interview questions, short answers</h3>
<table>
<tr><th style="width:32%">Question</th><th>Short answer</th></tr>
<tr><td>SQL vs NoSQL?</td><td>SQL: fixed tables, relationships, JOINs, strong rules (users, orders, payments). NoSQL (e.g. MongoDB): flexible documents, nested data, easy to change shape. Postgres can also store JSON in JSONB columns.</td></tr>
<tr><td>Primary key vs foreign key?</td><td>A primary key uniquely identifies a row in its own table. A foreign key is a column that points to another table's primary key and must match a real row.</td></tr>
<tr><td>INNER vs LEFT JOIN?</td><td>INNER keeps only matching rows. LEFT keeps every row of the left table and fills missing matches with NULL.</td></tr>
<tr><td>WHERE vs HAVING?</td><td>WHERE filters rows before grouping; HAVING filters groups after GROUP BY.</td></tr>
<tr><td>What is an index? Downsides?</td><td>A lookup structure that finds rows without scanning the whole table. It costs disk space and slows down inserts and updates a little.</td></tr>
<tr><td>What is a transaction / ACID?</td><td>A group of statements that succeed or fail together. ACID: Atomic (all or nothing), Consistent (rules hold), Isolated (transactions don't see each other's half-done work), Durable (committed data survives a crash).</td></tr>
<tr><td>What is normalization?</td><td>Storing each fact once and linking with keys, e.g. the user's name lives in <code>users</code> only, and <code>todos</code> stores <code>user_id</code>. That avoids copies getting out of sync.</td></tr>
<tr><td>How do you prevent SQL injection?</td><td>Parameterized queries (<code>$1</code>, <code>$2</code>), never string concatenation.</td></tr>
<tr><td>What is the N+1 problem?</td><td>Loading 100 todos, then running 1 extra query per todo for its user (101 queries). Fix it with one JOIN.</td></tr>
</table>
${interview(`<p>When asked to write a query, say your plan out loud first: <i>"I need users and their todos, so I'll join on user_id; I want users with zero too, so LEFT JOIN; then group by user and count."</i> Interviewers grade the reasoning as much as the final SQL.</p>`)}
`;

export default page("PostgreSQL Mini Guide", body, { compact: true });
