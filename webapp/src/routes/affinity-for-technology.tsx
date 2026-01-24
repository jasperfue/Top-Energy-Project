import { zodResolver } from "@hookform/resolvers/zod";
import {
	createFileRoute,
	redirect,
	useNavigate,
	useRouter,
} from "@tanstack/react-router";
import { createServerFn, useServerFn } from "@tanstack/react-start";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
	LIKERT_CENTER,
	LIKERT_LEFT,
	LIKERT_RIGHT,
	Likert7,
	LikertScale,
} from "@/components/LikertScale";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { usePreloadRoute } from "@/lib/usePreloadRoute.ts";
import { useUserSession } from "@/lib/useUserSession.ts";
import { m } from "@/paraglide/messages.js";

export const Route = createFileRoute("/affinity-for-technology")({
	component: AffinityForTechnologyForm,
	loader: async () => await getAffTechSessionData(),
	gcTime: 0,
});

const afftechAnswers = z.object({
	afftech_q1: Likert7,
	afftech_q2: Likert7,
	afftech_q3: Likert7,
	afftech_q4: Likert7,
	afftech_q5: Likert7,
	afftech_q6: Likert7,
	afftech_q7: Likert7,
	afftech_q8: Likert7,
	afftech_q9: Likert7,
});

type AffTechFormValues = z.infer<typeof afftechAnswers>;

const getAffTechSessionData = createServerFn({ method: "GET" }).handler(
	async () => {
		const session = await useUserSession();
		return {
			afftech_q1: session.data.afftech_q1,
			afftech_q2: session.data.afftech_q2,
			afftech_q3: session.data.afftech_q3,
			afftech_q4: session.data.afftech_q4,
			afftech_q5: session.data.afftech_q5,
			afftech_q6: session.data.afftech_q6,
			afftech_q7: session.data.afftech_q7,
			afftech_q8: session.data.afftech_q8,
			afftech_q9: session.data.afftech_q9,
		};
	},
);

const submitAffinityForTechnologyForm = createServerFn({ method: "POST" })
	.inputValidator(afftechAnswers)
	.handler(async ({ data }) => {
		const session = await useUserSession();

		if (!session.data["Teilnehmer ID"]) {
			throw redirect({ to: "/" });
		}
		await session.update({
			...data,
		});
	});

export function AffinityForTechnologyForm() {
	const nav = useNavigate();
	const submitAffinityForTechnologyFormServerFn = useServerFn(
		submitAffinityForTechnologyForm,
	);
	usePreloadRoute("/scenario");
	const router = useRouter();

	const sessionData = Route.useLoaderData();

	const form = useForm<AffTechFormValues>({
		resolver: zodResolver(afftechAnswers),
		defaultValues: {
			afftech_q1: sessionData.afftech_q1,
			afftech_q2: sessionData.afftech_q2,
			afftech_q3: sessionData.afftech_q3,
			afftech_q4: sessionData.afftech_q4,
			afftech_q5: sessionData.afftech_q5,
			afftech_q6: sessionData.afftech_q6,
			afftech_q7: sessionData.afftech_q7,
			afftech_q8: sessionData.afftech_q8,
			afftech_q9: sessionData.afftech_q9,
		},
		mode: "onSubmit",
	});

	const submit = form.handleSubmit(async (values) => {
		await submitAffinityForTechnologyFormServerFn({ data: values });
		router.invalidate();
		await nav({ to: "/scenario" });
	});

	return (
		<main className="mx-auto w-full pt-4 md:p-6 max-w-5xl space-y-6 min-h-[80vh] flex flex-col justify-center">
			<h2 className="text-xl md:text-2xl font-semibold">{m.afftech_title()}</h2>

			<Card>
				<CardContent className="flex flex-col py-4 gap-4 text-sm md:text-base">
					<div
						// biome-ignore lint/security/noDangerouslySetInnerHtml: Have to
						dangerouslySetInnerHTML={{
							__html: m.afftech_intro(),
						}}
					/>
					<div
						// biome-ignore lint/security/noDangerouslySetInnerHtml: have to
						dangerouslySetInnerHTML={{
							__html: m.afftech_subtitle(),
						}}
					/>
				</CardContent>
			</Card>

			<Separator />

			<form onSubmit={submit} className="w-full mx-auto">
				<div className="space-y-6 md:space-y-5 mb-8">
					{[
						{ name: "afftech_q1" as const, label: m.afftech_q1() },
						{ name: "afftech_q2" as const, label: m.afftech_q2() },
						{ name: "afftech_q3" as const, label: m.afftech_q3() },
						{ name: "afftech_q4" as const, label: m.afftech_q4() },
						{ name: "afftech_q5" as const, label: m.afftech_q5() },
						{ name: "afftech_q6" as const, label: m.afftech_q6() },
						{ name: "afftech_q7" as const, label: m.afftech_q7() },
						{ name: "afftech_q8" as const, label: m.afftech_q8() },
						{ name: "afftech_q9" as const, label: m.afftech_q9() },
					].map((item) => (
						<LikertScale
							key={item.name}
							name={item.name}
							control={form.control}
							rowLabel={item.label}
							required
							leftLabel={LIKERT_LEFT}
							centerLabel={LIKERT_CENTER}
							rightLabel={LIKERT_RIGHT}
						/>
					))}
				</div>
				<div className="flex justify-end">
					<Button type="submit" disabled={form.formState.isSubmitting}>
						{form.formState.isSubmitting ? (
							<Loader2 className="h-4 w-4 animate-spin" />
						) : (
							m.common_continue()
						)}
					</Button>
				</div>
			</form>
		</main>
	);
}
