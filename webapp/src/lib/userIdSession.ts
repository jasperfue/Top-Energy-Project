import { createServerFn } from "@tanstack/react-start";
import { useSession } from "@tanstack/react-start/server";

type userSession = {
	userId?: string;
};

const useUserSession = () =>
	useSession<userSession>({
		name: "app-session",
		// biome-ignore lint/style/noNonNullAssertion: Is set
		password: process.env.SESSION_SECRET!,
		cookie: { secure: true, sameSite: "lax", httpOnly: true },
	});

export const setNewUserId = createServerFn().handler(async () => {
	const session = await useUserSession();
	const newUserId = crypto.randomUUID();
	await session.update({ userId: newUserId });
});

export const getUserId = createServerFn().handler(async () => {
	const session = await useUserSession();
	return session.data.userId;
});
