import { createOpenAI } from "@ai-sdk/openai";
import { cosineSimilarity, embed } from "ai";
import indexData from "../../knowledge/knowledge.index.json";

const EMBED_MODEL = createOpenAI({
	apiKey: process.env.OPENAI_API_KEY,
}).embedding("text-embedding-3-small");

export async function retrieveTopK(query: string, k = 12, minScore = 0.2) {
	const q = await embed({
		model: EMBED_MODEL,
		value: query,
	});

	const scored = indexData.index
		.map((row) => ({
			row,
			score: cosineSimilarity(q.embedding, row.embedding),
		}))
		.sort((a, b) => b.score - a.score)
		.filter((x) => x.score >= minScore)
		.slice(0, k);

	return scored.map(({ row, score }) => ({
		id: row.id,
		file: row.file,
		context: row.context,
		score,
		text: row.text,
	}));
}
