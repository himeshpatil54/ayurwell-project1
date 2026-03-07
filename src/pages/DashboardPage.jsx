// Dashboard Page - Main Chat Interface
import { useRef, useEffect } from 'react';
import Header from '../components/Header';
import ChatMessage from '../components/ChatMessage';
import ChatInput from '../components/ChatInput';
import { useChat } from '../context/ChatContext';

function DashboardPage() {
    const { messages, isTyping, sendMessage, clearChat, feedbackState, submitFeedback } = useChat();
    const messagesEndRef = useRef(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isTyping]);

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header />

            <div className="chat-container" style={{ flex: 1, overflow: 'hidden' }}>
                {/* Chat Messages */}
                <div className="chat-messages">
                    {messages.map((message) => (
                        <ChatMessage
                            key={message.id}
                            message={message}
                            feedbackState={feedbackState}
                            onFeedback={submitFeedback}
                        />

                    ))}

                    {/* Typing Indicator */}
                    {isTyping && (
                        <div className="typing-indicator">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Chat Input */}
                <ChatInput onSend={sendMessage} disabled={isTyping} />
            </div>

            {/* Clear Chat Button (subtle) */}
            <div style={{
                position: 'fixed',
                bottom: '1rem',
                left: '1rem',
                zIndex: 50
            }}>
                <button
                    onClick={clearChat}
                    className="btn btn-ghost btn-sm"
                    style={{
                        opacity: 0.6,
                        fontSize: '0.75rem',
                        padding: '0.5rem 0.75rem'
                    }}
                    title="Clear chat history"
                >
                    🗑️ Clear Chat
                </button>
            </div>
        </div>
    );
}

export default DashboardPage;
