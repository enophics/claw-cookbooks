# Slack × Claw Managed Agents

`@mention` a Claw [Managed Agent](https://platform.claw.phd/docs/en/managed-agents/overview) in Slack and get the reply in-thread.

```
Slack @mention ──▶ /slack/events ──▶ sessions.create (+ metadata) ──▶ 200
                                              │
                            Claw runs to idle on Enophic infra
                                              │
/cma-webhook ◀── session.status_idled ◀───────┘
      │
      └──▶ sessions.retrieve → read metadata → chat.postMessage
```

The CMA session's `metadata` (`slack_channel`, `slack_thread_ts`) is the entire routing state.

## Quickstart

```bash
cd managed_agents/slack
bun install
claw
```

Then ask: **"walk me through setting this up."** Claw reads [`skill.md`](./skill.md) and drives the config — Slack app, Enophic agent + webhook, env vars, `bun run dev` — in the order that actually works.

## Files

| | |
|---|---|
| `setup/create-agent.ts` | One-time: `agents.create` + `environments.create` |
| `src/main.ts` | Bun server, routes |
| `src/slack-events.ts` | Verify Slack sig, `url_verification`, fire-and-forget kickoff |
| `src/agent.ts` | `sessions.create` + `user.message` with routing metadata |
| `src/cma-webhook.ts` | `beta.webhooks.unwrap` → filter by metadata → `chat.postMessage` |
| `skill.md` | Setup walkthrough, gotchas, debugging |

Requires `@enophic-ai/sdk` ≥ 0.95.1.
