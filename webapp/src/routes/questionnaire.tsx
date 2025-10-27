import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { LikertField } from "@/components/questionnaire/LikertField.tsx";
import { MultipleChoiceField } from "@/components/questionnaire/MultipleChoiceField.tsx";
import { TextAreaField } from "@/components/questionnaire/TextAreaField.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent } from "@/components/ui/card.tsx";
import { Separator } from "@/components/ui/separator.tsx";

export const Route = createFileRoute("/questionnaire")({
	component: Questionnaire,
	validateSearch: (search) =>
		z.object({ type: z.enum(["chat", "dashboard"]) }).parse(search),
});

// Something here does not work at the router. There is an issue for this: https://github.com/TanStack/router/issues/4787
export const { fieldContext, useFieldContext, formContext } =
	createFormHookContexts();

export const { useAppForm } = createFormHook({
	fieldContext,
	formContext,
	fieldComponents: {
		LikertField,
		MultipleChoiceField,
		TextAreaField,
	},
	formComponents: {},
});

function Questionnaire() {
	const nav = useNavigate();
	const { type } = Route.useSearch();
	const form = useAppForm({
		defaultValues: {
			condition: type,

			// Verständnis (subjektiv)
			und1: "",
			und2: "",
			und3: "",

			// Verständnis (objektiv)
			und_obj_1: "",
			und_obj_2: "",

			// Vertrauen (Madsen & Gregor, 2000)
			trust1: "",
			trust2: "",
			trust3: "",
			trust4: "",
			trust5: "",

			// Implementationsabsicht (Ajzen, 1991)
			impl1: "",
			impl2: "",
			impl3: "",

			// Manipulationscheck + Feedback
			manipulation: "",
			feedback_pos: "",
			feedback_neg: "",
		},
		onSubmit: async ({ value }) => {
			console.log("Questionnaire submit:", value);
			void nav({ to: "/thanks" });
		},
	});

	return (
		<main className="mx-auto max-w-2xl p-6 space-y-6">
			<header className="space-y-1">
				<h2 className="text-xl font-semibold">Fragebogen</h2>
				<p className="text-muted-foreground text-sm">
					Bitte beantworte die folgenden Fragen zu dem gerade genutzten System.
				</p>
			</header>

			<Card>
				<CardContent className="py-4 text-sm text-muted-foreground">
					<div>
						<span className="font-medium text-foreground">Bedingung:</span>{" "}
						{type}
					</div>
					<div>Es gibt keine richtigen oder falschen Antworten.</div>
				</CardContent>
			</Card>

			<Separator />

			<form.AppForm>
				<div className="space-y-6">
					{/* ---------------- VERSTÄNDNIS (subjektiv) ---------------- */}
					<section className="space-y-3">
						<h3 className="text-lg font-medium">Verständnis</h3>

						<form.AppField
							name="und1"
							validators={{
								onSubmit: ({ value }) => (!value ? "Bitte wählen" : undefined),
							}}
						>
							{(field) => (
								<field.LikertField
									label="Ich habe verstanden, wie die empfohlene Energiesystem-Lösung funktioniert."
									points={5}
								/>
							)}
						</form.AppField>

						<form.AppField
							name="und2"
							validators={{
								onSubmit: ({ value }) => (!value ? "Bitte wählen" : undefined),
							}}
						>
							{(field) => (
								<field.LikertField
									label="Ich konnte nachvollziehen, warum das System diese Empfehlung gibt."
									points={5}
								/>
							)}
						</form.AppField>

						<form.AppField
							name="und3"
							validators={{
								onSubmit: ({ value }) => (!value ? "Bitte wählen" : undefined),
							}}
						>
							{(field) => (
								<field.LikertField
									label="Die angezeigten Kennzahlen (z. B. CO₂, Kosten) waren für mich verständlich."
									points={5}
								/>
							)}
						</form.AppField>
					</section>

					{/* ---------------- VERSTÄNDNIS (objektiv) ---------------- */}
					<section className="space-y-3">
						<form.AppField
							name="und_obj_1"
							validators={{
								onSubmit: ({ value }) => (!value ? "Bitte wählen" : undefined),
							}}
						>
							{(field) => (
								<field.MultipleChoiceField
									label="Welche der dargestellten Lösungen hatte die niedrigsten CO₂-Emissionen?"
									options={[
										{ value: "A", text: "Lösung A" },
										{ value: "B", text: "Lösung B" },
										{ value: "C", text: "Lösung C" },
										{ value: "unsicher", text: "Ich bin mir unsicher" },
									]}
								/>
							)}
						</form.AppField>

						<form.AppField
							name="und_obj_2"
							validators={{
								onSubmit: ({ value }) => (!value ? "Bitte wählen" : undefined),
							}}
						>
							{(field) => (
								<field.MultipleChoiceField
									label="Welcher Faktor war ausschlaggebend für die Empfehlung?"
									options={[
										{ value: "kosten", text: "Gesamtkosten" },
										{ value: "co2", text: "CO₂-Emissionen" },
										{ value: "foerderung", text: "Förderfähigkeit" },
										{ value: "unsicher", text: "Ich bin mir unsicher" },
									]}
								/>
							)}
						</form.AppField>
					</section>

					<Separator />

					{/* ---------------- VERTRAUEN ---------------- */}
					<section className="space-y-3">
						<h3 className="text-lg font-medium">Vertrauen</h3>

						{(["trust1", "trust2", "trust3", "trust4", "trust5"] as const).map(
							(name, i) => {
								const labels = [
									"Ich halte die Systemempfehlung für zuverlässig.",
									"Ich habe Vertrauen in die Richtigkeit der dargestellten Ergebnisse.",
									"Ich würde mich auf die Empfehlung des Systems verlassen.",
									"Ich halte das System für kompetent in der Analyse von Energiesystemen.",
									"Ich hatte das Gefühl, dass das System ehrlich und transparent ist.",
								];
								return (
									<form.AppField
										key={name}
										name={name}
										validators={{
											onSubmit: ({ value }) =>
												!value ? "Bitte wählen" : undefined,
										}}
									>
										{(field) => (
											<field.LikertField label={labels[i]!} points={7} />
										)}
									</form.AppField>
								);
							},
						)}
					</section>

					<Separator />

					{/* ---------------- IMPLEMENTATIONSABSICHT ---------------- */}
					<section className="space-y-3">
						<h3 className="text-lg font-medium">Implementationsabsicht</h3>

						<form.AppField
							name="impl1"
							validators={{
								onSubmit: ({ value }) => (!value ? "Bitte wählen" : undefined),
							}}
						>
							{(field) => (
								<field.LikertField
									label="Ich würde die empfohlene Maßnahme im eigenen Betrieb umsetzen."
									points={5}
								/>
							)}
						</form.AppField>

						<form.AppField
							name="impl2"
							validators={{
								onSubmit: ({ value }) => (!value ? "Bitte wählen" : undefined),
							}}
						>
							{(field) => (
								<field.LikertField
									label="Ich würde die Empfehlung meinem Management vorschlagen."
									points={5}
								/>
							)}
						</form.AppField>

						<form.AppField
							name="impl3"
							validators={{
								onSubmit: ({ value }) => (!value ? "Bitte wählen" : undefined),
							}}
						>
							{(field) => (
								<field.LikertField
									label="Es ist wahrscheinlich, dass ich die empfohlene Lösung implementiere."
									points={5}
								/>
							)}
						</form.AppField>
					</section>

					<Separator />

					{/* ---------------- MANIPULATIONSCHECK ---------------- */}
					<section className="space-y-3">
						<h3 className="text-lg font-medium">Kurzer Check</h3>
						<form.AppField
							name="manipulation"
							validators={{
								onSubmit: ({ value }) => (!value ? "Bitte wählen" : undefined),
							}}
						>
							{(field) => (
								<field.MultipleChoiceField
									label="Wie würdest du das System beschreiben, mit dem du gerade gearbeitet hast?"
									options={[
										{ value: "chat", text: "Dialogisch / Chat-basiert" },
										{
											value: "dashboard",
											text: "Visuell-grafisches Dashboard",
										},
										{ value: "beides", text: "Beides" },
										{ value: "unsicher", text: "Unsicher" },
									]}
								/>
							)}
						</form.AppField>
					</section>

					{/* ---------------- FEEDBACK ---------------- */}
					<section className="space-y-4">
						<h3 className="text-lg font-medium">Feedback</h3>

						<form.AppField name="feedback_pos">
							{(field) => (
								<field.TextAreaField
									label="Was hat dir besonders gefallen?"
									placeholder="Optional"
								/>
							)}
						</form.AppField>

						<form.AppField name="feedback_neg">
							{(field) => (
								<field.TextAreaField
									label="Was könnte verbessert werden?"
									placeholder="Optional"
								/>
							)}
						</form.AppField>
					</section>

					<div className="flex justify-end pt-2">
						<form.Subscribe
							selector={(state) => [state.canSubmit, state.isSubmitting]}
						>
							{([canSubmit, isSubmitting]) => (
								<Button type="submit" disabled={!canSubmit}>
									{isSubmitting ? "Sende..." : "Absenden"}
								</Button>
							)}
						</form.Subscribe>
					</div>
				</div>
			</form.AppForm>
		</main>
	);
}
