import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/card.tsx";
import { Label } from "@/components/ui/label.tsx";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group.tsx";
import { cn } from "@/lib/utils.ts";
import { useFieldContext } from "@/routes/questionnaire.tsx";

type LikertProps = {
	label: string;
	description?: string;
	points?: 5 | 7;
	leftAnchor?: string;
	rightAnchor?: string;
	required?: boolean;
	className?: string;
};
export function LikertField({
	label,
	description,
	points = 5,
	leftAnchor = "Stimme überhaupt nicht zu",
	rightAnchor = "Stimme voll zu",
	required = true,
	className,
}: LikertProps) {
	const field = useFieldContext<string>(); // Wert ist string "1".."7"
	const scale = Array.from({ length: points }, (_, i) => String(i + 1));
	const gridCols = points === 7 ? "grid-cols-7" : "grid-cols-5";

	return (
		<Card className={cn("border-muted", className)}>
			<CardHeader className="pb-3">
				<CardTitle className="text-base">{label}</CardTitle>
				{description ? (
					<p className="text-sm text-muted-foreground">{description}</p>
				) : null}
			</CardHeader>
			<CardContent>
				<div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
					<span>{leftAnchor}</span>
					<span>{rightAnchor}</span>
				</div>
				<RadioGroup
					value={field.state.value ?? ""}
					onValueChange={(v) => field.handleChange(v)}
					className={cn("grid gap-2 sm:max-w-sm", gridCols)}
				>
					{scale.map((val) => (
						<div key={val} className="flex flex-col items-center gap-1">
							<RadioGroupItem id={`${field.name}-${val}`} value={val} />
							<Label
								className="text-[10px] text-muted-foreground"
								htmlFor={`${field.name}-${val}`}
							>
								{val}
							</Label>
						</div>
					))}
				</RadioGroup>
				{required && field.state.meta.errors.length ? (
					<p className="text-xs text-destructive mt-2">
						{field.state.meta.errors.join(", ")}
					</p>
				) : null}
			</CardContent>
		</Card>
	);
}
