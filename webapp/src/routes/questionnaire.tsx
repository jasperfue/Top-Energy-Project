import { zodResolver } from "@hookform/resolvers/zod";
import {
	createFileRoute,
	useNavigate,
	useRouter,
} from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { LikertScale } from "@/components/LikertScale";
import { MultipleChoiceQuestion } from "@/components/MultipleChoiceQuestion.tsx";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
	understanding_q2: z.enum(["q2_option_a", "q2_option_b", "q2_option_c"]),
});

const formSchema = z.object({
	...understandingAnswers.shape,
	...trustAnswers.shape,
});

type FormValues = z.infer<typeof formSchema>;

function Questionnaire() {
	const nav = useNavigate();
	const router = useRouter();

	useEffect(() => {
		void router.preloadRoute({
			to: "/thanks",
		});
	}, [router]);

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			trust_q1: undefined,
			trust_q2: undefined,
			trust_q3: undefined,
			understanding_q1: undefined,
			understanding_q2: undefined,
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
							rowLabel={"Objektive Verständnisfrage 1"}
							required
							showHeader
						/>
						<MultipleChoiceQuestion
							name="understanding_q2"
							control={form.control}
							question={"Subjektive Verständnisfrage 2"}
							required
							options={[
								{ value: "q2_option_a", label: "Test Antwort 1" },
								{ value: "q2_option_b", label: "Test Antwort 2" },
								{ value: "q2_option_c", label: "Test Antwort 3" },
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
