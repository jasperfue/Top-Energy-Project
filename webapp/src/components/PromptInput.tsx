import type { useChat } from "@ai-sdk/react";
import { useHydrated } from "@tanstack/react-router";
import type { ChatStatus } from "ai";
import { useRef } from "react";
import {
	PromptInput,
	PromptInputBody,
	PromptInputFooter,
	type PromptInputMessage,
	PromptInputSubmit,
	PromptInputTextarea,
	PromptInputTools,
} from "@/components/ai-elements/prompt-input.tsx";
import { m } from "@/paraglide/messages.js";

type PromptInputComponentProps = {
	status: ChatStatus;
	sendMessage: ReturnType<typeof useChat>["sendMessage"];
	stop: () => Promise<void>;
};

const PromptInputComponent = ({
	status,
	sendMessage,
	stop,
}: PromptInputComponentProps) => {
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const hydrated = useHydrated();

	const handleSubmit = (message: PromptInputMessage) => {
		if (status === "streaming") {
			void stop();
			return;
		}
		if (!message.text || !hydrated) return;

		void sendMessage({ text: message.text });
		if (textareaRef.current) textareaRef.current.value = "";
	};

	return (
		<PromptInput
			onSubmit={handleSubmit}
			className="mt-0 border-t bg-background p-2 md:p-4"
			globalDrop={false}
			multiple
		>
			<PromptInputBody>
				<PromptInputTextarea
					ref={textareaRef}
					placeholder={m.chat_prompt_placeholder()}
				/>
			</PromptInputBody>
			<PromptInputFooter>
				<PromptInputTools></PromptInputTools>
				<PromptInputSubmit
					disabled={
						!(status === "ready" || status === "streaming") || !hydrated
					}
					status={status}
					className="h-10 w-10 md:h-9 md:w-9 rounded-full md:rounded-md"
				/>
			</PromptInputFooter>
		</PromptInput>
	);
};

export default PromptInputComponent;
