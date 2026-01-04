/// <reference types="vite/client" />

import {
	createRootRoute,
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

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content:
					"width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0",
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
		if (pathname.includes("dashboard") || pathname.includes("chat")) return 60;
		if (pathname.includes("questionnaire")) {
			const currentStep = location.search.step || 1;
			const totalSteps = 5;
			const baseProgress = 60;
			const remainingScope = 35;

			return baseProgress + (currentStep / totalSteps) * remainingScope;
		}
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
            selection:bg-primary/20
       "
				style={{
					paddingTop: "env(safe-area-inset-top)",
					paddingBottom: "env(safe-area-inset-bottom)",
					paddingLeft: "env(safe-area-inset-left)",
					paddingRight: "env(safe-area-inset-right)",
				}}
			>
				{/* Sticky Progress Bar */}
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

				<div className="absolute top-4 right-4 z-40 md:fixed md:bottom-4 md:right-4 md:top-auto">
					<Select value={getLocale()} onValueChange={setLocale}>
						<SelectTrigger className="bg-background/80 backdrop-blur-sm">
							<ReactCountryFlag
								style={{ width: 20, height: 20 }}
								svg
								countryCode={getCountryCode(getLocale())}
							/>
						</SelectTrigger>

						<SelectContent>
							{locales.map((locale) => (
								<SelectItem key={locale} value={locale}>
									<div className="flex items-center gap-2">
										<ReactCountryFlag
											svg
											style={{ width: 16, height: 16 }}
											countryCode={getCountryCode(locale)}
										/>
										<span className="text-xs uppercase text-muted-foreground">
											{locale}
										</span>
									</div>
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="flex-1 flex flex-col min-h-0 relative">
					<div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex-1 flex flex-col">
						{children}
					</div>
				</div>

				<TanStackRouterDevtools position="bottom-left" />
				<Scripts />
			</body>
		</html>
	);
}
