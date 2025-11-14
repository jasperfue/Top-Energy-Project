import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { airtable } from "@/lib/airtable.ts";
import { useUserSession } from "@/lib/useUserSession.ts";
import { m } from "@/paraglide/messages.js";

export const Route = createFileRoute("/scenario")({
	component: Scenario,
});

const getPrototypeType = createServerFn().handler(
	async (): Promise<"chat" | "dashboard"> => {
		const [session, allRecords] = await Promise.all([
			useUserSession(),
			airtable.select({ fields: ["Studienvariante"] }).all(),
		]);
		if (!session.data.recId) throw new Error("No recId in session data");

		const counts = { chat: 0, dashboard: 0 };
		for (const record of allRecords) {
			const v = record.fields?.Studienvariante;
			if (v === "Chat") counts.chat++;
			else if (v === "Dashboard") counts.dashboard++;
		}

		const newType = counts.chat > counts.dashboard ? "dashboard" : "chat";
		await airtable
			.update([
				{
					id: session.data.recId,
					fields: {
						Studienvariante: newType === "chat" ? "Chat" : "Dashboard",
					},
				},
			])
			.catch((err: Error) => {
				console.error("Error updating study variant:", err);
			});

		return newType;
	},
);

function Scenario() {
	const nav = useNavigate();
	const [isLoading, setIsLoading] = useState(false);

	const start = async () => {
		setIsLoading(true);
		const type = await getPrototypeType();
		void nav({ to: `/prototype/${type}` });
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
