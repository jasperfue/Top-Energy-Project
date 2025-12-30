import { createFileRoute } from "@tanstack/react-router";
import { createAgentUIStreamResponse, type UIMessage } from "ai";
import { agent } from "@/lib/rag-agent.ts";

export const Route = createFileRoute("/api/chat")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				try {
					const { messages } = (await request.json()) as {
						messages: UIMessage[];
					};
					const abortController = new AbortController();

					return createAgentUIStreamResponse({
						agent: agent,
						uiMessages: messages,
						abortSignal: abortController.signal,
					});
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
