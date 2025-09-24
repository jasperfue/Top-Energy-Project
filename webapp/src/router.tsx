import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import Spinner from "@/components/ui/Spinner.tsx";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
	const queryClient = new QueryClient();
	const router = createRouter({
		routeTree,
		context: { queryClient },
		defaultPreload: "intent",
		scrollRestoration: true,
		defaultStructuralSharing: true,
		defaultPreloadStaleTime: 0,
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
