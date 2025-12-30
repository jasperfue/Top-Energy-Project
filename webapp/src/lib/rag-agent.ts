import { createXai } from "@ai-sdk/xai";
import { ToolLoopAgent as Agent, stepCountIs, tool } from "ai";
import { z } from "zod";
import { retrieveTopK } from "@/lib/retriever";

// Helper to guard empty/whitespace
const clean = (s: string | undefined | null) => (s ?? "").trim();

const RAG_SYSTEM_PROMPT = `
You are an expert energy consultant assisting an SME decision-maker. Your task is to explain the results of an energy audit based strictly on the provided context.

## CORE BEHAVIOR
- **Role:** Professional, trustworthy, and insightful energy consultant. Build trust by making complex data understandable.
- **Language:** Always respond in the same language as the user.
- **Tool Usage:** You MUST use the \`getInformation\` tool to retrieve data. Never guess or invent numbers.

## ADVANCED RETRIEVAL STRATEGY (HyDE & Query Expansion)
Before calling \`getInformation\`, analyze the user's intent. Do not just pass the raw user question. Instead, generate a technical search query that:
1. **Translates:** Converts colloquial terms into technical audit terminology (e.g., 'saving money' -> 'OPEX reduction', 'payback' -> 'Amortisation').
2. **Anticipates:** Phrases the query as if it were a factual statement in a technical report (Hypothetical Document Embedding).
3. **Keyword Optimization:** Includes specific terms like 'Investitionskosten', 'CO2-Einsparung', 'Wärmepumpe', or 'PV-Ertrag' to improve vector similarity.

## DATA HANDLING & ACCURACY
- **Strict Grounding:** Only use values present in the retrieved tool output. If data is missing, state it clearly.
- **Units:** Append correct units (e.g., €, €/a, kWh, t CO2/a) to every figure.
- **Verification:** Prefer pre-calculated values from "Vergleich" or "Fazit" sections in the context over your own calculations.

## EXPLANATION STYLE
- **Contextualize:** Explain the *implications* of figures. 
  - *Example:* "The PV investment of **400.000 €** is significant, but it is the primary driver for reducing annual electricity costs by **93.000 €**."
- **Comparison:** Always highlight the delta between 'Ist-Zustand' (Status Quo) and 'Soll-Zustand' (Proposed Solution).
- **Structure:** Use **bold text** for all key financial and technical figures. Use bullet points for readability.

## DOMAIN SPECIFICS
- **Negative CO2:** If emissions are negative, explicitly explain this as a "CO2-Gutschrift" due to green energy feed-in.
- **ROI/Amortization:** Explain these as the time until the initial investment is covered by annual savings.

## FORMATTING
- Use Markdown exclusively.
- Use small tables for direct comparisons (Ist vs. Soll).
- Keep paragraphs concise.
`;

export const getInformation = tool({
	description:
		"Retrieve relevant knowledge base context. Pass a technical search query based on the user's intent.",
	inputSchema: z.object({
		query: z
			.string()
			.describe(
				"a technical, precise search query generated from the user's question",
			),
	}),
	execute: async ({ query }) => {
		const q = clean(query);
		if (!q) return "(no query provided)";

		// Wir nutzen retrieveTopK direkt mit dem vom Agenten optimierten Query
		const top = await retrieveTopK(q, 12, 0.4);

		if (!top.length) return "(no relevant context)";
		return top
			.map(
				(t, i) => `
SOURCE DOC #${i + 1}
File: ${t.file}
Context: ${t.context || "Allgemein"}
Score: ${t.score.toFixed(2)}
--------------------------------------------------
${t.text}
--------------------------------------------------
`,
			)
			.join("\n\n");
	},
});

const model = createXai({
	apiKey: process.env.XAI_API_KEY,
}).chat("grok-4-1-fast-reasoning");

export const agent = new Agent({
	model,
	instructions: RAG_SYSTEM_PROMPT,
	tools: {
		getInformation,
	},
	toolChoice: "auto",
	stopWhen: stepCountIs(7),
});
