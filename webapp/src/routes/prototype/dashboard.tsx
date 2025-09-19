import { Link, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/prototype/dashboard")({
	component: Dashboard,
});
function Dashboard() {
	return (
		<main className="p-6 space-y-4">
			<h2 className="text-xl font-semibold">Dashboard-Prototyp</h2>
			<div className="grid sm:grid-cols-3 gap-4">
				<div className="rounded-xl border p-4">KPI: Kosten</div>
				<div className="rounded-xl border p-4">KPI: CO₂</div>
				<div className="rounded-xl border p-4">KPI: Autarkie</div>
			</div>
			<div className="rounded-xl border p-4">Trade-off Chart (Mock)</div>
			<div className="flex justify-end">
				<Link to="/questionnaire" search={{ type: "dashboard" }}>
					Weiter zum Fragebogen
				</Link>
			</div>
		</main>
	);
}
