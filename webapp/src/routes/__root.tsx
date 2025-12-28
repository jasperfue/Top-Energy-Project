/// <reference types="vite/client" />

import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
	createRootRouteWithContext,
	HeadContent,
	Outlet,
	Scripts,
	useLocation,
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
import * as m from "@/paraglide/messages";
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
			...seo({ title: m.study_title(), description: m.study_description() }),
		],
		links: [
			{ rel: "stylesheet", href: stylesCss },
			{ rel: "manifest", href: "/site.webmanifest", color: "#ffffff" },
			{
				rel: "icon",
				href: "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text x=%2250%22 y=%22.9em%22 font-size=%2290%22 text-anchor=%22middle%22>⚡</text></svg>",
			},
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
	const location = useLocation();

	// Calculate progress based on current route
	const getProgress = (pathname: string) => {
		if (pathname === "/") return 5;
		if (pathname.includes("affinity-for-technology")) return 20;
		if (pathname.includes("scenario")) return 40;
		// Both variants represent the same stage
		if (pathname.includes("dashboard") || pathname.includes("chat")) return 60;
		if (pathname.includes("questionnaire")) return 80;
		if (pathname.includes("thanks")) return 100;
		return 0;
	};

	const progress = getProgress(location.pathname);

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
				{/* Sticky Progress Bar at the top */}
				<div className="fixed top-0 left-0 w-full h-1.5 z-50 bg-muted">
					<div
						className="h-full bg-primary transition-all duration-700 ease-in-out"
						style={{ width: `${progress}%` }}
						role="progressbar"
						aria-valuenow={progress}
						aria-valuemin={0}
						aria-valuemax={100}
					/>
				</div>

				<div className="flex-1 flex min-h-0">
					<div className="container mx-auto px-4 sm:px-6 lg:px-8">
						{children}
					</div>
				</div>
				<div className="fixed bottom-4 right-4 z-50">
					<Select value={getLocale()} onValueChange={setLocale}>
						<SelectTrigger className="bg-background">
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
