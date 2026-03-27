// Authentication Context - Manages user authentication state
// Updated: Magic Link authentication (no OTP)
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isDemoMode, demoStorage } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

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
            }).catch(() => {
                setLoading(false);
            });

            // Listen for auth changes (handles magic link & OAuth callbacks)
            const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
                console.log('[Auth] onAuthStateChange:', event, session?.user?.email || 'no user');
                setUser(session?.user ?? null);
                // Ensure loading is cleared when auth state resolves (covers new user PKCE edge case)
                setLoading(false);
            });

            return () => subscription.unsubscribe();
        }
    }, []);

    // Send Magic Link
    const sendMagicLink = async ({ email }) => {
        try {
            if (isDemoMode) {
                // Demo mode - simulate login directly
                const demoUser = {
                    id: 'demo-user-' + Date.now(),
                    email: email || 'demo@example.com',
                    fullName: email?.split('@')[0] || 'Demo User',
                    createdAt: new Date().toISOString()
                };
                demoStorage.setUser(demoUser);
                setUser(demoUser);
                return { success: true, message: 'Demo mode: Logged in automatically.' };
            }

            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    emailRedirectTo: window.location.origin + '/auth/callback'
                }
            });
            if (error) throw error;
            return { success: true, message: 'A secure login link has been sent to your email. Please click the link in your email to log in.' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    };

    // Sign in with Google
    const signInWithGoogle = async () => {
        try {
            if (isDemoMode) {
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

            const redirectUrl = `${window.location.origin}/auth/callback`;
            console.log('[Auth] Starting Google OAuth, redirectTo:', redirectUrl);

            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: redirectUrl,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    }
                }
            });

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('[Auth] Google sign-in error:', error);
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
        isDemoMode,
        sendMagicLink,
        signInWithGoogle,
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
