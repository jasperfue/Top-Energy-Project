import { Label } from "@/components/ui/label.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import { useFieldContext } from "@/routes/questionnaire.tsx";

type TextAreaProps = {
	label: string;
	placeholder?: string;
	required?: boolean;
};
export function TextAreaField({
	label,
	placeholder,
	required = false,
}: TextAreaProps) {
	const field = useFieldContext<string>();
	return (
		<div className="space-y-2">
			<Label htmlFor={field.name}>{label}</Label>
			<Textarea
				id={field.name}
				placeholder={placeholder}
				value={field.state.value ?? ""}
				onBlur={field.handleBlur}
				onChange={(e) => field.handleChange(e.target.value)}
			/>
			{required && field.state.meta.errors.length ? (
				<p className="text-xs text-destructive">
					{field.state.meta.errors.join(", ")}
				</p>
			) : null}
		</div>
	);
}
