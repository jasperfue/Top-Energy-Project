import { TriangleAlert } from "lucide-react";
import {
	type Control,
	Controller,
	type FieldPath,
	type FieldValues,
} from "react-hook-form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { m } from "@/paraglide/messages.js";

type SemanticDifferentialProps<TFieldValues extends FieldValues> = {
	name: FieldPath<TFieldValues>;
	control: Control<TFieldValues>;
	minLabel: string;
	maxLabel: string;
	required?: boolean;
	className?: string;
};

export function SemanticDifferential<TFieldValues extends FieldValues>({
	name,
	control,
	minLabel,
	maxLabel,
	required = true,
	className,
}: SemanticDifferentialProps<TFieldValues>) {
	const values = [1, 2, 3, 4, 5, 6, 7];

	return (
		<div
			className={cn(
				"w-full py-4 border-b border-border/40 last:border-0",
				className,
			)}
		>
			<Controller
				name={name}
				control={control}
				rules={{ required }}
				render={({ field, fieldState }) => (
					<div className="w-full">
						<div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
							<div className="flex justify-between md:hidden w-full mb-1">
								<span
									className={cn(
										"text-sm font-medium w-1/2 text-left pr-2 leading-tight",
										fieldState.error && "text-destructive",
									)}
								>
									{minLabel}
								</span>
								<span
									className={cn(
										"text-sm font-medium w-1/2 text-right pl-2 leading-tight",
										fieldState.error && "text-destructive",
									)}
								>
									{maxLabel}
								</span>
							</div>

							<span
								className={cn(
									"hidden md:block w-1/4 text-right text-sm font-medium leading-tight",
									fieldState.error && "text-destructive",
								)}
							>
								{minLabel}
							</span>

							<RadioGroup
								onValueChange={(v) => field.onChange(Number(v))}
								value={field.value?.toString()}
								className="flex-1 grid grid-cols-7 gap-0"
							>
								{values.map((val) => (
									<div
										key={val}
										className="flex items-center justify-center w-full"
									>
										<RadioGroupItem
											value={val.toString()}
											id={`${name}-${val}`}
											className={cn(
												"h-5 w-5 md:h-6 md:w-6 border-muted-foreground/40 text-primary data-[state=checked]:border-primary transition-all",
												fieldState.error && "border-destructive",
											)}
										/>
									</div>
								))}
							</RadioGroup>

							<span
								className={cn(
									"hidden md:block w-1/4 text-left text-sm font-medium leading-tight",
									fieldState.error && "text-destructive",
								)}
							>
								{maxLabel}
							</span>
						</div>

						{fieldState.error && (
							<div className="mt-2 flex items-center justify-center gap-1.5 text-xs text-destructive font-medium animate-in fade-in-0 slide-in-from-top-1">
								<TriangleAlert className="h-3.5 w-3.5" />
								<span>{m.common_required_error()}</span>
							</div>
						)}
					</div>
				)}
			/>
		</div>
	);
}
