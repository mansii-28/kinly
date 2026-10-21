# Product Feedback (Draft)

**Tools, APIs, and SDKs used:**
I used the official MCP TypeScript SDK (@modelcontextprotocol/sdk, v1 generation) to build a self-hosted MCP server over Streamable HTTP, implementing protocol version 2025-11-25. I used Node.js, TypeScript, Express, and Zod alongside it. I tested the server using the official MCP Inspector tool.

**What worked well:**
Once I settled on the stable v1 SDK, setup was fast: installing the package, writing a few `server.tool()` calls, and wiring up the Streamable HTTP transport with Express took well under an hour. The MCP Inspector was especially valuable, it let me test every tool call and see real request/response history without needing live Alexa+ access, which doesn't exist yet in public preview.

**What needs work:**
The SDK's documentation currently has two generations live at once: a stable v1 package (`@modelcontextprotocol/sdk`) and a newer v2 (`@modelcontextprotocol/server`), which is explicitly labeled alpha/pre-alpha. As a first-time MCP builder following the top search results and the main GitHub README, it's easy to land on v2 first since it's presented prominently, without realizing it's unstable. I lost time switching from v2 to v1 mid-build. Clearer flagging on the README (not just a small "Important" note) of which generation beginners should use for production or hackathon projects would help.

**Onboarding experience (zero to hello world):**
Fairly smooth once I was on the correct SDK generation. Going from `npm install` to a working, Inspector-verified tool call took under two hours as a first-time MCP builder.

**Would I build with this again? Yes.**
The protocol is well-designed and the Inspector tool made local testing genuinely pleasant. My main ask is just clearer guidance steering newcomers to the stable release.
