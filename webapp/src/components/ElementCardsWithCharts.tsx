import { motion } from "framer-motion";
import { BarChart3, Factory, Gauge } from "lucide-react";
import IOSection from "@/components/IOSection.tsx";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@/components/ui/tabs.tsx";
import type { ProjectData } from "@/types/projectDataTypes.ts";

export default function ElementCardsWithCharts({
	data,
}: {
	data: ProjectData;
}) {
	return (
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
			{data.elements.map((el) => (
				<motion.div
					key={el.name}
					initial={{ opacity: 0, y: 8 }}
					animate={{ opacity: 1, y: 0 }}
				>
					<Card className="rounded-2xl shadow-sm hover:shadow-md transition-shadow">
						<CardHeader className="space-y-1">
							<div className="flex items-center gap-2">
								<div className="rounded-xl bg-primary/10 p-2">
									<Factory className="h-5 w-5 text-primary" />
								</div>
								<CardTitle className="text-lg">{el.name}</CardTitle>
							</div>
							<CardDescription>
								<Badge variant="secondary" className="gap-1">
									<Gauge className="h-3 w-3" />
									{el.input.length} Input
								</Badge>
								<Badge variant="secondary" className="gap-1 ml-2">
									<BarChart3 className="h-3 w-3" />
									{el.output.length} Output
								</Badge>
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Tabs defaultValue="output">
								<TabsList className="grid w-full grid-cols-2">
									<TabsTrigger value="input">Input</TabsTrigger>
									<TabsTrigger value="output">Output</TabsTrigger>
								</TabsList>
								<TabsContent value="input" className="mt-4">
									<IOSection entries={el.input} kind="input" />
								</TabsContent>
								<TabsContent value="output" className="mt-4">
									<IOSection entries={el.output} kind="output" />
								</TabsContent>
							</Tabs>
						</CardContent>
					</Card>
				</motion.div>
			))}
		</div>
	);
}
