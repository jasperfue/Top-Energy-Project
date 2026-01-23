import { Info } from "lucide-react";
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
import type { CustomTooltipProps } from "@/components/SystemDynamicsSection.tsx";
import useIsMobile from "@/hooks/use-is-mobile.ts";
import * as m from "@/paraglide/messages";
import { getLocale } from "@/paraglide/runtime";
import { fmt } from "@/routes/dashboard.tsx";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "./ui/card";
import {
	Tooltip as ShadTooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "./ui/tooltip";

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
	autarky: 67.9,
	selfUse: 54.4,
};

const PIE_DATA_AUTARKIE = [
	{
		name: m.dashboard_legend_autarky_pv(),
		value: RAW_DATA.autarky,
		color: "#16a34a",
	},
	{
		name: m.dashboard_legend_grid(),
		value: 100 - RAW_DATA.autarky,
		color: "#e2e8f0",
	},
];

const PIE_DATA_SELF_USE = [
	{
		name: m.dashboard_label_self_consumption(),
		value: RAW_DATA.selfUse,
		color: "#3b82f6",
	},
	{
		name: m.dashboard_legend_export(),
		value: 100 - RAW_DATA.selfUse,
		color: "#e2e8f0",
	},
];

export function CostAutarkySection() {
	const currentLocale = getLocale();
	const { isMobile } = useIsMobile();
	return (
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
				<CardContent className="h-[300px] md:h-[350px]">
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
							<Legend content={<CustomCostLegend />} />
							<Bar
								dataKey="Strom"
								stackId="a"
								fill="#3b82f6"
								name={m.dashboard_legend_grid()}
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
								fill="#8b5cf6"
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
				<CardContent className="flex flex-col gap-6 py-4 h-full justify-center">
					<TooltipProvider>
						<div className="grid grid-cols-2 gap-4 w-full">
							{/* Autarky Chart */}
							<div className="flex flex-col items-center">
								<div className="relative w-full aspect-square max-h-[140px] md:max-h-[200px]">
									<ResponsiveContainer width="100%" height="100%">
										<PieChart>
											<Pie
												data={PIE_DATA_AUTARKIE}
												cx="50%"
												cy="50%"
												innerRadius={isMobile ? 45 : 60}
												outerRadius={isMobile ? 60 : 80}
												paddingAngle={5}
												dataKey="value"
												startAngle={90}
												endAngle={450}
											>
												{PIE_DATA_AUTARKIE.map((entry) => (
													<Cell key={`cell-${entry.name}`} fill={entry.color} />
												))}
											</Pie>
										</PieChart>
									</ResponsiveContainer>
									<div className="absolute inset-0 flex items-center justify-center pointer-events-none">
										<span className="text-lg md:text-xl font-bold">
											{fmt(RAW_DATA.autarky, currentLocale)}%
										</span>
									</div>
								</div>
								<div className="flex items-center gap-1.5 mt-2">
									<span className="text-xs font-medium text-center leading-tight">
										{m.dashboard_label_autarky()}
									</span>
									<ShadTooltip>
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
											<div className="bg-popover border text-popover-foreground p-3 max-w-[250px]">
												<p className="text-sm leading-relaxed">
													{m.dashboard_tooltip_autarky_desc()}
												</p>
											</div>
										</TooltipContent>
									</ShadTooltip>
								</div>
							</div>

							{/* Self-Use Chart */}
							<div className="flex flex-col items-center">
								<div className="relative w-full aspect-square max-h-[140px] md:max-h-[200px]">
									<ResponsiveContainer width="100%" height="100%">
										<PieChart>
											<Pie
												data={PIE_DATA_SELF_USE}
												cx="50%"
												cy="50%"
												innerRadius={isMobile ? 45 : 60}
												outerRadius={isMobile ? 60 : 80}
												paddingAngle={5}
												dataKey="value"
												startAngle={90}
												endAngle={450}
											>
												{PIE_DATA_SELF_USE.map((entry) => (
													<Cell key={`cell-${entry.name}`} fill={entry.color} />
												))}
											</Pie>
										</PieChart>
									</ResponsiveContainer>
									<div className="absolute inset-0 flex items-center justify-center pointer-events-none">
										<span className="text-lg md:text-xl font-bold">
											{fmt(RAW_DATA.selfUse, currentLocale)}%
										</span>
									</div>
								</div>
								<div className="flex items-center gap-1.5 mt-2">
									<span className="text-xs font-medium text-center leading-tight">
										{m.dashboard_label_self_consumption()}
									</span>
									<ShadTooltip>
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
											<div className="bg-popover border text-popover-foreground p-3 max-w-[250px]">
												<p className="text-sm leading-relaxed">
													{m.dashboard_tooltip_self_use_desc()}
												</p>
											</div>
										</TooltipContent>
									</ShadTooltip>
								</div>
							</div>
						</div>
					</TooltipProvider>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mt-2">
						{/* Autarky Legend */}
						<div className="space-y-1.5">
							<div className="flex justify-between text-[11px] md:text-xs items-center">
								<span className="flex items-center gap-2 text-muted-foreground">
									<div className="w-2 h-2 rounded-full bg-green-600 shrink-0" />
									{m.dashboard_label_own_generation()}
								</span>
								<span className="font-medium">
									{fmt(RAW_DATA.autarky, currentLocale)}%
								</span>
							</div>
							<div className="flex justify-between text-[11px] md:text-xs items-center">
								<span className="flex items-center gap-2 text-muted-foreground">
									<div className="w-2 h-2 rounded-full bg-slate-200 shrink-0" />
									{m.dashboard_legend_grid()}
								</span>
								<span className="font-medium">
									{fmt(100 - RAW_DATA.autarky, currentLocale)}%
								</span>
							</div>
						</div>

						{/* Self-Use Legend */}
						<div className="space-y-1.5">
							<div className="flex justify-between text-[11px] md:text-xs items-center">
								<span className="flex items-center gap-2 text-muted-foreground">
									<div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
									{m.dashboard_label_self_consumption()}
								</span>
								<span className="font-medium">
									{fmt(RAW_DATA.selfUse, currentLocale)}%
								</span>
							</div>
							<div className="flex justify-between text-[11px] md:text-xs items-center">
								<span className="flex items-center gap-2 text-muted-foreground">
									<div className="w-2 h-2 rounded-full bg-slate-200 shrink-0" />
									{m.dashboard_legend_export()}
								</span>
								<span className="font-medium">
									{fmt(100 - RAW_DATA.selfUse, currentLocale)}%
								</span>
							</div>
						</div>
					</div>
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
					{/** biome-ignore lint/suspicious/noExplicitAny: Is okay*/}
					{payload.map((entry: any) => (
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

const CustomCostLegend = (props: any) => {
	const { payload } = props;
	if (!payload) return null;

	return (
		<div className="flex flex-wrap justify-center gap-x-3 gap-y-1.5 pt-4 px-2 md:gap-x-5">
			{payload.map((entry: any, index: number) => (
				<div
					key={`legend-${
						// biome-ignore lint/suspicious/noArrayIndexKey: It is how it is
						index
					}`}
					className="flex items-center gap-1.5"
				>
					<div
						className="w-2.5 h-2.5 rounded-full shrink-0"
						style={{ backgroundColor: entry.color }}
					/>
					<span
						className="text-xs whitespace-nowrap md:text-sm"
						style={{ color: entry.color }}
					>
						{entry.value}
					</span>
				</div>
			))}
		</div>
	);
};
