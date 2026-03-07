// Chat Message Bubble Component with Feedback
import { useEffect, useRef, useState } from 'react';

function ChatMessage({ message, feedbackState, onFeedback }) {
    const { id, role, content, timestamp } = message;
    const messageRef = useRef(null);
    const [showFeedbackThanks, setShowFeedbackThanks] = useState(false);
    const currentFeedback = feedbackState?.[id];

    useEffect(() => {
        if (messageRef.current) {
            messageRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
    }, []);

    const handleFeedback = (rating) => {
        if (onFeedback && !currentFeedback) {
            onFeedback(id, rating);
            setShowFeedbackThanks(true);
            setTimeout(() => setShowFeedbackThanks(false), 2000);
        }
    };

    // Simple markdown-like formatting
    const formatContent = (text) => {
        const lines = text.split('\n');
        let result = [];

        lines.forEach((line, idx) => {
            if (line.startsWith('## ')) {
                result.push(<h2 key={idx} style={{ fontSize: '1.25rem', marginTop: '1rem', marginBottom: '0.5rem' }}>{line.substring(3)}</h2>);
            } else if (line.startsWith('### ')) {
                result.push(<h3 key={idx} style={{ fontSize: '1.1rem', marginTop: '0.75rem', marginBottom: '0.5rem', color: 'var(--color-primary)' }}>{line.substring(4)}</h3>);
            } else if (line.startsWith('**') && line.endsWith('**')) {
                result.push(<p key={idx} style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{line.slice(2, -2)}</p>);
            } else if (line.startsWith('- ')) {
                const content = formatInlineStyles(line.substring(2));
                result.push(<li key={idx} style={{ marginLeft: '1.5rem', marginBottom: '0.25rem' }}>{content}</li>);
            } else if (line.startsWith('> ')) {
                result.push(
                    <blockquote key={idx} style={{
                        padding: '0.75rem 1rem',
                        background: 'rgba(212, 165, 116, 0.1)',
                        borderLeft: '3px solid var(--color-accent)',
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        fontStyle: 'italic',
                        marginTop: '1rem'
                    }}>
                        {line.substring(2)}
                    </blockquote>
                );
            } else if (line.startsWith('---')) {
                result.push(<hr key={idx} style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '1rem 0' }} />);
            } else if (line.trim() === '') {
                result.push(<br key={idx} />);
            } else {
                result.push(<p key={idx} style={{ marginBottom: '0.5rem' }}>{formatInlineStyles(line)}</p>);
            }
        });

        return result;
    };

    // Format inline styles (bold, italic)
    const formatInlineStyles = (text) => {
        const parts = text.split(/(\*\*[^*]+\*\*)/g);
        return parts.map((part, idx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={idx} style={{ color: role === 'user' ? 'inherit' : 'var(--color-primary)' }}>{part.slice(2, -2)}</strong>;
            }
            const italicParts = part.split(/(\*[^*]+\*)/g);
            return italicParts.map((ip, iidx) => {
                if (ip.startsWith('*') && ip.endsWith('*') && !ip.startsWith('**')) {
                    return <em key={`${idx}-${iidx}`}>{ip.slice(1, -1)}</em>;
                }
                return ip;
            });
        });
    };

    return (
        <div className={`chat-bubble ${role}`} ref={messageRef}>
            {role === 'assistant' ? formatContent(content) : content}

            {/* Feedback buttons for assistant messages */}
            {role === 'assistant' && onFeedback && (
                <div className="chat-feedback" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginTop: '0.75rem',
                    paddingTop: '0.5rem',
                    borderTop: '1px solid rgba(255,255,255,0.08)'
                }}>
                    {showFeedbackThanks ? (
                        <span style={{
                            fontSize: '0.8rem',
                            color: 'var(--color-primary)',
                            fontStyle: 'italic'
                        }}>
                            Thanks for your feedback! 🙏
                        </span>
                    ) : (
                        <>
                            <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>Was this helpful?</span>
                            <button
                                onClick={() => handleFeedback('positive')}
                                disabled={!!currentFeedback}
                                style={{
                                    background: currentFeedback === 'positive' ? 'rgba(76, 175, 80, 0.2)' : 'transparent',
                                    border: currentFeedback === 'positive' ? '1px solid rgba(76, 175, 80, 0.5)' : '1px solid rgba(255,255,255,0.15)',
                                    borderRadius: '0.375rem',
                                    padding: '0.25rem 0.5rem',
                                    cursor: currentFeedback ? 'default' : 'pointer',
                                    fontSize: '0.85rem',
                                    opacity: currentFeedback && currentFeedback !== 'positive' ? 0.4 : 1,
                                    transition: 'all 0.2s'
                                }}
                                aria-label="Helpful"
                            >
                                👍
                            </button>
                            <button
                                onClick={() => handleFeedback('negative')}
                                disabled={!!currentFeedback}
                                style={{
                                    background: currentFeedback === 'negative' ? 'rgba(244, 67, 54, 0.2)' : 'transparent',
                                    border: currentFeedback === 'negative' ? '1px solid rgba(244, 67, 54, 0.5)' : '1px solid rgba(255,255,255,0.15)',
                                    borderRadius: '0.375rem',
                                    padding: '0.25rem 0.5rem',
                                    cursor: currentFeedback ? 'default' : 'pointer',
                                    fontSize: '0.85rem',
                                    opacity: currentFeedback && currentFeedback !== 'negative' ? 0.4 : 1,
                                    transition: 'all 0.2s'
                                }}
                                aria-label="Not helpful"
                            >
                                👎
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

export default ChatMessage;
