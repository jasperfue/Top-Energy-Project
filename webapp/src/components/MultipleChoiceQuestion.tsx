import { TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";
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

export type MultipleChoiceOption = {
	value: string;
	label: string | ReactNode;
};

export type MultipleChoiceQuestionProps<TFieldValues extends FieldValues> = {
	name: FieldPath<TFieldValues>;
	control: Control<TFieldValues>;
	question: string | ReactNode;
	options: MultipleChoiceOption[];
	required?: boolean;
	className?: string;
};

export function MultipleChoiceQuestion<TFieldValues extends FieldValues>({
	name,
	control,
	question,
	options,
	required,
	className,
}: MultipleChoiceQuestionProps<TFieldValues>) {
	return (
		<div
			className={cn(
				"w-full border-b pb-4 border-border/40 last:border-0",
				className,
			)}
		>
			<div className="flex flex-col md:grid md:grid-cols-[minmax(12rem,1.5fr)_minmax(0,1fr)] gap-3 md:gap-4 md:items-start mt-4 md:mt-7">
				<Label
					htmlFor={name}
					className="leading-snug text-base md:text-sm font-medium"
				>
					{question}
					{/*{required ? " *" : ""}*/}
				</Label>

				<Controller
					name={name}
					control={control}
					rules={{ required }}
					render={({ field, fieldState }) => (
						<div className="w-full">
							<RadioGroup
								id={name}
								value={field.value ?? ""}
								onValueChange={field.onChange}
								className="flex flex-col gap-2"
							>
								{options.map((opt) => (
									<div key={opt.value}>
										<Label
											htmlFor={`${name}-${opt.value}`}
											className={cn(
												"flex items-start space-x-3 p-3 rounded-md border border-transparent bg-muted/40 hover:bg-muted/70 cursor-pointer transition-colors active:scale-[0.99]",
												field.value === opt.value &&
													"bg-primary/5 border-primary/20",
												fieldState.error &&
													"border-destructive/50 bg-destructive/5",
											)}
										>
											<RadioGroupItem
												value={opt.value}
												id={`${name}-${opt.value}`}
												className={cn(
													"mt-0.5 shrink-0",
													fieldState.error && "border-destructive",
												)}
											/>
											<span
												className={cn(
													"font-normal leading-snug",
													fieldState.error && "text-destructive",
												)}
											>
												{opt.label}
											</span>
										</Label>
									</div>
								))}
							</RadioGroup>

							{fieldState.error && (
								<div className="mt-2 flex items-center justify-start gap-1 text-xs text-destructive">
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
