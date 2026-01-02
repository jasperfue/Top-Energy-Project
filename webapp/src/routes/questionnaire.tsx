import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { LikertScale } from "@/components/LikertScale";
import { MultipleChoiceQuestion } from "@/components/MultipleChoiceQuestion.tsx";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label.tsx";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea.tsx";
import { airtable } from "@/lib/airtable.ts";
import { usePreloadRoute } from "@/lib/usePreloadRoute.ts";
import { useUserSession } from "@/lib/useUserSession.ts";
import { m } from "@/paraglide/messages.js";
import { Likert7, likert7Options } from "@/routes/affinity-for-technology.tsx";

export const Route = createFileRoute("/questionnaire")({
	component: Questionnaire,
});

const trustAnswers = z.object({
	trust_comp_1: Likert7,
	trust_ben_1: Likert7,
	trust_comp_2: Likert7,
	trust_ben_2: Likert7,
	trust_comp_3: Likert7,
	trust_ben_3: Likert7,
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
	ueq_2_swapped: Likert7,
	ueq_3: Likert7,
	ueq_4_swapped: Likert7,
	ueq_5: Likert7,
	ueq_6_swapped: Likert7,
	ueq_7: Likert7,
	ueq_8_swapped: Likert7,
});

const intentionAnswers = z.object({
	intention_q1: Likert7,
	intention_q2: Likert7,
	intention_q3: Likert7,
});

const feedbackAnswer = z.object({
	feedback: z.string().optional(),
});

const formSchema = z.object({
	...understandingAnswers.shape,
	...trustAnswers.shape,
	...ueqAnswers.shape,
	...intentionAnswers.shape,
	...feedbackAnswer.shape,
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

const submitQuestionnaire = createServerFn({ method: "POST" })
	.inputValidator(formSchema)
	.handler(async ({ data }) => {
		const session = await useUserSession();

		if (!session.data.recId) {
			throw new Error("No record ID found in session");
		}

		await airtable
			.update([
				{
					id: session.data.recId,
					fields: {
						...data,
					},
				},
			])
			.catch((err) => {
				console.error("Airtable Error:", err);
				throw new Error("Failed to save data", err);
			});
		await session.clear();
	});

function Questionnaire() {
	const nav = useNavigate();
	usePreloadRoute("/thanks");

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			trust_comp_1: undefined,
			trust_ben_1: undefined,
			trust_comp_2: undefined,
			trust_ben_2: undefined,
			trust_comp_3: undefined,
			trust_ben_3: undefined,

			understanding_q1: undefined,
			understanding_q2: undefined,
			understanding_q3: undefined,
			understanding_q4: undefined,
			ueq_1: undefined,
			ueq_2_swapped: undefined,
			ueq_3: undefined,
			ueq_4_swapped: undefined,
			ueq_5: undefined,
			ueq_6_swapped: undefined,
			ueq_7: undefined,
			ueq_8_swapped: undefined,
			intention_q1: undefined,
			intention_q2: undefined,
			intention_q3: undefined,
			feedback: "",
		},
		mode: "onSubmit",
	});

	const submit = form.handleSubmit(async (values) => {
		try {
			console.log("Submitting questionnaire...", values);
			await submitQuestionnaire({ data: values });
			await nav({ to: "/thanks" });
		} catch (error) {
			console.error("Failed to submit questionnaire:", error);
			alert("Fehler beim Speichern. Bitte versuchen Sie es erneut.");
		}
	});

	const trustItems = [
		{ name: "trust_comp_1", label: m.trust_comp_q1() },
		{ name: "trust_ben_1", label: m.trust_ben_q1() },
		{ name: "trust_comp_2", label: m.trust_comp_q2() },
		{ name: "trust_ben_2", label: m.trust_ben_q2() },
		{ name: "trust_comp_3", label: m.trust_comp_q3() },
		{ name: "trust_ben_3", label: m.trust_ben_q3() },
	] as const;

	const ueqItems = [
		{ name: "ueq_1", min: m.ueq_1_min(), max: m.ueq_1_max() },
		{ name: "ueq_2_swapped", min: m.ueq_2_max(), max: m.ueq_2_min() },
		{ name: "ueq_3", min: m.ueq_3_min(), max: m.ueq_3_max() },
		{ name: "ueq_4_swapped", min: m.ueq_4_max(), max: m.ueq_4_min() },
		{ name: "ueq_5", min: m.ueq_5_min(), max: m.ueq_5_max() },
		{ name: "ueq_6_swapped", min: m.ueq_6_max(), max: m.ueq_6_min() },
		{ name: "ueq_7", min: m.ueq_7_min(), max: m.ueq_7_max() },
		{ name: "ueq_8_swapped", min: m.ueq_8_max(), max: m.ueq_8_min() },
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
					<CardHeader>
						<CardTitle>{m.questionnaire_section_general()}</CardTitle>
					</CardHeader>
					<CardContent className="space-y-5">
						{trustItems.map((item, index) => (
							<LikertScale
								key={item.name}
								name={item.name}
								control={form.control}
								options={likert7Options}
								rowLabel={item.label}
								required
								showHeader={index === 0}
							/>
						))}
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>{m.questionnaire_section_impression()}</CardTitle>
					</CardHeader>
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
					<CardHeader>
						<CardTitle>{m.questionnaire_section_understanding()}</CardTitle>
					</CardHeader>
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
					<CardHeader>
						<CardTitle>{m.questionnaire_section_intention()}</CardTitle>
					</CardHeader>
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

				<Card>
					<CardHeader>
						<CardTitle>{m.questionnaire_section_feedback()}</CardTitle>
					</CardHeader>
					<CardContent className="space-y-2">
						<Label
							htmlFor="feedback"
							className="text-muted-foreground font-normal"
						>
							{m.questionnaire_feedback_label()}
						</Label>
						<Textarea
							id="feedback"
							placeholder={m.questionnaire_feedback_placeholder()}
							{...form.register("feedback")}
							className="mt-2 resize-none h-24"
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
