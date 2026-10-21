import express from "express";
import { randomUUID } from "node:crypto";
import fs from "node:fs";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

// --- Tiny persistent storage (a JSON file, so state survives restarts) ---
const DB_PATH = "./data.json";
type Task = { id: string; text: string; done: boolean };
type Checkin = { id: string; person: string; note: string; time: string };
type DB = { tasks: Task[]; checkins: Checkin[] };

function loadDb(): DB {
  if (!fs.existsSync(DB_PATH)) return { tasks: [], checkins: [] };
  return JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
}
function saveDb(db: DB) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

// --- Build one MCP server instance (shared logic for every connection) ---
function buildServer() {
  const server = new McpServer({ name: "kinly", version: "0.1.0" });

  server.tool(
    "add_task",
    "Add a shared household task or errand for the family to see.",
    { text: z.string().describe("What needs to get done") },
    async ({ text }) => {
      const db = loadDb();
      const task: Task = { id: randomUUID(), text, done: false };
      db.tasks.push(task);
      saveDb(db);
      return { content: [{ type: "text", text: `Added task: "${text}"` }] };
    }
  );

  server.tool(
    "list_tasks",
    "List all open (not yet done) household tasks.",
    {},
    async () => {
      const db = loadDb();
      const open = db.tasks.filter((t) => !t.done);
      const text = open.length
        ? open.map((t) => `- ${t.text}`).join("\n")
        : "No open tasks right now.";
      return { content: [{ type: "text", text }] };
    }
  );

  server.tool(
    "log_checkin",
    "Log a wellness or medication check-in for a family member.",
    {
      person: z.string().describe("Who checked in, e.g. 'Mom'"),
      note: z.string().describe("e.g. 'took morning meds' or 'feeling fine'"),
    },
    async ({ person, note }) => {
      const db = loadDb();
      const entry: Checkin = {
        id: randomUUID(),
        person,
        note,
        time: new Date().toISOString(),
      };
      db.checkins.push(entry);
      saveDb(db);
      return {
        content: [{ type: "text", text: `Logged check-in for ${person}: ${note}` }],
      };
    }
  );

  server.tool(
    "complete_task",
    "Mark a household task as done by matching its text.",
    { text: z.string().describe("Text or partial text of the task to complete") },
    async ({ text }) => {
      const db = loadDb();
      const match = db.tasks.find(
        (t) => !t.done && t.text.toLowerCase().includes(text.toLowerCase())
      );
      if (!match) {
        return {
          content: [{ type: "text", text: `No open task found matching "${text}".` }],
        };
      }
      match.done = true;
      saveDb(db);
      return {
        content: [{ type: "text", text: `Marked "${match.text}" as done.` }],
      };
    }
  );

  server.tool(
    "get_family_summary",
    "Get a combined summary of open tasks and recent care check-ins.",
    {},
    async () => {
      const db = loadDb();
      const openTasks = db.tasks.filter((t) => !t.done);
      const recentCheckins = db.checkins.slice(-5).reverse();

      let text = "--- Kinly Family Summary ---\n\n";
      text += `Open tasks (${openTasks.length}):\n`;
      text += openTasks.length
        ? openTasks.map((t) => `  - ${t.text}`).join("\n")
        : "  (none)";
      text += "\n\nRecent check-ins:\n";
      text += recentCheckins.length
        ? recentCheckins
            .map((c) => `  - ${c.person}: ${c.note} (${c.time})`)
            .join("\n")
        : "  (none yet)";

      return { content: [{ type: "text", text }] };
    }
  );

  return server;
}

// --- Streamable HTTP wiring (what Alexa+ / MCP Inspector connects to) ---
const app = express();
app.use(express.json());

app.post("/mcp", async (req, res) => {
  const server = buildServer();
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
  });
  res.on("close", () => {
    transport.close();
    server.close();
  });
  await server.connect(transport);
  await transport.handleRequest(req, res, req.body);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Kinly MCP server listening on http://localhost:${PORT}/mcp`);
});