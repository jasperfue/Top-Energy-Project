import {
	Message,
	MessageAvatar,
	MessageContent,
} from "@/components/ui/message.tsx";
import { Tool } from "@/components/ui/tool.tsx";
import type { IncomingMessageChunk } from "@/lib/useChatStream.ts";
import { useToolStates } from "@/lib/useToolStates.ts";

export function IncomingMessage({
	message,
}: {
	message: IncomingMessageChunk[];
}) {
	const toolStates = useToolStates(message);
	return (
		<div className="space-y-4 flex justify-start">
			<Message>
				<MessageAvatar src="" fallback="AI" alt="AI" />
				{/*@ts-ignore*/}
				<MessageContent
					markdown
					className="prose-h2:mt-0! prose-h2:scroll-m-0! dark:prose-invert"
				>
					{message.map((m) => {
						if (m.type === "AIMessageChunk" && m.data.tool_calls.length > 0) {
							return (
								<>
									{m.data.tool_calls.map((toolCall) => {
										const toolState = toolStates.get(toolCall.id) ?? {
											type: toolCall.name,
											state: "input-streaming" as const,
											input: toolCall.args,
										};
										return <Tool key={toolCall.id} toolPart={toolState} />;
									})}
								</>
							);
						} else if (m.type === "tool") {
							return null;
						} else {
							return m.data.content;
						}
					})}
				</MessageContent>
			</Message>
		</div>
	);
}
