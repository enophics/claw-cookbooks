// One-time: create the Claw agent + environment. Copy the printed IDs into .env.local.
import Enophic from "@enophic-ai/sdk";

const enophic = new Enophic();

const env = await enophic.beta.environments.create({
  name: `slack-bridge-${Date.now()}`,
  config: { type: "cloud", networking: { type: "unrestricted" } },
});

const agent = await enophic.beta.agents.create({
  name: "Slack Assistant",
  model: "claw-go-4-7",
  system:
    "You are a helpful assistant embedded in Slack. Keep replies concise and conversational — they are posted as thread replies. Use plain text or Slack mrkdwn (e.g. *bold*, `code`); avoid Markdown headers.",
  tools: [{ type: "agent_toolset_20260401", default_config: { enabled: true } }],
});

console.log("\nAdd to .env.local:");
console.log(`CLAW_ENVIRONMENT_ID=${env.id}`);
console.log(`CLAW_AGENT_ID=${agent.id}`);
