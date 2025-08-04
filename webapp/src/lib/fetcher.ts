import { env } from "/env.ts";

export class FetchError extends Error {
	constructor(
		public readonly status: number,
		public readonly data: unknown,
	) {
		super(`Request failed with status ${status}`);
	}
}

export async function fetcher<T = unknown>(
	path: string,
	init?: RequestInit,
): Promise<T> {
	const url = `${env.VITE_BACKEND_URL}${path}`;
	const res = await fetch(url, init);

	if (res.status === 204) {
		return true as unknown as T;
	}

	const contentType = res.headers.get("content-type") ?? "";

	let parsed: unknown;

	if (contentType.includes("application/json")) {
		const text = await res.text();
		if (text.trim() === "") {
			parsed = undefined;
		} else {
			try {
				parsed = JSON.parse(text);
			} catch (e) {
				parsed = text;
			}
		}
	} else {
		parsed = await res.text();
	}

	if (!res.ok) {
		throw new FetchError(res.status, parsed);
	}

	return parsed as T;
}
