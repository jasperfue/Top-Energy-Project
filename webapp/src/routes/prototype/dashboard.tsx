import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button.tsx";

export const Route = createFileRoute("/prototype/dashboard")({
	component: Dashboard,
});
function Dashboard() {
	return (
		<>
			{/* Header */}
			<div className="sticky top-0 z-20 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
				<div className="flex items-center justify-between py-3">
					<h2 className="text-xl font-semibold">Dashboard-Prototyp</h2>
					<Button asChild>
						<Link to="/questionnaire" search={{ type: "dashboard" }}>
							Weiter zum Fragebogen
						</Link>
					</Button>
				</div>
			</div>
			<div className="space-y-4">
				<div className="grid sm:grid-cols-3 gap-4">
					<div className="rounded-xl border p-4">KPI: Kosten</div>
					<div className="rounded-xl border p-4">KPI: CO₂</div>
					<div className="rounded-xl border p-4">KPI: Autarkie</div>
				</div>
				<div className="rounded-xl border p-4">Trade-off Chart (Mock)</div>
			</div>
		</>
	);
}
