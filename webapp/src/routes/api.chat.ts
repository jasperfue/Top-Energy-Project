import { createXai } from "@ai-sdk/xai";
import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText } from "ai";

const SYSTEM_PROMPT = `Du bist ein hilfreicher Assistent.`;

export const Route = createFileRoute("/api/chat")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				try {
					const { messages } = await request.json();

					const result = streamText({
						model: createXai({
							apiKey: process.env.XAI_API_KEY,
						}).chat("grok-4-fast-reasoning"),
						system: SYSTEM_PROMPT,
						messages: convertToModelMessages(messages),
						// noch keine tools, noch kein RAG
					});

					// Liefert einen kompatiblen Stream für @ai-sdk/react DefaultChatTransport
					return result.toUIMessageStreamResponse();
				} catch (error) {
					console.error("Chat API error:", error);
					return new Response(
						JSON.stringify({ error: "Failed to process chat request" }),
						{ status: 500, headers: { "Content-Type": "application/json" } },
					);
				}
			},
		},
	},
});
