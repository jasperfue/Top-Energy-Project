import TimeSeriesChart from "@/components/TimeSeriesChart";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import {
	type IOEntry,
	fmtNumber,
	isNumberEntry,
	isTimeSeriesEntry,
} from "@/types/projectDataTypes.ts";

export default function IOSection({
	entries,
	kind,
}: {
	entries: IOEntry[];
	kind: "input" | "output";
}) {
	return (
		<div className="space-y-6">
			{entries.map((e, idx) => {
				// ---------- NUMBER VALUE ----------
				if (isNumberEntry(e)) {
					const nv = e.value.number_value;
					return (
						<div
							key={`${kind}-num-${idx}-${e.name}`}
							className="rounded-xl border bg-background px-3 py-2 text-sm shadow-sm transition-shadow hover:shadow"
						>
							<div className="flex items-center gap-2">
								<span className="font-medium">{e.name}</span>
								{nv?.qualifier ? (
									<span
										className="ml-auto truncate text-xs text-muted-foreground"
										title={nv.qualifier}
									>
										{nv.qualifier}
									</span>
								) : null}
							</div>

							<div className="mt-1 flex items-baseline gap-2">
								<span className="tabular-nums text-base font-semibold">
									{fmtNumber(nv?.value)}
								</span>
								<span className="text-muted-foreground">
									{nv?.unit ?? e.unit}
								</span>
								{nv?.valid === false && (
									<span className="ml-auto rounded bg-destructive/10 px-1.5 py-0.5 text-[10px] font-medium text-destructive">
										invalid
									</span>
								)}
							</div>
						</div>
					);
				}

				// ---------- TIME SERIES ----------
				if (isTimeSeriesEntry(e)) {
					const s = e.value.summary;
					const chartData = e.value.time_series_value.value_list.map((p) => ({
						date: p.timepoint,
						value: p.value,
					}));

					return (
						<Accordion
							key={`${kind}-ts-${idx}-${e.name}`}
							type="single"
							collapsible
						>
							<AccordionItem value={`${kind}-${idx}-${e.name}`}>
								<AccordionTrigger>{e.name}</AccordionTrigger>
								<AccordionContent>
									<TimeSeriesChart
										data={chartData}
										label={e.name}
										unit={s?.unit ?? e.unit}
										height={250}
									/>

									{s && (
										<div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1 text-xs sm:grid-cols-3">
											<div>
												<span className="text-muted-foreground">Mittel</span>{" "}
												<span className="tabular-nums font-medium">
													{fmtNumber(s.mean)}
												</span>{" "}
												{s.unit}
											</div>
											<div>
												<span className="text-muted-foreground">Min</span>{" "}
												<span className="tabular-nums font-medium">
													{fmtNumber(s.min)}
												</span>{" "}
												{s.unit}
											</div>
											<div>
												<span className="text-muted-foreground">Max</span>{" "}
												<span className="tabular-nums font-medium">
													{fmtNumber(s.max)}
												</span>{" "}
												{s.unit}
											</div>
											<div>
												<span className="text-muted-foreground">StdAbw</span>{" "}
												<span className="tabular-nums font-medium">
													{fmtNumber(s.stddev)}
												</span>
											</div>
											<div>
												<span className="text-muted-foreground">Punkte</span>{" "}
												<span className="tabular-nums font-medium">
													{s.count_valid}/{s.count_total}
												</span>
											</div>
											{s.reduction && (
												<div>
													<span className="text-muted-foreground">
														Reduktion
													</span>{" "}
													<span className="tabular-nums font-medium">
														{s.reduction.returned_points}/
														{s.reduction.original_points}
													</span>{" "}
													({s.reduction.method})
												</div>
											)}
										</div>
									)}
								</AccordionContent>
							</AccordionItem>
						</Accordion>
					);
				}

				// ---------- Fallback ----------
				return (
					<div
						key={`${kind}-unknown-${idx}-${Math.random()}`}
						className="rounded-xl border bg-muted/30 px-3 py-2 text-sm"
					>
						<div className="font-medium">Unbekannter Typ</div>
					</div>
				);
			})}
		</div>
	);
}
