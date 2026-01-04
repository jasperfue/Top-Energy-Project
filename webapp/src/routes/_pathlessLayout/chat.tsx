import { useChat } from "@ai-sdk/react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { DefaultChatTransport } from "ai";
import { useEffect, useState } from "react";
import { z } from "zod";
import {
	Conversation,
	ConversationContent,
	ConversationScrollButton,
} from "@/components/ai-elements/conversation.tsx";
import { Message, MessageContent } from "@/components/ai-elements/message.tsx";
import PromptInputComponent from "@/components/PromptInput.tsx";
import { StudyHeader } from "@/components/StudyHeader.tsx";
import { AITypingBubble } from "@/components/ui/AITypingBubble.tsx";
import { Markdown } from "@/components/ui/markdown.tsx";
import { airtable } from "@/lib/airtable.ts";
import { usePreloadRoute } from "@/lib/usePreloadRoute.ts";
import { useUserSession } from "@/lib/useUserSession.ts";
import { m } from "@/paraglide/messages.js";

export const finishTask = createServerFn({ method: "POST" })
	.inputValidator(
		z.object({
			messageCount: z.number().optional(),
		}),
	)
	.handler(async ({ data }) => {
		const session = await useUserSession();
		if (!session.data.recId) throw new Error("No recId in session data");

		await airtable
			.update([
				{
					id: session.data.recId,
					fields: {
						// Set the end timestamp
						Endzeit: new Date().toISOString(),
						// Save message count if provided (only relevant for chat)
						...(data.messageCount !== undefined && {
							Nachrichten_Anzahl: data.messageCount,
						}),
					},
				},
			])
			.catch((err: Error) => {
				console.error("Error saving finish task data:", err);
				throw err;
			});
	});

export const Route = createFileRoute("/_pathlessLayout/chat")({
	component: Chat,
});

function Chat() {
	const navigate = useNavigate();
	const [isFinishing, setIsFinishing] = useState(false);
	usePreloadRoute("/questionnaire", { step: 1 });
	const { messages, sendMessage, status, stop } = useChat({
		transport: new DefaultChatTransport({
			api: "/api/chat",
		}),
		messages: [
			{
				id: "welcome-message",
				role: "assistant",
				parts: [
					{
						type: "text",
						text: m.chat_intro(),
					},
				],
			},
		],
	});

	useEffect(() => {
		console.log(messages[messages.length - 1]);
	}, [messages[messages.length - 1]]);

	const handleFinish = async () => {
		if (isFinishing) return;
		setIsFinishing(true);

		try {
			await finishTask({
				data: {
					messageCount: messages.length,
				},
			});

			await navigate({ to: "/questionnaire", search: { step: 1 } });
		} catch (error) {
			console.error(
				"Failed to finish task or navigate to questionnaire",
				error,
			);
			// Reset loading state and inform the user so they can retry
			setIsFinishing(false);
			if (typeof window !== "undefined") {
				window.alert(
					"An error occurred while finishing the task. Please try again.",
				);
			}
		}
	};

	return (
		// We set h-dvh here to ensure the chat takes the full viewport height
		<div className="flex flex-col pt-2 md:pt-4 h-dvh w-full overflow-hidden bg-background overscroll-y-none">
			<StudyHeader onFinish={handleFinish} isLoading={isFinishing} />

			<div className="flex-1 min-h-0 relative">
				<div className="grid pb-0 h-full grid-rows-[1fr_auto]">
					{/* Scrollable content */}
					<Conversation className="overflow-x-hidden">
						<ConversationContent>
							{messages.map((message, index) => (
								<Message from={message.role} key={message.id}>
									<MessageContent>
										{message.parts.map((part, i) => {
											switch (part.type) {
												case "text": // we don't use any reasoning or tool calls in this example
													return (
														<Markdown key={`${message.id}-${i}`}>
															{part.text}
														</Markdown>
													);
												default:
													return null;
											}
										})}
										{status === "streaming" &&
											index === messages.length - 1 &&
											message.role === "assistant" && <AITypingBubble />}
									</MessageContent>
								</Message>
							))}
						</ConversationContent>
						<ConversationScrollButton className="bottom-20" />
					</Conversation>
					<div className="w-full bg-background pb-[env(safe-area-inset-bottom)]">
						<PromptInputComponent
							stop={stop}
							// @ts-expect-error
							sendMessage={sendMessage}
							status={status}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
