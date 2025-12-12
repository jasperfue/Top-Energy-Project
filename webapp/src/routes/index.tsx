import { createFileRoute, Link } from "@tanstack/react-router";
import { useId, useState } from "react";
import { Button } from "@/components/ui/button.tsx";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import { m } from "@/paraglide/messages.js";

export const Route = createFileRoute("/")({
	component: Consent,
});

function Consent() {
	const [consent, setConsent] = useState(false);
	const checkboxId = useId();

	return (
		<main className="mx-auto max-w-2xl p-6 space-y-6">
			<h1 className="text-2xl font-semibold">{m.consent_title()}</h1>
			<p className="text-muted-foreground">{m.consent_blurb()}</p>
			<Separator />
			<label
				htmlFor={checkboxId}
				className="flex items-center gap-3 cursor-pointer"
			>
				<Checkbox
					id={checkboxId}
					checked={consent}
					onCheckedChange={(v) => setConsent(Boolean(v))}
				/>
				<span>{m.consent_checkbox_label()}</span>
			</label>
			<div className="flex justify-end">
				<Button disabled={!consent} asChild>
					<Link to="/affinity-for-technology">{m.common_continue()}</Link>
				</Button>
			</div>
		</main>
	);
}
