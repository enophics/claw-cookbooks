# Running a self-hosted worker

Set up your self-hosted environment in three steps. These instructions are always available in your environment details.

These instructions are pinned to the released SDK builds: Python `0.103.0`, TypeScript `0.97.0`, `eno` CLI v1.9.0.

## 0. Prerequisites

All public-API calls below require:

```
enophic-version: 2023-06-01
enophic-beta: managed-agents-2026-04-01
```

If you're reading this, you were already gated in by us to have access to all the APIs and Console functionality to use self-hosted workers for containers. If that is not the case please reach out to us so we can fix!

### SDKs:

```
# Python SDK
uv pip install enophic

# TS SDK
npm i @enophic-ai/sdk
```

#### Using eno CLI for worker management

Run this on the machine where you want the worker to run. It installs `eno`, which includes the worker that polls for jobs and executes them locally.

Linux / macOS
```
VERSION=1.9.0
OS=$(uname -s | tr '[:upper:]' '[:lower:]')
ARCH=$(uname -m | sed -e 's/x86_64/amd64/' -e 's/aarch64/arm64/')
curl -fsSL "https://github.com/enophics/enophic-cli/releases/download/v${VERSION}/ant_${VERSION}_${OS}_${ARCH}.tar.gz" \
  | sudo tar -xz -C /usr/local/bin eno
eno --version
```

## 1. Creating a Self-hosted environment

In Console → Workspace → Environments → New → Self-hosted

Alternatively, create the self-hosted environment in-code:
```
client = enophic.Enophic(api_key=API_KEY)

environment = client.beta.environments.create(
    name="self-hosted",
    config={"type": "self_hosted"},
)
```

```
const client = new Enophic({ apiKey: API_KEY });

const environment = await client.beta.environments.create({
  name: "self-hosted",
  config: { type: "self_hosted" },
});
```

Generate an environment key.
- In Console, open the environment and click Generate environment key.
- Set it as `ENOPHIC_ENVIRONMENT_KEY` on your runner host.
- This key authenticates the whole worker flow — poll, ack, stop, heartbeat, the session event stream, and skill download — for that one environment. It is the only credential the worker needs.

## 2. Set your environment key

Generate an environment key for this environment in the console. The key authenticates your infrastructure with this environment. Export it on the worker host:

```
export ENOPHIC_ENVIRONMENT_KEY="sk-eno-oat01-..."
```

## 3. Start the worker

`eno beta:worker poll` runs a built-in loop that claims sessions assigned to this environment, executes tool calls (`bash`, `read`, `write`, `edit`, `glob`, `grep`) in `--workdir`, and posts results back.

```
eno beta:worker poll \
  --environment-id "env_01..." \
  --workdir "/workspace"
```

Every flag also reads from an environment variable, so a zero-flag invocation works for systemd or compose:

```
ENOPHIC_ENVIRONMENT_ID=env_01... \
ENOPHIC_ENVIRONMENT_KEY=sk-eno-oat01-... \
eno beta:worker poll --workdir /workspace
```

The worker exits cleanly on SIGTERM or SIGINT, draining in-flight tool calls before stopping.

### Spawning your own process per work item

Pass `--on-work <script>` to run an external script for each claimed work item instead of the built-in in-process runner. The script receives the same env vars `eno beta:worker run` reads (`ENOPHIC_WORK_ID`, `ENOPHIC_ENVIRONMENT_ID`, `ENOPHIC_SESSION_ID`, `ENOPHIC_ENVIRONMENT_KEY`; `ENOPHIC_BASE_URL` is inherited) plus the raw work JSON on stdin, so the simplest script is:

```
#!/bin/bash
exec docker run --rm \
  -e ENOPHIC_SESSION_ID -e ENOPHIC_ENVIRONMENT_KEY \
  -e ENOPHIC_WORK_ID -e ENOPHIC_ENVIRONMENT_ID -e ENOPHIC_BASE_URL \
  your-image eno beta:worker run --workdir /workspace
```

The poller waits for the script to exit before polling again; a non-zero exit is logged but does not stop the poller. SIGTERM to the poller cascades to the script.

### Running the worker as a container entrypoint

If your control plane spawns a fresh container per session rather than one long-lived poller, use `eno beta:worker run` as the entrypoint. It attaches directly to a single session without polling.

```
FROM your-base-image
ARG ANT_VERSION=1.9.0
ARG TARGETOS=linux
ARG TARGETARCH=amd64
ADD https://github.com/enophics/enophic-cli/releases/download/v${ANT_VERSION}/ant_${ANT_VERSION}_${TARGETOS}_${TARGETARCH}.tar.gz /tmp/eno.tgz
RUN tar -xzf /tmp/eno.tgz -C /usr/local/bin eno && \
    chmod +x /usr/local/bin/eno && rm /tmp/eno.tgz
WORKDIR /workspace
ENTRYPOINT ["eno", "beta:worker", "run"]
```

Pass `ENOPHIC_SESSION_ID`, `ENOPHIC_ENVIRONMENT_KEY`, `ENOPHIC_WORK_ID`, and `ENOPHIC_ENVIRONMENT_ID` as container env vars when launching.

