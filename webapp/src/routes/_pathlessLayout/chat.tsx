import { useChat } from "@ai-sdk/react";
import { createFileRoute } from "@tanstack/react-router";
import { DefaultChatTransport } from "ai";
import {
	Conversation,
	ConversationContent,
	ConversationScrollButton,
} from "@/components/ai-elements/conversation.tsx";
import { Message, MessageContent } from "@/components/ai-elements/message.tsx";
import PromptInputComponent from "@/components/PromptInput.tsx";
import { AITypingBubble } from "@/components/ui/AITypingBubble.tsx";
import { Markdown } from "@/components/ui/markdown.tsx";
import { m } from "@/paraglide/messages.js";

export const Route = createFileRoute("/_pathlessLayout/chat")({
	component: Chat,
});

function Chat() {
	const { messages, sendMessage, status } = useChat({
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

	return (
		<div className="grid pb-4 h-dvh grid-rows-[1fr_auto]">
			{/* Scrollable content */}
			<Conversation>
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
											)
										default:
											return null
									}
								})}
								{status === "streaming" &&
									index === messages.length - 1 &&
									message.role === "assistant" && <AITypingBubble />}
							</MessageContent>
						</Message>
					))}
				</ConversationContent>
				<ConversationScrollButton />
			</Conversation>
			{/* @ts-expect-error*/}
			<PromptInputComponent sendMessage={sendMessage} status={status} />
		</div>
	)
}
