import ErrorPage from "@/components/ErrorPage.tsx";
import { createQueryOptions } from "@/lib/query.ts";
import { useLogoutOnExit } from "@/lib/useLogoutOnExit.ts";
import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

export const Route = createRootRouteWithContext<{
	queryClient: QueryClient;
}>()({
	component: () => {
		useLogoutOnExit();

		return (
			<>
				<Outlet />
				<TanStackRouterDevtools position="bottom-right" />
				<ReactQueryDevtools buttonPosition="top-right" />
			</>
		);
	},
	loader: ({ context: { queryClient } }) =>
		queryClient.ensureQueryData(createQueryOptions(["login"], "/auth/login")),
	errorComponent: ({ error }) => ErrorPage(error),
});
