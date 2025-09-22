import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import ElementCardsWithCharts from "@/components/ElementCardsWithCharts.tsx";
import { createQueryOptions } from "@/lib/query.ts";
import type { ProjectData } from "@/types/projectDataTypes.ts";

const projectQueryOptions = (projectName: string) =>
	createQueryOptions<ProjectData>(
		["project", projectName],
		`/api/projects/${projectName}`,
		{
			staleTime: Number.POSITIVE_INFINITY,
		},
	);

export const Route = createFileRoute("/projects/$projectName")({
	component: Project,
	loader: async ({ params, context: { queryClient } }) => {
		const { projectName } = params;
		if (!projectName) {
			throw new Error("Project name is required");
		}
		return await queryClient.ensureQueryData(projectQueryOptions(projectName));
	},
});

function Project() {
	const { projectName } = Route.useParams();
	const { data, error } = useQuery(projectQueryOptions(projectName));
	if (error) return <div>Fehler: {(error as Error).message}</div>;
	if (!data) return <div>Keine Daten</div>;

	return <ElementCardsWithCharts data={data} />;
}
