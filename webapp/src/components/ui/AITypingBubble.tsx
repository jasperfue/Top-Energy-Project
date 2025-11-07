export const AITypingBubble = () => (
    <div className="px-3 py-2 bg-muted rounded-2xl flex items-center gap-1">
        <span className="w-1.5 h-1.5 bg-foreground/60 rounded-full animate-bounce [animation-delay:-0.3s]" />
        <span className="w-1.5 h-1.5 bg-foreground/60 rounded-full animate-bounce [animation-delay:-0.15s]" />
        <span className="w-1.5 h-1.5 bg-foreground/60 rounded-full animate-bounce" />
    </div>
);
