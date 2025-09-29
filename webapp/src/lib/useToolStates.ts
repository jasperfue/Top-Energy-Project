import { useMemo } from "react";
import type { IncomingMessageChunk } from "@/lib/useChatStream.ts";

type ToolState = {
	type: string;
	state: "input-streaming" | "output-available";
	input: Record<string, string>;
	output?: Record<string, string>;
	status?: "success" | "error";
};

export function useToolStates(messages: readonly IncomingMessageChunk[]) {
	return useMemo(() => {
		const map = new Map<string, ToolState>();

		for (const m of messages) {
			if (m.type === "AIMessageChunk") {
				for (const tc of m.data.tool_calls) {
					map.set(tc.id, {
						type: tc.name,
						state: "input-streaming",
						input: tc.args,
					});
				}
			} else if (m.type === "tool") {
				const prev = map.get(m.data.tool_call_id);
				map.set(m.data.tool_call_id, {
					type: prev?.type ?? m.data.name,
					state: "output-available",
					input: prev?.input ?? {},
					output: { output: m.data.content },
					status: m.data.status,
				});
			}
		}

		return map;
	}, [messages]);
}
