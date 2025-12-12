import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import Spinner from "@/components/ui/Spinner.tsx";
import { deLocalizeUrl, localizeUrl } from "./paraglide/runtime";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
	const queryClient = new QueryClient();
	const router = createRouter({
		routeTree,
		rewrite: {
			input: ({ url }) => deLocalizeUrl(url),
			output: ({ url }) => localizeUrl(url),
		},
		context: { queryClient },
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
	setupRouterSsrQueryIntegration({
		router,
		queryClient,
	});

	return router;
}
declare module "@tanstack/react-router" {
	interface Register {
		router: ReturnType<typeof getRouter>;
	}
}
