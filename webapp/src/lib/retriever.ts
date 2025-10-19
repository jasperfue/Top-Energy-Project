import fs from "node:fs";
import path from "node:path";
import {createOpenAI} from "@ai-sdk/openai";
import {cosineSimilarity, embed} from "ai";

// 1) zuerst public/ probieren (prod/vercel)
const PUBLIC_INDEX = path.resolve("public/knowledge.index.json");
// 2) fallback: root (lokal)
const ROOT_INDEX = path.resolve("knowledge.index.json");

const INDEX_PATH = fs.existsSync(PUBLIC_INDEX) ? PUBLIC_INDEX : ROOT_INDEX;
const EMBED_MODEL = createOpenAI({
	apiKey: process.env.OPENAI_API_KEY,
}).embedding("text-embedding-3-small");

type IndexRow = {
	id: string;
	file: string;
	chunkIndex: number;
	text: string;
	embedding: number[];
};
type IndexFile = { model: string; index: IndexRow[] };

let cache: IndexFile | null = null;
function loadIndex(): IndexFile {
	if (!cache) cache = JSON.parse(fs.readFileSync(INDEX_PATH, "utf8"));
	if (!cache) throw new Error("Failed to load index");
	return cache;
}

export async function retrieveTopK(query: string, k = 5, minScore = 0.2) {
	const idx = loadIndex();
	const q = await embed({
		model: EMBED_MODEL,
		value: query,
	});
	const scored = idx.index
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
		chunkIndex: row.chunkIndex,
		score,
		text: row.text,
	}));
}
