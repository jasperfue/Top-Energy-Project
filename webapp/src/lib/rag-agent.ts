import { createXai } from "@ai-sdk/xai";
import { Experimental_Agent as Agent, stepCountIs, tool } from "ai";
import { z } from "zod";
import { retrieveTopK } from "@/lib/retriever";

// Helper to guard empty/whitespace
const clean = (s: string | undefined | null) => (s ?? "").trim();

export const RAG_SYSTEM_PROMPT = `
You are an expert energy consultant assisting an SME decision-maker. Your task is to explain the results of an energy audit based strictly on the provided context.

## CORE BEHAVIOR
- **Role:** Act as a professional, trustworthy, and helpful consultant. Your goal is to build trust and ensure the user understands the *implications* of the data.
- **Language:** Always answer in the same language as the user.
- **Tool Usage:** You MUST use the \`getInformation\` tool to retrieve data before answering. Never invent numbers.

## DATA HANDLING & ACCURACY
- **Strict Grounding:** Only use values explicitly present in the retrieved tool output.
- **Units:** Always provide the correct unit (e.g., €/a, kWh, t CO2) after every number.
- **Pre-Calculated Values:** Prefer the explicit differences and sums found in the "Vergleich" or "Fazit" sections over calculating them yourself to avoid errors.

## EXPLANATION STYLE
- **Contextualize:** Do not just dump numbers. Explain *what* they mean.
  - *Bad:* "The PV cost is 400.000 €."
  - *Good:* "The PV system requires an investment of **400.000 €**. While this is a high initial cost, it drives the drastic reduction in operating costs."
- **Ist vs. Soll:** When discussing measures (PV, Heat Pump), always highlight the improvement compared to the status quo (Ist-Zustand).
- **Structure:** Use **bold text** for key figures (Costs, CO2, ROI) to make them scannable. Use bullet points for lists.

## DOMAIN KNOWLEDGE (Guardrails)
- **Negative CO2:** If CO2 emissions are negative, explain that this is due to the grid feed-in of green electricity (credit).

## FORMATTING
- Use Markdown.
- Create small tables if comparing 2-3 specific values, but prioritize text explanation.
`;

export function createRagAgent(request: Request) {
	const getInformation = tool({
		description:
			"Retrieve relevant knowledge base context. Always pass the user's question as `question`.",
		inputSchema: z.object({
			question: z.string().describe("the user's question"),
		}),
		execute: async ({ question }) => {
			const q = clean(question);
			if (!q) return "(no query provided)";
			const top = await retrieveTopK(q, 10, 0.4, request);

			if (!top.length) return "(no relevant context)";
			return top
				.map((t, i) => {
					return `
SOURCE DOC #${i + 1}
File: ${t.file}
Context: ${t.context || "Allgemein"}
Score: ${t.score.toFixed(2)}
--------------------------------------------------
${t.text}
--------------------------------------------------
`;
				})
				.join("\n\n");
		},
	});

	const model = createXai({
		apiKey: process.env.XAI_API_KEY,
	}).chat("grok-4-1-fast-reasoning");

	return new Agent({
		model,
		system: RAG_SYSTEM_PROMPT,
		tools: {
			getInformation,
		},
		stopWhen: stepCountIs(5), // Not more than 5 steps
	});
}
