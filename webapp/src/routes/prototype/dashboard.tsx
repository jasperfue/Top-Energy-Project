import { createFileRoute, Link } from "@tanstack/react-router";
import {
	Battery,
	Euro,
	Leaf,
	type LucideIcon,
	ThermometerSun,
	Timer,
	TrendingDown,
	Zap,
} from "lucide-react";
import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	Legend,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
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
				<section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
					<KpiCard
						title="Investitionskosten"
						value={`${KPI_DATA.invest.toLocaleString("de-DE")} €`}
						subtitle="Einmalige Gesamtkosten"
						icon={Euro}
					/>
					<KpiCard
						title="Jährliche Einsparung"
						value={`${KPI_DATA.savingsYearly.toLocaleString("de-DE")} €`}
						subtitle="Betriebskostenreduktion"
						icon={TrendingDown}
						trend="positive"
						trendText="-49% Kosten"
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
					/>
				</section>

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
									<XAxis dataKey="name" />
									<YAxis unit=" €" />
									<Tooltip
										formatter={(value) => `${value.toLocaleString("de-DE")} €`}
									/>
									<Legend />
									<Bar
										dataKey="Strom"
										stackId="a"
										fill="#3b82f6"
										name="Strombezug"
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
									{/* Erlöse werden negativ dargestellt für den Netto-Effekt */}
									<Bar
										dataKey="Erlöse"
										stackId="a"
										fill="#16a34a"
										name="Einspeisevergütung"
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
					Implementierte Komponenten (Soll-Zustand)
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
							{ label: "Invest", value: "73.524 €" },
							{ label: "Betriebskosten", value: "1.470,5 €/a" },
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
}

function KpiCard({
	title,
	value,
	subtitle,
	icon: Icon,
	highlightClass,
	trend,
	trendText,
}: KpiCardProps) {
	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle className="text-sm font-medium text-muted-foreground">
					{title}
				</CardTitle>
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
