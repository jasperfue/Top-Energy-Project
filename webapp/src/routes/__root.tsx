import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { env } from "/env.ts";

async function fetchLogin() {
	const res = await fetch(`${env.VITE_BACKEND_URL}/login`);
	if (!res.ok) {
		throw new Response(null, {
			status: 302,
			headers: { Location: "/login" },
		});
	}
	return res.json();
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
});
