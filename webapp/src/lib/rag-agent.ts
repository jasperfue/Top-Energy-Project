import {createXai} from "@ai-sdk/xai";
import {Experimental_Agent as Agent, stepCountIs, tool} from "ai";
import {z} from "zod";
import {retrieveTopK} from "@/lib/retriever";

// Helper to guard empty/whitespace
const clean = (s: string | undefined | null) => (s ?? "").trim();

// Keep it simple & strict so the planner behaves deterministically
export const RAG_SYSTEM_PROMPT = [
	"You are a concise assistant.",
	"For every user question, call the getInformation tool exactly once, passing the user's question as `question`.",
	"After receiving the tool output, produce a final assistant message using that information.",
	"If the tool output contains no relevant information, respond: 'Sorry, I don't have the necessary information.'",
	"When citing, include the source file and chunk index in parentheses — e.g. (source: file.md#2).",
].join("\n");

export function createRagAgent() {
	const getInformation = tool({
		description:
			"Retrieve relevant knowledge base context. Always pass the user's question as `question`.",
		inputSchema: z.object({
			question: z.string().describe("the user's question"),
		}),
		execute: async ({ question }) => {
			const q = clean(question);
			if (!q) return "(no query provided)";
			const top = await retrieveTopK(q, 5);
			if (!top.length) return "(no relevant context)";
			return top
				.map(
					(t, i) =>
						`# Doc ${i + 1} (${t.file}#${t.chunkIndex}, score=${t.score.toFixed(
							3,
						)})\n${t.text}`,
				)
				.join("\n\n---\n\n");
		},
	});

	const model = createXai({
		apiKey: process.env.XAI_API_KEY,
	}).chat("grok-4-fast-reasoning");

	return new Agent({
		model,
		system: RAG_SYSTEM_PROMPT,
		tools: {
			getInformation,
		},
		stopWhen: stepCountIs(5), // Not more than 5 steps
	});
}
