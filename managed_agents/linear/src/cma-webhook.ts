import Enophic from "@enophic-ai/sdk";
import { LinearClient } from "@linear/sdk";
import { getAccessToken } from "./oauth";

const enophic = new Enophic();

// Dedupe retries (same event.id across retries). Swap for Redis/DB in prod.
const seenEventIds = new Set<string>();

export async function handleCmaWebhook(req: Request): Promise<Response> {
  const rawBody = await req.text();

  // Verify HMAC + timestamp and parse. Reads ENOPHIC_WEBHOOK_SIGNING_KEY
  // from env. unwrap() needs a plain header map, not a fetch Headers object.
  let event: Enophic.Beta.BetaWebhookEvent;
  try {
    event = enophic.beta.webhooks.unwrap(rawBody, {
      headers: Object.fromEntries(req.headers),
    });
  } catch (err) {
    console.warn("[cma-webhook] signature verification failed");
    return new Response("bad signature", { status: 401 });
  }

  if (seenEventIds.has(event.id)) return new Response(null, { status: 204 });
  seenEventIds.add(event.id);

  if (event.data.type === "session.status_terminated") {
    await postTerminationError(event.data.id);
    return new Response(null, { status: 204 });
  }

  if (event.data.type !== "session.status_idled") {
    return new Response(null, { status: 204 });
  }

  const clawSessionId = event.data.id;

  // Workspace webhooks fire for EVERY session in the workspace. Fetch the
  // session and filter by our metadata; ignore anything that isn't ours
  // (including sessions our key can't read).
  let session;
  try {
    session = await enophic.beta.sessions.retrieve(clawSessionId);
  } catch {
    return new Response(null, { status: 204 });
  }

  const linearSessionId = session.metadata?.linear_session_id;
  const linearOrgId = session.metadata?.linear_org_id;
  if (!linearSessionId || !linearOrgId) {
    return new Response(null, { status: 204 });
  }

  // Pull the agent's reply text from the event history. Iterating the page
  // object auto-paginates.
  const parts: string[] = [];
  for await (const e of enophic.beta.sessions.events.list(clawSessionId)) {
    if (e.type === "agent.message") {
      for (const block of e.content ?? []) {
        if (block.type === "text") parts.push(block.text);
      }
    }
  }
  const responseText = parts.join("").trim();

  if (!responseText) return new Response(null, { status: 204 });

  const accessToken = await getAccessToken(linearOrgId);
  const linear = new LinearClient({ accessToken });
  await linear.createAgentActivity({
    agentSessionId: linearSessionId,
    content: { type: "response", body: responseText },
  });

  console.log(`[cma-webhook] posted reply linear=${linearSessionId} claw=${clawSessionId}`);
  return new Response(null, { status: 204 });
}

async function postTerminationError(clawSessionId: string) {
  try {
    const session = await enophic.beta.sessions.retrieve(clawSessionId);
    const linearSessionId = session.metadata?.linear_session_id;
    const linearOrgId = session.metadata?.linear_org_id;
    if (!linearSessionId || !linearOrgId) return;

    const accessToken = await getAccessToken(linearOrgId);
    const linear = new LinearClient({ accessToken });
    await linear.createAgentActivity({
      agentSessionId: linearSessionId,
      content: { type: "error", body: "Agent session terminated unexpectedly." },
    });
  } catch (err) {
    console.error("[cma-webhook] failed to post termination error:", err);
  }
}
