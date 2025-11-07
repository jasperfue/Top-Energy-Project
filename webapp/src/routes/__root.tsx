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
import ReactCountryFlag from "react-country-flag";
import ErrorPage from "@/components/ErrorPage.tsx";
import NotFoundPage from "@/components/NotFoundPage.tsx";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
} from "@/components/ui/select.tsx";
import { getLocale, locales, setLocale } from "@/paraglide/runtime";
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

const getCountryCode = (locale: string) =>
	locale === "en" ? "GB" : locale.toUpperCase();

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang={getLocale()} className="h-full">
			<head>
				<HeadContent />
			</head>
			<body
				className="
          min-h-dvh
          flex flex-col
          bg-background text-foreground antialiased
        "
				style={{
					paddingTop: "env(safe-area-inset-top)",
					paddingBottom: "env(safe-area-inset-bottom)",
				}}
			>
				<div className="flex-1 flex min-h-0">
					<div className="container mx-auto px-4 sm:px-6 lg:px-8">
						{children}
					</div>
				</div>
				<div className="fixed bottom-4 right-4 z-50">
					<Select value={getLocale()} onValueChange={setLocale}>
						<SelectTrigger>
							<ReactCountryFlag
								style={{ width: 20, height: 20 }}
								svg
								countryCode={getCountryCode(getLocale())}
							/>
						</SelectTrigger>

						<SelectContent>
							{locales.map((locale) => (
								<SelectItem key={locale} value={locale}>
									<ReactCountryFlag
										svg
										style={{ width: 20, height: 20 }}
										countryCode={getCountryCode(locale)}
									/>
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				<TanStackRouterDevtools position="top-right" />
				<ReactQueryDevtools buttonPosition="bottom-left" />
				<Scripts />
			</body>
		</html>
	);
}
