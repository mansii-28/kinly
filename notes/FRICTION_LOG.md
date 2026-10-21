# Friction Log

## Entry 1
- **Task attempted:** Connect to the Kinly MCP server using the official MCP Inspector tool over Streamable HTTP.
- **Steps taken:** Ran `npx @modelcontextprotocol/inspector` in a separate terminal from the running server, pointed it at http://localhost:3000/mcp.
- **Expected result:** A fully silent, error-free connection.
- **Actual result:** The browser-based Inspector UI connected successfully and all tools worked, but a second terminal instance logged a 404 error: "Failed to open SSE stream: Not Found." This came from the client trying to open an optional GET /mcp notification stream that our server doesn't implement, since we only implemented the required POST /mcp endpoint.
- **Severity:** Low
- **Workaround:** None needed, core tool-calling functionality is unaffected.
- **Suggested fix:** The MCP SDK docs could more clearly state that the GET endpoint (for server-to-client push notifications) is optional for a stateless Streamable HTTP server, so developers aren't alarmed by this error during normal testing.

## Entry 2
- **Task attempted:** Test the `complete_task` tool's text-matching logic against existing open tasks.
- **Steps taken:** Called `add_task` with "Buy milk" multiple times across different testing sessions (due to the server's file-based storage persisting between restarts), then called `complete_task` with "milk."
- **Expected result:** The single matching task would be marked done, and summaries would reflect zero open tasks.
- **Actual result:** `complete_task` correctly completed the first matching task it found, but duplicate "Buy milk" entries from earlier test runs remained open, which looked like a bug until we traced it back to accumulated test data, not faulty logic.
- **Severity:** Medium (specific to real-world use, not a bug in our code)
- **Workaround:** Deleted the local data file and added it to .gitignore to prevent stale data from polluting future tests.
- **Suggested fix:** For a production voice assistant use case, matching tasks by exact text alone is fragile when duplicates exist. A real implementation should likely use short IDs or timestamps a user can reference, or de-duplicate on add.
