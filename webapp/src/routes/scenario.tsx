import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/scenario")({
	component: Scenario,
});

function Scenario() {
	const nav = useNavigate();

	const start = async () => {
		// Hier später Backend fragen
		const type = Math.random() < 0.5 ? "chat" : "dashboard";
		void nav({ to: `/prototype/${type}` });
	};

	return (
		<main className="mx-auto max-w-3xl p-6 space-y-6">
			<h1 className="text-2xl font-semibold">Szenario</h1>
			<p className="text-muted-foreground">
				Stell dir vor, du bist Inhaber eines KMU und stehst vor der
				Entscheidung, welches Energiesystem du einbauen willst. Dein Ziel ist
				es, Kosten, CO₂-Emissionen und Versorgungssicherheit zu berücksichtigen.
				Das folgende DSS präsentiert dir eine empfohlene Lösung und erklärt die
				maßgeblichen Gründe.
			</p>
			<Separator />
			<div className="grid md:grid-cols-3 gap-4">
				<Card>
					<CardHeader>Option A</CardHeader>
					<CardContent>z. B. PV + Wärmepumpe</CardContent>
				</Card>
				<Card>
					<CardHeader>Option B</CardHeader>
					<CardContent>z. B. BHKW + Gasboiler</CardContent>
				</Card>
				<Card>
					<CardHeader>Option C</CardHeader>
					<CardContent>z. B. Status quo + Effizienzmaßnahmen</CardContent>
				</Card>
			</div>
			<p className="text-sm text-muted-foreground">
				Das DSS hilft dir, diese Optionen anhand deiner Lastprofile und
				Randbedingungen zu bewerten und eine Empfehlung auszusprechen.
			</p>
			<div className="flex justify-end">
				<Button onClick={start}>Jetzt starten</Button>
			</div>
		</main>
	);
}
