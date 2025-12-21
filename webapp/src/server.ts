import handler from "@tanstack/react-start/server-entry";
import { paraglideMiddleware } from "./paraglide/server.js";

export default {
	fetch(req: Request): Promise<Response> {
		return paraglideMiddleware(req, () => {
			// ⚠️ CRITICAL: Use the original 'req', NOT the 'paraglideRequest'.
			//
			// The middleware proactively strips the locale from the URL (e.g., /en/chat -> /chat).
			// Since our TanStack Router handles localization via its own 'rewrite' config,
			// passing the already modified URL would cause conflicts and 307 redirect loops.
			//
			// We only use this middleware to set the AsyncLocalStorage context.
			return handler.fetch(req);
		});
	},
};
