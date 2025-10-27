import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/card.tsx";
import { Label } from "@/components/ui/label.tsx";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group.tsx";
import { useFieldContext } from "@/routes/questionnaire.tsx";

type MCOption = { value: string; text: string };
type MultipleChoiceProps = {
	label: string;
	options: MCOption[];
	required?: boolean;
};
export function MultipleChoiceField({
	label,
	options,
	required = true,
}: MultipleChoiceProps) {
	const field = useFieldContext<string>();

	return (
		<Card className="border-muted">
			<CardHeader className="pb-3">
				<CardTitle className="text-base">{label}</CardTitle>
			</CardHeader>
			<CardContent className="space-y-3">
				<RadioGroup
					value={field.state.value ?? ""}
					onValueChange={(v) => field.handleChange(v)}
					className="space-y-3"
				>
					{options.map((opt) => (
						<div key={opt.value} className="flex items-start gap-3">
							<RadioGroupItem
								id={`${field.name}-${opt.value}`}
								value={opt.value}
							/>
							<Label htmlFor={`${field.name}-${opt.value}`}>{opt.text}</Label>
						</div>
					))}
				</RadioGroup>
				{required && field.state.meta.errors.length ? (
					<p className="text-xs text-destructive">
						{field.state.meta.errors.join(", ")}
					</p>
				) : null}
			</CardContent>
		</Card>
	);
}
