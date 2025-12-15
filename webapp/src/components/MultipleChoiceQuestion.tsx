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
			<div className="mt-7 grid grid-cols-1 items-start gap-4 md:grid-cols-[minmax(12rem,1.5fr)_minmax(0,1fr)]">
				<Label htmlFor={name} className="leading-snug">
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
								className="flex flex-col gap-3"
							>
								{options.map((opt) => (
									<div key={opt.value} className="flex items-start space-x-3">
										<RadioGroupItem
											value={opt.value}
											id={`${name}-${opt.value}`}
											className={cn(
												"mt-1",
												fieldState.error && "border-destructive",
											)}
										/>
										<Label
											htmlFor={`${name}-${opt.value}`}
											className={cn(
												"font-normal leading-snug cursor-pointer", // cursor-pointer für bessere UX
												fieldState.error && "text-destructive",
											)}
										>
											{opt.label}
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
