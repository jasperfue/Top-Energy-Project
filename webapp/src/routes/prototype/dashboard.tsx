import { createFileRoute, Link } from "@tanstack/react-router";
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
import { Activity } from "react";
import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	Legend,
	Pie,
	PieChart,
	Tooltip as RechartsTooltip,
	ResponsiveContainer,
	XAxis,
	YAxis,
} from "recharts";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion.tsx";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
} from "@/components/ui/tooltip";

export const Route = createFileRoute("/prototype/dashboard")({
	component: Dashboard,
});

const KPI_DATA = {
	invest: 498524,
	savingsYearly: 93581,
	amortization: 5.95,
	co2Ist: 76.55,
	co2Soll: -18.89,
	autarky: 61.7,
	selfUse: 38.6,
};
const KPI_DETAILS = {
	invest: [
		{ label: "PV-Anlage (3.041 m²)", value: "400.000 €" },
		{ label: "Batteriespeicher (321 kWh)", value: "73.524 €" },
		{ label: "Wärmepumpe (50 kW)", value: "25.000 €" },
	],
	savings: [
		{ label: "Stromkosten-Reduktion", value: "88.900 €" },
		{ label: "Brennstoff-Einsparung", value: "12.500 €" },
		{ label: "Einspeiseerlöse", value: "20.960 €" },
		{ label: "Abzgl. neue Betriebskosten", value: "- 7.845 €" },
	],
	co2: [
		{ label: "Rest-Strombezug", value: "17,27 t" },
		{ label: "Rest-Brennstoff", value: "0,01 t" },
		{ label: "Gutschrift Einspeisung", value: "- 36,17 t" },
		{ label: "Summe", value: "- 18,89 t" },
	],
};

const COST_DATA = [
	{
		name: "Ist-Zustand",
		Strom: 177250,
		Brennstoff: 13032,
		Wartung: 0,
		Erlöse: 0,
		total: 190282,
	},
	{
		name: "Soll-Zustand",
		Strom: 88350,
		Brennstoff: 506,
		Wartung: 7845,
		Erlöse: -20960,
		total: 96701,
	},
];

const PIE_DATA_AUTARKIE = [
	{ name: "Netzbezug", value: 100 - KPI_DATA.autarky, color: "#94a3b8" },
	{ name: "Autarkie (PV)", value: KPI_DATA.autarky, color: "#16a34a" },
];

