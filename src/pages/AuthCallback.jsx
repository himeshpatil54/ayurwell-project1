// Auth Callback — Handles OAuth redirect from Supabase
// Waits for session to be established, then redirects to dashboard
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

function AuthCallback() {
    const navigate = useNavigate();
    const [error, setError] = useState('');

    useEffect(() => {
        console.log('[AuthCallback] Mounted — waiting for session from OAuth redirect...');
        console.log('[AuthCallback] Current URL hash:', window.location.hash ? '(has tokens)' : '(empty)');

        let timeout;
        let unsubscribe;

        const handleCallback = async () => {
            try {
                // First, try to get the session (Supabase auto-detects tokens from the URL hash)
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                if (sessionError) {
                    console.error('[AuthCallback] getSession error:', sessionError.message);
                    setError(sessionError.message);
                    timeout = setTimeout(() => navigate('/login', { replace: true }), 2000);
                    return;
                }

                if (session) {
                    console.log('[AuthCallback] Session found immediately:', session.user.email);
                    navigate('/chatbot', { replace: true });
                    return;
                }

                // Session not ready yet — wait for onAuthStateChange
                console.log('[AuthCallback] No session yet, listening for auth state change...');
                const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
                    console.log('[AuthCallback] Auth event:', event);
                    if (event === 'SIGNED_IN' && session) {
                        console.log('[AuthCallback] SIGNED_IN detected:', session.user.email);
                        navigate('/chatbot', { replace: true });
                    }
                });
                unsubscribe = subscription;

                // Timeout fallback — if nothing happens in 8 seconds, redirect to login
                timeout = setTimeout(() => {
                    console.warn('[AuthCallback] Timeout — no session detected after 8s');
                    setError('Login timed out. Please try again.');
                    setTimeout(() => navigate('/login', { replace: true }), 1500);
                }, 8000);

            } catch (err) {
                console.error('[AuthCallback] Unexpected error:', err);
                setError('Something went wrong. Redirecting to login...');
                timeout = setTimeout(() => navigate('/login', { replace: true }), 2000);
            }
        };

        handleCallback();

        return () => {
            if (timeout) clearTimeout(timeout);
            if (unsubscribe) unsubscribe.unsubscribe();
        };
    }, [navigate]);

    return (
        <div className="auth-container">
            <div className="auth-card animate-fade-in-up" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
                {error ? (
                    <>
                        <div style={{
                            width: '48px', height: '48px', margin: '0 auto 1.5rem',
                            borderRadius: '50%', background: 'rgba(198, 107, 61, 0.1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '1.5rem'
                        }}>⚠️</div>
                        <h2 style={{ marginBottom: '0.5rem' }}>Authentication Error</h2>
                        <p style={{ color: 'var(--color-text-muted)' }}>{error}</p>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                            Redirecting to login...
                        </p>
                    </>
                ) : (
                    <>
                        <div className="loading-spinner" style={{
                            width: '40px', height: '40px', margin: '0 auto 1.5rem'
                        }}></div>
                        <h2 style={{ marginBottom: '0.5rem' }}>Completing Sign In</h2>
                        <p style={{ color: 'var(--color-text-muted)' }}>
                            Verifying your authentication...
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}

export default AuthCallback;
