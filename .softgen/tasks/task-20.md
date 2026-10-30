---
title: Fix OpenAI API integration and tool execution loop
status: todo
priority: urgent
type: bug
tags: [api, openai, bugfix]
created_by: agent
created_at: 2026-10-30T20:10:00Z
position: 20
---

## Notes:
The `/api/smart-conversation` endpoint is throwing 500 errors and failing to write events to Supabase. This was caused by recent updates that broke the OpenAI integration:
1. Calling a non-existent `openai.responses.create()` API instead of standard `chat.completions`.
2. Missing the actual execution loop for function calls (e.g. `create_calendar_event` is never invoked locally, so Supabase is never written to).
3. Passing an invalid tool `type: "mcp"` (from the Ticketmaster integration) directly to OpenAI, which triggers a 400 Bad Request.

## Checklist:
- [ ] Refactor `src/pages/api/smart-conversation.ts` to use `openai.chat.completions.create()` instead of `openai.responses.create()`.
- [ ] Update OpenAI request parameters (`messages` instead of `input`) and response parsing (`choices[0].message.content`).
- [ ] Update token tracking to use correct properties (`prompt_tokens` and `completion_tokens`).
- [ ] Implement the missing tool execution loop: if `response.choices[0].message.tool_calls` exists, execute the corresponding local functions (like `executeFunctionCall` for Supabase writes), append the tool results to the messages array, and send a follow-up request to OpenAI.
- [ ] Filter out the Ticketmaster MCP tool (or any tool without `type: "function"`) from the `tools` array sent to OpenAI to prevent 400 Bad Request errors.

## Acceptance:
- Chat interface works without throwing 500 errors.
- Calendar events and lists successfully save to Supabase when requested in chat.