import * as crypto from "node:crypto";
import * as fs from "node:fs";
import * as path from "node:path";
import { createOpenAI } from "@ai-sdk/openai";
import { embedMany } from "ai";
import { splitMarkdownByStructure } from "@/lib/markdown-splitter.ts";

const KNOWLEDGE_DIR = path.resolve("knowledge");
const OUTFILE = path.resolve("public/knowledge.index.json");
const EMBED_MODEL = createOpenAI({
	apiKey: process.env.OPENAI_API_KEY,
}).embedding("text-embedding-3-small");

function stripFrontmatter(s: string) {
	if (s.startsWith("---")) {
		const end = s.indexOf("\n---", 3);
		if (end !== -1) return s.slice(end + 4);
	}
	return s;
}

function readAllFiles(dir: string): string[] {
	const allowed = new Set([".md", ".mdx", ".txt", ".json"]);
	const files: string[] = [];
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		const full = path.join(dir, entry.name);
		if (entry.isDirectory()) files.push(...readAllFiles(full));
		else if (allowed.has(path.extname(entry.name))) files.push(full);
	}
	return files;
}

async function main() {
	const files = readAllFiles(KNOWLEDGE_DIR);
	const docs: { id: string; file: string; context: string; text: string }[] =
		[];

	for (const file of files) {
		const raw = fs.readFileSync(file, "utf8");
		const cleaned = stripFrontmatter(raw);

		// 1. Structural splitting instead of fixed chunking
		const structuralChunks = splitMarkdownByStructure(cleaned);

		structuralChunks.forEach((chunk, idx) => {
			// 2. Build context string (e.g., "Soll-System > Wärmepumpe")
			const contextString = chunk.headerPath.join(" > ");

			// 3. Optional: If a chunk is still too large (>2000 characters),
			// it would need to be split recursively here.
			// For your file sizes, the structural split is often sufficient.

			// Generate ID
			const id = crypto
				.createHash("sha1")
				.update(`${file}::${idx}::${chunk.content.slice(0, 64)}`)
				.digest("hex");

			docs.push({
				id,
				file: path.relative(process.cwd(), file),
				context: contextString,
				text: chunk.content,
			});
		});
	}

	// 4. Create embeddings
	// TRICK: We embed "Context + Content" to make search more precise.
	const { embeddings } = await embedMany({
		model: EMBED_MODEL,
		values: docs.map((d) => `Topic: ${d.context}\nContent: ${d.text}`),
	});

	const index = docs.map((d, i) => ({
		id: d.id,
		file: d.file,
		context: d.context,
		text: d.text,
		embedding: embeddings[i],
	}));

	fs.writeFileSync(
		OUTFILE,
		JSON.stringify({ model: "text-embedding-3-small", index }, null, 2),
	);
	console.log(`Wrote ${index.length} chunks to ${OUTFILE}`);
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
