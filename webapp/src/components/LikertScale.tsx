import { TriangleAlert } from "lucide-react";
import {
	type Control,
	Controller,
	type FieldPath,
	type FieldValues,
} from "react-hook-form";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { m } from "@/paraglide/messages.js";

export type LikertScaleProps<TFieldValues extends FieldValues> = {
	name: FieldPath<TFieldValues>;
	control: Control<TFieldValues>;
	rowLabel?: string;
	leftLabel?: string;
	centerLabel?: string;
	rightLabel?: string;
	hideLabelsOnDesktop?: boolean;
	required?: boolean;
	className?: string;
};

export function LikertScale<TFieldValues extends FieldValues>({
	name,
	control,
	rowLabel,
	leftLabel,
	centerLabel,
	rightLabel,
	hideLabelsOnDesktop = false,
	required = true,
	className,
}: LikertScaleProps<TFieldValues>) {
	const values = [1, 2, 3, 4, 5, 6, 7];

	const hasLabels = leftLabel || centerLabel || rightLabel;

	return (
		<div
			className={cn(
				"w-full border-b pb-4 border-border/40 last:border-0",
				className,
			)}
		>
			<div className="flex flex-col gap-3 md:grid md:grid-cols-[1fr_28rem] md:gap-8 md:items-center">
				{rowLabel && (
					<Label htmlFor={name} className="text-base font-medium leading-snug">
						{rowLabel}
					</Label>
				)}

				<Controller
					name={name}
					control={control}
					rules={{ required }}
					render={({ field, fieldState }) => (
						<div className="w-full">
							{hasLabels && (
								<div
									className={cn(
										"grid grid-cols-7 mb-2 px-1",
										hideLabelsOnDesktop && "md:hidden",
									)}
								>
									<div
										className={cn(
											"col-start-1 col-span-1 flex justify-center items-end",
											fieldState.error && "text-destructive",
										)}
									>
										<span className="text-xs md:text-sm leading-none font-medium text-muted-foreground w-max text-center ">
											{leftLabel}
										</span>
									</div>

									{/* MITTE: Bleibt über Spalte 3,4,5 (Zentriert über 4) */}
									<div
										className={cn(
											"col-start-3 col-span-3 flex justify-center items-end",
											fieldState.error && "text-destructive",
										)}
									>
										<span className="text-xs md:text-sm leading-none font-medium text-muted-foreground text-center">
											{centerLabel}
										</span>
									</div>

									<div
										className={cn(
											"col-start-7 col-span-1 flex justify-center items-end",
											fieldState.error && "text-destructive",
										)}
									>
										<span className="text-xs md:text-sm leading-none font-medium text-muted-foreground w-max text-center">
											{rightLabel}
										</span>
									</div>
								</div>
							)}

							<RadioGroup
								id={name}
								className="grid grid-cols-7 gap-0 w-full"
								value={field.value?.toString() ?? ""}
								onValueChange={(v) => field.onChange(Number(v))}
							>
								{values.map((val) => (
									<div
										key={val}
										className="flex items-center justify-center relative group"
									>
										<RadioGroupItem
											value={String(val)}
											id={`${name}-${val}`}
											className={cn(
												"h-6 w-6 md:h-7 md:w-7 border-muted-foreground/30 text-primary data-[state=checked]:border-primary data-[state=checked]:bg-primary/10 transition-all z-10",
												fieldState.error && "border-destructive",
											)}
										/>
										<Label
											htmlFor={`${name}-${val}`}
											className="absolute inset-0 cursor-pointer"
										>
											<span className="sr-only">{val}</span>
										</Label>
									</div>
								))}
							</RadioGroup>
							{fieldState.error && (
								<div className="mt-3 flex items-center justify-center gap-2 text-xs text-destructive font-medium animate-in fade-in-0 slide-in-from-top-1">
									<TriangleAlert className="h-4 w-4" />
									<span>{m.common_required_error()}</span>
								</div>
							)}
						</div>
					)}
				/>
			</div>
		</div>
	);
}
