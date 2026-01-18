import { Battery, type LucideIcon, ThermometerSun, Zap } from "lucide-react";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/card.tsx";
import * as m from "@/paraglide/messages";
import { getLocale } from "@/paraglide/runtime";
import { fmt } from "@/routes/dashboard.tsx";

export function SystemConfigurationBar() {
	const currentLocale = getLocale();
	return (
		<>
			<h3 className="text-lg font-semibold mt-4 mb-4 px-1">
				{m.dashboard_tech_section_title()}
			</h3>
			<section className="grid gap-4 md:grid-cols-3">
				<TechCard
					icon={Zap}
					title={m.dashboard_tech_pv_title()}
					specs={[
						{
							label: m.dashboard_spec_power(),
							value: `${fmt(684, currentLocale)} kWp`,
						},
						{
							label: m.dashboard_spec_area(),
							value: `${fmt(3041, currentLocale)} m²`,
						},
						{
							label: m.dashboard_spec_yield(),
							value: `${fmt(673, currentLocale)} MWh/a`,
						},
						{
							label: m.dashboard_spec_opex(),
							value: `${fmt(6000, currentLocale)} €/a`,
						},
						{
							label: m.dashboard_spec_invest(),
							value: `${fmt(400000, currentLocale)} €`,
						},
					]}
					description={m.dashboard_tech_pv_desc()}
				/>
				<TechCard
					icon={Battery}
					title={m.dashboard_tech_battery_title()}
					specs={[
						{
							label: m.dashboard_spec_capacity(),
							value: `${fmt(321, currentLocale)} kWh`,
						},
						{
							label: m.dashboard_spec_cycles(),
							value: `${fmt(268, currentLocale)} / ${m.dashboard_unit_year()}`,
						},
						{
							label: m.dashboard_spec_opex(),
							value: `${fmt(1470.5, currentLocale)} €/a`,
						},
						{
							label: m.dashboard_spec_invest(),
							value: `${fmt(73524, currentLocale)} €`,
						},
					]}
					description={m.dashboard_tech_battery_desc()}
				/>
				<TechCard
					icon={ThermometerSun}
					title={m.dashboard_tech_hp_title()}
					specs={[
						{
							label: m.dashboard_spec_thermal_power(),
							value: `${fmt(50, currentLocale)} kW`,
						},
						{
							label: m.dashboard_spec_heat(),
							value: `${fmt(126.49, currentLocale)} MWh/a`,
						},
						{
							label: m.dashboard_spec_opex(),
							value: `${fmt(375, currentLocale)} €/a`,
						},
						{
							label: m.dashboard_spec_invest(),
							value: `${fmt(25000, currentLocale)} €`,
						},
					]}
					description={m.dashboard_tech_hp_desc()}
				/>
			</section>
		</>
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
