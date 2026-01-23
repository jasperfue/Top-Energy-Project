import { createServerOnlyFn } from "@tanstack/react-start";
import { useSession } from "@tanstack/react-start/server";

type userSession = {
	"Teilnehmer ID"?: string;
	Zielgruppe?: boolean;
	afftech_q1?: number;
	afftech_q2?: number;
	afftech_q3?: number;
	afftech_q4?: number;
	afftech_q5?: number;
	afftech_q6?: number;
	afftech_q7?: number;
	afftech_q8?: number;
	afftech_q9?: number;
	Studienvariante?: "Chat" | "Dashboard";
	Startzeit?: string;
	Endzeit?: string;
	Nachrichten_Anzahl?: number;
	trust_comp_1?: number;
	trust_comp_2?: number;
	trust_comp_3?: number;
	trust_comp_4?: number;
	trust_ben_1?: number;
	trust_ben_2?: number;
	trust_ben_3?: number;
	trust_int_1?: number;
	trust_int_2?: number;
	trust_int_3?: number;
	trust_int_4?: number;
	understanding_q1?: number;
	understanding_q2?: number;
	understanding_q3?: string;
	understanding_q4?: string;
	ueq_1?: number;
	ueq_2_swapped?: number;
	ueq_3?: number;
	ueq_4_swapped?: number;
	ueq_5?: number;
	ueq_6_swapped?: number;
	ueq_7?: number;
	ueq_8_swapped?: number;
	intention_q1?: number;
	intention_q2?: number;
	intention_q3?: number;
	age?: number;
	gender?: string;
	occupation_role?: string;
	domain_background?: string;
	investment_experience?: string;
	feedback?: string;
	email?: string;
};

export const useUserSession = createServerOnlyFn(() =>
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
	}),
);
