// Authentication Context - Manages user authentication state
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isDemoMode, demoStorage } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [pendingAuth, setPendingAuth] = useState(null);

    // Check for existing session on mount
    useEffect(() => {
        if (isDemoMode) {
            const savedUser = demoStorage.getUser();
            if (savedUser) {
                setUser(savedUser);
            }
            setLoading(false);
        } else {
            // Check Supabase session
            supabase.auth.getSession().then(({ data: { session } }) => {
                setUser(session?.user ?? null);
                setLoading(false);
            });

            // Listen for auth changes
            const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
                setUser(session?.user ?? null);
            });

            return () => subscription.unsubscribe();
        }
    }, []);

    // Send OTP (Email only)
    const sendOTP = async ({ email, fullName }) => {
        try {
            if (isDemoMode) {
                // Demo mode - just save pending auth
                setPendingAuth({ email, fullName, type: 'email' });
                return { success: true, message: 'Demo OTP sent. Use 123456 to verify.' };
            }

            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: { data: { full_name: fullName } }
            });
            if (error) throw error;
            setPendingAuth({ email, fullName, type: 'email' });
            return { success: true, message: 'OTP sent to your email' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    };

    // Sign in with Google
    const signInWithGoogle = async () => {
        try {
            if (isDemoMode) {
                // Demo mode - simulate Google sign in
                const demoUser = {
                    id: 'demo-google-user-' + Date.now(),
                    email: 'demo.google@example.com',
                    fullName: 'Demo Google User',
                    provider: 'google',
                    createdAt: new Date().toISOString()
                };
                demoStorage.setUser(demoUser);
                setUser(demoUser);
                return { success: true };
            }

            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin + '/dashboard'
                }
            });

            if (error) throw error;
            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        }
    };

    // Verify OTP
    const verifyOTP = async (otp) => {
        try {
            if (isDemoMode) {
                // Demo mode - accept 123456
                if (otp === '123456') {
                    const demoUser = {
                        id: 'demo-user-' + Date.now(),
                        email: pendingAuth?.email || 'demo@example.com',
                        fullName: pendingAuth?.fullName || 'Demo User',
                        createdAt: new Date().toISOString()
                    };
                    demoStorage.setUser(demoUser);
                    setUser(demoUser);
                    setPendingAuth(null);
                    return { success: true };
                } else {
                    return { success: false, message: 'Invalid OTP. Demo code is 123456' };
                }
            }

            // Real Supabase verification
            const { error } = await supabase.auth.verifyOtp({
                email: pendingAuth.email,
                token: otp,
                type: 'email'
            });

            if (error) throw error;

            setPendingAuth(null);
            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        }
    };

    // Sign out
    const signOut = async () => {
        if (isDemoMode) {
            demoStorage.clearUser();
            demoStorage.clearChatHistory();
            setUser(null);
        } else {
            await supabase.auth.signOut();
        }
    };

    // Update user profile
    const updateProfile = async (updates) => {
        if (isDemoMode) {
            const updatedUser = { ...user, ...updates };
            demoStorage.setUser(updatedUser);
            setUser(updatedUser);
            return { success: true };
        }

        // Real Supabase update
        const { error } = await supabase
            .from('profiles')
            .upsert({ id: user.id, ...updates });

        if (error) {
            return { success: false, message: error.message };
        }

        setUser({ ...user, ...updates });
        return { success: true };
    };

    const value = {
        user,
        loading,
        pendingAuth,
        isDemoMode,
        sendOTP,
        signInWithGoogle,
        verifyOTP,
        signOut,
        updateProfile
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export default AuthContext;