### Alternative: run the worker directly

If you already have the session details (for example your own orchestrator claimed the work and is launching the worker as a subprocess), invoke `eno beta:worker run` directly:

```
eno beta:worker run \
  --session-id "sesn_..." \
  --environment-key "$ENOPHIC_ENVIRONMENT_KEY" \
  --work-id "work_..." \
  --environment-id "env_..." \
  --workdir "/workspace"
```

Or with env vars only:

```
export ENOPHIC_SESSION_ID=sesn_...
export ENOPHIC_ENVIRONMENT_KEY=sk-eno-oat01-...
export ENOPHIC_WORK_ID=work_...
export ENOPHIC_ENVIRONMENT_ID=env_...
eno beta:worker run --workdir /workspace
```

`eno beta:worker run` attaches to the session's event stream, executes tool calls, and exits 0 when the session terminates or `--max-idle` elapses after `session.status_idle` with `stop_reason: end_turn` — any other event resets the clock.

## Flags

| Flag | Env var | Default |
| :- | :- | :- |
| `--environment-id` | `ENOPHIC_ENVIRONMENT_ID` | required |
| `--environment-key` | `ENOPHIC_ENVIRONMENT_KEY` | required |
| `--on-work` | | in-process runner |
| `--worker-id` | `ENOPHIC_WORKER_ID` | hostname |
| `--workdir` | | `.` |
| `--unrestricted-paths` | | `false` |
| `--max-idle` | | `1m` after end_turn idle |
| `--log-format` | | `text` (or `json`) |
| `--base-url` | `ENOPHIC_BASE_URL` | `api.enophic.com` |

The worker executes shell and file operations directly on the host. Run it inside a container or other isolation boundary you control.

## Library usage

The same poll/run worker is available as library code in each SDK if you want to embed it in your own process or customise the tools. `client.beta.environments.work.worker(...)` composes the whole loop — poll → set up the workdir + download the session agent's skills → run the tools while heartbeating the work-item lease → force-stop on exit → loop. It accepts the same tool type as `client.beta.messages.tool_runner` / `.toolRunner`, so any tool you define with `@beta_async_tool` (Python) or `betaZodTool` / `BetaRunnableTool` (TypeScript) can be passed alongside the defaults via `tools=`.

### Python

```python
import asyncio, os
from enophic import AsyncEnophic

environment_key = os.environ["ENOPHIC_ENVIRONMENT_KEY"]

async def main() -> None:
    async with AsyncEnophic(auth_token=environment_key) as client:
        await client.beta.environments.work.worker(
            environment_id=os.environ["ENOPHIC_ENVIRONMENT_ID"],
            environment_key=environment_key,
            workdir="/workspace",
        ).run()

asyncio.run(main())
```

`.handle_item()` is the per-item form — for a `--on-work` script or a sandbox spawned per session, it reads the `ENOPHIC_*` env vars and services the one already-claimed work item.

### TypeScript

```ts
import Enophic from '@enophic-ai/sdk';

const environmentKey = process.env.ENOPHIC_ENVIRONMENT_KEY!;
const client = new Enophic({ authToken: environmentKey });
const ctrl = new AbortController();
process.once('SIGTERM', () => ctrl.abort());

await client.beta.environments.work
  .worker({
    environmentId: process.env.ENOPHIC_ENVIRONMENT_ID!,
    environmentKey,
    workdir: '/workspace',
    signal: ctrl.signal,
  })
  .run();
```

`.handleItem()` is the per-item form (reads the `ENOPHIC_*` env vars).

### Go

```go
// TODO: pending a released Go SDK build for the self-hosted worker.
```

## Customising the tool list

`beta_agent_toolset_20260401(env)` (Python) / `betaAgentToolset20260401(ctx)` (TypeScript) returns the `agent_toolset_20260401` implementations as a list: `bash`, `read`, `write`, `edit`, `glob`, `grep`. Filter or extend it, then pass it to `worker(...)` as `tools` — a factory invoked once per claimed session with that session's tool context:

```python
from enophic.lib.tools import beta_async_tool
from enophic.lib.tools.agent_toolset import (
    AgentToolContext, beta_agent_toolset_20260401, beta_bash_tool, beta_read_tool,
)

# drop grep, add a custom tool
@beta_async_tool
async def fetch_url(url: str) -> str: ...

def tools(env: AgentToolContext):
    return [t for t in beta_agent_toolset_20260401(env) if t.name != "grep"] + [fetch_url]

# or build from individual factories
def tools(env: AgentToolContext):
    return [beta_bash_tool(env), beta_read_tool(env), my_custom_tool]

client.beta.environments.work.worker(..., tools=tools)
```

```ts
import { betaZodTool } from '@enophic-ai/sdk/helpers/beta/zod';
import { betaAgentToolset20260401, betaBashTool } from '@enophic-ai/sdk/tools/agent-toolset/node';

client.beta.environments.work.worker({
  ...,
  tools: (ctx) => [...betaAgentToolset20260401(ctx).filter(t => t.name !== 'grep'), myZodTool],
});
```

```go
// TODO: pending a released Go SDK build for the self-hosted worker.
```
