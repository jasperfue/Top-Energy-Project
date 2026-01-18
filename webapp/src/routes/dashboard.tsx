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
	Area,
	Bar,
	BarChart,
	BarStack,
	CartesianGrid,
	Cell,
	ComposedChart,
	Legend,
	Line,
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

interface DailyDataPoint {
	time: string;
	pv: number;
	load: number;
	grid: number;
	soc: number;
	bat_kwh: number;
}

interface MonthlyDataPoint {
	name: string;
	pv: number;
	grid: number;
	// Split consumption into components for better explanation
	load_base: number; // Produktionsanlagen
	load_hp: number; // Wärmepumpe (Winter peak)
	load_cooling: number; // Kühltürme (Summer peak)
	surplus?: number;
}

const RAW_DATA = {
	invest: 498524,
	savingsYearly: 114540.77,
	amortization: 5.95,
	co2Ist: 76.55,
	co2Soll: -18.89,
	autarky: 61.7,
	selfUse: 38.6,
};

const calcSurplus = (data: MonthlyDataPoint) => {
	const input = data.pv + data.grid;
	const output = data.load_base + data.load_hp + data.load_cooling;
	const diff = input - output;
	// If diff is positive, it's feed-in/storage. If negative (shouldn't happen in balance), it's 0.
	return diff > 0 ? diff : 0;
};

// IMPORTANT: Values here must be in kWh (Sum of kW values divided by 4)
const MONTHLY_SOLL_RAW: MonthlyDataPoint[] = [
	{
		name: "Jan",
		pv: 20728.51,
		grid: 31122.27,
		load_base: 39843.3,
		load_hp: 4995.33,
		load_cooling: 0,
	},
	{
		name: "Feb",
		pv: 27587.04,
		grid: 22824.5,
		load_base: 39843.3,
		load_hp: 4343.72,
		load_cooling: 0,
	},
	{
		name: "Mär",
		pv: 44613.19,
		grid: 19647.85,
		load_base: 39843.3,
		load_hp: 3798.18,
		load_cooling: 0,
	},
	{
		name: "Apr",
		pv: 64210.25,
		grid: 6707.45,
		load_base: 39843.3,
		load_hp: 2253.19,
		load_cooling: 0,
	},
	{
		name: "Mai",
		pv: 100459.56,
		grid: 1320.19,
		load_base: 39843.3,
		load_hp: 131.97,
		load_cooling: 6153.65,
	},
	{
		name: "Jun",
		pv: 92661.37,
		grid: 1274.86,
		load_base: 39843.3,
		load_hp: 0,
		load_cooling: 8817.33,
	},
	{
		name: "Jul",
		pv: 89349.26,
		grid: 3349.3,
		load_base: 39843.3,
		load_hp: 0,
		load_cooling: 20998.44,
	},
	{
		name: "Aug",
		pv: 90251.85,
		grid: 4429.6,
		load_base: 39843.3,
		load_hp: 0,
		load_cooling: 22470.24,
	},
	{
		name: "Sep",
		pv: 74863.66,
		grid: 1313.76,
		load_base: 39843.3,
		load_hp: 0,
		load_cooling: 3427.24,
	},
	{
		name: "Okt",
		pv: 46348.47,
		grid: 10855.12,
		load_base: 39843.3,
		load_hp: 1168.35,
		load_cooling: 0,
	},
	{
		name: "Nov",
		pv: 23375.57,
		grid: 24891.3,
		load_base: 39843.3,
		load_hp: 3587.7,
		load_cooling: 0,
	},
	{
		name: "Dez",
		pv: 14611.72,
		grid: 29566.95,
		load_base: 39843.3,
		load_hp: 5365.08,
		load_cooling: 0,
	},
];

const MONTHLY_SOLL = MONTHLY_SOLL_RAW.map((d) => ({
	...d,
	surplus: calcSurplus(d),
}));

const MONTHLY_IST: MonthlyDataPoint[] = MONTHLY_SOLL.map((d) => ({
	...d,
	pv: 0, // Keine PV
	load_hp: 0, // Keine WP
	grid: d.load_base + d.load_cooling, // Alles kommt aus dem Netz
	surplus: 0,
}));

// IMPORTANT: Values here are in kW (Power) and % (SoC)
const DAILY_SUMMER: DailyDataPoint[] = [
	{ time: "00:00", pv: 0, load: 14.0, grid: 0, soc: 81.6, bat_kwh: 262.2 },
	{ time: "04:00", pv: 0, load: 14.0, grid: 0, soc: 57.8, bat_kwh: 185.9 },
	{ time: "08:00", pv: 78.8, load: 14.0, grid: 0, soc: 2.7, bat_kwh: 8.8 },
	{ time: "12:00", pv: 286.2, load: 14.0, grid: 0, soc: 60.5, bat_kwh: 194.5 },
	{ time: "16:00", pv: 193.9, load: 11.2, grid: 0, soc: 98.0, bat_kwh: 315.0 },
	{ time: "20:00", pv: 17.8, load: 11.2, grid: 0, soc: 90.0, bat_kwh: 289.0 },
];

