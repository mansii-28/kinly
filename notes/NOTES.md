# Progress Notes

## Day 1 — Oct 20, 2026
- Locked track: Alexa+
- Locked idea: Kinly — a family coordination + care check-in MCP server
- Set up kinly repo (public, MIT license)
- Installed MCP SDK v1 (@modelcontextprotocol/sdk, stable, supports protocol 2025-11-25)
- Built and tested 4 working tools via Streamable HTTP + MCP Inspector:
  - add_task
  - list_tasks
  - log_checkin
  - get_family_summary
- Added 5th tool: complete_task (matches by task text)
- Verified full round trip: add → complete → list → summarize, all correct
- Committed and pushed working server to GitHub

## Day 2 — Oct 21, 2026
- Added complete_task tool (matches open tasks by text)
- Verified full round trip in MCP Inspector: add → complete → list → summarize
- Drafted Product Feedback based on real SDK experience (v1 vs v2 generation)
- Built overdue check-in alert logic inside get_family_summary (24hr threshold)
- Completed AWS Builder mini challenge: migrated storage from a local JSON file to AWS DynamoDB
  - Created an AWS account (Free Plan), hit a region restriction (locked to us-east-2), adjusted all config accordingly
  - Created a scoped IAM user and access key, configured local AWS CLI credentials
  - Verified real data round-trips through DynamoDB via Inspector and direct inspection of the KinlyData table in the AWS console
- Verified MCP protocol version compliance (2025-11-25) via a raw curl request after the Inspector UI didn't surface that field
- Updated README with an architecture diagram, design decisions, and a roadmap section

## Day 3 — Oct 22, 2026
- (fill in as the day happens)
