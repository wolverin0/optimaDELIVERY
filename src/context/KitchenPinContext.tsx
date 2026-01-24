import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

interface KitchenSession {
    tenantId: string;
    tenantSlug: string;
    tenantName: string;
    validatedAt: number;
}

interface KitchenPinContextType {
    session: KitchenSession | null;
    isValidating: boolean;
    error: string | null;
    validatePin: (slug: string, pin: string) => Promise<boolean>;
    logout: () => void;
}

const KitchenPinContext = createContext<KitchenPinContextType | undefined>(undefined);

const STORAGE_KEY = 'kitchen_pin_session';
const SESSION_DURATION = 12 * 60 * 60 * 1000; // 12 hours

export const KitchenPinProvider = ({ children }: { children: ReactNode }) => {
    const [session, setSession] = useState<KitchenSession | null>(null);
    const [isValidating, setIsValidating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load session from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed: KitchenSession = JSON.parse(stored);
                // Check if session is still valid (12 hours)
                if (Date.now() - parsed.validatedAt < SESSION_DURATION) {
                    setSession(parsed);
                } else {
                    localStorage.removeItem(STORAGE_KEY);
                }
            }
        } catch (e) {
            localStorage.removeItem(STORAGE_KEY);
        }
    }, []);

    const validatePin = useCallback(async (slug: string, pin: string): Promise<boolean> => {
        setIsValidating(true);
        setError(null);

        try {
            // First, check rate limit status
            const rateLimitRes = await fetch(
                `${SUPABASE_URL}/rest/v1/rpc/check_kitchen_pin_rate_limit`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'apikey': SUPABASE_ANON_KEY,
                    },
                    body: JSON.stringify({ p_slug: slug }),
                }
            );

            if (rateLimitRes.ok) {
                const rateLimitData = await rateLimitRes.json();
                if (rateLimitData?.rate_limited) {
                    const minutes = Math.ceil(rateLimitData.retry_after_seconds / 60);
                    setError(`Demasiados intentos fallidos. Espera ${minutes} minuto${minutes > 1 ? 's' : ''}.`);
                    return false;
                }
            }

            // Call the validate_kitchen_pin function via RPC
            const res = await fetch(
                `${SUPABASE_URL}/rest/v1/rpc/validate_kitchen_pin`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'apikey': SUPABASE_ANON_KEY,
                    },
                    body: JSON.stringify({
                        p_slug: slug,
                        p_pin: pin,
                    }),
                }
            );

            if (!res.ok) {
                throw new Error('Error de conexión');
            }

            const tenantId = await res.json();

            if (!tenantId) {
                // Check if rate limited after this failed attempt
                const postCheckRes = await fetch(
                    `${SUPABASE_URL}/rest/v1/rpc/check_kitchen_pin_rate_limit`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'apikey': SUPABASE_ANON_KEY,
                        },
                        body: JSON.stringify({ p_slug: slug }),
                    }
                );
                if (postCheckRes.ok) {
                    const postCheckData = await postCheckRes.json();
                    if (postCheckData?.attempts_remaining > 0) {
                        setError(`PIN incorrecto. ${postCheckData.attempts_remaining} intento${postCheckData.attempts_remaining > 1 ? 's' : ''} restante${postCheckData.attempts_remaining > 1 ? 's' : ''}.`);
                    } else {
                        setError('PIN incorrecto. Has sido bloqueado por 15 minutos.');
                    }
                } else {
                    setError('PIN incorrecto');
                }
                return false;
            }

            // Fetch tenant name for display
            const tenantRes = await fetch(
                `${SUPABASE_URL}/rest/v1/tenants?id=eq.${tenantId}&select=name,slug`,
                {
                    headers: {
                        'apikey': SUPABASE_ANON_KEY,
                    },
                }
            );

            const tenantData = await tenantRes.json();
            const tenant = tenantData[0];

            if (!tenant) {
                setError('Negocio no encontrado');
                return false;
            }

            const newSession: KitchenSession = {
                tenantId,
                tenantSlug: tenant.slug,
                tenantName: tenant.name,
                validatedAt: Date.now(),
            };

            setSession(newSession);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newSession));
            return true;
        } catch (err) {
            if (import.meta.env.DEV) console.error('PIN validation error:', err);
            setError('Error al validar PIN');
            return false;
        } finally {
            setIsValidating(false);
        }
    }, []);

    const logout = useCallback(() => {
        setSession(null);
        localStorage.removeItem(STORAGE_KEY);
    }, []);

    return (
        <KitchenPinContext.Provider value={{
            session,
            isValidating,
            error,
            validatePin,
            logout,
        }}>
            {children}
        </KitchenPinContext.Provider>
    );
};

export const useKitchenPin = () => {
    const context = useContext(KitchenPinContext);
    if (!context) {
        throw new Error('useKitchenPin must be used within a KitchenPinProvider');
    }
    return context;
};
