import { useState, KeyboardEvent } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send, Leaf } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading?: boolean;
  showSuggestions?: boolean;
}

const suggestedPrompts = [
  "What's my dosha type?",
  "Help me sleep better",
  "Morning routine tips",
  "Reduce stress naturally",
  "Digestive health advice",
];

export const ChatInput = ({ onSend, isLoading, showSuggestions = true }: ChatInputProps) => {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim() && !isLoading) {
      onSend(message.trim());
      setMessage("");
    }
  };

  const handleSuggestionClick = (prompt: string) => {
    if (!isLoading) {
      onSend(prompt);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-border bg-card p-4">
      <div className="max-w-4xl mx-auto">
        {showSuggestions && (
          <div className="flex flex-wrap gap-2 mb-3 justify-center">
            {suggestedPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => handleSuggestionClick(prompt)}
                disabled={isLoading}
                className="px-3 py-1.5 text-sm bg-secondary/50 hover:bg-secondary text-secondary-foreground rounded-full border border-border transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}
        <div className="flex gap-3 items-end">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your symptoms, digestion, sleep, stress, and daily routine..."
            className="min-h-[52px] max-h-32 resize-none bg-background border-border focus-visible:ring-primary"
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={!message.trim() || isLoading}
            className="h-[52px] w-[52px] shrink-0 rounded-full bg-primary hover:bg-primary/90 shadow-md"
            size="icon"
          >
            {isLoading ? (
              <Leaf className="h-5 w-5 animate-pulse" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground text-center mt-3 max-w-2xl mx-auto leading-relaxed">
          This AI provides educational Ayurvedic wellness information only. It does
          not diagnose or treat medical conditions. Please consult a qualified
          Ayurvedic physician for medical advice.
        </p>
      </div>
    </div>
  );
};

export default ChatInput;
