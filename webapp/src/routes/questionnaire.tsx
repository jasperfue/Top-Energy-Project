import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { LikertScale } from "@/components/LikertScale";
import { MultipleChoiceQuestion } from "@/components/MultipleChoiceQuestion.tsx";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { usePreloadRoute } from "@/lib/usePreloadRoute.ts";
import { m } from "@/paraglide/messages.js";
import { Likert7, likert7Options } from "@/routes/affinity-for-technology.tsx";

export const Route = createFileRoute("/questionnaire")({
	component: Questionnaire,
});

const trustAnswers = z.object({
	trust_q1: Likert7,
	trust_q2: Likert7,
	trust_q3: Likert7,
});

const understandingAnswers = z.object({
	understanding_q1: Likert7,
	understanding_q2: Likert7,
	understanding_q3: z.enum([
		"understanding_q3_option1",
		"understanding_q3_option2",
		"understanding_q3_option3",
		"understanding_q3_option4",
	]),
	understanding_q4: z.enum([
		"understanding_q4_option1",
		"understanding_q4_option2",
		"understanding_q4_option3",
		"understanding_q4_option4",
	]),
});

const formSchema = z.object({
	...understandingAnswers.shape,
	...trustAnswers.shape,
});

type FormValues = z.infer<typeof formSchema>;

function Questionnaire() {
	const nav = useNavigate();
	usePreloadRoute("/thanks");

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			trust_q1: undefined,
			trust_q2: undefined,
			trust_q3: undefined,
			understanding_q1: undefined,
			understanding_q2: undefined,
			understanding_q3: undefined,
			understanding_q4: undefined,
		},
		mode: "onSubmit",
	});

	const submit = form.handleSubmit(async (values) => {
		console.log("Questionnaire submit", values);
		// TODO: send to airtable with ServerFn
		void nav({ to: "/thanks" });
	});

	return (
		<main className="mx-auto p-6 space-y-6">
			<h2 className="text-2xl font-semibold">{m.questionnaire_title()}</h2>

			<Card>
				<CardContent className="flex flex-col py-4 gap-4">
					<div
						// biome-ignore lint/security/noDangerouslySetInnerHtml: Have to
						dangerouslySetInnerHTML={{
							__html: m.questionnaire_intro(),
						}}
					/>
				</CardContent>
			</Card>

			<Separator />

			<form onSubmit={submit} className="max-w-fit mx-auto space-y-3">
				<Card>
					<CardContent className="space-y-5">
						<LikertScale
							name="trust_q1"
							control={form.control}
							options={likert7Options}
							rowLabel={m.trust_q1()}
							required
							showHeader
						/>
						<LikertScale
							name="trust_q2"
							control={form.control}
							options={likert7Options}
							rowLabel={m.trust_q2()}
							required
						/>
						<LikertScale
							name="trust_q3"
							control={form.control}
							options={likert7Options}
							rowLabel={m.trust_q3()}
							required
						/>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="space-y-5">
						<LikertScale
							name="understanding_q1"
							control={form.control}
							options={likert7Options}
							rowLabel={m.understanding_q1()}
							required
							showHeader
						/>
						<LikertScale
							name="understanding_q2"
							control={form.control}
							options={likert7Options}
							rowLabel={m.understanding_q2()}
							required
						/>
						<MultipleChoiceQuestion
							name="understanding_q3"
							control={form.control}
							question={m.understanding_q3()}
							required
							options={[
								{
									value: "understanding_q3_option1",
									label: m.understanding_q3_option1(),
								},
								{
									value: "understanding_q3_option2",
									label: m.understanding_q3_option2(),
								},
								{
									value: "understanding_q3_option3",
									label: m.understanding_q3_option3(),
								},
								{
									value: "understanding_q3_option4",
									label: m.understanding_q3_option4(),
								},
							]}
						/>
						<MultipleChoiceQuestion
							name="understanding_q4"
							control={form.control}
							question={m.understanding_q4()}
							required
							options={[
								{
									value: "understanding_q4_option1",
									label: m.understanding_q4_option1(),
								},
								{
									value: "understanding_q4_option2",
									label: m.understanding_q4_option2(),
								},
								{
									value: "understanding_q4_option3",
									label: m.understanding_q4_option3(),
								},
								{
									value: "understanding_q4_option4",
									label: m.understanding_q4_option4(),
								},
							]}
						/>
					</CardContent>
				</Card>

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

export default Questionnaire;
