/// <reference types="vite/client" />
import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
	createRootRouteWithContext,
	HeadContent,
	Outlet,
	Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import ErrorPage from "@/components/ErrorPage.tsx";
import NotFoundPage from "@/components/NotFoundPage.tsx";
import { seo } from "@/types/utils.ts";
import stylesCss from "../styles.css?url";

export const Route = createRootRouteWithContext<{
	queryClient: QueryClient;
}>()({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			...seo({
				title:
					"TanStack Start | Type-Safe, Client-First, Full-Stack React Framework",
				description: `TanStack Start is a type-safe, client-first, full-stack React framework. `,
			}),
		],
		links: [
			{ rel: "stylesheet", href: stylesCss },
			{ rel: "manifest", href: "/site.webmanifest", color: "#ffffff" },
			{ rel: "icon", href: "/favicon.ico" },
		],
	}),
	errorComponent: ({ error }) => ErrorPage(error),
	notFoundComponent: NotFoundPage,
	component: RootComponent,
});

function RootComponent() {
	return (
		<RootDocument>
			<Outlet />
		</RootDocument>
	);
}

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="de">
			<head>
				<HeadContent />
			</head>
			<body>
				{children}
				<TanStackRouterDevtools position="bottom-right" />
				<ReactQueryDevtools buttonPosition="bottom-left" />
				<Scripts />
			</body>
		</html>
	);
}
