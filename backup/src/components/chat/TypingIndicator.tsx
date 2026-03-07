export const TypingIndicator = () => {
  return (
    <div className="flex gap-3 animate-fade-in">
      <div className="h-9 w-9 shrink-0 rounded-full bg-primary shadow-md flex items-center justify-center">
        <span className="text-primary-foreground text-sm">🌿</span>
      </div>
      <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1.5 h-5">
          <span className="typing-dot w-2 h-2 rounded-full bg-primary/60" />
          <span className="typing-dot w-2 h-2 rounded-full bg-primary/60" />
          <span className="typing-dot w-2 h-2 rounded-full bg-primary/60" />
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
