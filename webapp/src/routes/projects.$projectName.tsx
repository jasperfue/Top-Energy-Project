import { createQueryOptions } from "@/lib/query.ts";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export interface ProjectData {
	elements: ElementBlock[];
}

export interface ElementBlock {
	name: string;
	input: IOEntry[];
	output: IOEntry[];
}

export interface IOEntryBase {
	name: string;
	unit: string;
}

export type IOEntry =
	| (IOEntryBase & NumberValueField)
	| (IOEntryBase & TimeSeriesValueField);

export interface NumberValueField {
	type: "number_value";
	value: {
		number_value: {
			value: number;
			unit: string;
			qualifier?: string;
			valid: boolean;
		};
	};
}

export interface TimeSeriesValueField {
	type: "time_series_value";
	value: {
		time_series_value: {
			unit: string;
			dst_information?: string;
			qualifier?: string;
			value_list: TimeSeriesPoint[];
		};
		summary: TimeSeriesSummary;
	};
}

export interface TimeSeriesPoint {
	timepoint: string;
	value: number;
	valid: boolean;
}

export interface TimeSeriesSummary {
	type: "timeseries";
	unit: string;
	count_total: number;
	count_valid: number;
	count_invalid: number;
	valid_coverage: number;
	mean: number;
	median: number;
	min: number;
	max: number;
	stddev: number;
	sum: number;
	start: string; // ISO
	end: string; // ISO
	estimated_step_seconds?: number;
	reduction?: {
		original_points: number;
		returned_points: number;
		method: string;
	};
}
const isNumberEntry = (e: IOEntry): e is IOEntryBase & NumberValueField =>
	e.type === "number_value";

const isTimeSeriesEntry = (
	e: IOEntry,
): e is IOEntryBase & TimeSeriesValueField => e.type === "time_series_value";

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

	return (
		<div>
			{data.elements.map((el) => (
				<section key={el.name}>
					<h2>{el.name}</h2>

					<h3>Input</h3>
					<ul>
						{el.input.map((entry) => (
							<li key={entry.name}>
								{isNumberEntry(entry) && (
									<>
										<strong>{entry.name}</strong>:{" "}
										{entry.value.number_value.value}{" "}
										{entry.value.number_value.unit} ({entry.unit})
									</>
								)}
								{isTimeSeriesEntry(entry) && (
									<>
										<strong>{entry.name}</strong>:{" "}
										{entry.value.time_series_value.value_list.length} Punkte (
										{entry.unit})
									</>
								)}
							</li>
						))}
					</ul>

					<h3>Output</h3>
					<ul>
						{el.output.map((entry) => (
							<li key={entry.name}>
								{isTimeSeriesEntry(entry) ? (
									<>
										<strong>{entry.name}</strong> – Mittelwert:{" "}
										{entry.value.summary?.mean ?? "–"}{" "}
										{entry.value.summary?.unit ?? entry.unit}
									</>
								) : (
									<>
										<strong>{entry.name}</strong>:{" "}
										{entry.value.number_value.value}{" "}
										{entry.value.number_value.unit}
									</>
								)}
							</li>
						))}
					</ul>
				</section>
			))}
		</div>
	);
}
