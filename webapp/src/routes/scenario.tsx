import {
	createFileRoute,
	useNavigate,
	useRouter,
} from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import {
	AlertCircle,
	ArrowRight,
	Briefcase,
	Factory,
	FileText,
	Loader2,
	TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert.tsx";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
						Startzeit: new Date().toISOString(),
					},
				},
			])
			.catch((err: Error) => {
				console.error("Error updating study variant:", err);
			});
	});

const getPrototypeType = createServerFn().handler(
	async (): Promise<{ variant: "chat" | "dashboard"; isExisting: boolean }> => {
		const session = await useUserSession();

		// Check if there is already a record for the current user
		if (session.data.recId) {
			try {
				const userRecord = await airtable.find(session.data.recId);
				const currentVariant = userRecord.fields?.Studienvariante;

				if (currentVariant === "Chat") {
					return { variant: "chat", isExisting: true };
				}
				if (currentVariant === "Dashboard") {
					return { variant: "dashboard", isExisting: true };
				}
			} catch (error) {
				console.error("Failed to fetch existing user record:", error);
			}
		}

		const allRecords = await airtable
			.select({ fields: ["Studienvariante"] })
			.all();

		const counts = { chat: 0, dashboard: 0 };
		for (const record of allRecords) {
			const v = record.fields?.Studienvariante;
			if (v === "Chat") counts.chat++;
			else if (v === "Dashboard") counts.dashboard++;
		}

		const newVariant = counts.chat > counts.dashboard ? "dashboard" : "chat";
		return { variant: newVariant, isExisting: false };
	},
);

function Scenario() {
	const nav = useNavigate();
	const [isLoading, setIsLoading] = useState(false);
	const { deferredSlowData } = Route.useLoaderData();
	const router = useRouter();

	useEffect(() => {
		deferredSlowData
			.then(({ variant }) => {
				void router.preloadRoute({
					to: `/${variant}`,
				});
			})
			.catch((err) => {
				console.error("Failed to resolve prototype type for preloading", err);
			});
	}, [deferredSlowData, router]);

	const start = async () => {
		if (isLoading) return;
		setIsLoading(true);

		try {
			const { variant, isExisting } = await deferredSlowData;
			// Only update if the variant is not already set in Airtable
			if (!isExisting) {
				await updateStudyVariant({ data: variant });
			}
			await nav({ to: `/${variant}` });
		} catch (error) {
			console.error("Error during start sequence:", error);
			setIsLoading(false);
		}
	};

	return (
		<main className="bg-muted/20 flex items-center justify-center p-6 min-h-[80vh] flex-col">
			<div className="max-w-4xl w-full space-y-8 bg-background p-8 rounded-xl shadow-sm border">
				{/* HEADLINE & ROLE */}
				<div className="space-y-4 text-center max-w-2xl mx-auto">
					<div className="flex justify-center mb-4">
						<div className="p-3 bg-primary/10 rounded-full">
							<Briefcase className="w-8 h-8 text-primary" />
						</div>
					</div>
					<h1 className="text-3xl font-bold tracking-tight">
						{m.scenario_title()}
					</h1>
					<p className="text-lg text-muted-foreground leading-relaxed">
						{m.scenario_role_text()}
					</p>
				</div>

				<Separator className="my-6" />

				{/* STATUS QUO CARDS (GRID) */}
				<div>
					<h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
						{m.scenario_problem_intro()}
					</h3>
					<div className="grid md:grid-cols-3 gap-6">
						{/* Karte 1: Versorgung */}
						<Card className="bg-muted/30 border-dashed">
							<CardHeader className="pb-3 flex flex-row items-center gap-2 space-y-0">
								<Factory className="w-4 h-4 text-orange-500" />
								<CardTitle className="text-base">
									{m.scenario_card_status_title()}
								</CardTitle>
							</CardHeader>
							<CardContent className="text-sm text-muted-foreground">
								{m.scenario_card_status_content()}
							</CardContent>
						</Card>

						{/* Karte 2: Schmerzpunkte */}
						<Card className="bg-muted/30 border-dashed">
							<CardHeader className="pb-3 flex flex-row items-center gap-2 space-y-0">
								<TrendingUp className="w-4 h-4 text-red-500" />
								<CardTitle className="text-base">
									{m.scenario_card_pain_title()}
								</CardTitle>
							</CardHeader>
							<CardContent className="text-sm text-muted-foreground">
								{m.scenario_card_pain_content()}
							</CardContent>
						</Card>

						{/* Karte 3: Das Event */}
						<Card className="bg-blue-50/50 border-blue-100 dark:bg-blue-900/10 dark:border-blue-900">
							<CardHeader className="pb-3 flex flex-row items-center gap-2 space-y-0">
								<FileText className="w-4 h-4 text-blue-600" />
								<CardTitle className="text-base text-blue-900 dark:text-blue-100">
									{m.scenario_card_event_title()}
								</CardTitle>
							</CardHeader>
							<CardContent className="text-sm text-blue-800/80 dark:text-blue-200/80">
								{m.scenario_card_event_content()}
							</CardContent>
						</Card>
					</div>
				</div>

				{/* TASK & CTA */}
				<div className="pt-4">
					<Alert className="bg-primary/5 border-primary/20">
						<AlertCircle className="h-4 w-4 text-primary" />
						<AlertTitle className="text-primary font-semibold">
							{m.scenario_task_title()}
						</AlertTitle>
						<AlertDescription className="text-muted-foreground mt-1">
							{m.scenario_task_desc()}
							<br />
							<strong>{m.scenario_task_question()}</strong>
						</AlertDescription>
					</Alert>

					<div className="mt-8 flex justify-end">
						<Button
							onClick={start}
							disabled={isLoading}
							size="lg"
							className="w-full md:w-auto font-semibold shadow-lg hover:shadow-xl transition-all"
						>
							{isLoading ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								<>
									{m.scenario_start_button()}
									<ArrowRight className="ml-2 h-4 w-4" />
								</>
							)}
						</Button>
					</div>
				</div>
			</div>
		</main>
	);
}
