export type MarkdownChunk = {
	content: string;
	headerPath: string[]; // e.g., ["Soll-System", "Wärmepumpe"]
};

/**
 * Splits Markdown based on headings.
 * Prevents tables from being split, as long as they are under a heading
 */
export function splitMarkdownByStructure(text: string): MarkdownChunk[] {
	const lines = text.split("\n");
	const chunks: MarkdownChunk[] = [];

	let currentPath: string[] = [];
	let currentBuffer: string[] = [];

	// Helper function to save the current buffer
	const flush = () => {
		if (currentBuffer.length > 0) {
			chunks.push({
				content: currentBuffer.join("\n").trim(),
				headerPath: [...currentPath], // Copy of the current path
			});
			currentBuffer = [];
		}
	};

	for (const line of lines) {
		// Detects headings (#, ##, ###)
		const headerMatch = line.match(/^(#{1,6})\s+(.*)/);

		if (headerMatch) {
			flush(); // Save the previous section

			const level = headerMatch[1].length;
			const title = headerMatch[2].trim();

			// Path logic: If we're at level 2, clear everything from level 2 and reset
			// (Very simplified logic, but works well for clean MD files)

			currentPath = currentPath.slice(0, level - 1);
			currentPath[level - 1] = title;

			// The heading itself also goes into the content (important for context)
			currentBuffer.push(line);
		} else {
			currentBuffer.push(line);
		}
	}

	flush(); // Save the last buffer
	return chunks;
}
