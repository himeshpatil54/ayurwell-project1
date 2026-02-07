// Chat Message Bubble Component
import { useEffect, useRef } from 'react';

function ChatMessage({ message }) {
    const { role, content, timestamp } = message;
    const messageRef = useRef(null);

    useEffect(() => {
        if (messageRef.current) {
            messageRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
    }, []);

    // Simple markdown-like formatting
    const formatContent = (text) => {
        // Split by lines
        const lines = text.split('\n');
        let inList = false;
        let result = [];

        lines.forEach((line, idx) => {
            // Headers
            if (line.startsWith('## ')) {
                result.push(<h2 key={idx} style={{ fontSize: '1.25rem', marginTop: '1rem', marginBottom: '0.5rem' }}>{line.substring(3)}</h2>);
            } else if (line.startsWith('### ')) {
                result.push(<h3 key={idx} style={{ fontSize: '1.1rem', marginTop: '0.75rem', marginBottom: '0.5rem', color: 'var(--color-primary)' }}>{line.substring(4)}</h3>);
            } else if (line.startsWith('**') && line.endsWith('**')) {
                result.push(<p key={idx} style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{line.slice(2, -2)}</p>);
            } else if (line.startsWith('- ')) {
                // List item
                const content = formatInlineStyles(line.substring(2));
                result.push(<li key={idx} style={{ marginLeft: '1.5rem', marginBottom: '0.25rem' }}>{content}</li>);
            } else if (line.startsWith('> ')) {
                // Blockquote / disclaimer
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
        // Simple bold formatting with **text**
        const parts = text.split(/(\*\*[^*]+\*\*)/g);
        return parts.map((part, idx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={idx} style={{ color: role === 'user' ? 'inherit' : 'var(--color-primary)' }}>{part.slice(2, -2)}</strong>;
            }
            // Italic with *text*
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
        </div>
    );
}

export default ChatMessage;
