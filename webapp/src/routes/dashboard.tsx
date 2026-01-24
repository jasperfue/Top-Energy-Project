import {
	createFileRoute,
	useHydrated,
	useNavigate,
} from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { CostAutarkySection } from "@/components/CostAutarkySection.tsx";
import { KpiSection } from "@/components/KpiSection.tsx";
import { StudyHeader } from "@/components/StudyHeader.tsx";
import { SystemConfigurationBar } from "@/components/SystemConfigurationBar.tsx";
import { SystemDynamicsSection } from "@/components/SystemDynamicsSection.tsx";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion.tsx";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card.tsx";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table.tsx";
import { usePreloadRoute } from "@/lib/usePreloadRoute.ts";
import * as m from "@/paraglide/messages";
import { getLocale } from "@/paraglide/runtime";
import { finishTask } from "@/routes/chat.tsx";

export const Route = createFileRoute("/dashboard")({
	component: Dashboard,
});

export const fmt = (num: number, currentLocale: ReturnType<typeof getLocale>) =>
	num.toLocaleString(currentLocale);

function Dashboard() {
	const nav = useNavigate();
	const [isFinishing, setIsFinishing] = useState(false);
	const finishTaskServerFn = useServerFn(finishTask);
	usePreloadRoute("/questionnaire");
	const hydrated = useHydrated();

	const handleFinish = async () => {
		if (isFinishing) return;
		setIsFinishing(true);

		try {
			await finishTaskServerFn({
				data: {},
			});
			await nav({
				to: "/questionnaire",
				search: { step: 1 },
			});
		} catch (error) {
			console.error(
				"Failed to finish task before navigating to questionnaire",
				error,
			);
			setIsFinishing(false);
			if (hydrated) {
				window.alert(
					"Es ist ein Fehler beim Speichern aufgetreten. Bitte versuchen Sie es erneut.",
				);
			}
		}
	};

	return (
		<div className="flex flex-col bg-background overscroll-none flex-1">
			<StudyHeader onFinish={handleFinish} isLoading={isFinishing} />

			<div className="flex-1 flex flex-col">
				<main className="container mx-auto px-2 md:px-4 py-4 md:py-8 space-y-6 md:space-y-8 pb-10 flex-1 flex flex-col">
					{/* 1. SECTION: EXECUTIVE SUMMARY (KPIs) */}
					<KpiSection />

					<SystemConfigurationBar />

					<CostAutarkySection />

					<SystemDynamicsSection />

					{/* 2. SECTION: SYSTEM DYNAMICS */}

					<AssumptionsSection />
				</main>
			</div>
		</div>
	);
}

// --- SUB-COMPONENTS ---

function AssumptionsSection() {
	const currentLocale = getLocale();
	return (
		<section className="mt-8">
			<Card className="shadow-sm">
				<CardHeader>
					<CardTitle className="text-lg">
						{m.dashboard_assumptions_title()}
					</CardTitle>
					<CardDescription>{m.dashboard_assumptions_desc()}</CardDescription>
				</CardHeader>
				<CardContent className="p-0 md:p-6">
					<Accordion type="single" collapsible className="w-full">
						{/* TARIFE */}
						<AccordionItem value="item-1" className="border-b-0 px-4 md:px-0">
							<AccordionTrigger className="hover:no-underline py-4">
								{m.dashboard_assumptions_tariffs()}
							</AccordionTrigger>
							<AccordionContent>
								<div className="rounded-md border overflow-x-auto">
									<Table className="min-w-[600px]">
										<TableHeader>
											<TableRow>
												<TableHead>{m.dashboard_table_type()}</TableHead>
												<TableHead>{m.dashboard_table_price()}</TableHead>
												<TableHead>{m.dashboard_table_base_price()}</TableHead>
												<TableHead>{m.dashboard_table_feedin()}</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											<TableRow>
												<TableCell className="font-medium">
													{m.dashboard_row_electricity()}
												</TableCell>
												<TableCell>
													{fmt(24.92, currentLocale)} ct/kWh
												</TableCell>
												<TableCell>
													{fmt(153.55, currentLocale)} €/kW/a
												</TableCell>
												<TableCell>{fmt(6.2, currentLocale)} ct/kWh</TableCell>
											</TableRow>
											<TableRow>
												<TableCell className="font-medium">
													{m.dashboard_row_fuel()}
												</TableCell>
												<TableCell>8 ct/kWh</TableCell>
												<TableCell>500 €/a</TableCell>
												<TableCell>-</TableCell>
											</TableRow>
										</TableBody>
									</Table>
								</div>
								<p className="text-xs text-muted-foreground mt-2 px-1">
									{m.dashboard_footer_note()}
								</p>
							</AccordionContent>
						</AccordionItem>

						{/* VERBRAUCHSDATEN */}
						<AccordionItem value="item-2" className="border-b-0 px-4 md:px-0">
							<AccordionTrigger className="hover:no-underline py-4">
								{m.dashboard_assumptions_load()}
							</AccordionTrigger>
							<AccordionContent>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm pb-4">
									<div className="space-y-1 bg-muted/30 p-3 rounded-md">
										<span className="block text-muted-foreground text-xs uppercase tracking-wide">
											{m.dashboard_load_elec_total()}
										</span>
										<span className="font-medium block pt-1">
											395 MWh/a + 70 MWh{" "}
											<span className="text-muted-foreground text-xs ml-1">
												{m.dashboard_load_cool().split(" ")[1]}
											</span>
										</span>
									</div>
									<div className="space-y-1 bg-muted/30 p-3 rounded-md">
										<span className="block text-muted-foreground text-xs uppercase tracking-wide">
											{m.dashboard_load_elec_peak()}
										</span>
										<span className="font-medium block pt-1">
											{fmt(352.8, currentLocale)} kW
										</span>
									</div>
									<div className="space-y-1 bg-muted/30 p-3 rounded-md">
										<span className="block text-muted-foreground text-xs uppercase tracking-wide">
											{m.dashboard_load_heat()}
										</span>
										<span className="font-medium block pt-1">
											{fmt(126.5, currentLocale)} MWh/a
										</span>
									</div>
									<div className="space-y-1 bg-muted/30 p-3 rounded-md">
										<span className="block text-muted-foreground text-xs uppercase tracking-wide">
											{m.dashboard_load_cool()}
										</span>
										<span className="font-medium block pt-1">350 MWh/a</span>
									</div>
								</div>
							</AccordionContent>
						</AccordionItem>
					</Accordion>
				</CardContent>
			</Card>
		</section>
	);
}
