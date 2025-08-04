import { useEffect } from "react";
import { env } from "/env.ts";

export function useLogoutOnExit() {
	useEffect(() => {
		const logoutUrl = `${env.VITE_BACKEND_URL}/auth/logout`;

		const sendLogout = () => {
			// Preferred: sendBeacon (fire-and-forget, works when closing tab)
			if (navigator.sendBeacon) {
				const blob = new Blob([], { type: "application/json" });
				navigator.sendBeacon(logoutUrl, blob);
			} else {
				// Fallback: fetch with keepalive (only in modern browsers)
				void fetch(logoutUrl, {
					method: "POST",
					keepalive: true,
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ reason: "unload" }),
				});
			}
		};

		const beforeUnloadHandler = () => {
			sendLogout();
		};

		window.addEventListener("beforeunload", beforeUnloadHandler);

		return () => {
			window.removeEventListener("beforeunload", beforeUnloadHandler);
		};
	}, []);
}
