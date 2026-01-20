import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { Session, User as SupabaseUser, AuthError } from '@supabase/supabase-js';
import { supabase, User } from '@/lib/supabase';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const STORAGE_KEY = 'sb-nzqnibcdgqjporarwlzx-auth-token';

interface AuthContextType {
    session: Session | null;
    user: SupabaseUser | null;
    profile: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    signInWithGoogle: () => Promise<{ error: AuthError | null }>;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Read session from localStorage (no supabase-js dependency)
function getStoredSession(): { accessToken: string; userId: string; email: string } | null {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return null;
        const parsed = JSON.parse(stored);
        const accessToken = parsed.access_token || parsed.accessToken;
        const userId = parsed.user?.id;
        const email = parsed.user?.email;
        if (accessToken && userId) {
            return { accessToken, userId, email };
        }
        return null;
    } catch {
        return null;
    }
}

// Fetch profile using raw fetch (no supabase-js dependency)
async function fetchProfileRaw(userId: string, accessToken: string): Promise<User | null> {
    try {
        const res = await fetch(
            `${SUPABASE_URL}/rest/v1/users?id=eq.${userId}&select=*`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'apikey': SUPABASE_ANON_KEY
                }
            }
        );
        if (!res.ok) return null;
        const data = await res.json();
        return data.length > 0 ? data[0] : null;
    } catch (err) {
        console.error('Error fetching profile:', err);
        return null;
    }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<SupabaseUser | null>(null);
    const [profile, setProfile] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const refreshProfile = useCallback(async () => {
        const stored = getStoredSession();
        if (stored) {
            const profileData = await fetchProfileRaw(stored.userId, stored.accessToken);
            setProfile(profileData);
        }
    }, []);

    useEffect(() => {
        const initAuth = async () => {
            // Read session from localStorage (bypasses supabase-js hang)
            const stored = getStoredSession();

            if (stored) {
                // Set session in Supabase client for authenticated requests
                try {
                    // Get the full stored session for refresh token
                    const fullStored = localStorage.getItem(STORAGE_KEY);
                    if (fullStored) {
                        const parsed = JSON.parse(fullStored);
                        await supabase.auth.setSession({
                            access_token: parsed.access_token || parsed.accessToken,
                            refresh_token: parsed.refresh_token || parsed.refreshToken || '',
                        });
                    }
                } catch (err) {
                    console.warn('Could not set supabase session:', err);
                }

                // Create minimal session and user objects
                const minimalSession = {
                    access_token: stored.accessToken,
                    user: { id: stored.userId, email: stored.email }
                } as Session;

                const minimalUser = {
                    id: stored.userId,
                    email: stored.email,
                    user_metadata: {}
                } as SupabaseUser;

                setSession(minimalSession);
                setUser(minimalUser);

                // Fetch profile
                const profileData = await fetchProfileRaw(stored.userId, stored.accessToken);
                setProfile(profileData);
            }

            setIsLoading(false);
        };

        initAuth();

        // Still listen for auth changes for new logins (but don't block on it)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
                setSession(session);
                setUser(session.user);
                const profileData = await fetchProfileRaw(session.user.id, session.access_token);
                setProfile(profileData);
            } else if (event === 'SIGNED_OUT') {
                setSession(null);
                setUser(null);
                setProfile(null);
                localStorage.removeItem(STORAGE_KEY);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const signInWithGoogle = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
                queryParams: {
                    access_type: 'offline',
                    prompt: 'consent',
                },
            },
        });
        return { error };
    };

    const signOut = async () => {
        localStorage.removeItem(STORAGE_KEY);
        setSession(null);
        setUser(null);
        setProfile(null);
        // Try to sign out from supabase too (but don't wait for it)
        supabase.auth.signOut().catch(() => { });
    };

    return (
        <AuthContext.Provider
            value={{
                session,
                user,
                profile,
                isLoading,
                isAuthenticated: !!session && !!user,
                signInWithGoogle,
                signOut,
                refreshProfile,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export { AuthContext };
