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
		<div
			className={cn(
				"w-full border-b pb-4 border-border/40 last:border-0",
				className,
			)}
		>
			<div className="flex flex-col gap-3 md:grid md:grid-cols-[1fr_auto] md:items-end md:gap-4">
				{rowLabel && (
					<Label
						htmlFor={name}
						className="leading-snug font-medium pb-2 md:pb-0"
					>
						{rowLabel}
					</Label>
				)}

				<Controller
					name={name}
					control={control}
					rules={{ required }}
					render={({ field, fieldState }) => (
						<div className="w-full md:w-[26rem] self-center">
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
												"text-center mb-2 text-[10px] sm:text-xs leading-tight break-words hyphens-auto w-full px-0.5",
												fieldState.error && "text-destructive",
												!opt.label && "invisible",
												showHeader ? "block" : "block md:hidden",
											)}
										>
											{opt.label}
										</Label>

										<RadioGroupItem
											className={cn(
												"h-5 w-5 md:h-6 md:w-6 border-muted-foreground/40 text-primary data-[state=checked]:border-primary transition-all",
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
