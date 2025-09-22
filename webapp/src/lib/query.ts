import type { QueryKey } from "@tanstack/react-query";
import { queryOptions, type UseQueryOptions } from "@tanstack/react-query";
import { fetcher } from "./fetcher";

export function createQueryOptions<T>(
	queryKey: QueryKey,
	path: string,
	overrides?: Omit<UseQueryOptions<T, Error>, "queryKey" | "queryFn">,
	init?: RequestInit,
) {
	return queryOptions<T>({
		queryKey,
		queryFn: () => fetcher<T>(path, init),
		...overrides,
	});
}
