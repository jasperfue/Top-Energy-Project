import { ArrowUp, Square } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	PromptInput,
	PromptInputAction,
	PromptInputActions,
	PromptInputTextarea,
} from "@/components/ui/prompt-input";

export function PromptInputComponent({
	onSubmit,
	isLoading,
	onStop,
}: {
	onSubmit: (value: string) => void;
	isLoading: boolean;
	onStop: () => void;
}) {
	const [inputValue, setInputValue] = useState("");

	const handleSendOrStop = () => {
		if (isLoading) {
			onStop();
			return;
		}
		const value = inputValue.trim();
		if (!value) return;
		onSubmit(value);
		setInputValue("");
	};

	return (
		<PromptInput
			value={inputValue}
			onValueChange={setInputValue}
			isLoading={isLoading}
			onSubmit={handleSendOrStop}
			className="w-full"
		>
			<PromptInputTextarea placeholder="Ask me anything..." />
			<PromptInputActions className="justify-end pt-2">
				<PromptInputAction
					tooltip={isLoading ? "Stop generation" : "Send message"}
				>
					<Button
						variant="default"
						size="icon"
						className="h-8 w-8 rounded-full"
						onClick={handleSendOrStop}
					>
						{isLoading ? (
							<Square className="size-4 fill-current" />
						) : (
							<ArrowUp className="size-5" />
						)}
					</Button>
				</PromptInputAction>
			</PromptInputActions>
		</PromptInput>
	);
}
