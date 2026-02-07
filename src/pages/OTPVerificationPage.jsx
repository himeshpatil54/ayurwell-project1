// OTP Verification Page
import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function OTPVerificationPage() {
    const navigate = useNavigate();
    const { verifyOTP, pendingAuth, sendOTP, isDemoMode } = useAuth();

    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [resendTimer, setResendTimer] = useState(60);

    const inputRefs = useRef([]);

    // Redirect if no pending auth
    useEffect(() => {
        if (!pendingAuth) {
            navigate('/login');
        }
    }, [pendingAuth, navigate]);

    // Resend countdown
    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendTimer]);

    // Auto-focus first input
    useEffect(() => {
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);

    const handleChange = (index, value) => {
        // Only allow digits
        if (value && !/^\d$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        setError('');

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-submit when complete
        if (newOtp.every(digit => digit !== '') && value) {
            handleVerify(newOtp.join(''));
        }
    };

    const handleKeyDown = (index, e) => {
        // Handle backspace
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6);
        if (/^\d+$/.test(pastedData)) {
            const newOtp = pastedData.split('').concat(Array(6 - pastedData.length).fill(''));
            setOtp(newOtp);
            if (pastedData.length === 6) {
                handleVerify(pastedData);
            }
        }
    };

    const handleVerify = async (otpCode) => {
        setLoading(true);
        setError('');

        const result = await verifyOTP(otpCode || otp.join(''));

        setLoading(false);

        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.message || 'Invalid OTP');
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        }
    };

    const handleResend = async () => {
        if (resendTimer > 0) return;

        setResendTimer(60);
        const result = await sendOTP(pendingAuth);

        if (!result.success) {
            setError(result.message || 'Failed to resend OTP');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card animate-fade-in-up">
                <div className="auth-header">
                    <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                        ← Back to login
                    </Link>
                    <h1>Verify OTP</h1>
                    <p>
                        Enter the 6-digit code sent to<br />
                        <strong>{pendingAuth?.email || pendingAuth?.phone || 'your contact'}</strong>
                    </p>
                </div>

                {isDemoMode && (
                    <div style={{
                        padding: '0.75rem 1rem',
                        background: 'rgba(93, 110, 78, 0.1)',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: '1rem',
                        fontSize: '0.875rem',
                        textAlign: 'center'
                    }}>
                        🌿 Demo OTP: <strong>123456</strong>
                    </div>
                )}

                {error && (
                    <div style={{
                        padding: '0.75rem 1rem',
                        background: 'rgba(198, 107, 61, 0.1)',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: '1rem',
                        color: 'var(--color-secondary)',
                        fontSize: '0.875rem',
                        textAlign: 'center'
                    }}>
                        {error}
                    </div>
                )}

                <div className="otp-container" onPaste={handlePaste}>
                    {otp.map((digit, index) => (
                        <input
                            key={index}
                            ref={el => inputRefs.current[index] = el}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            className="otp-input"
                            value={digit}
                            onChange={(e) => handleChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            disabled={loading}
                        />
                    ))}
                </div>

                <button
                    onClick={() => handleVerify()}
                    className="btn btn-primary btn-lg"
                    style={{ width: '100%' }}
                    disabled={loading || otp.some(d => !d)}
                >
                    {loading ? (
                        <span className="loading-spinner" style={{ width: '20px', height: '20px' }}></span>
                    ) : (
                        'Verify'
                    )}
                </button>

                <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                    Didn't receive the code?{' '}
                    {resendTimer > 0 ? (
                        <span>Resend in {resendTimer}s</span>
                    ) : (
                        <button
                            onClick={handleResend}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--color-primary)',
                                cursor: 'pointer',
                                textDecoration: 'underline'
                            }}
                        >
                            Resend OTP
                        </button>
                    )}
                </p>
            </div>
        </div>
    );
}

export default OTPVerificationPage;
