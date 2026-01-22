import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { ArrowRight, Loader2, TriangleAlert } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useEffectEvent } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { LikertScale } from "@/components/LikertScale";
import { MultipleChoiceQuestion } from "@/components/MultipleChoiceQuestion.tsx";
import { SemanticDifferential } from "@/components/SemanticDifferential.tsx";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group.tsx";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea.tsx";
import { airtable } from "@/lib/airtable.ts";
import { usePreloadRoute } from "@/lib/usePreloadRoute.ts";
import { useUserSession } from "@/lib/useUserSession.ts";
import { cn } from "@/lib/utils.ts";
import { m } from "@/paraglide/messages.js";
import {
	LIKERT_CENTER,
	LIKERT_LEFT,
	LIKERT_RIGHT,
	Likert7,
} from "@/routes/affinity-for-technology.tsx";

export const Route = createFileRoute("/questionnaire")({
	validateSearch: (search?) => {
		const rawStep = Number(search?.step ?? 1);
		const safeStep = Number.isFinite(rawStep)
			? Math.min(6, Math.max(1, rawStep))
			: 1;
		return {
			step: safeStep,
		};
	},
	component: Questionnaire,
});

const trustAnswers = z.object({
	trust_comp_1: Likert7,
	trust_comp_2: Likert7,
	trust_comp_3: Likert7,
	trust_comp_4: Likert7,
	trust_ben_1: Likert7,
	trust_ben_2: Likert7,
	trust_ben_3: Likert7,
	trust_int_1: Likert7,
	trust_int_2: Likert7,
	trust_int_3: Likert7,
	trust_int_4: Likert7,
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

const demographicsAnswers = z.object({
	age: z
		.number({ error: () => m.common_required_error() })
		.min(18, { message: m.demographics_age_error_min() })
		.max(99, { message: m.demographics_age_error_max() }),
	gender: z.enum(["female", "male", "diverse"]),
	occupation_role: z.enum([
		"student",
		"employee_no_lead",
		"employee_lead",
		"entrepreneur",
	]),
	domain_background: z.enum(["business", "technical", "it", "other"]),
	investment_experience: z.enum([
		"none",
		"theoretical",
		"practical_basic",
		"practical_professional",
	]),
});

const feedbackAnswer = z.object({
	feedback: z.string().optional(),
});

const formSchema = z.object({
	...understandingAnswers.shape,
	...trustAnswers.shape,
	...ueqAnswers.shape,
	...intentionAnswers.shape,
	...demographicsAnswers.shape,
	...feedbackAnswer.shape,
});

type FormValues = z.infer<typeof formSchema>;

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
	const { step } = Route.useSearch();
	const nav = useNavigate();
	usePreloadRoute(
		step < 6 ? "/questionnaire" : "/thanks",
		step < 6 ? { step: step + 1 } : undefined,
	);

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			trust_comp_1: undefined,
			trust_ben_1: undefined,
			trust_comp_2: undefined,
			trust_ben_2: undefined,
			trust_comp_3: undefined,
			trust_ben_3: undefined,
			trust_comp_4: undefined,
			trust_int_1: undefined,
			trust_int_2: undefined,
			trust_int_3: undefined,
			trust_int_4: undefined,
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
			age: undefined,
			gender: undefined,
			occupation_role: undefined,
			domain_background: undefined,
			investment_experience: undefined,
			feedback: "",
		},
		mode: "onChange",
	});

	const steps = [
		{
			id: 1,
			title: m.questionnaire_section_general(),
			fields: Object.keys(trustAnswers.shape) as (keyof FormValues)[],
			isLast: false,
		},
		{
			id: 2,
			title: m.questionnaire_section_impression(),
			fields: Object.keys(ueqAnswers.shape) as (keyof FormValues)[],
			isLast: false,
		},
		{
			id: 3,
			title: m.questionnaire_section_understanding(),
			fields: Object.keys(understandingAnswers.shape) as (keyof FormValues)[],
			isLast: false,
		},
		{
			id: 4,
			title: m.questionnaire_section_intention(),
			fields: Object.keys(intentionAnswers.shape) as (keyof FormValues)[],
			isLast: false,
		},
		{
			id: 5,
			title: m.questionnaire_section_demographics(),
			fields: Object.keys(demographicsAnswers.shape) as (keyof FormValues)[],
			isLast: false,
		},
		{
			id: 6,
			title: m.questionnaire_section_feedback(),
			fields: Object.keys(feedbackAnswer.shape) as (keyof FormValues)[],
			isLast: true,
		},
	];

	const currentStepConfig = steps.find((s) => s.id === step) || steps[0];

	const handleNext = async () => {
		const isValid = await form.trigger(currentStepConfig.fields);

		if (currentStepConfig.isLast) return;

		if (isValid) {
			await nav({
				to: "/questionnaire",
				search: { step: step + 1 },
			});
		}
	};

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
		{ name: "trust_int_1", label: m.trust_int_q1() },

		{ name: "trust_comp_2", label: m.trust_comp_q2() },
		{ name: "trust_ben_2", label: m.trust_ben_q2() },
		{ name: "trust_int_2", label: m.trust_int_q2() },

		{ name: "trust_comp_3", label: m.trust_comp_q3() },
		{ name: "trust_ben_3", label: m.trust_ben_q3() },
		{ name: "trust_int_3", label: m.trust_int_q3() },

		{ name: "trust_comp_4", label: m.trust_comp_q4() },
		{ name: "trust_int_4", label: m.trust_int_q4() },
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

	const checkPreviousSteps = useEffectEvent(async () => {
		if (step === 1) return;
		const previousSteps = steps.filter((s) => s.id < step);
		const fieldsToCheck = previousSteps.flatMap((s) => s.fields);
		const isValid = await form.trigger(fieldsToCheck);
		if (!isValid) {
			form.clearErrors(fieldsToCheck);
			await nav({
				to: "/questionnaire",
				search: { step: 1 },
				replace: true,
			});
		}
	});

	// biome-ignore lint/correctness/useExhaustiveDependencies: We need Step here
	useEffect(() => {
		void checkPreviousSteps();
	}, [step]);

	return (
		<main className="mx-auto w-full pt-4 md:p-6 max-w-4xl space-y-6 min-h-[80vh] flex flex-col justify-center">
			<h2 className="text-xl md:text-2xl font-semibold">
				{m.questionnaire_title()}
			</h2>

			{step === 1 && (
				<Card>
					<CardContent className="flex flex-col py-3 px-4 md:p-6 gap-4 text-sm md:text-base">
						<div
							// biome-ignore lint/security/noDangerouslySetInnerHtml: Have to
							dangerouslySetInnerHTML={{ __html: m.questionnaire_intro() }}
						/>
					</CardContent>
				</Card>
			)}

			<Separator />

			<form
				onSubmit={currentStepConfig.isLast ? submit : (e) => e.preventDefault()}
				className="space-y-6 pb-8"
			>
				<AnimatePresence mode="wait" initial={false}>
					<motion.div
						key={step}
						initial={{ x: 10, opacity: 0 }}
						animate={{ x: 0, opacity: 1 }}
						exit={{ x: -10, opacity: 0 }}
						transition={{ duration: 0.2 }}
					>
						{/* STEP 1: GENERAL / TRUST */}
						{step === 1 && (
							<Card>
								<CardHeader className="md:px-6 px-4">
									<CardTitle className="text-lg md:text-xl">
										{m.questionnaire_section_general()}
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-6 md:space-y-5 md:px-6 px-4">
									{trustItems.map((item) => (
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
								</CardContent>
							</Card>
						)}

						{/* STEP 2: UEQ */}
						{step === 2 && (
							<Card>
								<CardHeader className="md:px-6 px-4">
									<CardTitle className="text-lg md:text-xl">
										{m.questionnaire_section_impression()}
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4 md:px-6 px-4">
									<div className="mb-4 p-3 bg-muted/50 rounded-lg text-sm leading-relaxed">
										{m.ueq_instruction()}
									</div>
									<div className="space-y-1">
										{ueqItems.map((item) => (
											<SemanticDifferential
												key={item.name}
												name={item.name}
												control={form.control}
												minLabel={item.min}
												maxLabel={item.max}
												required
											/>
										))}
									</div>
								</CardContent>
							</Card>
						)}

						{/* STEP 3: UNDERSTANDING */}
						{step === 3 && (
							<Card>
								<CardHeader className="md:px-6 px-4">
									<CardTitle className="text-lg md:text-xl">
										{m.questionnaire_section_understanding()}
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-6 md:space-y-5 md:px-6 px-4">
									<LikertScale
										name="understanding_q1"
										control={form.control}
										rowLabel={m.understanding_q1()}
										required
										leftLabel={LIKERT_LEFT}
										centerLabel={LIKERT_CENTER}
										rightLabel={LIKERT_RIGHT}
									/>
									<LikertScale
										name="understanding_q2"
										control={form.control}
										rowLabel={m.understanding_q2()}
										required
										leftLabel={LIKERT_LEFT}
										centerLabel={LIKERT_CENTER}
										rightLabel={LIKERT_RIGHT}
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
						)}

						{/* STEP 4: INTENTION */}
						{step === 4 && (
							<Card>
								<CardHeader className="md:px-6 px-4">
									<CardTitle className="text-lg md:text-xl">
										{m.questionnaire_section_intention()}
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-6 md:space-y-5 md:px-6 px-4">
									{/* --- NEUER DISCLAIMER START --- */}
									<div
										className="rounded-md bg-muted/60 p-4 text-sm text-foreground border border-border"
										// biome-ignore lint/security/noDangerouslySetInnerHtml: Trusted content
										dangerouslySetInnerHTML={{
											__html: m.intention_disclaimer(),
										}}
									/>
									{/* --- NEUER DISCLAIMER ENDE --- */}

									<LikertScale
										name="intention_q1"
										control={form.control}
										rowLabel={m.intention_q1()}
										required
										leftLabel={LIKERT_LEFT}
										centerLabel={LIKERT_CENTER}
										rightLabel={LIKERT_RIGHT}
									/>
									<LikertScale
										name="intention_q2"
										control={form.control}
										rowLabel={m.intention_q2()}
										required
										leftLabel={LIKERT_LEFT}
										centerLabel={LIKERT_CENTER}
										rightLabel={LIKERT_RIGHT}
									/>
									<LikertScale
										name="intention_q3"
										control={form.control}
										rowLabel={m.intention_q3()}
										required
										leftLabel={LIKERT_LEFT}
										centerLabel={LIKERT_CENTER}
										rightLabel={LIKERT_RIGHT}
									/>
								</CardContent>
							</Card>
						)}

						{/* STEP 5: DEMOGRAPHICS */}
						{step === 5 && (
							<Card>
								<CardHeader className="md:px-6 px-4">
									<CardTitle className="text-lg md:text-xl">
										{m.questionnaire_section_demographics()}
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-8 md:px-6 px-4">
									<div className="flex flex-col md:flex-row gap-8">
										<div className="space-y-3">
											<Label htmlFor="age" className="text-base font-medium">
												{m.demographics_age()}
											</Label>

											<Controller
												control={form.control}
												name="age"
												render={({ field, fieldState }) => (
													<>
														<div className="flex items-center gap-2">
															<Input
																{...field}
																id="age"
																type="number"
																value={field.value ?? ""}
																onChange={(e) => {
																	const val = e.target.value;
																	field.onChange(
																		val === "" ? undefined : Number(val),
																	);
																}}
																className={cn(
																	"w-24 text-lg",
																	fieldState.error &&
																		"border-destructive focus-visible:ring-destructive",
																)}
															/>
														</div>
														{fieldState.error && (
															<div className="mt-3 flex items-center justify-start gap-2 text-xs text-destructive font-medium animate-in fade-in-0 slide-in-from-top-1">
																<TriangleAlert className="h-4 w-4" />
																<span>{fieldState.error.message}</span>
															</div>
														)}
													</>
												)}
											/>
										</div>

										<div className="space-y-3">
											<Label className="text-base font-medium">
												{m.demographics_gender()}
											</Label>
											<Controller
												control={form.control}
												name="gender"
												render={({ field, fieldState }) => (
													<>
														<RadioGroup
															onValueChange={field.onChange}
															defaultValue={field.value}
															className="flex gap-4 md:gap-6 flex-wrap"
														>
															<div className="flex items-center space-x-2">
																<RadioGroupItem
																	value="male"
																	id="g_male"
																	className={cn(
																		"h-6 w-6 md:h-7 md:w-7 border-muted-foreground/30 text-primary data-[state=checked]:border-primary data-[state=checked]:bg-primary/10 transition-all z-10",
																		fieldState.error && "border-destructive",
																	)}
																/>
																<Label
																	htmlFor="g_male"
																	className={cn(
																		"font-normal cursor-pointer",
																		fieldState.error && "text-destructive",
																	)}
																>
																	{m.demographics_gender_male()}
																</Label>
															</div>
															<div className="flex items-center space-x-2">
																<RadioGroupItem
																	value="female"
																	id="g_fem"
																	className={cn(
																		"h-6 w-6 md:h-7 md:w-7 border-muted-foreground/30 text-primary data-[state=checked]:border-primary data-[state=checked]:bg-primary/10 transition-all z-10",
																		fieldState.error && "border-destructive",
																	)}
																/>
																<Label
																	htmlFor="g_fem"
																	className={cn(
																		"font-normal cursor-pointer",
																		fieldState.error && "text-destructive",
																	)}
																>
																	{m.demographics_gender_female()}
																</Label>
															</div>
															<div className="flex items-center space-x-2">
																<RadioGroupItem
																	value="diverse"
																	id="g_div"
																	className={cn(
																		"h-6 w-6 md:h-7 md:w-7 border-muted-foreground/30 text-primary data-[state=checked]:border-primary data-[state=checked]:bg-primary/10 transition-all z-10",
																		fieldState.error && "border-destructive",
																	)}
																/>
																<Label
																	htmlFor="g_div"
																	className={cn(
																		"font-normal cursor-pointer",
																		fieldState.error && "text-destructive",
																	)}
																>
																	{m.demographics_gender_diverse()}
																</Label>
															</div>
														</RadioGroup>
														{fieldState.error && (
															<div className="mt-3 flex items-center justify-center gap-2 text-xs text-destructive font-medium animate-in fade-in-0 slide-in-from-top-1">
																<TriangleAlert className="h-4 w-4" />
																<span>{m.common_required_error()}</span>
															</div>
														)}
													</>
												)}
											/>
										</div>
									</div>

									<Separator className="bg-border/60" />

									{/* OCCUPATION ROLE (Student vs Entrepreneur) */}
									<MultipleChoiceQuestion
										name="occupation_role"
										control={form.control}
										question={m.demographics_occupation_question()}
										required
										options={[
											{
												value: "employee_no_lead",
												label: m.demographics_occupation_employee(),
											},
											{
												value: "employee_lead",
												label: m.demographics_occupation_manager(),
											},
											{
												value: "entrepreneur",
												label: m.demographics_occupation_entrepreneur(),
											},
											{
												value: "student",
												label: m.demographics_occupation_student(),
											},
										]}
									/>

									{/* DOMAIN (Technical vs Business vs IT) */}
									<MultipleChoiceQuestion
										name="domain_background"
										control={form.control}
										question={m.demographics_domain_question()}
										required
										options={[
											{
												value: "business",
												label: m.demographics_domain_business(), // Kaufmännisch
											},
											{
												value: "technical",
												label: m.demographics_domain_technical(), // Technisch / Handwerk
											},
											{
												value: "it",
												label: m.demographics_domain_it(), // IT
											},
											{
												value: "other",
												label: m.demographics_domain_other(),
											},
										]}
									/>

									{/* INVESTMENT EXPERIENCE (Critical!) */}
									<MultipleChoiceQuestion
										name="investment_experience"
										control={form.control}
										question={m.demographics_investexp_question()}
										required
										options={[
											{
												value: "practical_professional",
												label: m.demographics_investexp_pro(),
											},
											{
												value: "practical_basic",
												label: m.demographics_investexp_basic(),
											},
											{
												value: "theoretical",
												label: m.demographics_investexp_theory(),
											},
											{ value: "none", label: m.demographics_investexp_none() },
										]}
									/>
								</CardContent>
							</Card>
						)}

						{/* STEP 6: FEEDBACK */}
						{step === 6 && (
							<Card>
								<CardHeader className="md:px-6 px-4">
									<CardTitle className="text-lg md:text-xl">
										{m.questionnaire_section_feedback()}
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-2 md:px-6 px-4">
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
										className="mt-2 resize-none h-24 text-base md:text-sm"
									/>
								</CardContent>
							</Card>
						)}
					</motion.div>
				</AnimatePresence>

				{/* NAVIGATION BUTTONS */}
				<div className="flex justify-between items-center pt-2">
					{step > 1 ? (
						<Button
							type="button"
							variant="ghost"
							onClick={() =>
								nav({ to: "/questionnaire", search: { step: step - 1 } })
							}
							className="pl-0 hover:bg-transparent hover:text-primary md:pl-4 md:hover:bg-accent"
						>
							{m.common_back()}
						</Button>
					) : (
						<div />
					)}

					{currentStepConfig.isLast ? (
						<Button
							key="submit-btn"
							type="submit"
							disabled={form.formState.isSubmitting}
							className="w-auto"
						>
							{form.formState.isSubmitting ? (
								<Loader2 className="h-4 w-4 animate-spin mr-2" />
							) : (
								<>
									{m.common_submit()}
									<ArrowRight className="ml-2 h-4 w-4" />
								</>
							)}
						</Button>
					) : (
						<Button key={`next-btn-${step}`} type="button" onClick={handleNext}>
							{m.common_continue()}
						</Button>
					)}
				</div>
			</form>
		</main>
	);
}
