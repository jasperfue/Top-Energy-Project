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
		<div className={cn("w-full", className)}>
			<div className="grid grid-cols-[minmax(12rem,1fr)_minmax(0,1.5fr)] items-start gap-3">
				<Label htmlFor={name} className="leading-snug pt-2">
					{question}
					{required ? " *" : ""}
				</Label>

				<Controller
					name={name}
					control={control}
					rules={{ required }}
					render={({ field, fieldState }) => (
						<div className="self-start w-full">
							<RadioGroup
								id={name}
								value={field.value ?? ""}
								onValueChange={field.onChange}
								className="flex flex-col gap-2"
							>
								{options.map((opt) => (
									<div key={opt.value} className="flex items-center space-x-2">
										<RadioGroupItem
											value={opt.value}
											id={`${name}-${opt.value}`}
											className={cn(fieldState.error && "border-destructive")}
										/>
										<Label
											htmlFor={`${name}-${opt.value}`}
											className={cn(
												"font-normal",
												fieldState.error && "text-destructive",
											)}
										>
											{opt.label}
										</Label>
									</div>
								))}
							</RadioGroup>

							{fieldState.error && (
								<div className="mt-1 flex items-center justify-start gap-1 text-xs text-destructive">
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
