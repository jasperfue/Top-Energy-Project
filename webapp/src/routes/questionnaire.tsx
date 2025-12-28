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

const ueqAnswers = z.object({
	ueq_1: Likert7,
	ueq_2: Likert7,
	ueq_3: Likert7,
	ueq_4: Likert7,
	ueq_5: Likert7,
	ueq_6: Likert7,
	ueq_7: Likert7,
	ueq_8: Likert7,
});

const intentionAnswers = z.object({
	intention_q1: Likert7,
	intention_q2: Likert7,
	intention_q3: Likert7,
});

const formSchema = z.object({
	...understandingAnswers.shape,
	...trustAnswers.shape,
	...ueqAnswers.shape,
	...intentionAnswers.shape,
});

type FormValues = z.infer<typeof formSchema>;

function getUeqOptions(minLabel: string, maxLabel: string) {
	return [
		{ value: 1, label: minLabel },
		{ value: 2, label: "" },
		{ value: 3, label: "" },
		{ value: 4, label: "" },
		{ value: 5, label: "" },
		{ value: 6, label: "" },
		{ value: 7, label: maxLabel },
	];
}

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
			ueq_1: undefined,
			ueq_2: undefined,
			ueq_3: undefined,
			ueq_4: undefined,
			ueq_5: undefined,
			ueq_6: undefined,
			ueq_7: undefined,
			ueq_8: undefined,
			intention_q1: undefined,
			intention_q2: undefined,
			intention_q3: undefined,
		},
		mode: "onSubmit",
	});

	const submit = form.handleSubmit(async (values) => {
		console.log("Questionnaire submit", values);
		// TODO: send to airtable with ServerFn
		void nav({ to: "/thanks" });
	});

	const ueqItems = [
		{ name: "ueq_1", min: m.ueq_1_min(), max: m.ueq_1_max(), isSwapped: false },
		{ name: "ueq_2", min: m.ueq_2_max(), max: m.ueq_2_min(), isSwapped: true },
		{ name: "ueq_3", min: m.ueq_3_min(), max: m.ueq_3_max(), isSwapped: false },
		{ name: "ueq_4", min: m.ueq_4_max(), max: m.ueq_4_min(), isSwapped: true },
		{ name: "ueq_5", min: m.ueq_5_min(), max: m.ueq_5_max(), isSwapped: false },
		{ name: "ueq_6", min: m.ueq_6_max(), max: m.ueq_6_min(), isSwapped: true },
		{ name: "ueq_7", min: m.ueq_7_min(), max: m.ueq_7_max(), isSwapped: false },
		{ name: "ueq_8", min: m.ueq_8_max(), max: m.ueq_8_min(), isSwapped: true },
	] as const;

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
					<CardContent className="space-y-2">
						<div className="mb-6 p-4 bg-muted/50 rounded-lg text-sm">
							{m.ueq_instruction()}
						</div>

						<div className="max-w-xl mx-auto space-y-7">
							{ueqItems.map((item) => (
								<LikertScale
									key={item.name}
									name={item.name}
									control={form.control}
									options={getUeqOptions(item.min, item.max)}
									required
									showHeader
								/>
							))}
						</div>
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
				<Card>
					<CardContent className="space-y-5">
						<LikertScale
							name="intention_q1"
							control={form.control}
							options={likert7Options}
							rowLabel={m.intention_q1()}
							required
							showHeader
						/>
						<LikertScale
							name="intention_q2"
							control={form.control}
							options={likert7Options}
							rowLabel={m.intention_q2()}
							required
						/>
						<LikertScale
							name="intention_q3"
							control={form.control}
							options={likert7Options}
							rowLabel={m.intention_q3()}
							required
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
