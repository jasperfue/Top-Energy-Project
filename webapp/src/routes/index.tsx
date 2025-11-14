import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useId, useState } from "react";
import { Button } from "@/components/ui/button.tsx";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import { useUserSession } from "@/lib/userIdSession.ts";
import { m } from "@/paraglide/messages.js";

const setNewUserId = createServerFn().handler(async () => {
	const session = await useUserSession();
	const newUserId = crypto.randomUUID();
	await session.update({ userId: newUserId });
});

export const Route = createFileRoute("/")({
	component: Consent,
	ssr: false, // So the beforeLoad function runs on the client -> Function needs a request
	beforeLoad: () => {
		void setNewUserId();
	},
});

function Consent() {
	const nav = useNavigate();
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
				<Button
					disabled={!consent}
					onClick={() => nav({ to: "/affinity-for-technology" })}
				>
					{m.common_continue()}
				</Button>
			</div>
		</main>
	);
}
