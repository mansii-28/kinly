import express from "express";
import { randomUUID } from "node:crypto";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";

const ddbClient = new DynamoDBClient({ region: "us-east-2" });
const ddb = DynamoDBDocumentClient.from(ddbClient);
const TABLE_NAME = "KinlyData";
const ITEM_ID = "kinly-db";

type Task = { id: string; text: string; done: boolean };
type Checkin = { id: string; person: string; note: string; time: string };
type DB = { tasks: Task[]; checkins: Checkin[] };

async function loadDb(): Promise<DB> {
  try {
    const res = await ddb.send(new GetCommand({ TableName: TABLE_NAME, Key: { id: ITEM_ID } }));
    if (!res.Item) return { tasks: [], checkins: [] };
    return JSON.parse(res.Item.data);
  } catch (err) {
    console.error("DynamoDB load error:", err);
    return { tasks: [], checkins: [] };
  }
}

async function saveDb(db: DB) {
  await ddb.send(new PutCommand({ TableName: TABLE_NAME, Item: { id: ITEM_ID, data: JSON.stringify(db) } }));
}

function buildServer() {
  const server = new McpServer({ name: "kinly", version: "0.2.0" });

  server.tool(
    "add_task",
    "Add a shared household task or errand for the family to see.",
    { text: z.string().describe("What needs to get done") },
    async ({ text }) => {
      const db = await loadDb();
      const task: Task = { id: randomUUID(), text, done: false };
      db.tasks.push(task);
      await saveDb(db);
      return { content: [{ type: "text", text: `Added task: "${text}"` }] };
    }
  );

  server.tool(
    "list_tasks",
    "List all open (not yet done) household tasks.",
    {},
    async () => {
      const db = await loadDb();
      const open = db.tasks.filter((t) => !t.done);
      const text = open.length ? open.map((t) => `- ${t.text}`).join("\n") : "No open tasks right now.";
      return { content: [{ type: "text", text }] };
    }
  );

  server.tool(
    "complete_task",
    "Mark a household task as done by matching its text.",
    { text: z.string().describe("Text or partial text of the task to complete") },
    async ({ text }) => {
      const db = await loadDb();
      const match = db.tasks.find((t) => !t.done && t.text.toLowerCase().includes(text.toLowerCase()));
      if (!match) return { content: [{ type: "text", text: `No open task found matching "${text}".` }] };
      match.done = true;
      await saveDb(db);
      return { content: [{ type: "text", text: `Marked "${match.text}" as done.` }] };
    }
  );

  server.tool(
    "log_checkin",
    "Log a wellness or medication check-in for a family member.",
    { person: z.string().describe("Who checked in, e.g. 'Mom'"), note: z.string().describe("e.g. 'took morning meds'") },
    async ({ person, note }) => {
      const db = await loadDb();
      const entry: Checkin = { id: randomUUID(), person, note, time: new Date().toISOString() };
      db.checkins.push(entry);
      await saveDb(db);
      return { content: [{ type: "text", text: `Logged check-in for ${person}: ${note}` }] };
    }
  );

  server.tool(
    "get_family_summary",
    "Get a combined summary of open tasks, recent care check-ins, and overdue alerts.",
    {},
    async () => {
      const db = await loadDb();
      const openTasks = db.tasks.filter((t) => !t.done);
      const recentCheckins = db.checkins.slice(-5).reverse();

      const OVERDUE_HOURS = 24;
      const now = Date.now();
      const lastCheckinByPerson: Record<string, string> = {};
      for (const c of db.checkins) {
        if (!lastCheckinByPerson[c.person] || c.time > lastCheckinByPerson[c.person]) {
          lastCheckinByPerson[c.person] = c.time;
        }
      }
      const overduePeople = Object.entries(lastCheckinByPerson)
        .filter(([, time]) => now - new Date(time).getTime() > OVERDUE_HOURS * 60 * 60 * 1000)
        .map(([person]) => person);

      let text = "--- Kinly Family Summary ---\n\n";
      text += `Open tasks (${openTasks.length}):\n`;
      text += openTasks.length ? openTasks.map((t) => `  - ${t.text}`).join("\n") : "  (none)";
      text += "\n\nRecent check-ins:\n";
      text += recentCheckins.length ? recentCheckins.map((c) => `  - ${c.person}: ${c.note} (${c.time})`).join("\n") : "  (none yet)";
      text += "\n\nAlerts:\n";
      text += overduePeople.length ? overduePeople.map((p) => `  - ${p} has not checked in for over ${OVERDUE_HOURS} hours`).join("\n") : "  (none, everyone is up to date)";

      return { content: [{ type: "text", text }] };
    }
  );

  return server;
}

const app = express();
app.use(express.json());

app.post("/mcp", async (req, res) => {
  const server = buildServer();
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  res.on("close", () => { transport.close(); server.close(); });
  await server.connect(transport);
  await transport.handleRequest(req, res, req.body);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => { console.log(`Kinly MCP server listening on http://localhost:${PORT}/mcp`); });