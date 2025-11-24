import { useChat } from "@ai-sdk/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { DefaultChatTransport } from "ai";
import {
	Conversation,
	ConversationContent,
	ConversationScrollButton,
} from "@/components/ai-elements/conversation.tsx";
import { Message, MessageContent } from "@/components/ai-elements/message.tsx";
import PromptInputComponent from "@/components/PromptInput.tsx";
import { AITypingBubble } from "@/components/ui/AITypingBubble.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Markdown } from "@/components/ui/markdown.tsx";

export const Route = createFileRoute("/prototype/chat")({
	component: Chat,
});

function Chat() {
	const { messages, sendMessage, status } = useChat({
		transport: new DefaultChatTransport({
			api: "/api/chat",
		}),
	});
	return (
		<div className="grid py-4 h-dvh grid-rows-[auto_1fr_auto]">
			{/* Header */}
			<div className="flex items-center justify-between py-3">
				<h2 className="text-xl font-semibold">Chat-Prototyp</h2>
				<Button asChild>
					<Link to="/questionnaire">Weiter zum Fragebogen</Link>
				</Button>
			</div>
			{/* Scrollable content */}
			<div className="min-h-0 overflow-y-auto">
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
					<ConversationScrollButton />
				</Conversation>
			</div>
			<PromptInputComponent sendMessage={sendMessage} status={status} />
		</div>
	);
}
