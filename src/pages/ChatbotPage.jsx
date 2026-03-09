// Chatbot Page — Symptom Analysis with Dosha Detection
import { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import ChatMessage from '../components/ChatMessage';
import ChatInput from '../components/ChatInput';
import { useChat } from '../context/ChatContext';

function ChatbotPage() {
    const { messages, isTyping, sendMessage, clearChat, feedbackState, submitFeedback } = useChat();
    const messagesEndRef = useRef(null);

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

            {/* Bottom bar */}
            <div style={{
                position: 'fixed',
                bottom: '1rem',
                left: '1rem',
                right: '1rem',
                display: 'flex',
                justifyContent: 'space-between',
                zIndex: 50,
                pointerEvents: 'none'
            }}>
                <button
                    onClick={clearChat}
                    className="btn btn-ghost btn-sm"
                    style={{
                        opacity: 0.6,
                        fontSize: '0.75rem',
                        padding: '0.5rem 0.75rem',
                        pointerEvents: 'auto'
                    }}
                    title="Clear chat history"
                >
                    🗑️ Clear Chat
                </button>
                <Link
                    to="/herbal-remedies"
                    className="btn btn-ghost btn-sm"
                    style={{
                        opacity: 0.7,
                        fontSize: '0.75rem',
                        padding: '0.5rem 0.75rem',
                        pointerEvents: 'auto',
                        color: 'var(--color-primary)'
                    }}
                >
                    🌿 Browse Herbal Remedies →
                </Link>
            </div>
        </div>
    );
}

export default ChatbotPage;
