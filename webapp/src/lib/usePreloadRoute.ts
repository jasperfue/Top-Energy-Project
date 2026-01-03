import { useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import type { FileRoutesByTo } from "@/routeTree.gen.ts";

export function usePreloadRoute(
	routePath: keyof FileRoutesByTo,
	search?: Record<string, unknown>,
) {
	const router = useRouter();

	// biome-ignore lint/correctness/useExhaustiveDependencies: JSON.stringify helps
	useEffect(() => {
		void router.preloadRoute({ to: routePath, search: search });
	}, [router, routePath, JSON.stringify(search)]);
}
