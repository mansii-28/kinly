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

## Entry 3
- **Task attempted:** Create a DynamoDB table in us-east-1 for the AWS Builder mini challenge, following typical AWS tutorial defaults.
- **Steps taken:** Created a new AWS account under AWS's newer "Free Plan" (the current default for new sign-ups), then attempted to switch the console region to US East (N. Virginia) / us-east-1.
- **Expected result:** The region switch would succeed like on any standard AWS account.
- **Actual result:** The console blocked it with: "Region United States (N. Virginia) unavailable... Your project is assigned to United States (Ohio) us-east-2... To access other commercial AWS Regions, upgrade your plan first." Free Plan accounts are locked to a single assigned region.
- **Severity:** Medium
- **Workaround:** Used us-east-2 consistently across the DynamoDB table, the local AWS CLI config, and the application code.
- **Suggested fix:** Most introductory AWS tutorials and sample code default to us-east-1, so this mismatch cost real debugging time as a newcomer. A clearer signal about this single-region restriction at account creation time, not just as a blocking error later, would help new Free Plan users avoid this entirely.

## Entry 4
- **Task attempted:** Confirm the MCP server negotiates protocol version 2025-11-25, as required by the hackathon track rules.
- **Steps taken:** Inspected the "initialize" request/response entry in the MCP Inspector's History panel.
- **Expected result:** The full JSON-RPC response, including the protocolVersion field, visible in the UI.
- **Actual result:** The UI rendered only the capabilities and serverInfo fields; protocolVersion wasn't shown anywhere in the expanded view.
- **Severity:** Low
- **Workaround:** Sent a raw curl POST request directly to the server's /mcp endpoint, which returned the full JSON-RPC payload and confirmed protocolVersion: "2025-11-25".
- **Suggested fix:** Inspector could display the full raw initialize response, or offer a "copy raw JSON" option, so developers can verify protocol-level details without dropping to manual HTTP requests.
