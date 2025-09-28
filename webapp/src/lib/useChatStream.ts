import { useMutation } from "@tanstack/react-query";
import { env } from "/env.ts";

export type IncomingMessageChunk =
	| { type: "AIMessageChunk"; data: AIMessageChunk }
	| { type: "tool"; data: ToolResponse };

type ToolResponse = {
	content: string;
	name: string;
	tool_call_id: string;
	status: "success" | "error";
	id: string;
};

type AIMessageChunk = {
	id: string;
	content: string;
	tool_calls: ToolCall[];
	response_metadata: Record<string, string>;
};

type ToolCall = {
	id: string;
	name: string;
	args: Record<string, string>;
};

type StartChatArgs = {
	prompt: string;
	onChunk: (chunk: IncomingMessageChunk) => void;
	signal?: AbortSignal;
};

async function* ndjsonObjects(
	byteStream: ReadableStream<Uint8Array>,
): AsyncIterable<IncomingMessageChunk> {
	// WICHTIG: Cast auf BufferSource, damit TextDecoderStream typkompatibel ist
	const textStream = (byteStream as ReadableStream<BufferSource>).pipeThrough(
		new TextDecoderStream(),
	);

	// Text -> Zeilen (robust gegen \n / \r\n und Chunk-Grenzen)
	let carry = "";
	const lineSplitter = new TransformStream<string, string>({
		transform(chunk, controller) {
			carry += chunk;
			const parts = carry.split(/\r?\n/);
			carry = parts.pop() ?? "";
			for (const line of parts) {
				const trimmed = line.trimEnd();
				if (trimmed) controller.enqueue(trimmed);
			}
		},
		flush(controller) {
			const final = carry.trim();
			if (final) controller.enqueue(final);
		},
	});

	const lines = textStream.pipeThrough(lineSplitter);
	const reader = lines.getReader();

	try {
		while (true) {
			const { value, done } = await reader.read();
			if (done) break;
			if (!value) continue;
			try {
				// Server liefert pro Zeile genau ein JSON-Objekt
				const obj = JSON.parse(value) as IncomingMessageChunk;
				yield obj;
			} catch (e) {
				// Ungültige Zeile überspringen (oder hier ein eigenes Error-Event emittieren)
				console.warn("NDJSON parse error:", e, "line:", value);
			}
		}
	} finally {
		reader.releaseLock();
	}
}

export function useChatStream() {
	return useMutation({
		mutationFn: async ({ prompt, onChunk, signal }: StartChatArgs) => {
			const resp = await fetch(`${env.VITE_BACKEND_URL}/api/chat`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Accept: "application/x-ndjson",
				},
				body: JSON.stringify({ content: prompt }),
				signal,
			});
			if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
			if (!resp.body) throw new Error("Response body is null (no stream)");

			try {
				for await (const ev of ndjsonObjects(resp.body)) {
					// Typ bleibt dein IncomingMessageChunk
					onChunk(ev);
				}
			} catch (err: any) {
				if (err?.name === "AbortError") return; // sauber abgebrochen
				throw err;
			}
		},
	});
}
