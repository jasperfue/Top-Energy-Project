import { type UseQueryOptions, useQuery } from "@tanstack/react-query";
import { fetcher } from "../lib/fetcher";

export function useFetchQuery<T>(
	queryKey: readonly [...unknown[]],
	path: string,
	init?: RequestInit,
	options?: Omit<UseQueryOptions<T, Error>, "queryKey" | "queryFn">,
) {
	return useQuery<T, Error>({
		queryKey,
		queryFn: () => fetcher<T>(path, init),
		...options,
	});
}
