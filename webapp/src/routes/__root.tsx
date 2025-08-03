import ErrorPage from "@/components/ErrorPage.tsx";
import { useLogoutOnExit } from "@/lib/useLogoutOnExit.ts";
import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { env } from "/env.ts";

async function fetchLogin() {
	return await fetch(`${env.VITE_BACKEND_URL}/login`);
}

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
		queryClient.ensureQueryData({
			queryKey: ["login"] as const,
			queryFn: fetchLogin,
			staleTime: Number.POSITIVE_INFINITY,
		}), // Wenn man die Seite schließt und anschließend wieder öffnet wird login nicht erneut aufgerufen.
	errorComponent: ({ error }) => ErrorPage(error),
});
