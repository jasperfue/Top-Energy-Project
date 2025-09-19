import { Button } from "@/components/ui/button.tsx";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/intro")({
	component: Intro,
});

function Intro() {
	const nav = useNavigate();
	const [consent, setConsent] = useState(false);

	return (
		<main className="mx-auto max-w-2xl p-6 space-y-6">
			<h1 className="text-2xl font-semibold">
				Studieninformation & Einwilligung
			</h1>
			<p className="text-muted-foreground">
				Kurzbeschreibung der Studie, Datenerhebung (anonym/pseudonym), Dauer,
				Kontakt, Widerruf etc.
			</p>
			<Separator />
			<label className="flex items-start gap-3">
				<Checkbox
					checked={consent}
					onCheckedChange={(v) => setConsent(Boolean(v))}
				/>
				<span>Ich habe die Informationen gelesen und willige ein.</span>
			</label>
			<div className="flex justify-end">
				<Button disabled={!consent} onClick={() => nav({ to: "/scenario" })}>
					Weiter
				</Button>
			</div>
		</main>
	);
}
