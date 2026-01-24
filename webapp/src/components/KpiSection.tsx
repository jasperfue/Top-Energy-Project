import {
	Euro,
	Info,
	Leaf,
	type LucideIcon,
	Timer,
	TrendingDown,
} from "lucide-react";
import { Badge } from "@/components/ui/badge.tsx";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/card.tsx";
import {
	Tooltip,
	TooltipContent,
	TooltipPositioner,
	TooltipTrigger,
} from "@/components/ui/tooltip.tsx";
import { cn } from "@/lib/utils.ts";
import * as m from "@/paraglide/messages";
import { getLocale } from "@/paraglide/runtime";
import { fmt } from "@/routes/dashboard.tsx";

const RAW_DATA = {
	invest: 498524,
	savingsYearly: 114540.77,
	amortization: 5.95,
	co2Ist: 76.55,
	co2Soll: -18.89,
	autarky: 67.9,
	selfUse: 48.4,
};

export function KpiSection() {
	const currentLocale = getLocale();
	const KPI_DETAILS = {
		invest: [
			{
				label: m.dashboard_kpi_invest_label_pv(),
				value: `${fmt(400000, currentLocale)} €`,
			},
			{
				label: m.dashboard_kpi_invest_label_battery(),
				value: `${fmt(73524, currentLocale)} €`,
			},
			{
				label: m.dashboard_kpi_invest_label_hp(),
				value: `${fmt(25000, currentLocale)} €`,
			},
		],
		savings: [
			{
				label: m.dashboard_kpi_savings_label_elec(),
				value: `${fmt(88900, currentLocale)} €`,
			},
			{
				label: m.dashboard_kpi_savings_label_fuel(),
				value: `${fmt(12526.27, currentLocale)} €`,
			},
			{
				label: m.dashboard_kpi_savings_label_feedin(),
				value: `${fmt(20960, currentLocale)} €`,
			},
			{
				label: m.dashboard_kpi_savings_label_opex(),
				value: `- ${fmt(7845.5, currentLocale)} €`,
			},
		],
		co2: [
			{
				label: m.dashboard_kpi_co2_label_rest_elec(),
				value: `${fmt(17.27, currentLocale)} t`,
			},
			{
				label: m.dashboard_kpi_co2_label_rest_fuel(),
				value: `${fmt(0.01, currentLocale)} t`,
			},
			{
				label: m.dashboard_kpi_co2_label_credit(),
				value: `- ${fmt(36.17, currentLocale)} t`,
			},
			{
				label: m.dashboard_kpi_co2_label_sum(),
				value: `- ${fmt(18.89, currentLocale)} t`,
			},
		],
	};
	return (
		<section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
			<KpiCard
				title={m.dashboard_kpi_invest_title()}
				value={`${fmt(RAW_DATA.invest, currentLocale)} €`}
				subtitle={m.dashboard_kpi_invest_subtitle()}
				icon={Euro}
				tooltipData={KPI_DETAILS.invest}
			/>
			<KpiCard
				title={m.dashboard_kpi_savings_title()}
				value={`${fmt(RAW_DATA.savingsYearly, currentLocale)} €`}
				subtitle={m.dashboard_kpi_savings_subtitle()}
				icon={TrendingDown}
				trend="positive"
				trendText={m.dashboard_kpi_savings_trend()}
				tooltipData={KPI_DETAILS.savings}
			/>
			<KpiCard
				title={m.dashboard_kpi_amortization_title()}
				value={`${fmt(RAW_DATA.amortization, currentLocale)} ${m.dashboard_kpi_amortization_unit()}`}
				subtitle={m.dashboard_kpi_amortization_subtitle()}
				icon={Timer}
			/>
			<KpiCard
				title={m.dashboard_kpi_co2_title()}
				value={`${fmt(RAW_DATA.co2Soll, currentLocale)} t/a`}
				subtitle={m.dashboard_kpi_co2_subtitle({
					value: fmt(RAW_DATA.co2Ist, currentLocale),
				})}
				icon={Leaf}
				highlightClass="text-green-600"
				trend="positive"
				trendText={m.dashboard_kpi_co2_trend()}
				tooltipData={KPI_DETAILS.co2}
			/>
		</section>
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
}: Readonly<KpiCardProps>) {
	return (
		<Card className="relative overflow-visible shadow-sm">
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<div className="flex items-center gap-2 max-w-[85%]">
					<CardTitle className="text-sm font-medium text-muted-foreground truncate">
						{title}
					</CardTitle>
					<div className={cn(!tooltipData ? "hidden" : "flex", "items-center")}>
						<Tooltip>
							<TooltipTrigger>
								<div className="p-1 -m-1 cursor-pointer">
									<Info className="h-3.5 w-3.5 text-muted-foreground/50 hover:text-primary transition-colors" />
								</div>
							</TooltipTrigger>

							{/* NEU: Positioner umschließt Content */}
							{/* side und align gehören jetzt zum Positioner */}
							<TooltipPositioner side="right" align="start">
								<TooltipContent className="p-0 overflow-hidden shadow-lg border-none">
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
							</TooltipPositioner>
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
