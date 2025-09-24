import { useRouter } from "@tanstack/react-router";
import { ArrowLeft, Home, RefreshCw, SearchX } from "lucide-react";
import { Button } from "./ui/button";
import {
	Card,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "./ui/card";

export default function NotFoundPage() {
	const router = useRouter();
	return (
		<div className="min-h-screen w-screen flex items-center justify-center p-4">
			<Card className="max-w-md w-full shadow-lg rounded-2xl">
				<CardHeader className="flex flex-col items-center space-y-2 text-center">
					<SearchX className="h-12 w-12 text-destructive" />
					<CardTitle>Seite nicht gefunden</CardTitle>
					<CardDescription>
						Die angeforderte Seite existiert nicht oder wurde verschoben.
					</CardDescription>
				</CardHeader>
				<CardFooter className="flex flex-wrap gap-2 justify-center">
					<Button variant="outline" onClick={() => router.invalidate()}>
						<RefreshCw className="mr-2 h-4 w-4" />
						Erneut versuchen
					</Button>

					<Button variant="secondary" onClick={() => router.history.back()}>
						<ArrowLeft className="mr-2 h-4 w-4" />
						Zurück
					</Button>

					<Button onClick={() => router.navigate({ to: "/" })}>
						<Home className="mr-2 h-4 w-4" />
						Startseite
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
}
