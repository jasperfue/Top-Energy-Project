import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/prototype/chat")({
	component: Chat,
});

function Chat() {
	return (
		<main className="p-6 space-y-4">
			<h2 className="text-xl font-semibold">Chat-Prototyp</h2>
			<div className="space-y-2">
				<div className="rounded-2xl border p-3 w-fit">Empfehlung: Option A</div>
				<div className="rounded-2xl border p-3 w-fit">Begründung 1…</div>
				<div className="rounded-2xl border p-3 w-fit">Begründung 2…</div>
			</div>
			<div className="flex justify-end">
				<Link to="/questionnaire" search={{ type: "chat" }}>
					Weiter zum Fragebogen
				</Link>
			</div>
		</main>
	);
}
