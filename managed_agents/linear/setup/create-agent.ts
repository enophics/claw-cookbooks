// One-time: create the Claw agent + environment. Copy the printed IDs into .env.local.
import Enophic from "@enophic-ai/sdk";

const enophic = new Enophic();

const env = await enophic.beta.environments.create({
  name: `linear-bridge-${Date.now()}`,
  config: { type: "cloud", networking: { type: "unrestricted" } },
});

const agent = await enophic.beta.agents.create({
  name: "Linear Assistant",
  model: "claw-go-4-7",
  system:
    "You are a helpful assistant embedded in Linear. Keep replies concise and actionable — they are posted as comments. Do not invent issue IDs, users, or project names.",
  tools: [{ type: "agent_toolset_20260401", default_config: { enabled: true } }],
});

console.log("\nAdd to .env.local:");
console.log(`CLAW_ENVIRONMENT_ID=${env.id}`);
console.log(`CLAW_AGENT_ID=${agent.id}`);
