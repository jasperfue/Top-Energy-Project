import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
	Battery,
	Euro,
	Info,
	Leaf,
	type LucideIcon,
	ThermometerSun,
	Timer,
	TrendingDown,
	Zap,
} from "lucide-react";
import { useState } from "react";
import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	Legend,
	Pie,
	PieChart,
	Tooltip as RechartsTooltip,
	ReferenceLine,
	ResponsiveContainer,
	XAxis,
	YAxis,
} from "recharts";
import { StudyHeader } from "@/components/StudyHeader.tsx";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table.tsx";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip.tsx";
import { usePreloadRoute } from "@/lib/usePreloadRoute.ts";
import * as m from "@/paraglide/messages";
import { getLocale } from "@/paraglide/runtime";
import { finishTask } from "@/routes/chat.tsx";

export const Route = createFileRoute("/dashboard")({
	component: Dashboard,
});

const RAW_DATA = {
	invest: 498524,
	savingsYearly: 114540.77,
	amortization: 5.95,
	co2Ist: 76.55,
	co2Soll: -18.89,
	autarky: 61.7,
	selfUse: 38.6,
};

function Dashboard() {
	const nav = useNavigate();
	const [isFinishing, setIsFinishing] = useState(false);
	usePreloadRoute("/questionnaire");

	const currentLocale = getLocale();
	const fmt = (num: number) => num.toLocaleString(currentLocale);

	const handleFinish = async () => {
		if (isFinishing) return;
		setIsFinishing(true);

		try {
			await finishTask({
				data: {},
			});
			await nav({ to: "/questionnaire", search: { step: 1 } });
		} catch (error) {
			console.error(
				"Failed to finish task before navigating to questionnaire",
				error,
			);
			setIsFinishing(false);
			window.alert(
				"Es ist ein Fehler beim Speichern aufgetreten. Bitte versuchen Sie es erneut.",
			);
		}
	};

	const KPI_DETAILS = {
		invest: [
			{ label: m.dashboard_kpi_invest_label_pv(), value: `${fmt(400000)} €` },
			{
				label: m.dashboard_kpi_invest_label_battery(),
				value: `${fmt(73524)} €`,
			},
			{ label: m.dashboard_kpi_invest_label_hp(), value: `${fmt(25000)} €` },
		],
		savings: [
			{ label: m.dashboard_kpi_savings_label_elec(), value: `${fmt(88900)} €` },
			{
				label: m.dashboard_kpi_savings_label_fuel(),
				value: `${fmt(12526.27)} €`,
			},
			{
				label: m.dashboard_kpi_savings_label_feedin(),
				value: `${fmt(20960)} €`,
			},
			{
				label: m.dashboard_kpi_savings_label_opex(),
				value: `- ${fmt(7845.5)} €`,
			},
		],
		co2: [
			{
				label: m.dashboard_kpi_co2_label_rest_elec(),
				value: `${fmt(17.27)} t`,
			},
			{ label: m.dashboard_kpi_co2_label_rest_fuel(), value: `${fmt(0.01)} t` },
			{ label: m.dashboard_kpi_co2_label_credit(), value: `- ${fmt(36.17)} t` },
			{ label: m.dashboard_kpi_co2_label_sum(), value: `- ${fmt(18.89)} t` },
		],
	};

	const COST_DATA = [
		{
			name: m.dashboard_status_ist(),
			Strom: 177250,
			Brennstoff: 13032,
			Wartung: 0,
			Erlöse: 0,
			total: 190282,
		},
		{
			name: m.dashboard_status_soll(),
			Strom: 88350,
			Brennstoff: 506,
			Wartung: 7845,
			Erlöse: -20960,
			total: 75741,
		},
	];

	const PIE_DATA_AUTARKIE = [
		{
			name: m.dashboard_legend_grid(),
			value: 100 - RAW_DATA.autarky,
			color: "#94a3b8",
		},
		{
			name: m.dashboard_legend_autarky_pv(),
			value: RAW_DATA.autarky,
			color: "#16a34a",
		},
	];

	return (
		<div className="flex flex-col pt-2 md:pt-4 h-dvh overflow-hidden bg-background overscroll-none">
			<div className="flex-none">
				<StudyHeader onFinish={handleFinish} isLoading={isFinishing} />
			</div>

			<div className="flex-1 overflow-y-auto min-h-0">
				<main className="container mx-auto px-2 md:px-4 py-4 md:py-8 space-y-6 md:space-y-8 pb-10">
					<TooltipProvider delayDuration={300}>
						{/* 1. SECTION: EXECUTIVE SUMMARY (KPIs) */}
						<section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
							<KpiCard
								title={m.dashboard_kpi_invest_title()}
								value={`${fmt(RAW_DATA.invest)} €`}
								subtitle={m.dashboard_kpi_invest_subtitle()}
								icon={Euro}
								tooltipData={KPI_DETAILS.invest}
							/>
							<KpiCard
								title={m.dashboard_kpi_savings_title()}
								value={`${fmt(RAW_DATA.savingsYearly)} €`}
								subtitle={m.dashboard_kpi_savings_subtitle()}
								icon={TrendingDown}
								trend="positive"
								trendText={m.dashboard_kpi_savings_trend()}
								tooltipData={KPI_DETAILS.savings}
							/>
							<KpiCard
								title={m.dashboard_kpi_amortization_title()}
								value={`${fmt(RAW_DATA.amortization)} ${m.dashboard_kpi_amortization_unit()}`}
								subtitle={m.dashboard_kpi_amortization_subtitle()}
								icon={Timer}
							/>
							<KpiCard
								title={m.dashboard_kpi_co2_title()}
								value={`${fmt(RAW_DATA.co2Soll)} t/a`}
								subtitle={m.dashboard_kpi_co2_subtitle({
									value: fmt(RAW_DATA.co2Ist),
								})}
								icon={Leaf}
								highlightClass="text-green-600"
								trend="positive"
								trendText={m.dashboard_kpi_co2_trend()}
								tooltipData={KPI_DETAILS.co2}
							/>
						</section>
					</TooltipProvider>

					{/* 2. SECTION: VISUALIZATION & CHARTS */}
					<section className="grid gap-4 md:grid-cols-7">
						{/* KOSTENVERGLEICH */}
						<Card className="md:col-span-4 shadow-sm">
							<CardHeader className="pb-2">
								<CardTitle className="text-lg">
									{m.dashboard_chart_cost_title()}
								</CardTitle>
								<CardDescription className="text-xs md:text-sm">
									{m.dashboard_chart_cost_desc()}
								</CardDescription>
							</CardHeader>
							<CardContent className="h-[300px] md:h-[350px] pl-0">
								<ResponsiveContainer width="100%" height="100%">
									<BarChart
										data={COST_DATA}
										margin={{ top: 20, right: 10, left: 0, bottom: 5 }}
										stackOffset="sign"
									>
										<CartesianGrid
											strokeDasharray="3 3"
											vertical={false}
											stroke="#e5e7eb"
										/>
										<ReferenceLine y={0} stroke="#64748b" strokeWidth={1} />

										<XAxis
											dataKey="name"
											fontSize={12}
											tickLine={false}
											axisLine={false}
											dy={10}
										/>
										<YAxis
											unit=" €"
											fontSize={11}
											tickLine={false}
											axisLine={false}
											tickFormatter={(value) => `${value / 1000}k`}
											width={40} // Fixe Breite verhindert Springen
										/>

										<RechartsTooltip
											content={<CustomTooltip />}
											cursor={{ fill: "rgba(0,0,0,0.05)" }}
											wrapperStyle={{ zIndex: 100 }}
										/>

										<Legend
											wrapperStyle={{ paddingTop: "10px", fontSize: "12px" }}
										/>

										<Bar
											dataKey="Strom"
											stackId="a"
											fill="#3b82f6"
											name={m.dashboard_legend_electricity()}
										/>
										<Bar
											dataKey="Brennstoff"
											stackId="a"
											fill="#ef4444"
											name={m.dashboard_legend_fuel()}
											radius={[4, 4, 0, 0]}
										/>
										<Bar
											dataKey="Wartung"
											stackId="a"
											fill="#f59e0b"
											name={m.dashboard_legend_maintenance()}
											radius={[4, 4, 0, 0]}
										/>
										<Bar
											dataKey="Erlöse"
											stackId="a"
											fill="#16a34a"
											name={m.dashboard_legend_feedin()}
											radius={[4, 4, 0, 0]}
										/>
									</BarChart>
								</ResponsiveContainer>
							</CardContent>
						</Card>

						{/* AUTARKIE */}
						<Card className="md:col-span-3 shadow-sm">
							<CardHeader className="pb-2">
								<CardTitle className="text-lg">
									{m.dashboard_chart_autarky_title()}
								</CardTitle>
								<CardDescription className="text-xs md:text-sm">
									{m.dashboard_chart_autarky_desc()}
								</CardDescription>
							</CardHeader>
							<CardContent className="flex flex-col items-center justify-center h-[280px] md:h-[300px]">
								<div className="relative w-full h-[180px]">
									<ResponsiveContainer width="100%" height="100%">
										<PieChart>
											<Pie
												data={PIE_DATA_AUTARKIE}
												cx="50%"
												cy="50%"
												innerRadius={60}
												outerRadius={80}
												paddingAngle={5}
												dataKey="value"
											>
												{PIE_DATA_AUTARKIE.map((entry) => (
													<Cell key={`cell-${entry.name}`} fill={entry.color} />
												))}
											</Pie>
										</PieChart>
									</ResponsiveContainer>
									<div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
										<span className="text-3xl font-bold">
											{fmt(RAW_DATA.autarky)}%
										</span>
										<span className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider">
											{m.dashboard_label_autarky()}
										</span>
									</div>
								</div>

								<div className="mt-4 w-full space-y-3 px-2">
									<div className="flex justify-between text-sm items-center">
										<span className="flex items-center gap-2">
											<div className="w-3 h-3 rounded-full bg-green-600 shrink-0" />
											<span className="truncate">
												{m.dashboard_label_own_generation()}
											</span>
										</span>
										<span className="font-medium whitespace-nowrap">
											{fmt(RAW_DATA.autarky)}%
										</span>
									</div>
									<Separator />
									<div className="flex justify-between text-sm items-center">
										<span className="text-muted-foreground truncate pr-2">
											{m.dashboard_label_self_consumption()}
										</span>
										<span className="font-medium whitespace-nowrap">
											{fmt(RAW_DATA.selfUse)}%
										</span>
									</div>
								</div>
							</CardContent>
						</Card>
					</section>

					{/* 3. SECTION: TECHNISCHE DETAILS */}
					<div>
						<h3 className="text-lg font-semibold mt-4 mb-4 px-1">
							{m.dashboard_tech_section_title()}
						</h3>
						<section className="grid gap-4 md:grid-cols-3">
							<TechCard
								icon={Zap}
								title={m.dashboard_tech_pv_title()}
								specs={[
									{ label: m.dashboard_spec_power(), value: "684 kWp" },
									{ label: m.dashboard_spec_area(), value: "3.041 m²" },
									{ label: m.dashboard_spec_yield(), value: "673 MWh/a" },
									{ label: m.dashboard_spec_opex(), value: "6.000 €/a" },
									{ label: m.dashboard_spec_invest(), value: "400.000 €" },
								]}
								description={m.dashboard_tech_pv_desc()}
							/>

							<TechCard
								icon={Battery}
								title={m.dashboard_tech_battery_title()}
								specs={[
									{ label: m.dashboard_spec_capacity(), value: "321 kWh" },
									{
										label: m.dashboard_spec_cycles(),
										value: `268 / ${m.dashboard_unit_year()}`,
									},
									{ label: m.dashboard_spec_opex(), value: "1.470,5 €/a" },
									{ label: m.dashboard_spec_invest(), value: "73.524 €" },
								]}
								description={m.dashboard_tech_battery_desc()}
							/>

							<TechCard
								icon={ThermometerSun}
								title={m.dashboard_tech_hp_title()}
								specs={[
									{ label: m.dashboard_spec_thermal_power(), value: "50 kW" },
									{ label: m.dashboard_spec_heat(), value: "126,49 MWh/a" },
									{ label: m.dashboard_spec_opex(), value: "375 €/a" },
									{ label: m.dashboard_spec_invest(), value: "25.000 €" },
								]}
								description={m.dashboard_tech_hp_desc()}
							/>
						</section>
					</div>

					<AssumptionsSection />
				</main>
			</div>
		</div>
	);
}

