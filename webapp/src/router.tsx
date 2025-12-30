import { createRouter } from "@tanstack/react-router";
import Spinner from "@/components/ui/Spinner.tsx";
import { deLocalizeUrl, localizeUrl } from "./paraglide/runtime";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
	return createRouter({
		routeTree,
		rewrite: {
			input: ({ url }) => deLocalizeUrl(url),
			output: ({ url }) => localizeUrl(url),
		},
		defaultPreload: "render",
		scrollRestoration: true,
		defaultStructuralSharing: true,
		defaultPendingComponent: () => (
			<div className="flex items-center justify-center h-screen">
				<Spinner />
			</div>
		),
		defaultPendingMs: 100,
		defaultPendingMinMs: 300,
	});
}
declare module "@tanstack/react-router" {
	interface Register {
		router: ReturnType<typeof getRouter>;
	}
}
