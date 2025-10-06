import { createFileRoute, Link } from "@tanstack/react-router";
import { User } from "lucide-react";
import { nanoid } from "nanoid";
import { useState } from "react";
import { IncomingMessage } from "@/components/IncomingMessage.tsx";
import { PromptInputComponent } from "@/components/PromptInput.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
	Message,
	MessageAvatar,
	MessageContent,
} from "@/components/ui/message.tsx";
import {
	type IncomingMessageChunk,
	useChatStream,
} from "@/lib/useChatStream.ts";

export const Route = createFileRoute("/prototype/chat")({
	ssr: false,
	component: Chat,
});
type MessageType =
	| { id: string; type: "IncomingMessage"; message: IncomingMessageChunk[] }
	| { id: string; type: "OutgoingMessage"; message: string };

function Chat() {
	const startChat = useChatStream();
	const [content, setContent] = useState<MessageType[]>([]);
	const handleSubmit = (value: string) => {
		setContent((prev) => [
			...prev,
			{ id: nanoid(), type: "OutgoingMessage", message: value },
		]);
		const incomingId = nanoid();
		startChat.mutate({
			prompt: value,
			onChunk: (t) => {
				setContent((prev) => {
					const idx = prev.findIndex(
						(c) => c.id === incomingId && c.type === "IncomingMessage",
					);

					if (idx !== -1) {
						const item = prev[idx] as Extract<
							MessageType,
							{ type: "IncomingMessage" }
						>;
						const updated: MessageType = {
							...item,
							message: [...item.message, t],
						};
						return [...prev.slice(0, idx), updated, ...prev.slice(idx + 1)];
					}

					return [
						...prev,
						{ id: incomingId, type: "IncomingMessage", message: [t] },
					];
				});
			},
		});
	};

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
			<div className="flex-1 overflow-y-auto py-4 space-y-4">
				{content.map((c) =>
					c.type === "IncomingMessage" ? (
						<IncomingMessage key={c.id} message={c.message} />
					) : (
						<div key={c.id} className="space-y-4 self-end">
							<Message>
								<MessageContent className="prose-h2:mt-0! prose-h2:scroll-m-0! dark:prose-invert">
									{c.message}
								</MessageContent>
								<MessageAvatar src="" fallback={<User />} alt="User" />
							</Message>
						</div>
					),
				)}
			</div>
			{/* Prompt unten */}
			<div className="sticky bottom-0 z-20 bg-background/80 pb-2 backdrop-blur supports-[backdrop-filter]:bg-background/60">
				<PromptInputComponent onSubmit={handleSubmit} />
			</div>
		</div>
	);
}