// --- SUB-COMPONENTS ---

interface KpiCardProps {
	title: string;
	value: string;
	subtitle: string;
	icon: LucideIcon;
	highlightClass?: string;
	trend?: "positive" | "negative" | "neutral";
	trendText?: string;
	tooltipData?: { label: string; value: string }[];
}
function KpiCard({
	title,
	value,
	subtitle,
	icon: Icon,
	highlightClass,
	trend,
	trendText,
	tooltipData,
}: KpiCardProps) {
	return (
		<Card className="relative overflow-visible shadow-sm">
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<div className="flex items-center gap-2 max-w-[85%]">
					<CardTitle className="text-sm font-medium text-muted-foreground truncate">
						{title}
					</CardTitle>
					<div className={!tooltipData ? "hidden" : "block"}>
						<Tooltip>
							<TooltipTrigger asChild>
								<div className="p-1 -m-1 cursor-pointer">
									<Info className="h-3.5 w-3.5 text-muted-foreground/50 hover:text-primary transition-colors" />
								</div>
							</TooltipTrigger>
							<TooltipContent
								side="bottom"
								align="start"
								className="p-0 overflow-hidden shadow-lg border-none z-50"
							>
								<div className="bg-popover border text-popover-foreground p-3 min-w-[200px]">
									<p className="font-semibold text-xs text-muted-foreground uppercase mb-2">
										{m.dashboard_tooltip_composition()}
									</p>
									<div className="space-y-1.5">
										{tooltipData?.map((item) => (
											<div
												key={item.label}
												className="flex justify-between text-sm gap-4"
											>
												<span className="text-muted-foreground">
													{item.label}
												</span>
												<span className="font-mono font-medium">
													{item.value}
												</span>
											</div>
										))}
									</div>
								</div>
							</TooltipContent>
						</Tooltip>
					</div>
				</div>
				<Icon className="h-4 w-4 text-muted-foreground shrink-0" />
			</CardHeader>
			<CardContent>
				<div
					className={`text-xl md:text-2xl font-bold truncate ${highlightClass || ``}`}
				>
					{value}
				</div>
				<div className="flex flex-wrap items-center justify-between mt-1 min-h-[1.25rem]">
					<p className="text-xs text-muted-foreground truncate pr-2">
						{subtitle}
					</p>
					{trend === "positive" && trendText && (
						<Badge
							variant="outline"
							className="bg-green-50 text-green-700 border-green-200 text-[10px] px-1 whitespace-nowrap"
						>
							{trendText}
						</Badge>
					)}
				</div>
			</CardContent>
		</Card>
	);
}