function Dashboard() {
	return (
		<div className="min-h-screen bg-muted/20 pb-10">
			{/* Header */}
			<div className="sticky top-0 z-20 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
				<div className="container mx-auto px-4 flex items-center justify-between py-3">
					<div className="flex items-center gap-2">
						<div className="bg-primary/10 p-2 rounded-md">
							<Zap className="h-5 w-5 text-primary" />
						</div>
						<div>
							<h2 className="text-xl font-semibold leading-none">
								Energie-Audit Ergebnis
							</h2>
							<span className="text-xs text-muted-foreground">
								Szenario Vergleich
							</span>
						</div>
					</div>
					<Button asChild variant="default">
						<Link to="/questionnaire">Entscheidung treffen & Weiter</Link>
					</Button>
				</div>
			</div>

			<main className="container mx-auto px-4 py-8 space-y-8">
				{/* 1. SECTION: EXECUTIVE SUMMARY (KPIs) */}
				<TooltipProvider delayDuration={300}>
					{/* 1. SECTION: EXECUTIVE SUMMARY (KPIs) */}
					<section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
						<KpiCard
							title="Investitionskosten"
							value={`${KPI_DATA.invest.toLocaleString("de-DE")} €`}
							subtitle="Einmalige Gesamtkosten"
							icon={Euro}
							tooltipData={KPI_DETAILS.invest}
						/>
						<KpiCard
							title="Jährliche Einsparung"
							value={`${KPI_DATA.savingsYearly.toLocaleString("de-DE")} €`}
							subtitle="Betriebskostenreduktion"
							icon={TrendingDown}
							trend="positive"
							trendText="-49% Kosten"
							tooltipData={KPI_DETAILS.savings}
						/>
						<KpiCard
							title="Amortisation"
							value={`${KPI_DATA.amortization.toString().replace(".", ",")} Jahre`}
							subtitle="Return on Investment"
							icon={Timer}
						/>
						<KpiCard
							title="CO₂-Bilanz"
							value={`${KPI_DATA.co2Soll.toString().replace(".", ",")} t/a`}
							subtitle={`Vorher: ${KPI_DATA.co2Ist.toString().replace(".", ",")} t/a`}
							icon={Leaf}
							highlightClass="text-green-600"
							trend="positive"
							trendText="Klimapositiv"
							tooltipData={KPI_DETAILS.co2}
						/>
					</section>
				</TooltipProvider>

				{/* 2. SECTION: VISUALIZATION & CHARTS */}
				<section className="grid gap-4 md:grid-cols-7">
					{/* KOSTENVERGLEICH (Breiter) */}
					<Card className="md:col-span-4">
						<CardHeader>
							<CardTitle>Jährlicher Kostenvergleich</CardTitle>
							<CardDescription>
								Gesamtbetriebskosten Ist-Zustand vs. Soll-Zustand
							</CardDescription>
						</CardHeader>
						<CardContent className="h-[300px]">
							<ResponsiveContainer width="100%" height="100%">
								<BarChart
									data={COST_DATA}
									margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
								>
									<CartesianGrid strokeDasharray="3 3" vertical={false} />
									<XAxis
										dataKey="name"
										fontSize={12}
										tickLine={false}
										axisLine={false}
									/>
									<YAxis
										unit=" €"
										fontSize={12}
										tickLine={false}
										axisLine={false}
										tickFormatter={(value) => `${value / 1000}k`}
									/>

									{/* HIER IST DIE ÄNDERUNG: */}
									<RechartsTooltip
										content={<CustomTooltip />}
										cursor={{ fill: "rgba(0,0,0,0.05)" }} // Optional: Macht den Hover-Hintergrund dezenter
									/>

									<Legend wrapperStyle={{ paddingTop: "20px" }} />
									<Bar
										dataKey="Strom"
										stackId="a"
										fill="#3b82f6"
										name="Strombezug"
										radius={[0, 0, 4, 4]}
									/>
									<Bar
										dataKey="Brennstoff"
										stackId="a"
										fill="#ef4444"
										name="Brennstoff (Gas)"
									/>
									<Bar
										dataKey="Wartung"
										stackId="a"
										fill="#f59e0b"
										name="Betrieb & Wartung"
									/>
									<Bar
										dataKey="Erlöse"
										stackId="a"
										fill="#16a34a"
										name="Einspeisevergütung"
										radius={[4, 4, 0, 0]}
									/>
								</BarChart>
							</ResponsiveContainer>
						</CardContent>
					</Card>

					{/* AUTARKIE & UNABHÄNGIGKEIT */}
					<Card className="md:col-span-3">
						<CardHeader>
							<CardTitle>Unabhängigkeitsgrad</CardTitle>
							<CardDescription>
								Anteil der Eigenversorgung am Gesamtbedarf
							</CardDescription>
						</CardHeader>
						<CardContent className="flex flex-col items-center justify-center h-[300px]">
							<div className="relative w-full h-[200px]">
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
								{/* Zentrierter Text im Donut */}
								<div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
									<span className="text-3xl font-bold">
										{KPI_DATA.autarky.toString().replace(".", ",")}%
									</span>
									<span className="text-xs text-muted-foreground uppercase tracking-wider">
										Autarkie
									</span>
								</div>
							</div>

							<div className="mt-4 w-full space-y-2">
								<div className="flex justify-between text-sm">
									<span className="flex items-center gap-2">
										<div className="w-3 h-3 rounded-full bg-green-600" />
										Eigene Erzeugung
									</span>
									<span className="font-medium">
										{KPI_DATA.autarky.toString().replace(".", ",")}%
									</span>
								</div>
								<Separator />
								<div className="flex justify-between text-sm">
									<span className="text-muted-foreground">
										Eigenverbrauchsquote (PV)
									</span>
									<span className="font-medium">
										{KPI_DATA.selfUse.toString().replace(".", ",")}%
									</span>
								</div>
							</div>
						</CardContent>
					</Card>
				</section>

				{/* 3. SECTION: TECHNISCHE DETAILS */}
				<h3 className="text-lg font-semibold mt-8 mb-4">
					Zu Implementierende Komponenten (Soll-Zustand)
				</h3>
				<section className="grid gap-4 md:grid-cols-3">
					{/* PV-Anlage  */}
					<TechCard
						icon={Zap}
						title="Photovoltaikanlage"
						specs={[
							{ label: "Leistung", value: "684 kWp" },
							{ label: "Fläche", value: "3.041 m²" },
							{ label: "Ertrag", value: "673 MWh/a" },
							{ label: "Betriebskosten", value: "6.000 €/a" },
							{ label: "Invest", value: "400.000 €" },
						]}
						description="Großflächige Dachanlage zur Deckung des Grundbedarfs und Einspeisung."
					/>

					{/* Speicher  */}
					<TechCard
						icon={Battery}
						title="Batteriespeicher"
						specs={[
							{ label: "Kapazität", value: "321 kWh" },
							{ label: "Zyklen", value: "268 / Jahr" },
							{ label: "Betriebskosten", value: "1.470,5 €/a" },
							{ label: "Invest", value: "73.524 €" },
						]}
						description="Puffert PV-Strom für die Nacht und kappt teure Lastspitzen."
					/>

					{/* Wärmepumpe  */}
					<TechCard
						icon={ThermometerSun}
						title="Wärmepumpe"
						specs={[
							{ label: "Thermische Nennleistung", value: "50 kW" },
							{ label: "Wärme", value: "126,49 MWh/a" },
							{ label: "Betriebskosten", value: "375 €/a" },
							{ label: "Invest", value: "25.000 €" },
						]}
						description="Ersetzt einen Großteil des Gasverbrauchs durch effizienten Strom."
					/>
				</section>
				<AssumptionsSection />
			</main>
		</div>
	);
}

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
		<Card className="relative overflow-visible">
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<div className="flex items-center gap-2">
					<CardTitle className="text-sm font-medium text-muted-foreground">
						{title}
					</CardTitle>
					{/* Tooltip Icon, wenn Daten vorhanden sind */}
					<Activity mode={!tooltipData ? "hidden" : "visible"}>
						<Tooltip>
							<TooltipTrigger asChild>
								<Info className="h-3.5 w-3.5 text-muted-foreground/50 hover:text-primary cursor-help transition-colors" />
							</TooltipTrigger>
							<TooltipContent
								side="right"
								align="start"
								className="p-0 overflow-hidden shadow-lg border-none"
							>
								<div className="bg-popover border text-popover-foreground p-3 min-w-[200px]">
									<p className="font-semibold text-xs text-muted-foreground uppercase mb-2">
										Zusammensetzung
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
					</Activity>
				</div>
				<Icon className="h-4 w-4 text-muted-foreground" />
			</CardHeader>
			<CardContent>
				<div className={`text-2xl font-bold ${highlightClass || ""}`}>
					{value}
				</div>
				<div className="flex items-center justify-between mt-1 h-5">
					<p className="text-xs text-muted-foreground">{subtitle}</p>
					{trend === "positive" && trendText && (
						<Badge
							variant="outline"
							className="bg-green-50 text-green-700 border-green-200 text-[10px] px-1 ml-2"
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
		<Card>
			<CardHeader className="flex flex-row items-center gap-4 pb-2">
				<div className="p-2 bg-primary/10 rounded-lg">
					<Icon className="h-6 w-6 text-primary" />
				</div>
				<CardTitle className="text-base">{title}</CardTitle>
			</CardHeader>
			<CardContent>
				<p className="text-sm text-muted-foreground mb-4 h-10 line-clamp-2">
					{description}
				</p>
				<div className="space-y-2">
					{specs.map((spec) => (
						<div
							key={spec.label}
							className="flex justify-between text-sm border-b pb-1 last:border-0"
						>
							<span className="text-muted-foreground">{spec.label}</span>
							<span className="font-medium">{spec.value}</span>
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
	if (active && payload && payload.length > 0) {
		// payload[0].payload ist das Objekt aus COST_DATA
		const data = payload[0].payload;

		return (
			<div className="bg-popover border text-popover-foreground shadow-md rounded-lg p-3 text-sm min-w-[180px]">
				{/* Titel (z.B. "Soll-Zustand") */}
				<p className="font-semibold mb-2 border-b pb-1">{label}</p>

				{/* Die einzelnen Balken-Werte */}
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
								{entry.value?.toLocaleString("de-DE")} €
							</span>
						</div>
					))}
				</div>

				{/* Die Trennlinie */}
				<div className="my-2 h-[1px] bg-border" />

				{/* Die Gesamtsumme */}
				<div className="flex items-center justify-between gap-4 pt-1">
					<span className="font-bold">Gesamt:</span>
					<span className="font-mono font-bold text-primary">
						{data.total.toLocaleString("de-DE")} €
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
			<Card>
				<CardHeader>
					<CardTitle className="text-lg">Modell-Grundlagen</CardTitle>
					<CardDescription>
						Die Berechnung basiert auf folgenden Ist-Daten und Tarifen Ihres
						Betriebs.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Accordion type="single" collapsible className="w-full">
						{/* TARIFE */}
						<AccordionItem value="item-1">
							<AccordionTrigger>Aktuelle Energietarife</AccordionTrigger>
							<AccordionContent>
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Typ</TableHead>
											<TableHead>Preis (Arbeit)</TableHead>
											<TableHead>Grundpreis/Leistung</TableHead>
											<TableHead>Einspeisevergütung</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										<TableRow>
											<TableCell className="font-medium">Strombezug</TableCell>
											<TableCell>24,92 ct/kWh</TableCell>
											<TableCell>153,55 €/kW/a</TableCell>
											<TableCell>6,2 ct/kWh</TableCell>
										</TableRow>
										<TableRow>
											<TableCell className="font-medium">
												Brennstoff* (Gas)
											</TableCell>
											<TableCell>8,00 ct/kWh</TableCell>
											<TableCell>500,00 €/a</TableCell>
										</TableRow>
									</TableBody>
								</Table>
								<p className="text-xs text-muted-foreground mt-2">
									* CO₂-Preis: 70 €/t | Preissteigerung: 3 %/a
								</p>
							</AccordionContent>
						</AccordionItem>

						{/* VERBRAUCHSDATEN */}
						<AccordionItem value="item-2">
							<AccordionTrigger>Jahresbedarf & Lastprofil</AccordionTrigger>
							<AccordionContent>
								<div className="grid grid-cols-2 gap-4 text-sm">
									<div className="space-y-1">
										<span className="block text-muted-foreground">
											Strombedarf (Gesamt)
										</span>
										<span className="font-medium">
											395 MWh/a + 70 MWh (Kälte)
										</span>
									</div>
									<div className="space-y-1">
										<span className="block text-muted-foreground">
											Spitzenlast (Strom)
										</span>
										<span className="font-medium">352,8 kW</span>
									</div>
									<div className="space-y-1">
										<span className="block text-muted-foreground">
											Thermischer Wärmebedarf (vor allem in den Wintermonaten)
										</span>
										<span className="font-medium">126,5 MWh/a</span>
									</div>
									<div className="space-y-1">
										<span className="block text-muted-foreground">
											Thermischer Kältebedarf (Sommermonate)
										</span>
										<span className="font-medium">350 MWh/a</span>
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
