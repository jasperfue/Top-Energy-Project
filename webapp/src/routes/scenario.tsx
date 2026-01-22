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
		if (!session.data["Teilnehmer ID"])
			throw new Error("No Teilnehmer ID in session data");

		await session.update({
			Studienvariante: data === "chat" ? "Chat" : "Dashboard",
			Startzeit: new Date().toISOString(),
		});
	});

const getPrototypeType = createServerFn().handler(
	async (): Promise<{ variant: "chat" | "dashboard" }> => {
		const session = await useUserSession();

		if (session.data.Studienvariante) {
			return {
				variant: session.data.Studienvariante.toLowerCase() as
					| "chat"
					| "dashboard",
			};
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
		return { variant: newVariant };
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
			const { variant } = await deferredSlowData;
			// Update session if it's a new session or variant changed
			await updateStudyVariant({ data: variant });
			await nav({ to: `/${variant}` });
		} catch (error) {
			console.error("Error during start sequence:", error);
			setIsLoading(false);
		}
	};

	return (
		<main className="bg-muted/20 min-h-dvh w-full flex flex-col items-center py-4 px-4 md:py-10 md:px-6">
			<div className="max-w-4xl w-full space-y-6 md:space-y-8 bg-background p-5 md:p-8 rounded-xl shadow-sm border">
				{/* HEADLINE & ROLE */}
				<div className="space-y-3 md:space-y-4 text-center max-w-2xl mx-auto">
					<div className="flex justify-center mb-2 md:mb-4">
						<div className="p-3 bg-primary/10 rounded-full">
							<Briefcase className="w-6 h-6 md:w-8 md:h-8 text-primary" />
						</div>
					</div>
					<h1 className="text-2xl md:text-3xl font-bold tracking-tight">
						{m.scenario_title()}
					</h1>

					<p className="text-base md:text-lg text-muted-foreground leading-relaxed">
						{m.scenario_role_text()}
					</p>
				</div>

				<Separator className="my-4 md:my-6" />

				{/* STATUS QUO CARDS (GRID) */}
				<div>
					<h3 className="text-xs md:text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 md:mb-4">
						{m.scenario_problem_intro()}
					</h3>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
						{/* Karte 1: Versorgung */}
						<Card className="bg-muted/30 border-dashed shadow-none">
							<CardHeader className="pb-2 pt-4 px-4 flex flex-row items-center gap-2 space-y-0">
								<Factory className="w-4 h-4 text-orange-500 shrink-0" />
								<CardTitle className="text-sm md:text-base">
									{m.scenario_card_status_title()}
								</CardTitle>
							</CardHeader>
							<CardContent className="px-4 pb-4 text-sm text-muted-foreground">
								{m.scenario_card_status_content()}
							</CardContent>
						</Card>

						{/* Karte 2: Schmerzpunkte */}
						<Card className="bg-muted/30 border-dashed shadow-none">
							<CardHeader className="pb-2 pt-4 px-4 flex flex-row items-center gap-2 space-y-0">
								<TrendingUp className="w-4 h-4 text-red-500 shrink-0" />
								<CardTitle className="text-sm md:text-base">
									{m.scenario_card_pain_title()}
								</CardTitle>
							</CardHeader>
							<CardContent className="px-4 pb-4 text-sm text-muted-foreground">
								{m.scenario_card_pain_content()}
							</CardContent>
						</Card>

						{/* Karte 3: Das Event */}
						<Card className="bg-blue-50/50 border-blue-100 dark:bg-blue-900/10 dark:border-blue-900 shadow-none">
							<CardHeader className="pb-2 pt-4 px-4 flex flex-row items-center gap-2 space-y-0">
								<FileText className="w-4 h-4 text-blue-600 shrink-0" />
								<CardTitle className="text-sm md:text-base text-blue-900 dark:text-blue-100">
									{m.scenario_card_event_title()}
								</CardTitle>
							</CardHeader>
							<CardContent className="px-4 pb-4 text-sm text-blue-800/80 dark:text-blue-200/80">
								{m.scenario_card_event_content()}
							</CardContent>
						</Card>
					</div>
				</div>

				{/* TASK & CTA */}
				<div className="pt-2 md:pt-4">
					<Alert className="bg-primary/5 border-primary/20 flex items-start gap-2">
						<AlertCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
						<div className="grid gap-1">
							<AlertTitle className="text-primary font-semibold text-sm md:text-base">
								{m.scenario_task_title()}
							</AlertTitle>
							<AlertDescription className="text-muted-foreground text-xs md:text-sm leading-relaxed">
								{m.scenario_task_desc()}
								<br className="block my-1" />
								<strong className="text-foreground">
									{m.scenario_task_question()}
								</strong>
							</AlertDescription>
						</div>
					</Alert>

					<div className="mt-6 md:mt-8 flex justify-end">
						<Button
							onClick={start}
							disabled={isLoading}
							size="lg"
							className="w-full md:w-auto h-12 md:h-11 font-semibold shadow-lg hover:shadow-xl transition-all text-base"
						>
							{isLoading ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								<>
									<span className="md:hidden">Start</span>

									<span className="hidden md:inline">
										{m.scenario_start_button()}
									</span>

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
