import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/thanks")({
	component: Thanks,
});

function Thanks() {
	return (
		<main className="mx-auto max-w-xl p-6">
			<Card className="text-center">
				<CardHeader className="space-y-3">
					<div className="mx-auto h-14 w-14 rounded-full border flex items-center justify-center">
						<CheckCircle2 className="h-8 w-8" aria-hidden />
					</div>
					<h1 className="text-2xl font-semibold">
						Vielen Dank für deine Teilnahme!
					</h1>
				</CardHeader>

				<CardContent className="space-y-4">
					<p className="text-muted-foreground">
						Deine Antworten wurden erfasst. Du kannst das Fenster jetzt
						schließen.
					</p>
					<Separator />
					<p className="text-sm text-muted-foreground">
						Bei Fragen zur Studie wende dich gerne an das Forschungsteam.
					</p>
				</CardContent>
			</Card>
		</main>
	);
}
