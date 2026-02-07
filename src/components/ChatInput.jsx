// Chat Input Component with Suggestions
import { useState, useRef, useEffect } from 'react';

const SUGGESTIONS = [
    "Analyze my Prakriti",
    "I feel stressed and anxious",
    "Digestive issues",
    "Daily routine for Vata",
    "Diet for Pitta balance",
    "Yoga for Kapha"
];

function ChatInput({ onSend, disabled }) {
    const [message, setMessage] = useState('');
    const inputRef = useRef(null);

    useEffect(() => {
        if (!disabled && inputRef.current) {
            inputRef.current.focus();
        }
    }, [disabled]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (message.trim() && !disabled) {
            onSend(message.trim());
            setMessage('');
        }
    };

    const handleSuggestionClick = (suggestion) => {
        if (!disabled) {
            onSend(suggestion);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <div className="chat-input-container">
            {/* Suggestions */}
            <div className="chat-suggestions">
                {SUGGESTIONS.map((suggestion, idx) => (
                    <button
                        key={idx}
                        className="chat-suggestion"
                        onClick={() => handleSuggestionClick(suggestion)}
                        disabled={disabled}
                    >
                        {suggestion}
                    </button>
                ))}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="chat-input-wrapper">
                <input
                    ref={inputRef}
                    type="text"
                    className="chat-input"
                    placeholder="Share how you're feeling or ask a question..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={disabled}
                />
                <button
                    type="submit"
                    className="chat-send-btn"
                    disabled={disabled || !message.trim()}
                    aria-label="Send message"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 2L11 13" />
                        <path d="M22 2L15 22L11 13L2 9L22 2Z" />
                    </svg>
                </button>
            </form>
        </div>
    );
}

export default ChatInput;
