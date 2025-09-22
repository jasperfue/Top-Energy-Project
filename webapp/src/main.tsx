import { createRouter, RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";

import "./styles.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/ThemeProvider.tsx";
import Spinner from "@/components/ui/Spinner.tsx";
import reportWebVitals from "./reportWebVitals.ts";

const queryClient = new QueryClient();

// Create a new router instance
const router = createRouter({
	routeTree,
	context: { queryClient },
	defaultPreload: "intent",
	scrollRestoration: true,
	defaultStructuralSharing: true,
	defaultPreloadStaleTime: 0,
	defaultPendingComponent: () => (
		<div className="flex items-center justify-center h-screen">
			<Spinner />
		</div>
	),
	defaultPendingMs: 100,
	defaultPendingMinMs: 300,
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

// Render the app
const rootElement = document.getElementById("app");
if (rootElement && !rootElement.innerHTML) {
	const root = ReactDOM.createRoot(rootElement);
	root.render(
		<StrictMode>
			<QueryClientProvider client={queryClient}>
				<ThemeProvider>
					<RouterProvider router={router} />
				</ThemeProvider>
			</QueryClientProvider>
		</StrictMode>,
	);
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
