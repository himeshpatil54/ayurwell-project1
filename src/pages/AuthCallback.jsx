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
                // For magic links or OAuth, Supabase automatically handles the URL hash tokens.
                // We'll first wait a brief moment for it to process
                await new Promise(resolve => setTimeout(resolve, 500));

                // If there's an error in the hash, handle it
                const hashParams = new URLSearchParams(window.location.hash.substring(1));
                if (hashParams.get('error')) {
                    setError(hashParams.get('error_description') || 'Authentication failed');
                    timeout = setTimeout(() => navigate('/login', { replace: true }), 2000);
                    return;
                }

                // Then try to get the session 
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                if (sessionError) {
                    console.error('[AuthCallback] getSession error:', sessionError.message);
                    setError(sessionError.message);
                    timeout = setTimeout(() => navigate('/login', { replace: true }), 2000);
                    return;
                }

                if (session) {
                    console.log('[AuthCallback] Session found immediately:', session.user?.email);
                    // Important: check if there's a specific redirect path in localStorage or fallback to /predict
                    const intendedPath = localStorage.getItem('intended_path') || '/predict';
                    localStorage.removeItem('intended_path');
                    navigate(intendedPath, { replace: true });
                    return;
                }

                // In some OAuth or MagicLink flows, access_token is in the URL but getSession hasn't caught it yet
                if (hashParams.get('access_token')) {
                    console.log('[AuthCallback] Found token in URL, setting session manually...');
                    const { error: setSessionError } = await supabase.auth.setSession({
                        access_token: hashParams.get('access_token'),
                        refresh_token: hashParams.get('refresh_token')
                    });

                    if (setSessionError) {
                        console.error('[AuthCallback] setSession error:', setSessionError.message);
                        setError(setSessionError.message);
                        timeout = setTimeout(() => navigate('/login', { replace: true }), 2000);
                        return;
                    }
                }

                // Session not ready yet — wait for onAuthStateChange
                console.log('[AuthCallback] No session yet, listening for auth state change...');
                const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
                    console.log('[AuthCallback] Auth event:', event);
                    if (event === 'SIGNED_IN' && session) {
                        console.log('[AuthCallback] SIGNED_IN detected:', session.user?.email);
                        const intendedPath = localStorage.getItem('intended_path') || '/predict';
                        localStorage.removeItem('intended_path');
                        navigate(intendedPath, { replace: true });
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
