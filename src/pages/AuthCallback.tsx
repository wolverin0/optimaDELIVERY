import { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Auth callback page that handles the OAuth redirect from Google.
 * Uses raw fetch to avoid supabase-js client hang issues.
 */
const AuthCallback = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [status, setStatus] = useState('Autenticando...');
    const hasProcessed = useRef(false);

    useEffect(() => {
        if (hasProcessed.current) return;

        const processAuth = async () => {
            try {
                // Extract tokens from URL hash
                const hashParams = new URLSearchParams(location.hash.substring(1));
                const accessToken = hashParams.get('access_token');
                const refreshToken = hashParams.get('refresh_token');

                if (!accessToken) {
                    console.error('No access token in URL');
                    navigate('/login?error=no_token', { replace: true });
                    return;
                }

                hasProcessed.current = true;
                setStatus('Verificando perfil...');

                // Decode JWT to get user ID (basic decode, no verification needed for client-side use)
                const payload = JSON.parse(atob(accessToken.split('.')[1]));
                const userId = payload.sub;

                console.error('DEBUG AuthCallback: userId =', userId);
                console.error('DEBUG AuthCallback: email =', payload.email);

                // Store session in localStorage for supabase client
                const session = {
                    access_token: accessToken,
                    refresh_token: refreshToken || '',
                    expires_at: payload.exp,
                    user: { id: userId, email: payload.email }
                };
                localStorage.setItem('sb-nzqnibcdgqjporarwlzx-auth-token', JSON.stringify(session));

                // Check if user has a profile/tenant using raw fetch
                const profileUrl = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/users?id=eq.${userId}&select=tenant_id`;
                console.error('DEBUG AuthCallback: fetching', profileUrl);

                const res = await fetch(profileUrl, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
                    }
                });

                console.error('DEBUG AuthCallback: response status =', res.status);
                const data = res.ok ? await res.json() : [];
                console.error('DEBUG AuthCallback: data =', JSON.stringify(data));

                const profile = data.length > 0 ? data[0] : null;
                console.error('DEBUG AuthCallback: profile =', profile, 'tenant_id =', profile?.tenant_id);

                if (profile?.tenant_id) {
                    console.error('DEBUG: User has tenant, redirecting to dashboard');
                    window.location.href = '/dashboard';
                } else {
                    console.error('DEBUG: No tenant, redirecting to setup');
                    window.location.href = '/register/setup';
                }
            } catch (err) {
                console.error('Auth callback error:', err);
                navigate('/login?error=auth_failed', { replace: true });
            }
        };

        // Process immediately
        processAuth();

        // Safety timeout
        const timeout = setTimeout(() => {
            if (!hasProcessed.current) {
                console.warn('Auth callback timeout, forcing redirect');
                navigate('/login?error=timeout', { replace: true });
            }
        }, 5000);

        return () => clearTimeout(timeout);
    }, [navigate, location.hash]);

    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
                <p className="text-muted-foreground">{status}</p>
            </div>
        </div>
    );
};

export default AuthCallback;
