import {
	createFileRoute,
	Link,
	Outlet,
	useLocation,
} from "@tanstack/react-router";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { cn } from "@/lib/utils.ts";
import { m } from "@/paraglide/messages.js";

export const Route = createFileRoute("/_pathlessLayout")({
	component: RouteComponent,
});

function RouteComponent() {
	const pathname = useLocation({ select: (s) => s.pathname });
	const isAppMode = pathname.startsWith("/chat");
	return (
		<div
			className={cn(
				"flex flex-col bg-background",
				isAppMode ? "h-dvh overflow-hidden" : "min-h-dvh",
			)}
		>
			<div className="sticky top-0 z-20 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
				<div className="container mx-auto px-4 flex items-center justify-between py-3">
					<div className="flex items-center gap-2">
						<div className="bg-primary/10 p-2 rounded-md">
							<Zap className="h-5 w-5 text-primary" />
						</div>
						<div>
							<h2 className="text-xl font-semibold leading-none">
								{m.common_energy_audit()}
							</h2>
						</div>
					</div>
					<Button asChild variant="default">
						<Link to="/questionnaire">
							{m.common_continue_to_questionnaire()}
						</Link>
					</Button>
				</div>
			</div>
			<div className={cn(isAppMode ? "flex-1 min-h-0 relative" : "flex-1")}>
				<Outlet />
			</div>
		</div>
	);
}
