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

type LikertOption = {
	value: number;
	label: string;
};

export type LikertScaleProps<TFieldValues extends FieldValues> = {
	name: FieldPath<TFieldValues>;
	control: Control<TFieldValues>;
	options: LikertOption[];
	rowLabel?: string;
	required?: boolean;
	className?: string;
	showHeader?: boolean;
};

export function LikertScale<TFieldValues extends FieldValues>({
	name,
	control,
	options,
	rowLabel,
	required,
	className,
	showHeader = false,
}: LikertScaleProps<TFieldValues>) {
	return (
		<div className={cn("w-full", className)}>
			<div className="flex flex-col gap-3 md:grid md:grid-cols-[minmax(12rem,1fr)_auto] md:items-end">
				{rowLabel && (
					<Label
						htmlFor={name}
						className="leading-snug md:self-end md:text-right font-medium"
					>
						{rowLabel}
					</Label>
				)}

				<Controller
					name={name}
					control={control}
					rules={{ required }}
					render={({ field, fieldState }) => (
						<div className="w-full md:w-auto self-center">
							<RadioGroup
								id={name}
								className="grid w-full"
								style={{
									gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))`,
								}}
								value={field.value?.toString() ?? ""}
								onValueChange={(v) => field.onChange(Number(v))}
							>
								{options.map((opt) => (
									<div
										key={opt.value}
										className="flex flex-col items-center justify-end w-full"
									>
										<Label
											htmlFor={`${name}-${opt.value}`}
											className={cn(
												"text-center mb-2 text-[10px] sm:text-xs leading-tight break-words hyphens-auto",
												fieldState.error && "text-destructive",
												!opt.label && "hidden",
												showHeader ? "block" : "block md:hidden",
											)}
										>
											{opt.label}
										</Label>

										<RadioGroupItem
											className={cn(
												"h-4 w-4 sm:h-5 sm:w-5 transition-all",
												fieldState.error && "border-destructive",
											)}
											value={String(opt.value)}
											id={`${name}-${opt.value}`}
										/>
									</div>
								))}
							</RadioGroup>
							{fieldState.error && (
								<div className="mt-2 flex items-center md:justify-center gap-1 text-xs text-destructive">
									<TriangleAlert className="h-3 w-3" aria-hidden="true" />
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
