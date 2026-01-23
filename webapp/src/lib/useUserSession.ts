import { createServerOnlyFn } from "@tanstack/react-start";
import { useSession } from "@tanstack/react-start/server";
import type { Likert7 } from "@/routes/affinity-for-technology.tsx";

type userSession = {
	"Teilnehmer ID"?: string;
	Zielgruppe?: boolean;
	afftech_q1?: Likert7;
	afftech_q2?: Likert7;
	afftech_q3?: Likert7;
	afftech_q4?: Likert7;
	afftech_q5?: Likert7;
	afftech_q6?: Likert7;
	afftech_q7?: Likert7;
	afftech_q8?: Likert7;
	afftech_q9?: Likert7;
	Studienvariante?: "Chat" | "Dashboard";
	Startzeit?: string;
	Endzeit?: string;
	Nachrichten_Anzahl?: number;
	trust_comp_1?: Likert7;
	trust_comp_2?: Likert7;
	trust_comp_3?: Likert7;
	trust_comp_4?: Likert7;
	trust_ben_1?: Likert7;
	trust_ben_2?: Likert7;
	trust_ben_3?: Likert7;
	trust_int_1?: Likert7;
	trust_int_2?: Likert7;
	trust_int_3?: Likert7;
	trust_int_4?: Likert7;
	understanding_q1?: Likert7;
	understanding_q2?: Likert7;
	understanding_q3?: string;
	understanding_q4?: string;
	ueq_1?: Likert7;
	ueq_2_swapped?: Likert7;
	ueq_3?: Likert7;
	ueq_4_swapped?: Likert7;
	ueq_5?: Likert7;
	ueq_6_swapped?: Likert7;
	ueq_7?: Likert7;
	ueq_8_swapped?: Likert7;
	intention_q1?: Likert7;
	intention_q2?: Likert7;
	intention_q3?: Likert7;
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
