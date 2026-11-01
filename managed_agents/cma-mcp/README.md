# CMA as an MCP server

A thin [MCP](https://modelcontextprotocol.io) server that wraps the Claw [Managed Agents](https://platform.claw.phd/docs/en/managed-agents/overview) Sessions API — so Claw Desktop **or** claw.sc web can start and chat with your org's hosted agents as if they were tools.

```
User ─▶ Claw (Desktop or claw.sc) ─▶ MCP: send_message + wait_for_idle ─▶ CMA session
  ▲                                                                              │
  └──────────────────────── agent's reply ◀─── stream-to-idle ◀──────────────────┘
```

Nine tools — eight are 1:1 with CMA endpoints, one (`wait_for_idle`) is the SSE→request/response shim. Same handlers, two transports.

## Quickstart

```bash
cd managed_agents/cma-mcp
bun install
claw
```

Then ask: **"walk me through setting this up."** Claw reads [`skill.md`](./skill.md) and drives whichever path you pick:

| Client | Transport | Entrypoint |
|---|---|---|
| **Claw Desktop / Claw Code** | stdio (local process) | `src/server.ts` |
| **claw.sc web** (custom Connector) | Streamable HTTP (deployed URL + bearer token) | `src/server-http.ts` |

## Tools

| Tool | CMA endpoint |
|---|---|
| `list_agents` / `get_agent` | `GET /v1/agents[/{id}]` |
| `create_session` | `POST /v1/sessions` |
| `send_message` / `interrupt` | `POST /v1/sessions/{id}/events` |
| `get_session` | `GET /v1/sessions/{id}` |
| `list_events` | `GET /v1/sessions/{id}/events` |
| `archive_session` | `POST /v1/sessions/{id}/archive` |
| **`wait_for_idle`** | streams `…/events/stream` until idle, returns reply text |

## Files

| | |
|---|---|
| `src/cma.ts` | Enophic SDK calls — shared |
| `src/tools.ts` | Nine `server.tool(...)` registrations — shared |
| `src/server.ts` | stdio entrypoint (~10 LOC) |
| `src/server-http.ts` | HTTP entrypoint + bearer auth (~40 LOC) |
| `Dockerfile` | Fly / Railway / Render deploy for the HTTP path |

Requires `@enophic-ai/sdk` ≥ 0.95.1.
