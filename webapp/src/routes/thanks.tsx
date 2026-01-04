import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Mail } from "lucide-react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { m } from "@/paraglide/messages.js";

export const Route = createFileRoute("/thanks")({
	component: Thanks,
});

function Thanks() {
	return (
		<main className="min-h-[80vh] flex flex-col justify-center  items-center p-4">
			<Card className="max-w-lg w-full text-center shadow-lg border-muted/60">
				<CardHeader className="flex flex-col items-center space-y-6 pt-10">
					<div className="relative">
						<div className="h-24 w-24 rounded-full bg-green-100 flex items-center justify-center animate-in zoom-in duration-300">
							<CheckCircle2
								className="h-12 w-12 text-green-600"
								aria-hidden="true"
							/>
						</div>
					</div>

					<div className="space-y-2">
						<CardTitle className="text-3xl font-bold tracking-tight">
							{m.thanks_title()}
						</CardTitle>
						<CardDescription className="text-base text-muted-foreground/80 max-w-sm mx-auto">
							{m.thanks_subtitle()}
						</CardDescription>
					</div>
				</CardHeader>

				<CardContent className="space-y-8 pb-10">
					<div className="p-4 bg-muted/30 rounded-lg text-sm text-muted-foreground">
						{m.thanks_close_hint()}
					</div>

					<Separator />

					<div className="space-y-3">
						<p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
							{m.thanks_contact_header()}
						</p>
						<div className="flex flex-col items-center gap-1 text-sm">
							<span className="font-medium text-foreground">Jasper Fülle</span>
							<span className="text-muted-foreground">
								University of Cologne
							</span>
							<a
								href="mailto:jfuelle@students.uni-koeln.de"
								className="flex items-center gap-2 text-blue-600 hover:underline mt-1 transition-colors"
							>
								<Mail className="h-3.5 w-3.5" />
								jfuelle@students.uni-koeln.de
							</a>
						</div>
					</div>
				</CardContent>
			</Card>
		</main>
	);
}
