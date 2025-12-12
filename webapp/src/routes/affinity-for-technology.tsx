import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { LikertScale } from "@/components/LikertScale";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { airtable } from "@/lib/airtable.ts";
import { useUserSession } from "@/lib/useUserSession.ts";
import { m } from "@/paraglide/messages.js";

export const Route = createFileRoute("/affinity-for-technology")({
	component: AffinityForTechnologyForm,
});

export const likert7Options = [
	{
		value: 1 as const,
		label: m.common_likert7_1(),
	},
	{
		value: 2 as const,
		label: "",
	},
	{
		value: 3 as const,
		label: "",
	},
	{
		value: 4 as const,
		label: m.common_likert7_4(),
	},
	{
		value: 5 as const,
		label: "",
	},
	{
		value: 6 as const,
		label: "",
	},
	{
		value: 7 as const,
		label: m.common_likert7_7(),
	},
];

export const Likert7 = z.union([
	z.literal(1),
	z.literal(2),
	z.literal(3),
	z.literal(4),
	z.literal(5),
	z.literal(6),
	z.literal(7),
]);

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

const submitAffinityForTechnologyForm = createServerFn({ method: "POST" })
	.inputValidator(afftechAnswers)
	.handler(async ({ data }) => {
		const [session, airTableResponse] = await Promise.all([
			useUserSession(),
			airtable.create([
				{
					fields: {
						"Teilnehmer ID": crypto.randomUUID(),
						...data,
					},
				},
			]),
		]);
		await session.update({ recId: airTableResponse[0].id });
	});

export function AffinityForTechnologyForm() {
	const nav = useNavigate();

	const form = useForm<AffTechFormValues>({
		resolver: zodResolver(afftechAnswers),
		defaultValues: {
			afftech_q1: undefined,
			afftech_q2: undefined,
			afftech_q3: undefined,
			afftech_q4: undefined,
			afftech_q5: undefined,
			afftech_q6: undefined,
			afftech_q7: undefined,
			afftech_q8: undefined,
			afftech_q9: undefined,
		},
		mode: "onSubmit",
	});

	const submit = form.handleSubmit(async (values) => {
		await submitAffinityForTechnologyForm({ data: values });
		await nav({ to: "/scenario" });
	});

	return (
		<main className="mx-auto p-6 space-y-6">
			<h2 className="text-2xl font-semibold">{m.afftech_title()}</h2>

			<Card>
				<CardContent className="flex flex-col py-4 gap-4">
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

			<form onSubmit={submit} className="max-w-fit mx-auto">
				<div className="space-y-5 mb-8">
					<LikertScale
						name="afftech_q1"
						control={form.control}
						options={likert7Options}
						rowLabel={m.afftech_q1()}
						required
						showHeader
					/>
					<LikertScale
						name="afftech_q2"
						control={form.control}
						options={likert7Options}
						rowLabel={m.afftech_q2()}
						required
					/>
					<LikertScale
						name="afftech_q3"
						control={form.control}
						options={likert7Options}
						rowLabel={m.afftech_q3()}
						required
					/>
					<LikertScale
						name="afftech_q4"
						control={form.control}
						options={likert7Options}
						rowLabel={m.afftech_q4()}
						required
					/>
					<LikertScale
						name="afftech_q5"
						control={form.control}
						options={likert7Options}
						rowLabel={m.afftech_q5()}
						required
					/>
					<LikertScale
						name="afftech_q6"
						control={form.control}
						options={likert7Options}
						rowLabel={m.afftech_q6()}
						required
					/>
					<LikertScale
						name="afftech_q7"
						control={form.control}
						options={likert7Options}
						rowLabel={m.afftech_q7()}
						required
					/>
					<LikertScale
						name="afftech_q8"
						control={form.control}
						options={likert7Options}
						rowLabel={m.afftech_q8()}
						required
					/>
					<LikertScale
						name="afftech_q9"
						control={form.control}
						options={likert7Options}
						rowLabel={m.afftech_q9()}
						required
					/>
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
