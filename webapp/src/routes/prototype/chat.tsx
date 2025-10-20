import {useChat} from "@ai-sdk/react";
import {createFileRoute, Link} from "@tanstack/react-router";
import {DefaultChatTransport} from "ai";
import {Conversation, ConversationContent, ConversationScrollButton,} from "@/components/ai-elements/conversation.tsx";
import {Message, MessageContent} from "@/components/ai-elements/message.tsx";
import PromptInputComponent from "@/components/PromptInput.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Markdown} from "@/components/ui/markdown.tsx";

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
		<div className="flex flex-col justify-between h-full relative">
			{/* Header */}
			<div className="sticky top-0 z-20 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
				<div className="flex items-center justify-between py-3">
					<h2 className="text-xl font-semibold">Chat-Prototyp</h2>
					<Button asChild>
						<Link to="/questionnaire" search={{ type: "chat" }}>
							Weiter zum Fragebogen
						</Link>
					</Button>
				</div>
			</div>

			{/* Scrollable content */}
			<div className="flex flex-col h-full">
				<Conversation>
					<ConversationContent>
						{messages.map((message) => (
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
								</MessageContent>
							</Message>
						))}
					</ConversationContent>
					<ConversationScrollButton />
				</Conversation>
			</div>
			{/* Prompt unten */}
			<div className="sticky bottom-0 z-20 bg-background/80 pb-2 backdrop-blur supports-[backdrop-filter]:bg-background/60">
				<PromptInputComponent sendMessage={sendMessage} status={status} />
			</div>
		</div>
	);
}
