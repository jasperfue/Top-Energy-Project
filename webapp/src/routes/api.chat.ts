import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, type UIMessage } from "ai";
import { createRagAgent } from "@/lib/rag-agent.ts";

export const Route = createFileRoute("/api/chat")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				try {
					const { messages } = (await request.json()) as {
						messages: UIMessage[];
					};

					const agent = createRagAgent(request);

					const session = agent.stream({
						messages: convertToModelMessages(messages),
					});

					return session.toUIMessageStreamResponse();
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