interface TechCardProps {
	icon: LucideIcon;
	title: string;
	specs: { label: string; value: string }[];
	description: string;
}

function TechCard({ icon: Icon, title, specs, description }: TechCardProps) {
	return (
		<Card className="shadow-sm">
			<CardHeader className="flex flex-row items-center gap-4 pb-2">
				<div className="p-2 bg-primary/10 rounded-lg shrink-0">
					<Icon className="h-6 w-6 text-primary" />
				</div>
				<CardTitle className="text-base">{title}</CardTitle>
			</CardHeader>
			<CardContent>
				<p className="text-sm text-muted-foreground mb-4 h-auto md:h-10 line-clamp-3 md:line-clamp-2">
					{description}
				</p>
				<div className="space-y-2">
					{specs.map((spec) => (
						<div
							key={spec.label}
							className="grid grid-cols-[1fr_auto] gap-4 text-sm border-b pb-1 last:border-0"
						>
							<span className="text-muted-foreground truncate">
								{spec.label}
							</span>
							<span className="font-medium whitespace-nowrap">
								{spec.value}
							</span>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}

interface CustomTooltipProps {
	active?: boolean;
	payload?: Array<{
		value: number;
		name: string;
		color: string;
		payload: {
			name: string;
			Strom: number;
			Brennstoff: number;
			Wartung: number;
			Erlöse: number;
			total: number;
		};
	}>;
	label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
	const currentLocale = getLocale();

	if (active && payload && payload.length > 0) {
		const data = payload[0].payload;

		return (
			<div className="bg-popover border text-popover-foreground shadow-md rounded-lg p-3 text-sm min-w-[180px] z-50">
				<p className="font-semibold mb-2 border-b pb-1">{label}</p>

				<div className="space-y-1">
					{payload.map((entry) => (
						<div
							key={entry.name}
							className="flex items-center justify-between gap-4"
						>
							<div className="flex items-center gap-2">
								<div
									className="w-2 h-2 rounded-full"
									style={{ backgroundColor: entry.color }}
								/>
								<span className="text-muted-foreground">{entry.name}:</span>
							</div>
							<span className="font-mono font-medium">
								{entry.value?.toLocaleString(currentLocale)} €
							</span>
						</div>
					))}
				</div>

				<div className="my-2 h-[1px] bg-border" />

				<div className="flex items-center justify-between gap-4 pt-1">
					<span className="font-bold">{m.dashboard_tooltip_total()}</span>
					<span className="font-mono font-bold text-primary">
						{data.total.toLocaleString(currentLocale)} €
					</span>
				</div>
			</div>
		);
	}
	return null;
};

function AssumptionsSection() {
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
												<TableCell>24,92 ct/kWh</TableCell>
												<TableCell>153,55 €/kW/a</TableCell>
												<TableCell>6,2 ct/kWh</TableCell>
											</TableRow>
											<TableRow>
												<TableCell className="font-medium">
													{m.dashboard_row_fuel()}
												</TableCell>
												<TableCell>8,00 ct/kWh</TableCell>
												<TableCell>500,00 €/a</TableCell>
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
											395 MWh/a + 70 MWh
											<span className="text-muted-foreground text-xs ml-1">
												({m.dashboard_load_cool().split(" ")[1]})
											</span>
										</span>
									</div>
									<div className="space-y-1 bg-muted/30 p-3 rounded-md">
										<span className="block text-muted-foreground text-xs uppercase tracking-wide">
											{m.dashboard_load_elec_peak()}
										</span>
										<span className="font-medium block pt-1">352,8 kW</span>
									</div>
									<div className="space-y-1 bg-muted/30 p-3 rounded-md">
										<span className="block text-muted-foreground text-xs uppercase tracking-wide">
											{m.dashboard_load_heat()}
										</span>
										<span className="font-medium block pt-1">126,5 MWh/a</span>
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
