import * as fs from "node:fs";
import * as path from "node:path";
import { createOpenAI } from "@ai-sdk/openai";
import { cosineSimilarity, embed } from "ai";

const EMBED_MODEL = createOpenAI({
	apiKey: process.env.OPENAI_API_KEY,
}).embedding("text-embedding-3-small");

type IndexRow = {
	id: string;
	file: string;
	context: string;
	text: string;
	embedding: number[];
};
type IndexFile = { model: string; index: IndexRow[] };

let cache: IndexFile | null = null;
export async function loadIndex(request?: Request): Promise<IndexFile> {
	if (cache) return cache;

	const publicPath = path.resolve("public/knowledge.index.json");
	if (fs.existsSync(publicPath)) {
		cache = JSON.parse(fs.readFileSync(publicPath, "utf8"));
		if (!cache) throw new Error("Failed to parse index from public folder.");
		console.info("Retrieved knowledge index via public path.");
		return cache;
	}

	if (request) {
		const url = new URL("/knowledge.index.json", request.url);
		const res = await fetch(url.toString());
		if (!res.ok)
			throw new Error(`Failed to fetch index: ${res.status} ${res.statusText}`);
		cache = (await res.json()) as IndexFile;
		console.info("Retrieved knowledge index via request.");
		return cache;
	}

	throw new Error(
		"knowledge.index.json not found (neither on FS nor via request).",
	);
}

export async function retrieveTopK(
	query: string,
	k = 5,
	minScore = 0.2,
	request?: Request,
) {
	const [idx, q] = await Promise.all([
		loadIndex(request),
		embed({
			model: EMBED_MODEL,
			value: query,
		}),
	]);
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
		context: row.context,
		score,
		text: row.text,
	}));
}
