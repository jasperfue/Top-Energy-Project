import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { ArrowRight, Clock, Loader2, Mail } from "lucide-react";
import { useId, useState } from "react";
import { z } from "zod";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent } from "@/components/ui/card.tsx";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import { airtable } from "@/lib/airtable.ts";
import { usePreloadRoute } from "@/lib/usePreloadRoute.ts";
import { useUserSession } from "@/lib/useUserSession.ts";
import { m } from "@/paraglide/messages.js";

export const Route = createFileRoute("/")({
	component: Consent,
});

const startStudy = createServerFn({ method: "POST" })
	.inputValidator(
		z.object({
			isTargetAudience: z.boolean(),
		}),
	)
	.handler(async ({ data }) => {
		const [session, records] = await Promise.all([
			useUserSession(),
			airtable.create([
				{
					fields: {
						"Teilnehmer ID": crypto.randomUUID(),
						Zielgruppe: data.isTargetAudience,
					},
				},
			]),
		]);

		if (!records || records.length === 0) {
			throw new Error("Failed to create Airtable record");
		}

		const newRecId = records[0].id;
		await session.update({ recId: newRecId });
		return { recId: newRecId };
	});

function Consent() {
	const nav = useNavigate();
	const [isTargetAudience, setIsTargetAudience] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const checkboxId = useId();
	usePreloadRoute("/affinity-for-technology");

	const handleStart = async () => {
		setIsLoading(true);
		try {
			await startStudy({ data: { isTargetAudience } });
			await nav({ to: "/affinity-for-technology" });
		} catch (error) {
			console.error("Failed to start study:", error);
			setIsLoading(false);
		}
	};

	return (
		<main className="mx-auto max-w-2xl p-6 space-y-8 min-h-[80vh] flex flex-col justify-center">
			{/* HEADER SECTION */}
			<div className="space-y-4 text-center sm:text-left">
				<h1 className="text-3xl font-bold tracking-tight text-primary">
					{m.landing_title()}
				</h1>

				<div className="flex justify-center sm:justify-start">
					<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted text-sm text-muted-foreground border">
						<Clock className="w-4 h-4" />
						<span>{m.landing_duration()}</span>
					</div>
				</div>

				<p className="text-lg text-muted-foreground leading-relaxed">
					{m.landing_intro()}
				</p>
			</div>

			<Separator />

			{/* RESEARCHER INFO */}
			<section className="space-y-3">
				<h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
					{m.landing_context_title()}
				</h2>

				<Card className="bg-muted/30 border-none shadow-sm">
					<CardContent className="flex flex-col gap-1 p-4">
						<span className="font-semibold text-foreground">Jasper Fülle</span>
						<span className="text-sm text-muted-foreground">
							Master Thesis • University of Cologne
						</span>
						<a
							href="mailto:jfuelle@smail.uni-koeln.de"
							className="flex text-sm items-center gap-2 text-blue-600 hover:underline mt-1 transition-colors"
						>
							<Mail className="h-3.5 w-3.5" />
							jfuelle@smail.uni-koeln.de
						</a>
					</CardContent>
				</Card>
			</section>

			{/* DATENSCHUTZ ACCORDION */}
			<Accordion type="single" collapsible className="w-full">
				<AccordionItem value="privacy" className="border-b-0">
					<AccordionTrigger className="text-sm text-muted-foreground hover:text-foreground py-2">
						{m.landing_privacy_trigger()}
					</AccordionTrigger>
					<AccordionContent className="text-sm text-muted-foreground space-y-3 leading-relaxed p-2 bg-muted/20 rounded-md">
						<p>{m.landing_privacy_p1()}</p>
						<p>{m.landing_privacy_p2()}</p>
						<p>
							<strong>{m.landing_privacy_p3_strong()}</strong>{" "}
							{m.landing_privacy_p3()}
						</p>
					</AccordionContent>
				</AccordionItem>
			</Accordion>

			{/* SCREENING CHECKBOX */}
			<div className="p-6 border rounded-xl bg-card shadow-sm space-y-4 transition-all hover:border-primary/50">
				<h3 className="font-medium text-foreground flex items-center gap-2">
					{m.landing_eligibility_title()}
				</h3>

				<label
					htmlFor={checkboxId}
					className="flex items-start gap-4 cursor-pointer group select-none"
				>
					<Checkbox
						id={checkboxId}
						checked={isTargetAudience}
						onCheckedChange={(v) => setIsTargetAudience(Boolean(v))}
						className="mt-1 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
					/>
					<div className="space-y-1.5">
						<span className="block text-sm font-medium text-foreground group-hover:text-primary transition-colors">
							{m.landing_checkbox_label()}
						</span>
						<p className="text-xs text-muted-foreground leading-normal">
							{m.landing_checkbox_sublabel()}
						</p>
					</div>
				</label>
			</div>

			{/* ACTION BUTTON */}
			<div className="flex justify-end pt-2">
				<Button
					size="lg"
					onClick={handleStart}
					disabled={isLoading}
					className="w-full sm:w-auto text-base"
				>
					{isLoading ? (
						<Loader2 className="h-4 w-4 animate-spin" />
					) : (
						<>
							{m.common_start_study()}
							<ArrowRight className="ml-2 h-4 w-4" />
						</>
					)}
				</Button>
			</div>
		</main>
	);
}
