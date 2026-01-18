import { createFileRoute, useNavigate } from "@tanstack/react-router";
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
import { KpiSection } from "@/components/KpiSection.tsx";
import { StudyHeader } from "@/components/StudyHeader.tsx";
import { SystemConfigurationBar } from "@/components/SystemConfigurationBar.tsx";
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
import { Separator } from "@/components/ui/separator.tsx";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table.tsx";
import { TooltipProvider } from "@/components/ui/tooltip.tsx";
import { usePreloadRoute } from "@/lib/usePreloadRoute.ts";
import * as m from "@/paraglide/messages";
import { getLocale } from "@/paraglide/runtime";
import { finishTask } from "@/routes/chat.tsx";

export const Route = createFileRoute("/dashboard")({
	component: Dashboard,
});

interface MonthlyDataPoint {
	monthIndex: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
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
		monthIndex: 1,
		pv: 20728.51,
		grid: 31122.27,
		load_base: 39843.3,
		load_hp: 4995.33,
		load_cooling: 0,
	},
	{
		monthIndex: 2,
		pv: 27587.04,
		grid: 22824.5,
		load_base: 39843.3,
		load_hp: 4343.72,
		load_cooling: 0,
	},
	{
		monthIndex: 3,
		pv: 44613.19,
		grid: 19647.85,
		load_base: 39843.3,
		load_hp: 3798.18,
		load_cooling: 0,
	},
	{
		monthIndex: 4,
		pv: 64210.25,
		grid: 6707.45,
		load_base: 39843.3,
		load_hp: 2253.19,
		load_cooling: 0,
	},
	{
		monthIndex: 5,
		pv: 100459.56,
		grid: 1320.19,
		load_base: 39843.3,
		load_hp: 131.97,
		load_cooling: 6153.65,
	},
	{
		monthIndex: 6,
		pv: 92661.37,
		grid: 1274.86,
		load_base: 39843.3,
		load_hp: 0,
		load_cooling: 8817.33,
	},
	{
		monthIndex: 7,
		pv: 89349.26,
		grid: 3349.3,
		load_base: 39843.3,
		load_hp: 0,
		load_cooling: 20998.44,
	},
	{
		monthIndex: 8,
		pv: 90251.85,
		grid: 4429.6,
		load_base: 39843.3,
		load_hp: 0,
		load_cooling: 22470.24,
	},
	{
		monthIndex: 9,
		pv: 74863.66,
		grid: 1313.76,
		load_base: 39843.3,
		load_hp: 0,
		load_cooling: 3427.24,
	},
	{
		monthIndex: 10,
		pv: 46348.47,
		grid: 10855.12,
		load_base: 39843.3,
		load_hp: 1168.35,
		load_cooling: 0,
	},
	{
		monthIndex: 11,
		pv: 23375.57,
		grid: 24891.3,
		load_base: 39843.3,
		load_hp: 3587.7,
		load_cooling: 0,
	},
	{
		monthIndex: 12,
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
// Typ anpassen
type DailyDataPoint = {
	time: string;
	pv: number;
	total_load: number; // Summe aller Verbraucher
	grid: number;
	feedin: number;
	soc: number;
};

// SOMMER (25.07.) - Total Load ist hoch wegen Kühlung
const DAILY_SUMMER: DailyDataPoint[] = [
	{ time: "00:00", pv: 0, total_load: 16.3, grid: 0, feedin: 0, soc: 51.3 },
	{ time: "01:00", pv: 0, total_load: 17, grid: 0, feedin: 0, soc: 45.86 },
	{ time: "02:00", pv: 0, total_load: 16.3, grid: 0, feedin: 0, soc: 40.49 },
	{ time: "03:00", pv: 0, total_load: 17, grid: 0, feedin: 0, soc: 35.07 },
	{ time: "04:00", pv: 0, total_load: 47.1, grid: 0, feedin: 0, soc: 29.71 },
	{ time: "05:00", pv: 5.5, total_load: 65.3, grid: 0, feedin: 0, soc: 22 },
	{ time: "06:00", pv: 27.5, total_load: 75.1, grid: 0, feedin: 0, soc: 7.79 },
	{
		time: "07:00",
		pv: 90,
		total_load: 88.4,
		grid: 0,
		feedin: 18.13,
		soc: 0.25,
	},
	{
		time: "08:00",
		pv: 202.47,
		total_load: 88.4,
		grid: 0,
		feedin: 114.07,
		soc: 0,
	},
	{
		time: "09:00",
		pv: 320.93,
		total_load: 87,
		grid: 0,
		feedin: 233.93,
		soc: 0,
	},
	{
		time: "10:00",
		pv: 399.92,
		total_load: 77.2,
		grid: 0,
		feedin: 322.72,
		soc: 0,
	},
	{
		time: "11:00",
		pv: 428.85,
		total_load: 183.8,
		grid: 0,
		feedin: 245.02,
		soc: 0,
	},
	{
		time: "12:00",
		pv: 422.33,
		total_load: 217.8,
		grid: 0,
		feedin: 204.5,
		soc: 0,
	},
	{
		time: "13:00",
		pv: 427.19,
		total_load: 226.22,
		grid: 0,
		feedin: 191.02,
		soc: 0,
	},
	{
		time: "14:00",
		pv: 402.86,
		total_load: 226,
		grid: 0,
		feedin: 0,
		soc: 24.72,
	},
	{
		time: "15:00",
		pv: 320.72,
		total_load: 203.4,
		grid: 0,
		feedin: 0,
		soc: 72.33,
	},
	{
		time: "16:00",
		pv: 205.1,
		total_load: 182.9,
		grid: 0,
		feedin: 0,
		soc: 97.2,
	},
	{
		time: "17:00",
		pv: 132.43,
		total_load: 178.5,
		grid: 0,
		feedin: 0,
		soc: 93.3,
	},
	{
		time: "18:00",
		pv: 89.24,
		total_load: 162.9,
		grid: 0,
		feedin: 0,
		soc: 76.63,
	},
	{ time: "19:00", pv: 34.85, total_load: 149, grid: 0, feedin: 0, soc: 46.94 },
	{ time: "20:00", pv: 8.17, total_load: 68.15, grid: 0, feedin: 0, soc: 12.9 },
	{ time: "21:00", pv: 0, total_load: 16.3, grid: 0.59, feedin: 0, soc: 3 },
	{ time: "22:00", pv: 0, total_load: 18.4, grid: 18.4, feedin: 0, soc: 0 },
	{ time: "23:00", pv: 0, total_load: 17.7, grid: 17.7, feedin: 0, soc: 0 },
];

const DAILY_WINTER: DailyDataPoint[] = [
	{ time: "00:00", pv: 0, total_load: 38.33, grid: 38.33, feedin: 0, soc: 0 },
	{ time: "01:00", pv: 0, total_load: 38.1, grid: 38.1, feedin: 0, soc: 0 },
	{ time: "02:00", pv: 0, total_load: 39.7, grid: 39.7, feedin: 0, soc: 0 },
	{ time: "03:00", pv: 0, total_load: 37.3, grid: 37.3, feedin: 0, soc: 0 },
	{ time: "04:00", pv: 0, total_load: 41.3, grid: 41.3, feedin: 0, soc: 0 },
	{ time: "05:00", pv: 0, total_load: 87.42, grid: 87.42, feedin: 0, soc: 0 },
	{ time: "06:00", pv: 0, total_load: 109.8, grid: 109.8, feedin: 0, soc: 0 },
	{
		time: "07:00",
		pv: 0.33,
		total_load: 112.56,
		grid: 112.24,
		feedin: 0,
		soc: 0,
	},
	{ time: "08:00", pv: 5.8, total_load: 97.25, grid: 91.44, feedin: 0, soc: 0 },
	{ time: "09:00", pv: 22.61, total_load: 96.6, grid: 74, feedin: 0, soc: 0 }, // PV hilft ein wenig
	{
		time: "10:00",
		pv: 108.22,
		total_load: 97.3,
		grid: 14.5,
		feedin: 0,
		soc: 0.63,
	}, // PV senkt Netzbezug (Rote Fläche wird kleiner)
	{
		time: "11:00",
		pv: 193.78,
		total_load: 98.57,
		grid: 0,
		feedin: 0,
		soc: 19.33,
	},
	{
		time: "12:00",
		pv: 145.37,
		total_load: 97.43,
		grid: 0,
		feedin: 0,
		soc: 44.11,
	},
	{
		time: "13:00",
		pv: 68.1,
		total_load: 94.19,
		grid: 0,
		feedin: 0,
		soc: 49.16,
	},
	{
		time: "14:00",
		pv: 27.9,
		total_load: 94.67,
		grid: 0,
		feedin: 0,
		soc: 35.68,
	},
	{ time: "15:00", pv: 4.6, total_load: 68.27, grid: 0, feedin: 0, soc: 13.22 },
	{
		time: "16:00",
		pv: 0,
		total_load: 48.38,
		grid: 44.12,
		feedin: 0,
		soc: 0.33,
	},
	{ time: "17:00", pv: 0, total_load: 44.97, grid: 44.97, feedin: 0, soc: 0 },
	{ time: "18:00", pv: 0, total_load: 41, grid: 41, feedin: 0, soc: 0 },
	{ time: "19:00", pv: 0, total_load: 35.37, grid: 35.37, feedin: 0, soc: 0 },
	{ time: "20:00", pv: 0, total_load: 34.65, grid: 34.65, feedin: 0, soc: 0 },
	{ time: "21:00", pv: 0, total_load: 33.78, grid: 33.78, feedin: 0, soc: 0 },
	{ time: "22:00", pv: 0, total_load: 31.68, grid: 31.68, feedin: 0, soc: 0 },
	{ time: "23:00", pv: 0, total_load: 32.3, grid: 32.3, feedin: 0, soc: 0 },
];

const getMonthName = (
	index: number,
	type: "short" | "long",
	currentLocale: ReturnType<typeof getLocale>,
) => {
	return new Date(2025, index, 1).toLocaleString(currentLocale, {
		month: type,
	});
};
export const fmt = (num: number, currentLocale: ReturnType<typeof getLocale>) =>
	num.toLocaleString(currentLocale);

function Dashboard() {
	const nav = useNavigate();
	const [isFinishing, setIsFinishing] = useState(false);
	const [viewMode, setViewMode] = useState<"summer" | "winter">("summer");
	const [seasonalViewMode, setSeasonalViewMode] = useState<"ist" | "soll">(
		"soll",
	);
	usePreloadRoute("/questionnaire");

	const currentLocale = getLocale();

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
						<KpiSection />
					</TooltipProvider>

					<SystemConfigurationBar />

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
											dataKey="monthIndex"
											fontSize={12}
											tickLine={false}
											axisLine={false}
											dy={10}
											tickFormatter={(val) =>
												getMonthName(val, "short", currentLocale)
											}
										/>
										<YAxis
											fontSize={11}
											tickLine={false}
											axisLine={false}
											unit=" kWh"
											domain={[0, 120000]}
											width={40}
											tickFormatter={(v) => {
												// Formatierung: 1000 -> 1k (Lokalisiert)
												if (v >= 1000) return `${fmt(v / 1000)}k`;
												return fmt(v);
											}}
										/>
										<RechartsTooltip
											content={<CustomBalanceTooltip />}
											cursor={{ fill: "rgba(0,0,0,0.05)" }}
											wrapperStyle={{ zIndex: 100 }}
										/>

										<Legend content={<CustomGroupedLegend />} />

										{/* LINKS: HERKUNFT */}
										<BarStack radius={[4, 4, 0, 0]} stackId="supply">
											<Bar
												dataKey="pv"
												name={m.dashboard_legend_pv_generation()}
												fill="#16a34a" // Grün
											/>
											<Bar
												dataKey="grid"
												name={m.dashboard_legend_grid()}
												fill="#ef4444" // Rot
											/>
										</BarStack>

										{/* RECHTS: VERWENDUNG */}
										<BarStack radius={[4, 4, 0, 0]} stackId="consumption">
											<Bar
												dataKey="load_base"
												name={m.dashboard_legend_load_base()}
												fill="#94a3b8" // Grau
											/>
											<Bar
												dataKey="load_hp"
												name={m.dashboard_legend_load_hp()}
												fill="#f97316" // Orange
											/>
											<Bar
												dataKey="load_cooling"
												name={m.dashboard_legend_load_cooling()}
												fill="#3b82f6" // Blau
											/>
											{/* Konsistente Farbe: Lila für Einspeisung (wie in Graph 2) */}
											<Bar
												dataKey="surplus"
												name={m.dashboard_legend_feedin()}
												fill="#8b5cf6"
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
									<CardTitle className="text-lg">
										{m.dashboard_chart_daily_title()}
									</CardTitle>
									{/* Dynamische Beschreibung basierend auf Jahreszeit */}
									<CardDescription className="text-xs md:text-sm hidden md:block">
										{viewMode === "summer"
											? m.dashboard_chart_daily_desc_summer()
											: m.dashboard_chart_daily_desc_winter()}
									</CardDescription>
								</div>
								<div className="flex bg-muted rounded-lg p-1 shrink-0">
									<button
										type="button"
										onClick={() => setViewMode("summer")}
										className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${viewMode === "summer" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
									>
										{m.dashboard_season_summer()}
									</button>
									<button
										type="button"
										onClick={() => setViewMode("winter")}
										className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${viewMode === "winter" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
									>
										{m.dashboard_season_winter()}
									</button>
								</div>
							</CardHeader>
							<CardContent className="h-[300px] md:h-[350px] px-0 md:px-6">
								<ResponsiveContainer width="100%" height="100%">
									<ComposedChart
										data={currentDailyData}
										margin={{ top: 20, right: 0, left: -20, bottom: 5 }}
									>
										{/* Gitter etwas dunkler (Slate-400 opacity) für bessere Sichtbarkeit */}
										<CartesianGrid
											strokeDasharray="3 3"
											vertical={false}
											stroke="#94a3b8"
											strokeOpacity={0.4}
										/>
										<XAxis
											dataKey="time"
											fontSize={12}
											tickLine={false}
											axisLine={false}
											interval={3}
											dy={10}
										/>

										{/* Linke Y-Achse (kW) */}
										<YAxis
											yAxisId="left"
											fontSize={11}
											tickLine={false}
											axisLine={false}
											domain={[0, 500]}
											ticks={[0, 100, 200, 300, 400, 500]}
											unit=" kW"
											width={45}
											tickFormatter={(val) => fmt(val)}
										/>
										{/* Rechte Y-Achse (%) */}
										<YAxis
											yAxisId="right"
											orientation="right"
											domain={[0, 100]}
											fontSize={11}
											tickLine={false}
											axisLine={false}
											ticks={[0, 25, 50, 75, 100]}
											unit=" %"
											width={35}
											tickFormatter={(val) => fmt(val)}
										/>

										<RechartsTooltip content={<CustomInterplayTooltip />} />

										<Legend
											wrapperStyle={{ paddingTop: "20px", fontSize: "12px" }}
											iconType="circle"
										/>

										{/* 1. NETZBEZUG (Rot) - Konsistent mit Graph 1 */}
										<Area
											yAxisId="left"
											type="step"
											dataKey="grid"
											name={m.dashboard_legend_grid()}
											fill="#fecaca"
											stroke="#ef4444"
											fillOpacity={0.6}
											strokeWidth={1}
										/>

										{/* 2. PV (Grün) - Konsistent mit Graph 1 */}
										<Area
											yAxisId="left"
											type="monotone"
											dataKey="pv"
											name={m.dashboard_legend_pv_generation()}
											fill="url(#colorPv)"
											stroke="#16a34a"
											strokeWidth={2}
											fillOpacity={0.4}
										/>

										{/* 3. EINSPEISUNG (Lila) - Konsistent mit Graph 1 */}
										<Area
											yAxisId="left"
											type="monotone"
											dataKey="feedin"
											name={m.dashboard_legend_feedin()}
											fill="#d8b4fe"
											stroke="#8b5cf6"
											fillOpacity={0.6}
											strokeWidth={1}
										/>

										{/* 4. VERBRAUCH (Dunkelblau) */}
										<Line
											yAxisId="left"
											type="monotone"
											dataKey="total_load"
											name={m.dashboard_legend_total_load()}
											stroke="#1e40af"
											strokeWidth={2}
											dot={false}
											activeDot={{ r: 6 }}
										/>

										{/* 5. SPEICHER (Gelb) */}
										<Line
											yAxisId="right"
											type="monotone"
											dataKey="soc"
											name={m.dashboard_legend_battery_soc()}
											stroke="#f59e0b"
											strokeWidth={3}
											dot={false}
											strokeDasharray="4 4"
										/>

										<defs>
											<linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
												<stop
													offset="5%"
													stopColor="#16a34a"
													stopOpacity={0.5}
												/>
												<stop
													offset="95%"
													stopColor="#16a34a"
													stopOpacity={0.1}
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
					</section>
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

	// 1. Gruppen definieren
	const supplyKeys = ["pv", "grid"];
	const usageKeys = ["load_base", "load_hp", "load_cooling", "surplus"];

	const supplyItems = payload.filter((entry: any) =>
		supplyKeys.includes(entry.dataKey),
	);
	const usageItems = payload.filter((entry: any) =>
		usageKeys.includes(entry.dataKey),
	);

	return (
		// CONTAINER: Mobil 1 Spalte (untereinander), ab Tablet (md) 2 Spalten
		<div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 text-xs w-full">
			{/* GRUPPE 1: SUPPLY (HERKUNFT) */}
			<div className="flex flex-col gap-1.5">
				{/* Gruppen-Titel */}
				<span className="font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">
					{m.dashboard_tooltip_supply()}
				</span>
				{/* Items-Wrapper: Erlaubt Umbruch (wrap) innerhalb der Gruppe */}
				<div className="flex flex-wrap gap-x-4 gap-y-2">
					{supplyItems.map((entry: any, index: number) => (
						<div key={`supply-${index}`} className="flex items-center gap-1.5">
							<div
								className="w-2.5 h-2.5 rounded-full shrink-0"
								style={{ backgroundColor: entry.color }}
							/>
							<span
								className="whitespace-nowrap"
								style={{ color: entry.color }}
							>
								{entry.value}
							</span>
						</div>
					))}
				</div>
			</div>

			{/* GRUPPE 2: CONSUMPTION (VERWENDUNG) */}
			{/* Auf Desktop rechtsbündig ausgerichtet für schöne Symmetrie, mobil links */}
			<div className="flex flex-col gap-1.5 md:items-end">
				<span className="font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">
					{m.dashboard_tooltip_usage()}
				</span>
				<div className="flex flex-wrap gap-x-4 gap-y-2 md:justify-end">
					{usageItems.map((entry: any, index: number) => (
						<div key={`usage-${index}`} className="flex items-center gap-1.5">
							<div
								className="w-2.5 h-2.5 rounded-full shrink-0"
								style={{ backgroundColor: entry.color }}
							/>
							<span
								className="whitespace-nowrap"
								style={{ color: entry.color }}
							>
								{entry.value}
							</span>
						</div>
					))}
				</div>
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

	const monthFullName = getMonthName(Number(label), "long", currentLocale);

	const fmtTooltip = (val: number) =>
		val.toLocaleString(currentLocale, {
			maximumFractionDigits: 0,
		});

	const RowItem = ({ entry }: { entry: any }) => (
		<div className="flex items-center justify-between gap-4">
			<div className="flex items-center gap-2">
				<div
					className="w-3 h-3 rounded-full"
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
		<div className="bg-popover border text-popover-foreground shadow-md rounded-lg p-3 text-sm min-w-[220px]">
			<p className="font-semibold mb-2 border-b pb-1">{monthFullName}</p>

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
	const currentLocale = getLocale();

	if (active && payload && payload.length) {
		return (
			<div className="bg-popover border text-popover-foreground shadow-md rounded-lg p-3 text-sm z-50">
				<p className="font-semibold mb-2 text-xs text-muted-foreground">
					{label}
				</p>
				{payload.map((entry: any) => {
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
							<span className="font-mono font-medium">
								{entry.value?.toLocaleString(currentLocale)}{" "}
								{entry.dataKey === "soc" ? "%" : "kW"}
							</span>
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
