import { useState, useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatBubble, Message } from "./ChatBubble";
import { ChatInput } from "./ChatInput";
import { TypingIndicator } from "./TypingIndicator";
import { streamChat, ChatMessage } from "@/lib/streamChat";
import { toast } from "sonner";

const STORAGE_KEY = "ayurveda-chat-history";

const welcomeMessage: Message = {
  id: "welcome",
  role: "assistant",
  content: "Namaste! 🙏 Welcome to your Ayurvedic Wellness companion. I'm here to offer personalized insights based on traditional Ayurvedic wisdom.\n\nPlease share what's on your mind—whether it's about your digestion, sleep patterns, stress levels, or daily routine. I'll provide guidance tailored to your unique constitution.\n\n*This AI provides educational Ayurvedic wellness information only and does not diagnose or treat medical conditions.*",
  timestamp: new Date(),
};

export const ChatContainer = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load messages from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const messagesWithDates = parsed.map((msg: Message) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
        setMessages(messagesWithDates);
      } catch {
        setMessages([welcomeMessage]);
      }
    } else {
      setMessages([welcomeMessage]);
    }
  }, []);

  // Save messages to localStorage when they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Build message history for AI (exclude welcome message sections)
    const chatHistory: ChatMessage[] = messages
      .filter((m) => m.id !== "welcome")
      .map((m) => ({ role: m.role, content: m.content }));
    chatHistory.push({ role: "user", content });

    let assistantContent = "";

    const upsertAssistant = (nextChunk: string) => {
      assistantContent += nextChunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant" && last.id !== "welcome") {
          return prev.map((m, i) =>
            i === prev.length - 1 ? { ...m, content: assistantContent } : m
          );
        }
        return [
          ...prev,
          {
            id: Date.now().toString(),
            role: "assistant" as const,
            content: assistantContent,
            timestamp: new Date(),
          },
        ];
      });
    };

    await streamChat({
      messages: chatHistory,
      onDelta: (chunk) => {
        upsertAssistant(chunk);
      },
      onDone: () => {
        setIsLoading(false);
      },
      onError: (error) => {
        setIsLoading(false);
        toast.error(error);
        // Add error message to chat
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: "assistant",
            content: "I apologize, but I'm having trouble connecting right now. Please try again in a moment. 🙏",
            timestamp: new Date(),
          },
        ]);
      },
    });
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <ScrollArea 
        ref={scrollRef}
        className="flex-1 px-4 py-6 chat-scroll"
      >
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((message) => (
            <ChatBubble key={message.id} message={message} />
          ))}
          {isLoading && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      <ChatInput onSend={handleSend} isLoading={isLoading} />
    </div>
  );
};

export default ChatContainer;
