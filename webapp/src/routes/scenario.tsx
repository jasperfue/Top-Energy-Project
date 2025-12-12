import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { airtable } from "@/lib/airtable.ts";
import { useUserSession } from "@/lib/useUserSession.ts";
import { m } from "@/paraglide/messages.js";

export const Route = createFileRoute("/scenario")({
	component: Scenario,
	loader: () => ({
		deferredSlowData: getPrototypeType(),
	}),
});

const updateStudyVariant = createServerFn({ method: "POST" })
	.inputValidator(z.enum(["chat", "dashboard"]))
	.handler(async ({ data }) => {
		const session = await useUserSession();
		if (!session.data.recId) throw new Error("No recId in session data");

		await airtable
			.update([
				{
					id: session.data.recId,
					fields: {
						Studienvariante: data === "chat" ? "Chat" : "Dashboard",
					},
				},
			])
			.catch((err: Error) => {
				console.error("Error updating study variant:", err);
			});
	});

const getPrototypeType = createServerFn().handler(
	async (): Promise<"chat" | "dashboard"> => {
		const allRecords = await airtable
			.select({ fields: ["Studienvariante"] })
			.all();

		const counts = { chat: 0, dashboard: 0 };
		for (const record of allRecords) {
			const v = record.fields?.Studienvariante;
			if (v === "Chat") counts.chat++;
			else if (v === "Dashboard") counts.dashboard++;
		}

		return counts.chat > counts.dashboard ? "dashboard" : "chat";
	},
);

function Scenario() {
	const nav = useNavigate();
	const [isLoading, setIsLoading] = useState(false);
	const { deferredSlowData } = Route.useLoaderData();

	const start = async () => {
		//TODO: Hier vielleicht gucken, ob man doch einen Link daraus machen kann, der zu prototype weiterleitet sobald deferredSlowData verfügbar ist.
		// Und wenn deferredSlowData verfügbar ist, soll automatisch updateStudyVariant aufgerufen werden.
		if (isLoading) return;
		setIsLoading(true);

		const prototypeType = await deferredSlowData;
		await updateStudyVariant({ data: prototypeType });
		await nav({ to: `/${prototypeType}` });
	};

	return (
		<main className="mx-auto max-w-3xl p-6 space-y-6">
			<h1 className="text-2xl font-semibold">{m.scenario_title()}</h1>

			<p className="text-muted-foreground">{m.scenario_intro()}</p>

			<Separator />

			<div className="grid md:grid-cols-3 gap-4">
				<Card>
					<CardHeader>Option A</CardHeader>
					<CardContent>{m.scenario_option_a_content()}</CardContent>
				</Card>
				<Card>
					<CardHeader>Option B</CardHeader>
					<CardContent>{m.scenario_option_b_content()}</CardContent>
				</Card>
				<Card>
					<CardHeader>Option C</CardHeader>
					<CardContent>{m.scenario_option_c_content()}</CardContent>
				</Card>
			</div>

			<p className="text-sm text-muted-foreground">
				{m.scenario_helper_text()}
			</p>

			<div className="flex justify-end">
				<Button onClick={start} disabled={isLoading}>
					{isLoading ? (
						<Loader2 className="h-4 w-4 animate-spin" />
					) : (
						m.scenario_start()
					)}
				</Button>
			</div>
		</main>
	);
}
