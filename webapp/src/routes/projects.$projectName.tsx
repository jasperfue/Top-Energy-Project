import { createQueryOptions } from "@/lib/query.ts";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

const projectQueryOptions = (projectName: string) =>
	createQueryOptions(["project", projectName], `/api/projects/${projectName}`, {
		staleTime: Number.POSITIVE_INFINITY,
	});

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
	const { data } = useQuery(projectQueryOptions(projectName));
	console.log(data);
	return <pre>{JSON.stringify(data, null, 2)}</pre>;
}
