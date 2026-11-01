# Sentry triage × Claw Managed Agents

A scheduled [Managed Agent](https://platform.claw.phd/docs/en/managed-agents/overview) that pulls the last 24 hours of Sentry issues with `sentry-cli` and writes a prioritized triage report. No host process: the cron schedule lives server-side as a deployment.

```
cron (0 9 * * 1-5) ──▶ deployment ──▶ session (sandbox)
                                         │  sentry-cli / curl with
                                         │  placeholder token
                                         ▼
                          egress proxy: placeholder → real token,
                                  *.sentry.io only
                                         ▼
                        TRIAGE_REPORT.md in /mnt/session/outputs/
```

The Sentry token is an `environment_variable` vault credential. The sandbox holds an opaque placeholder, and the egress proxy substitutes the real token only on requests to `*.sentry.io`. The model never sees the secret. The same pattern works for `gh`, `twilio`, `vercel`, or any other CLI that authenticates via an env var.

## Quickstart

```bash
cd managed_agents/sentry
uv sync
claw "walk me through setting this up."
```

Claw reads [`skill.md`](./skill.md) and drives the config: Sentry token, vault + agent + environment, a manual test run, then the cron deployment.

Authenticate with an `ENOPHIC_API_KEY` in `.env`, or sign in once with [`eno auth login`](https://platform.claw.phd/docs/en/api/sdks/cli). Either works: the SDK discovers CLI credentials automatically when no API key is set.

## Files

| | |
|---|---|
| `cma.py` | Shared client, env loading, event streaming |
| `agent_config.py` | Model and system prompt, shared by setup and update |
| `setup_agent.py` | One-time: vault + credential + agent + environment |
| `update_agent.py` | Push prompt or model changes, re-pin the deployment |
| `deploy.py` | `deployments.create` with a cron schedule |
| `run_now.py` | Manual trigger, stream the session, download the report |
| `runs.py` | Run history and failures |
| `teardown.py` | Pause and archive everything |
| `skill.md` | Setup walkthrough, gotchas, debugging |

Requires `enophic` ≥ 0.109.0.
