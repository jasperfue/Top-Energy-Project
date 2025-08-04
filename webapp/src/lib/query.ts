import { queryOptions } from "@tanstack/react-query";
import type { QueryKey } from "@tanstack/react-query";
import { fetcher } from "./fetcher";

export function createQueryOptions<T>(
	queryKey: QueryKey,
	path: string,
	init?: RequestInit,
) {
	return queryOptions<T>({
		queryKey,
		queryFn: () => fetcher<T>(path, init),
	});
}
