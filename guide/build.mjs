// NOT part of the to-do app. Builds every study guide into guide/*.pdf.
//   node guide/build.mjs
import { publish } from "./shared.mjs";
import mainGuide from "./build-guide.mjs";
import postgres from "./mini-postgresql.mjs";
import typescript from "./mini-typescript.mjs";
import nextjs from "./mini-nextjs.mjs";

publish("todo-app-guide", mainGuide);
publish("postgresql-mini-guide", postgres);
publish("typescript-mini-guide", typescript);
publish("nextjs-mini-guide", nextjs);
