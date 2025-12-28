import { useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import type { FileRoutesByTo } from "@/routeTree.gen.ts";

export function usePreloadRoute(routePath: keyof FileRoutesByTo) {
	const router = useRouter();

	useEffect(() => {
		void router.preloadRoute({ to: routePath });
	}, [router, routePath]);
}
