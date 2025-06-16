import { Loader2 } from "lucide-react";
export default function Spinner() {
	return (
		<div className="text-center">
			<div role="status" aria-live="polite">
				<Loader2 className="h-16 w-16 animate-spin text-primary" />
				<span className="sr-only">Loading...</span>
			</div>
		</div>
	);
}
