import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	Legend,
	Pie,
	PieChart,
	ReferenceLine,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { Separator } from "@/components/ui/separator.tsx";
import * as m from "@/paraglide/messages";
import { getLocale } from "@/paraglide/runtime";
import { type CustomTooltipProps, fmt } from "@/routes/dashboard.tsx";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "./ui/card";

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

const RAW_DATA = {
	invest: 498524,
	savingsYearly: 114540.77,
	amortization: 5.95,
	co2Ist: 76.55,
	co2Soll: -18.89,
	autarky: 61.7,
	selfUse: 38.6,
};

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

export function CostAutarkySection() {
	const currentLocale = getLocale();
	return (
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
								{fmt(RAW_DATA.autarky, currentLocale)}%
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
								{fmt(RAW_DATA.autarky, currentLocale)}%
							</span>
						</div>
						<Separator />
						<div className="flex justify-between text-sm items-center">
							<span className="text-muted-foreground truncate pr-2">
								{m.dashboard_label_self_consumption()}
							</span>
							<span className="font-medium whitespace-nowrap">
								{fmt(RAW_DATA.selfUse, currentLocale)}%
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
							<Tooltip
								content={<CustomCostTooltip />}
								cursor={{ fill: "rgba(0,0,0,0.05)" }}
								wrapperStyle={{ zIndex: 100 }}
							/>
							<Legend wrapperStyle={{ paddingTop: "10px", fontSize: "12px" }} />
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
	);
}

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
