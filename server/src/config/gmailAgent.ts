import "dotenv/config";
import OpenAI from "openai";
import { Agent, run, tool, setDefaultOpenAIClient } from "@openai/agents";
import { OpenAIAgentsProvider } from "@corsair-dev/mcp";
import { corsair } from "./corsair.js";
import { Logger } from "../utils/logger.js";

const logger = Logger.getInstance();

// ─────────────────────────────────────────────
// GROQ AS THE MODEL BACKEND (free tier)
// The @openai/agents SDK calls OpenAI by default — point it at Groq's
// OpenAI-compatible endpoint instead so no paid API key is required.
// ─────────────────────────────────────────────

const groqClient = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

setDefaultOpenAIClient(groqClient as any);

// ─────────────────────────────────────────────
// BUILD CORSAIR TOOLS ONCE (module-level, reused per request)
// provider.build() just builds tool *definitions* — it does not bind to a
// specific Corsair account. The account scoping happens via accountId
// being passed inside the natural-language prompt / run_script calls,
// based on how Corsair's MCP tools resolve "which Gmail account" to use.
// ─────────────────────────────────────────────

const provider = new OpenAIAgentsProvider();
const corsairTools = provider.build({ corsair, tool });
console.log("Built Corsair tools for Gmail agent:", corsairTools);
// Defensive fix: some Corsair tool schemas omit `type` on empty-object
// parameters, which OpenAI/Groq's function-calling schema validator rejects.
// for (const t of corsairTools) {
//   if (t.parameters && !t.parameters.type) {
//     t.parameters = {
//       type: "object",
//       properties: {},
//       additionalProperties: true,
//     };
//   }
// }

const gmailAgent = new Agent({
  name: "gmail-agent",
  model: "llama-3.1-8b-instant",
  instructions: `You control a user's Gmail account through Corsair tools.

Follow this exact process for every request:
1. Call list_operations ONCE to see what Gmail operations are available.
2. Call get_schema ONCE for the specific operation you need (e.g. messages.list, messages.send, messages.get, drafts.create).
3. Call run_script ONCE to execute that operation with the right arguments.
4. Read the result and respond to the user in plain text with what happened.

Hard rules:
- Never call list_operations or get_schema more than once per request.
- Never call a tool more than 4 times total for a single request.
- After run_script returns data, STOP calling tools and answer immediately.
- Always scope every Gmail operation to the accountId provided in the request context — never act on a different account.`,
  tools: corsairTools,
});

// ─────────────────────────────────────────────
// PUBLIC ENTRY POINT
// Called by GmailService for every agent-driven action (search, draft,
// send, summarize). accountId pins the action to one user's Corsair
// Gmail account so multi-user isolation is preserved.
// ─────────────────────────────────────────────

export async function runGmailAgent(
  accountId: string,
  userPrompt: string,
): Promise<string> {
  const scopedPrompt = `[Corsair accountId: ${accountId}]\n\n${userPrompt}`;
  logger.info("Gmail agent invoked", {
    accountId,
    promptPreview: userPrompt.slice(0, 80),
  });
  const result = await run(gmailAgent, scopedPrompt, { maxTurns: 8 });
  logger.info("Gmail agent finished", { accountId });
  return result.finalOutput ?? "";
}
