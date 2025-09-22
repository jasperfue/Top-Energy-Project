import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";

export type TimeSeriesPoint = { date: string; value: number };

export default function TimeSeriesChart({
	data,
	label,
	unit,
	height = 250,
}: {
	data: TimeSeriesPoint[];
	label: string; // z.B. der Name der Zeitreihe
	unit?: string; // für Tooltip/Legende
	height?: number; // optional: Höhe in px
}) {
	const chartConfig: ChartConfig = {
		value: {
			label: unit ? `${label} (${unit})` : label,
			color: "var(--chart-1)",
		},
	};

	return (
		<ChartContainer
			config={chartConfig}
			className="aspect-auto w-full"
			style={{ height }}
		>
			<LineChart
				accessibilityLayer
				data={data}
				margin={{ left: 12, right: 12 }}
			>
				<CartesianGrid vertical={false} />
				<XAxis
					dataKey="date"
					tickLine={false}
					axisLine={false}
					tickMargin={8}
					minTickGap={32}
					tickFormatter={(value: string) => {
						const d = new Date(value);
						return d.toLocaleDateString("de-DE", {
							month: "short",
							day: "numeric",
						});
					}}
				/>
				<YAxis tickLine={false} axisLine={false} width={50} />
				<ChartTooltip
					content={
						<ChartTooltipContent
							className="w-[180px]"
							nameKey="value"
							labelFormatter={(value) =>
								new Date(value as string).toLocaleDateString("de-DE", {
									month: "short",
									day: "numeric",
									year: "numeric",
									hour: "2-digit",
									minute: "2-digit",
								})
							}
						/>
					}
				/>
				<Line
					dataKey="value"
					type="monotone"
					stroke="var(--color-value)"
					strokeWidth={2}
					dot={false}
				/>
			</LineChart>
		</ChartContainer>
	);
}
