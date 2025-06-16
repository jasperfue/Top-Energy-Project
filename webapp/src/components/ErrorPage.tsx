import { Button } from "@/components/ui/button.tsx";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card.tsx";
import { useQueryErrorResetBoundary } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { AlertCircle } from "lucide-react";
import { useEffect } from "react";

export default function ErrorPage(error: Error) {
	const router = useRouter();
	const { reset } = useQueryErrorResetBoundary();

	useEffect(() => {
		reset();
	}, [reset]);

	return (
		<div className="h-screen w-screen flex items-center justify-center p-4">
			<Card className="max-w-md w-full shadow-lg rounded-2xl">
				<CardHeader className="flex flex-col items-center space-y-2">
					<AlertCircle className="h-12 w-12 text-destructive" />
					<CardTitle>Etwas ist schiefgelaufen</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-center text-sm text-muted-foreground">
						{error.message}
					</p>
				</CardContent>
				<CardFooter className="flex justify-center">
					<Button variant="outline" onClick={() => void router.invalidate()}>
						Erneut versuchen
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
}