const DAILY_WINTER: DailyDataPoint[] = [
	{ time: "00:00", pv: 0, load: 30.8, grid: 30.8, soc: 0, bat_kwh: 0 },
	{ time: "04:00", pv: 0, load: 30.8, grid: 30.8, soc: 0, bat_kwh: 0 },
	{ time: "08:00", pv: 1.8, load: 36.4, grid: 34.6, soc: 0, bat_kwh: 0 },
	{ time: "12:00", pv: 17.8, load: 28.0, grid: 10.2, soc: 0, bat_kwh: 0 },
	{ time: "16:00", pv: 0, load: 30.8, grid: 30.8, soc: 0, bat_kwh: 0 },
	{ time: "20:00", pv: 0, load: 30.8, grid: 30.8, soc: 0, bat_kwh: 0 },
];

function Dashboard() {
	const nav = useNavigate();
	const [isFinishing, setIsFinishing] = useState(false);
	const [viewMode, setViewMode] = useState<"summer" | "winter">("summer");
	const [seasonalViewMode, setSeasonalViewMode] = useState<"ist" | "soll">(
		"soll",
	);
	usePreloadRoute("/questionnaire");

	const currentLocale = getLocale();
	const fmt = (num: number) => num.toLocaleString(currentLocale);

	const currentDailyData = viewMode === "summer" ? DAILY_SUMMER : DAILY_WINTER;
	const currentMonthlyData =
		seasonalViewMode === "ist" ? MONTHLY_IST : MONTHLY_SOLL;

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

					{/* 2. SECTION: SYSTEM DYNAMICS */}
					<section className="grid gap-4 md:grid-cols-7">
						{/* GRAPH 1: SEASONAL BALANCE (Fully Stacked Comparison) */}
						<Card className="md:col-span-4 shadow-sm">
							<CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
								<div className="space-y-1">
									<CardTitle className="text-lg">
										{m.dashboard_chart_seasonal_title()}
									</CardTitle>
									<CardDescription className="text-xs md:text-sm">
										{m.dashboard_chart_seasonal_desc()}
									</CardDescription>
								</div>
								<div className="flex bg-muted rounded-lg p-1 shrink-0">
									<button
										type="button"
										onClick={() => setSeasonalViewMode("ist")}
										className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${seasonalViewMode === "ist" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
									>
										{m.dashboard_status_ist()}
									</button>
									<button
										type="button"
										onClick={() => setSeasonalViewMode("soll")}
										className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${seasonalViewMode === "soll" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
									>
										{m.dashboard_status_soll()}
									</button>
								</div>
							</CardHeader>
							<CardContent className="h-[300px] md:h-[350px]">
								<ResponsiveContainer width="100%" height="100%">
									<BarChart
										data={currentMonthlyData}
										margin={{ top: 20, right: 10, left: 0, bottom: 5 }}
										barGap={2}
										barCategoryGap="20%"
									>
										<CartesianGrid
											strokeDasharray="3 3"
											vertical={false}
											stroke="#e5e7eb"
										/>
										<XAxis
											dataKey="name"
											fontSize={12}
											tickLine={false}
											axisLine={false}
											dy={10}
										/>
										<YAxis
											fontSize={11}
											tickLine={false}
											axisLine={false}
											unit=" kWh"
											// Nutzung der lokalen Formatierung für die Achsenbeschriftung
											tickFormatter={(v) => {
												const val = v >= 1000 ? v / 1000 : v;
												const suffix = v >= 1000 ? "k" : "";
												return `${val.toLocaleString(currentLocale)}${suffix}`;
											}}
											width={35}
										/>
										<RechartsTooltip
											content={<CustomBalanceTooltip />}
											cursor={{ fill: "rgba(0,0,0,0.05)" }}
										/>

										{/* Neue gruppierte Legende */}
										<Legend content={<CustomGroupedLegend />} />

										{/* LINKS: HERKUNFT (Stacked Supply) */}
										<Bar
											dataKey="pv"
											stackId="supply"
											name={m.dashboard_legend_pv_generation()}
											fill="#16a34a"
										/>
										<Bar
											dataKey="grid"
											stackId="supply"
											name={m.dashboard_legend_grid()}
											fill="#ef4444"
											radius={[4, 4, 0, 0]}
										/>

										{/* RECHTS: VERWENDUNG (Stacked Consumption) */}
										<BarStack radius={[4, 4, 0, 0]} stackId="consumption">
											<Bar
												dataKey="load_base"
												name={m.dashboard_legend_load_base()}
												fill="#94a3b8"
											/>
											<Bar
												dataKey="load_hp"
												name={m.dashboard_legend_load_hp()}
												fill="#f97316"
											/>
											<Bar
												dataKey="load_cooling"
												name={m.dashboard_legend_load_cooling()}
												fill="#3b82f6"
											/>
											{/* Neue Farbe (Emerald-400) und neues Label (Einspeisung) */}
											<Bar
												dataKey="surplus"
												name={m.dashboard_legend_feedin()}
												fill="#34d399"
											/>
										</BarStack>
									</BarChart>
								</ResponsiveContainer>
							</CardContent>
						</Card>

						{/* GRAPH 2: DAILY DYNAMICS */}
						<Card className="md:col-span-3 shadow-sm">
							<CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
								<div className="space-y-1">
									<CardTitle className="text-lg">System-Verhalten</CardTitle>
									<CardDescription className="text-xs md:text-sm hidden md:block">
										Exemplarischer Tagesverlauf
									</CardDescription>
								</div>
								<div className="flex bg-muted rounded-lg p-1 shrink-0">
									<button
										type="button"
										onClick={() => setViewMode("summer")}
										className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${viewMode === "summer" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
									>
										Sommer
									</button>
									<button
										type="button"
										onClick={() => setViewMode("winter")}
										className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${viewMode === "winter" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
									>
										Winter
									</button>
								</div>
							</CardHeader>
							<CardContent className="h-[300px] md:h-[350px] px-0 md:px-6">
								<ResponsiveContainer width="100%" height="100%">
									<ComposedChart
										data={currentDailyData}
										margin={{ top: 20, right: 0, left: -20, bottom: 5 }}
									>
										<CartesianGrid
											strokeDasharray="3 3"
											vertical={false}
											stroke="#e5e7eb"
										/>
										<XAxis
											dataKey="time"
											fontSize={12}
											tickLine={false}
											axisLine={false}
											interval={11}
											dy={10}
										/>

										<YAxis
											yAxisId="left"
											fontSize={11}
											tickLine={false}
											axisLine={false}
											unit=" kW"
											width={45}
										/>
										<YAxis
											yAxisId="right"
											orientation="right"
											domain={[0, 100]}
											fontSize={11}
											tickLine={false}
											axisLine={false}
											unit=" %"
											width={35}
										/>

										<RechartsTooltip content={<CustomInterplayTooltip />} />
										<Legend
											wrapperStyle={{ paddingTop: "20px", fontSize: "12px" }}
										/>

										<Area
											yAxisId="left"
											type="monotone"
											dataKey="pv"
											name="PV"
											fill="url(#colorPv)"
											stroke="#16a34a"
											fillOpacity={0.4}
										/>
										<Line
											yAxisId="left"
											type="step"
											dataKey="load"
											name="Last"
											stroke="#94a3b8"
											strokeWidth={2}
											dot={false}
										/>
										<Line
											yAxisId="left"
											type="step"
											dataKey="grid"
											name="Netz"
											stroke="#ef4444"
											strokeWidth={2}
											dot={false}
											strokeDasharray="2 2"
										/>
										<Line
											yAxisId="right"
											type="monotone"
											dataKey="soc"
											name="Akku %"
											stroke="#f59e0b"
											strokeWidth={2}
											dot={false}
										/>

										<defs>
											<linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
												<stop
													offset="5%"
													stopColor="#16a34a"
													stopOpacity={0.3}
												/>
												<stop
													offset="95%"
													stopColor="#16a34a"
													stopOpacity={0}
												/>
											</linearGradient>
										</defs>
									</ComposedChart>
								</ResponsiveContainer>
							</CardContent>
						</Card>
					</section>

					{/* 3. SECTION: COST & AUTARKY CHARTS */}
					<section className="grid gap-4 md:grid-cols-7">
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
											width={40}
										/>
										<RechartsTooltip
											content={<CustomCostTooltip />}
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

					{/* 4. SECTION: TECH DETAILS */}
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

const CustomGroupedLegend = (props: any) => {
	const { payload } = props;
	if (!payload) return null;

	// Definition der Gruppen anhand der dataKeys
	const supplyKeys = ["pv", "grid"];
	const usageKeys = ["load_base", "load_hp", "load_cooling", "surplus"];

	const supplyItems = payload.filter((entry: any) =>
		supplyKeys.includes(entry.dataKey),
	);
	const usageItems = payload.filter((entry: any) =>
		usageKeys.includes(entry.dataKey),
	);

	return (
		<div className="flex flex-wrap justify-center gap-x-8 gap-y-2 pt-6 text-xs">
			{/* Gruppe Supply */}
			<div className="flex items-center gap-3">
				<span className="font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">
					{m.dashboard_tooltip_supply()}:
				</span>
				{supplyItems.map((entry: any, index: number) => (
					<div key={`item-${index}`} className="flex items-center gap-1.5">
						<div
							className="w-2.5 h-2.5 rounded-[2px]"
							style={{ backgroundColor: entry.color }}
						/>
						<span style={{ color: entry.color }}>{entry.value}</span>
					</div>
				))}
			</div>

			{/* Separator für visuelle Trennung */}
			<div className="w-px h-4 bg-border hidden sm:block" />

			{/* Gruppe Consumption */}
			<div className="flex items-center gap-3">
				<span className="font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">
					{m.dashboard_tooltip_usage()}:
				</span>
				{usageItems.map((entry: any, index: number) => (
					<div key={`item-${index}`} className="flex items-center gap-1.5">
						<div
							className="w-2.5 h-2.5 rounded-[2px]"
							style={{ backgroundColor: entry.color }}
						/>
						<span style={{ color: entry.color }}>{entry.value}</span>
					</div>
				))}
			</div>
		</div>
	);
};
const CustomBalanceTooltip = ({
	active,
	payload,
	label,
}: CustomTooltipProps) => {
	const currentLocale = getLocale();
	if (!active || !payload || !payload.length) return null;

	const supplyKeys = ["pv", "grid"];
	const usageKeys = ["load_base", "load_hp", "load_cooling", "surplus"];

	const supplyItems = payload.filter((p) => supplyKeys.includes(p.dataKey));
	const usageItems = payload.filter((p) => usageKeys.includes(p.dataKey));

	supplyItems.sort((a) => (a.dataKey === "pv" ? -1 : 1));

	// Einheitliche Formatierungs-Funktion für Tooltips
	const fmtTooltip = (val: number) =>
		val.toLocaleString(currentLocale, {
			maximumFractionDigits: 0,
		});

	const RowItem = ({ entry }: { entry: any }) => (
		<div className="flex items-center justify-between gap-4">
			<div className="flex items-center gap-2">
				<div
					className="w-2 h-2 rounded-full"
					style={{ backgroundColor: entry.color }}
				/>
				<span className="text-muted-foreground text-xs">{entry.name}</span>
			</div>
			<span className="font-mono font-medium">
				{fmtTooltip(entry.value)} kWh
			</span>
		</div>
	);

	return (
		<div className="bg-popover border text-popover-foreground shadow-md rounded-lg p-3 text-sm min-w-[220px] z-50">
			<p className="font-semibold mb-2 border-b pb-1">{label}</p>

			{/* Section 1: Herkunft */}
			<div className="mb-3">
				<p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
					{m.dashboard_tooltip_supply()}
				</p>
				<div className="space-y-1">
					{supplyItems.map((entry) => (
						<RowItem key={entry.name} entry={entry} />
					))}
				</div>
			</div>

			{/* Section 2: Verwendung */}
			<div>
				<p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
					{m.dashboard_tooltip_usage()}
				</p>
				<div className="space-y-1">
					{usageItems.map((entry) => (
						<RowItem key={entry.name} entry={entry} />
					))}
				</div>
			</div>
		</div>
	);
};

interface CustomTooltipProps {
	active?: boolean;
	payload?: any[];
	label?: string;
}

const CustomInterplayTooltip = ({
	active,
	payload,
	label,
}: CustomTooltipProps) => {
	if (active && payload && payload.length) {
		return (
			<div className="bg-popover border text-popover-foreground shadow-md rounded-lg p-3 text-sm z-50">
				<p className="font-semibold mb-2 text-xs text-muted-foreground">
					{label} Uhr
				</p>
				{payload.map((entry: any) => {
					if (entry.dataKey === "soc") {
						return (
							<div
								key={entry.name}
								className="flex items-center justify-between gap-4 mb-1"
							>
								<span className="flex items-center gap-2 text-muted-foreground">
									<div
										className="w-2 h-2 rounded-full"
										style={{ backgroundColor: entry.color }}
									/>
									Speicher:
								</span>
								<span className="font-mono font-medium">
									{entry.payload.bat_kwh} kWh ({entry.value}%)
								</span>
							</div>
						);
					}
					return (
						<div
							key={entry.name}
							className="flex items-center justify-between gap-4 mb-1"
						>
							<span className="flex items-center gap-2 text-muted-foreground">
								<div
									className="w-2 h-2 rounded-full"
									style={{ backgroundColor: entry.color }}
								/>
								{entry.name}:
							</span>
							<span className="font-mono font-medium">{entry.value} kW</span>
						</div>
					);
				})}
			</div>
		);
	}
	return null;
};

const CustomCostTooltip = ({ active, payload, label }: CustomTooltipProps) => {
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
