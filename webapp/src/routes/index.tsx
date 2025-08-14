import { Link, createFileRoute } from "@tanstack/react-router";
import logo from "../logo.svg";
import "../App.css";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/card.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import { createQueryOptions } from "@/lib/query.ts";
import { useQuery } from "@tanstack/react-query";
import { FileBox } from "lucide-react";

type Projects = {
	projects: string[];
};
const projectsOptions = createQueryOptions<Projects>(
	["projects"],
	"/api/projects",
);

export const Route = createFileRoute("/")({
	component: App,
	loader: ({ context: { queryClient } }) =>
		queryClient.ensureQueryData(projectsOptions),
});
function App() {
	const {
		data: projects,
		isLoading,
		isError,
		error,
	} = useQuery(projectsOptions);

	return (
		<header className="flex flex-col items-center gap-4 mb-6">
			<img src={logo} className="h-16 w-16 animate-spin-slow" alt="logo" />
			<Card className="w-full">
				<CardHeader>
					<CardTitle>Deine Projekte</CardTitle>
				</CardHeader>
				<CardContent>
					{isLoading && <p>Lade Projekte…</p>}
					{isError && (
						<p className="text-destructive">
							Fehler beim Laden: {String(error?.message || "Unbekannt")}
						</p>
					)}
					{!isLoading &&
					!isError &&
					projects?.projects &&
					projects.projects.length > 0 ? (
						<div className="flex flex-col">
							{projects.projects.map((proj, idx) => (
								<div key={proj} className="py-2">
									<Link
										to="/projects/$projectName"
										params={{ projectName: encodeURIComponent(proj) }}
										className="flex gap-2 hover:underline"
										preload={false}
									>
										<FileBox strokeWidth={1.5} />
										{proj}
									</Link>
									{idx < projects.projects.length - 1 && (
										<div className="my-2">
											<Separator />
										</div>
									)}
								</div>
							))}
						</div>
					) : (
						!isLoading && !isError && <p>Keine Projekte gefunden.</p>
					)}
				</CardContent>
			</Card>
			<div className="flex gap-4 mt-4">
				<a
					className="text-sm underline"
					href="https://reactjs.org"
					target="_blank"
					rel="noopener noreferrer"
				>
					Learn React
				</a>
				<a
					className="text-sm underline"
					href="https://tanstack.com"
					target="_blank"
					rel="noopener noreferrer"
				>
					Learn TanStack
				</a>
			</div>
		</header>
	);
}
