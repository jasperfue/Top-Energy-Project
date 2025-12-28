import type { useChat } from "@ai-sdk/react";
import { useHydrated } from "@tanstack/react-router";
import type { ChatStatus } from "ai";
import { useRef, useState } from "react";
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
};

const PromptInputComponent = ({
	status,
	sendMessage,
}: PromptInputComponentProps) => {
	const [text, setText] = useState("");
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const hydrated = useHydrated();

	const handleSubmit = (message: PromptInputMessage) => {
		if (!message.text) {
			return;
		}
		void sendMessage({ text: message.text });
		setText("");
	};

	return (
		<PromptInput onSubmit={handleSubmit} className="mt-4" globalDrop multiple>
			<PromptInputBody>
				<PromptInputTextarea
					onChange={(e) => setText(e.target.value)}
					ref={textareaRef}
					value={text}
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
				/>
			</PromptInputFooter>
		</PromptInput>
	);
};

export default PromptInputComponent;
