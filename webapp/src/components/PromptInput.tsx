"use client";

import { ArrowUp, Square } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	PromptInput,
	PromptInputAction,
	PromptInputActions,
	PromptInputTextarea,
} from "@/components/ui/prompt-input";

export function PromptInputComponent() {
	const inputRef = useRef<HTMLTextAreaElement | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = () => {
		if (!inputRef.current) return;
		console.log("submit: ", inputRef.current.value);
		setIsLoading(true);
		setTimeout(() => {
			setIsLoading(false);
		}, 2000);
	};

	return (
		<PromptInput
			isLoading={isLoading}
			onSubmit={handleSubmit}
			className="w-full"
		>
			<PromptInputTextarea ref={inputRef} placeholder="Ask me anything..." />
			<PromptInputActions className="justify-end pt-2">
				<PromptInputAction
					tooltip={isLoading ? "Stop generation" : "Send message"}
				>
					<Button
						variant="default"
						size="icon"
						className="h-8 w-8 rounded-full"
						onClick={handleSubmit}
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
