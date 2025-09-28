import { createFileRoute, Link } from "@tanstack/react-router";
import { User } from "lucide-react";
import { nanoid } from "nanoid";
import { useState } from "react";
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
		startChat.mutate({
			prompt: value,
			onChunk: (t) => {
				setContent((prev) => {
					const id = t?.data?.id; // ggf. an deine Struktur anpassen
					const idx = prev.findIndex((c) => c.id === id);

					if (idx !== -1 && prev[idx].type === "IncomingMessage") {
						const item = prev[idx];
						const updated = {
							...item,
							message: [...(item.message ?? []), t],
						};
						return [...prev.slice(0, idx), updated, ...prev.slice(idx + 1)];
					}

					return [...prev, { type: "IncomingMessage", id, message: [t] }];
				});
			},
		});
	};

	return (
		<div className="flex flex-col justify-between h-full">
			<div className="flex items-center justify-between mb-4">
				<h2 className="text-xl font-semibold">Chat-Prototyp</h2>
				<Button asChild>
					<Link to="/questionnaire" search={{ type: "chat" }}>
						Weiter zum Fragebogen
					</Link>
				</Button>
			</div>
			<div className="flex flex-col h-full py-6 gap-4">
				{content.map((c) =>
					c.type === "IncomingMessage" ? (
						<div key={c.id} className="space-y-4">
							<Message>
								<MessageAvatar src="" fallback="AI" alt="AI" />
								<MessageContent
									markdown
									className="prose-h2:mt-0! prose-h2:scroll-m-0! dark:prose-invert"
								>
									{c.message
										.filter((m) => m.type === "AIMessageChunk")
										.map((m) => m.data.content)
										.join("")}
								</MessageContent>
							</Message>
						</div>
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
			<PromptInputComponent onSubmit={handleSubmit} />
		</div>
	);
}
