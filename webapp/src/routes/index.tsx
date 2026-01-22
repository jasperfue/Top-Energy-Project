import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { ArrowRight, Clock, Loader2, Mail } from "lucide-react";
import { useState } from "react";
import ReactCountryFlag from "react-country-flag";
import { z } from "zod";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent } from "@/components/ui/card.tsx";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
} from "@/components/ui/select.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import { usePreloadRoute } from "@/lib/usePreloadRoute.ts";
import { useUserSession } from "@/lib/useUserSession.ts";
import { cn } from "@/lib/utils";
import { m } from "@/paraglide/messages.js";
import { getLocale, locales, setLocale } from "@/paraglide/runtime";

export const clearSession = createServerFn({ method: "POST" }).handler(
	async () => {
		const session = await useUserSession();
		await session.clear();
	},
);

export const Route = createFileRoute("/")({
	component: Consent,
	beforeLoad: async () => {
		await clearSession();
	},
});

const getCountryCode = (locale: string) =>
	locale === "en" ? "GB" : locale.toUpperCase();

const startStudy = createServerFn({ method: "POST" })
	.inputValidator(
		z.object({
			isTargetAudience: z.boolean(),
		}),
	)
	.handler(async ({ data }) => {
		const session = await useUserSession();
		await session.update({
			"Teilnehmer ID": crypto.randomUUID(),
			Zielgruppe: data.isTargetAudience,
		});
	});

function Consent() {
	const nav = useNavigate();
	const [selection, setSelection] = useState<"yes" | "no" | undefined>(
		undefined,
	);
	const [isLoading, setIsLoading] = useState(false);
	usePreloadRoute("/affinity-for-technology");

	const handleStart = async () => {
		if (!selection) return;
		setIsLoading(true);
		try {
			await startStudy({ data: { isTargetAudience: selection === "yes" } });
			await nav({ to: "/affinity-for-technology" });
		} catch (error) {
			console.error("Failed to start study:", error);
			setIsLoading(false);
		}
	};

	return (
		<main className="mx-auto max-w-2xl w-full p-4 md:p-6 space-y-6 md:space-y-8 min-h-[80vh] flex flex-col justify-center">
			{/* HEADER SECTION */}
			<div className="space-y-4 text-center sm:text-left">
				<h1 className="text-2xl md:text-3xl font-bold tracking-tight text-primary">
					{m.landing_title()}
				</h1>

				<div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
					<Select value={getLocale()} onValueChange={setLocale}>
						<SelectTrigger className="w-auto h-8 gap-2 rounded-full bg-background border shadow-sm pl-3 pr-3 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors focus:ring-1 focus:ring-primary/20">
							<span>{m.common_language()}</span>
							<span className="w-px h-3 bg-border" />
							<div className="flex items-center justify-center overflow-hidden w-4 h-3">
								<ReactCountryFlag
									style={{ width: "100%", height: "100%", objectFit: "cover" }}
									svg
									countryCode={getCountryCode(getLocale())}
								/>
							</div>
						</SelectTrigger>

						<SelectContent align="start">
							{locales.map((locale) => (
								<SelectItem
									key={locale}
									value={locale}
									className="text-sm cursor-pointer"
								>
									<div className="flex items-center gap-2">
										<ReactCountryFlag
											svg
											style={{ width: 16, height: 16 }}
											countryCode={getCountryCode(locale)}
										/>
										<span className="uppercase text-muted-foreground text-xs font-medium">
											{locale}
										</span>
									</div>
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					<div className="inline-flex h-8 items-center gap-2 px-3 rounded-full bg-muted border border-transparent text-xs font-medium text-muted-foreground">
						<Clock className="w-3.5 h-3.5" />
						<span>{m.landing_duration()}</span>
					</div>
				</div>

				<p className="text-base md:text-lg text-muted-foreground leading-relaxed pt-2">
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
							className="flex w-fit text-sm items-center gap-2 text-blue-600 hover:underline mt-1 py-1 transition-colors"
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
					<AccordionTrigger className="text-sm text-muted-foreground hover:text-foreground py-3">
						{m.landing_privacy_trigger()}
					</AccordionTrigger>
					<AccordionContent className="text-sm text-muted-foreground space-y-3 leading-relaxed p-3 md:p-4 bg-muted/20 rounded-md">
						<p>{m.landing_privacy_p1()}</p>
						<p>{m.landing_privacy_p2()}</p>
						<p>
							<strong>{m.landing_privacy_p3_strong()}</strong>{" "}
							{m.landing_privacy_p3()}
						</p>
					</AccordionContent>
				</AccordionItem>
			</Accordion>

			<div className="p-4 md:p-6 border rounded-xl bg-card shadow-sm space-y-4 transition-all">
				<div className="space-y-1">
					<h3 className="font-medium text-foreground flex items-center gap-2">
						{m.landing_eligibility_title()}
					</h3>
					<p className="text-sm text-muted-foreground leading-normal">
						{m.landing_checkbox_sublabel()}
					</p>
				</div>

				<RadioGroup
					value={selection}
					onValueChange={(val: "yes" | "no") => setSelection(val)}
					className="flex flex-col gap-3 pt-2"
				>
					<Label
						htmlFor="option-yes"
						className={cn(
							"flex items-center space-x-3 space-y-0 rounded-md border p-4 cursor-pointer hover:bg-muted/50 transition-colors active:scale-[0.99]",
							selection === "yes"
								? "border-primary bg-primary/5"
								: "border-border",
						)}
					>
						<RadioGroupItem value="yes" id="option-yes" className="shrink-0" />
						<span className="font-normal text-sm">
							{m.landing_checkbox_label_positive()}
						</span>
					</Label>

					{/* OPTION 2: NEIN */}
					<Label
						htmlFor="option-no"
						className={cn(
							"flex items-center space-x-3 space-y-0 rounded-md border p-4 cursor-pointer hover:bg-muted/50 transition-colors active:scale-[0.99]",
							selection === "no"
								? "border-primary bg-primary/5"
								: "border-border",
						)}
					>
						<RadioGroupItem value="no" id="option-no" className="shrink-0" />
						<span className="font-normal text-sm">
							{m.landing_checkbox_label_negative()}
						</span>
					</Label>
				</RadioGroup>
			</div>

			{/* ACTION BUTTON */}
			<div className="flex justify-end pt-2 pb-4 md:pb-0">
				<Button
					size="lg"
					onClick={handleStart}
					disabled={isLoading || selection !== "yes"}
					className="w-full sm:w-auto h-12 shadow-md sm:shadow-none"
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
