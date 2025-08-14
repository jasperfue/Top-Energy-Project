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
export const isNumberEntry = (
	e: IOEntry,
): e is IOEntryBase & NumberValueField => e.type === "number_value";

export const isTimeSeriesEntry = (
	e: IOEntry,
): e is IOEntryBase & TimeSeriesValueField => e.type === "time_series_value";

export const fmtNumber = (n: number | undefined, digits = 2) =>
	n == null
		? "–"
		: new Intl.NumberFormat("de-DE", { maximumFractionDigits: digits }).format(
				n,
			);
