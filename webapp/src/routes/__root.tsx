import ErrorPage from "@/components/ErrorPage.tsx";
import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

export const Route = createRootRouteWithContext<{
	queryClient: QueryClient;
}>()({
	component: () => (
		<>
			<Outlet />
			<TanStackRouterDevtools position="bottom-right" />
			<ReactQueryDevtools buttonPosition="top-right" />
		</>
	),
	errorComponent: ({ error }) => ErrorPage(error),
});
