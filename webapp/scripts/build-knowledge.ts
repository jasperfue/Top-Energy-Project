import * as crypto from "node:crypto";
import * as fs from "node:fs";
import * as path from "node:path";
import {createOpenAI} from "@ai-sdk/openai";
import {embedMany} from "ai";

const KNOWLEDGE_DIR = path.resolve("knowledge");
const OUTFILE = path.resolve("public/knowledge.index.json");
const EMBED_MODEL = createOpenAI({
	apiKey: process.env.OPENAI_API_KEY,
}).embedding("text-embedding-3-small");

// sehr simpler Chunker (ca. 800-1200 Tokens ≈ 3.5k-5k chars grob)
function chunk(text: string, chunkSize = 4000, overlap = 400) {
	const out: string[] = [];
	let i = 0;
	while (i < text.length) {
		out.push(text.slice(i, i + chunkSize));
		i += chunkSize - overlap;
	}
	return out;
}

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
	const docs: { id: string; file: string; chunkIndex: number; text: string }[] =
		[];

	for (const file of files) {
		const raw = fs.readFileSync(file, "utf8");
		const cleaned = stripFrontmatter(raw);
		const chunks = chunk(cleaned);
		chunks.forEach((text, idx) => {
			const id = crypto
				.createHash("sha1")
				.update(`${file}::${idx}::${text.slice(0, 64)}`)
				.digest("hex");
			docs.push({
				id,
				file: path.relative(process.cwd(), file),
				chunkIndex: idx,
				text,
			});
		});
	}

	const { embeddings } = await embedMany({
		model: EMBED_MODEL,
		values: docs.map((d) => d.text),
	});

	const index = docs.map((d, i) => ({
		id: d.id,
		file: d.file,
		chunkIndex: d.chunkIndex,
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
