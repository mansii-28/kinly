# Kinly

A family coordination and care check-in assistant, built as a self-hosted MCP server for the **Alexa+** track of the Build, Ship, Shape: Amazon Developer Hackathon.

## The problem

Families managing everyday household logistics (chores, errands) alongside caretaking for a relative (medication reminders, wellness check-ins) often juggle multiple disconnected apps, with no shared memory between family members.

## What it does

Kinly exposes a small set of MCP tools that give an assistant persistent, shared family memory:

- **add_task** — add a shared household task or errand
- **list_tasks** — list all open household tasks
- **complete_task** — mark a task done by matching its text
- **log_checkin** — log a wellness or medication check-in for a family member
- **get_family_summary** — a combined natural-language view of open tasks, recent check-ins, and overdue alerts for anyone who hasn't checked in within 24 hours

State persists across sessions and across different people asking, backed by AWS DynamoDB, so one family member can log something and another can ask about it later, from anywhere.

## Tech stack

- Node.js + TypeScript
- `@modelcontextprotocol/sdk` (stable v1 generation, verified to negotiate MCP protocol version 2025-11-25)
- Express, with the Streamable HTTP transport
- Zod for input validation
- AWS DynamoDB for persistent, shared storage (AWS Builder mini challenge)

## Setup

```
npm install
```

## Run the server

```
npx tsx src/index.ts
```

The server listens at `http://localhost:3000/mcp`.

## Testing it

In a separate terminal, run the official MCP Inspector:

```
npx @modelcontextprotocol/inspector
```

In the Inspector UI:
1. Set **Transport Type** to `Streamable HTTP`
2. Set the **URL** to `http://localhost:3000/mcp`
3. Click **Connect**
4. Go to the **Tools** tab to call any of the five tools

## License

MIT, see LICENSE.

## Hackathon

Built for the Alexa+ track of the Build, Ship, Shape: Amazon Developer Hackathon (2026).