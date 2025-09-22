import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/questionnaire")({
	component: Questionnaire,
	validateSearch: (search) =>
		z.object({ type: z.enum(["chat", "dashboard"]) }).parse(search),
});

function Questionnaire() {
	const nav = useNavigate();
	const { type } = Route.useSearch();

	const submit = async () => {
		console.log("Submitting questionnaire...", type);
		void nav({ to: "/thanks" });
	};

	return (
		<main className="mx-auto max-w-2xl p-6 space-y-6">
			<h2 className="text-xl font-semibold">Fragebogen</h2>
			{/* Likert-Komponenten etc. */}
			<div className="flex justify-end">
				<Button onClick={submit}>Absenden</Button>
			</div>
		</main>
	);
}
