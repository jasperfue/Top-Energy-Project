import { useSession } from "@tanstack/react-start/server";

type userSession = {
	recId?: string;
};

export const useUserSession = () =>
	useSession<userSession>({
		name: "app-session",
		// biome-ignore lint/style/noNonNullAssertion: Is set
		password: process.env.SESSION_SECRET!,
		cookie: {
			secure: process.env.NODE_ENV === "production", // HTTPS only in production
			sameSite: "lax", // CSRF protection
			httpOnly: true, // XSS protection
			maxAge: 7 * 24 * 60 * 60, // 7 days
		},
	});
