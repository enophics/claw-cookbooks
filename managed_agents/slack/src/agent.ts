import Enophic from "@enophic-ai/sdk";

const enophic = new Enophic();

const CLAW_AGENT_ID = process.env.CLAW_AGENT_ID!;
const CLAW_ENVIRONMENT_ID = process.env.CLAW_ENVIRONMENT_ID!;

export interface SlackMention {
  channel: string;
  thread_ts: string;
  user: string;
  text: string;
  team: string;
}

// Fire-and-forget: create the CMA session, attach routing metadata, send the
// prompt, return. The reply path is handled in cma-webhook.ts when Enophic
// POSTs `session.status_idled`.
export async function kickoffAgentSession(m: SlackMention) {
  // Stash the Slack routing info on the CMA session. The idle webhook later
  // delivers only a session ID; we read this metadata back to know where to
  // post the reply.
  const session = await enophic.beta.sessions.create({
    agent: CLAW_AGENT_ID,
    environment_id: CLAW_ENVIRONMENT_ID,
    metadata: {
      slack_channel: m.channel,
      slack_thread_ts: m.thread_ts,
      slack_team: m.team,
    },
  });

  await enophic.beta.sessions.events.send(session.id, {
    events: [
      {
        type: "user.message",
        content: [{ type: "text", text: m.text || "Hello! How can I help?" }],
      },
    ],
  });

  console.log(
    `[agent] kickoff slack=${m.channel}/${m.thread_ts} claw=${session.id}`,
  );
}
