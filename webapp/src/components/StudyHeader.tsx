import { ArrowRight, Loader2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { m } from "@/paraglide/messages.js";

interface StudyHeaderProps {
	onFinish: () => void;
	isLoading?: boolean;
}

export function StudyHeader({
	onFinish,
	isLoading,
}: Readonly<StudyHeaderProps>) {
	return (
		<div className="sticky top-0 z-20 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
			<div className="container mx-auto px-4 flex items-center justify-between py-2 md:py-3">
				<div className="flex items-center gap-2">
					<div className="bg-primary/10 p-1.5 md:p-2 rounded-md">
						<Zap className="h-4 w-4 md:h-5 md:w-5 text-primary" />
					</div>
					<div>
						<h2 className="text-base md:text-xl font-semibold leading-none">
							{m.common_energy_audit()}
						</h2>
					</div>
				</div>

				<Button
					onClick={onFinish}
					disabled={isLoading}
					size="sm"
					className="h-9"
				>
					{isLoading ? (
						<Loader2 className="h-4 w-4 animate-spin" />
					) : (
						<span className="flex items-center gap-2">
							<span className="md:hidden">{m.common_continue()}</span>
							<span className="hidden md:inline">
								{m.common_continue_to_questionnaire()}
							</span>
							<ArrowRight className="h-4 w-4" />
						</span>
					)}
				</Button>
			</div>
		</div>
	);
}
