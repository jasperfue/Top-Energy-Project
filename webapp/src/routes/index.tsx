import { createFileRoute } from "@tanstack/react-router";
import logo from "../logo.svg";
import "../App.css";
import { createQueryOptions } from "@/lib/query.ts";
import { useQuery } from "@tanstack/react-query";

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
	const { data: projects } = useQuery(projectsOptions);
	console.log(projects);
	return (
		<div className="App">
			<header className="App-header">
				<img src={logo} className="App-logo" alt="logo" />
				<p>
					Edit <code>src/routes/index.tsx</code> and save to reload.
				</p>
				<a
					className="App-link"
					href="https://reactjs.org"
					target="_blank"
					rel="noopener noreferrer"
				>
					Learn React
				</a>
				<a
					className="App-link"
					href="https://tanstack.com"
					target="_blank"
					rel="noopener noreferrer"
				>
					Learn TanStack
				</a>
			</header>
		</div>
	);
}
