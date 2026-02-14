import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Leaf } from "lucide-react";
import ReactMarkdown from "react-markdown";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  sections?: WellnessSection[];
}

export interface WellnessSection {
  type: "dosha" | "dinacharya" | "diet" | "herbal" | "mind";
  title: string;
  content: string;
}

interface ChatBubbleProps {
  message: Message;
}

export const ChatBubble = ({ message }: ChatBubbleProps) => {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex gap-3 animate-fade-in",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {!isUser && (
        <Avatar className="h-9 w-9 shrink-0 bg-primary shadow-md">
          <AvatarFallback className="bg-primary text-primary-foreground">
            <Leaf className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
      )}

      <div
        className={cn(
          "max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-3 shadow-sm",
          isUser
            ? "bg-secondary text-secondary-foreground rounded-br-sm"
            : "bg-card text-card-foreground rounded-bl-sm border border-border"
        )}
      >
        <div className="prose prose-sm prose-stone max-w-none dark:prose-invert">
          <ReactMarkdown
            components={{
              p: ({ children }) => (
                <p className="text-sm leading-relaxed mb-2 last:mb-0">{children}</p>
              ),
              strong: ({ children }) => (
                <strong className="font-semibold text-foreground">{children}</strong>
              ),
              ul: ({ children }) => (
                <ul className="list-disc list-inside space-y-1 text-sm mb-2">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal list-inside space-y-1 text-sm mb-2">{children}</ol>
              ),
              li: ({ children }) => (
                <li className="text-sm leading-relaxed">{children}</li>
              ),
              h1: ({ children }) => (
                <h4 className="font-semibold text-base mt-3 mb-1 text-foreground">{children}</h4>
              ),
              h2: ({ children }) => (
                <h4 className="font-semibold text-base mt-3 mb-1 text-foreground">{children}</h4>
              ),
              h3: ({ children }) => (
                <h4 className="font-medium text-sm mt-2 mb-1 text-foreground">{children}</h4>
              ),
              em: ({ children }) => (
                <em className="italic text-muted-foreground">{children}</em>
              ),
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>

        <span
          className={cn(
            "text-xs mt-2 block",
            isUser ? "text-secondary-foreground/70" : "text-muted-foreground"
          )}
        >
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </div>
  );
};

export default ChatBubble;
