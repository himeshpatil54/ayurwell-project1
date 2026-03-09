// Authentication Page — Magic Link Login
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function AuthPage() {
    const { sendMagicLink, signInWithGoogle, isDemoMode } = useAuth();

    const [email, setEmail] = useState('');
    const [consent, setConsent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        if (!email.trim()) {
            setError('Please enter your email address');
            return;
        }

        if (!consent) {
            setError('Please accept the health data consent');
            return;
        }

        setLoading(true);
        const result = await sendMagicLink({ email });
        setLoading(false);

        if (result.success) {
            setSuccessMessage(result.message);
        } else {
            setError(result.message || 'Failed to send login link');
        }
    };

    const handleGoogleSignIn = async () => {
        if (!consent) {
            setError('Please accept the health data consent first');
            return;
        }

        setGoogleLoading(true);
        setError('');

        const result = await signInWithGoogle();
        setGoogleLoading(false);

        if (!result.success) {
            setError(result.message || 'Google sign-in failed');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card animate-fade-in-up">
                <div className="auth-header">
                    <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--color-primary)' }}>
                        <svg viewBox="0 0 40 40" width="32" height="32" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="20" cy="20" r="18" fill="#FAF7F2" stroke="#5D6E4E" strokeWidth="2" />
                            <circle cx="20" cy="20" r="4" fill="#D4A574" />
                            <ellipse cx="20" cy="12" rx="3" ry="6" fill="#5D6E4E" />
                            <ellipse cx="20" cy="12" rx="3" ry="6" fill="#5D6E4E" transform="rotate(60 20 20)" />
                            <ellipse cx="20" cy="12" rx="3" ry="6" fill="#5D6E4E" transform="rotate(120 20 20)" />
                        </svg>
                        <span className="font-serif" style={{ fontSize: '1.25rem' }}>AYURWELL</span>
                    </Link>
                    <h1>Welcome</h1>
                    <p>Sign in to start your wellness journey</p>
                </div>

                {isDemoMode && (
                    <div style={{
                        padding: '0.75rem 1rem',
                        background: 'rgba(93, 110, 78, 0.1)',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: '1.5rem',
                        fontSize: '0.875rem'
                    }}>
                        🌿 <strong>Demo Mode:</strong> Enter any email to log in instantly.
                    </div>
                )}

                {error && (
                    <div style={{
                        padding: '0.75rem 1rem',
                        background: 'rgba(198, 107, 61, 0.1)',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: '1rem',
                        color: 'var(--color-secondary)',
                        fontSize: '0.875rem'
                    }}>
                        {error}
                    </div>
                )}

                {successMessage && (
                    <div style={{
                        padding: '1.25rem 1rem',
                        background: 'rgba(93, 110, 78, 0.1)',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: '1rem',
                        color: 'var(--color-primary-dark)',
                        fontSize: '0.95rem',
                        lineHeight: 1.6,
                        textAlign: 'center'
                    }}>
                        ✉️ {successMessage}
                    </div>
                )}

                {!successMessage && (
                    <>
                        {/* Google Sign In Button */}
                        <button
                            type="button"
                            onClick={handleGoogleSignIn}
                            className="btn btn-google"
                            style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.75rem',
                                padding: '0.875rem 1.5rem',
                                background: 'white',
                                border: '1px solid var(--color-border)',
                                borderRadius: 'var(--radius-md)',
                                fontSize: '1rem',
                                fontWeight: 500,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                            disabled={googleLoading}
                        >
                            {googleLoading ? (
                                <span className="loading-spinner" style={{ width: '20px', height: '20px' }}></span>
                            ) : (
                                <>
                                    <svg width="20" height="20" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                    Continue with Google
                                </>
                            )}
                        </button>

                        {/* Divider */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            margin: '1.5rem 0',
                            gap: '1rem'
                        }}>
                            <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }}></div>
                            <span style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>or continue with email</span>
                            <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }}></div>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    className="form-input"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-checkbox">
                                    <input
                                        type="checkbox"
                                        name="consent"
                                        checked={consent}
                                        onChange={(e) => { setConsent(e.target.checked); setError(''); }}
                                    />
                                    <span>
                                        I consent to sharing my health-related information for
                                        personalized Ayurvedic wellness guidance. I understand this is
                                        for educational purposes only and not medical advice.
                                    </span>
                                </label>
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary btn-lg"
                                style={{ width: '100%' }}
                                disabled={loading}
                            >
                                {loading ? (
                                    <span className="loading-spinner" style={{ width: '20px', height: '20px' }}></span>
                                ) : (
                                    'Send Login Link'
                                )}
                            </button>
                        </form>
                    </>
                )}

                <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                    By continuing, you agree to our{' '}
                    <Link to="/privacy" style={{ color: 'var(--color-primary)' }}>Privacy Policy</Link>
                </p>
            </div>
        </div>
    );
}

export default AuthPage;
