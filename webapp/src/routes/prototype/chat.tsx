import { createFileRoute, Link } from "@tanstack/react-router";
import { PromptInputComponent } from "@/components/PromptInput.tsx";
import { Button } from "@/components/ui/button.tsx";

export const Route = createFileRoute("/prototype/chat")({
	component: Chat,
});

function Chat() {
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
			<PromptInputComponent />
		</div>
	);
}
