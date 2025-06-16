import ErrorPage from "@/components/ErrorPage.tsx";
import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { env } from "/env.ts";

async function fetchLogin() {
	await fetch(`${env.VITE_BACKEND_URL}/login`);
	return;
}

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
	loader: ({ context: { queryClient } }) =>
		queryClient.ensureQueryData({
			queryKey: ["login"] as const,
			queryFn: fetchLogin,
			staleTime: Number.POSITIVE_INFINITY,
		}),
	errorComponent: ({ error }) => ErrorPage(error),
});
