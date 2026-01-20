import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle2, XCircle, Utensils, Users, ArrowRight, LogIn } from 'lucide-react';
import { getInvitationByToken, acceptTeamInvitation } from '@/lib/invitations';
import { TeamInvitation } from '@/lib/supabase';

const ROLE_DESCRIPTIONS: Record<string, string> = {
    admin: 'Tendrás acceso completo al panel de administración',
    staff: 'Tendrás acceso al panel de cocina y pedidos',
};

const JoinTeam = () => {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();
    const { signInWithGoogle, isAuthenticated, isLoading: authLoading, user } = useAuth();

    const [isLoading, setIsLoading] = useState(true);
    const [invitation, setInvitation] = useState<TeamInvitation | null>(null);
    const [tenantName, setTenantName] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isAccepting, setIsAccepting] = useState(false);
    const [isSigningIn, setIsSigningIn] = useState(false);
    const [acceptResult, setAcceptResult] = useState<{ success: boolean; message: string } | null>(null);

    // Fetch invitation details
    useEffect(() => {
        const fetchInvitation = async () => {
            if (!token) {
                setError('Enlace de invitación inválido');
                setIsLoading(false);
                return;
            }

            const result = await getInvitationByToken(token);

            if (result.error || !result.invitation) {
                setError(result.error || 'Invitación no encontrada');
            } else {
                setInvitation(result.invitation);
                setTenantName(result.tenantName);
            }
            setIsLoading(false);
        };

        fetchInvitation();
    }, [token]);

    // Auto-accept when user is authenticated
    useEffect(() => {
        if (isAuthenticated && invitation && !acceptResult && !isAccepting) {
            handleAcceptInvitation();
        }
    }, [isAuthenticated, invitation]);

    const handleSignIn = async () => {
        setIsSigningIn(true);
        const { error } = await signInWithGoogle();
        if (error) {
            setError('Error al iniciar sesión. Intenta de nuevo.');
            setIsSigningIn(false);
        }
        // After sign in, the useEffect will trigger acceptance
    };

    const handleAcceptInvitation = async () => {
        if (!token) return;

        setIsAccepting(true);
        const result = await acceptTeamInvitation(token);

        setAcceptResult({
            success: result.success,
            message: result.message || (result.success ? 'Te has unido al equipo' : 'Error al aceptar')
        });

        if (result.success) {
            // Redirect to dashboard after a short delay
            setTimeout(() => {
                navigate('/dashboard');
            }, 2000);
        }
        setIsAccepting(false);
    };

    // Loading state
    if (isLoading || authLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
        );
    }

    // Error state
    if (error && !invitation) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 flex flex-col">
                <Header />
                <main className="flex-1 flex items-center justify-center px-6 py-12">
                    <Card className="w-full max-w-md">
                        <CardContent className="pt-6">
                            <div className="text-center space-y-4">
                                <div className="w-16 h-16 mx-auto rounded-full bg-red-100 flex items-center justify-center">
                                    <XCircle className="w-8 h-8 text-red-600" />
                                </div>
                                <h2 className="text-xl font-semibold text-slate-800">Invitación no válida</h2>
                                <p className="text-slate-600">{error}</p>
                                <Link to="/">
                                    <Button variant="outline" className="mt-4">
                                        Ir al inicio
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </main>
            </div>
        );
    }

    // Success state
    if (acceptResult?.success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 flex flex-col">
                <Header />
                <main className="flex-1 flex items-center justify-center px-6 py-12">
                    <Card className="w-full max-w-md">
                        <CardContent className="pt-6">
                            <div className="text-center space-y-4">
                                <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center">
                                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                                </div>
                                <h2 className="text-xl font-semibold text-slate-800">Te has unido al equipo</h2>
                                <p className="text-slate-600">
                                    Ahora eres parte de <span className="font-medium">{tenantName}</span>
                                </p>
                                <p className="text-sm text-slate-500">Redirigiendo al dashboard...</p>
                            </div>
                        </CardContent>
                    </Card>
                </main>
            </div>
        );
    }

    // Accepting state
    if (isAccepting) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 flex flex-col">
                <Header />
                <main className="flex-1 flex items-center justify-center px-6 py-12">
                    <Card className="w-full max-w-md">
                        <CardContent className="pt-6">
                            <div className="text-center space-y-4">
                                <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto" />
                                <h2 className="text-xl font-semibold text-slate-800">Uniéndote al equipo...</h2>
                            </div>
                        </CardContent>
                    </Card>
                </main>
            </div>
        );
    }

    // Error accepting
    if (acceptResult && !acceptResult.success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 flex flex-col">
                <Header />
                <main className="flex-1 flex items-center justify-center px-6 py-12">
                    <Card className="w-full max-w-md">
                        <CardContent className="pt-6">
                            <div className="text-center space-y-4">
                                <div className="w-16 h-16 mx-auto rounded-full bg-red-100 flex items-center justify-center">
                                    <XCircle className="w-8 h-8 text-red-600" />
                                </div>
                                <h2 className="text-xl font-semibold text-slate-800">No se pudo unir</h2>
                                <p className="text-slate-600">{acceptResult.message}</p>
                                <Link to="/">
                                    <Button variant="outline" className="mt-4">
                                        Ir al inicio
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </main>
            </div>
        );
    }

    // Main invitation view
    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 flex flex-col">
            {/* Decorative background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-orange-200/30 rounded-full blur-3xl" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-red-200/20 rounded-full blur-3xl" />
            </div>

            <Header />

            <main className="flex-1 flex items-center justify-center px-6 py-12 relative z-10">
                <Card className="w-full max-w-md bg-white/70 backdrop-blur-xl border-white/50 shadow-xl">
                    <CardHeader className="text-center pb-2">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
                            <Users className="w-8 h-8 text-white" />
                        </div>
                        <CardTitle className="text-2xl">Únete al equipo</CardTitle>
                        <CardDescription className="text-base mt-2">
                            Has sido invitado a unirte a
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Team info */}
                        <div className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-orange-100">
                            <p className="text-2xl font-bold text-slate-800 text-center">{tenantName}</p>
                            {invitation && (
                                <p className="text-center text-sm text-slate-600 mt-2">
                                    Rol: <span className="font-medium capitalize">{invitation.role}</span>
                                </p>
                            )}
                        </div>

                        {/* Role description */}
                        {invitation && (
                            <p className="text-sm text-slate-600 text-center">
                                {ROLE_DESCRIPTIONS[invitation.role] || 'Tendrás acceso al sistema'}
                            </p>
                        )}

                        {/* Sign in button */}
                        {!isAuthenticated ? (
                            <div className="space-y-4">
                                <Button
                                    onClick={handleSignIn}
                                    disabled={isSigningIn}
                                    className="w-full h-14 text-base gap-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm hover:shadow transition-all rounded-xl"
                                    variant="outline"
                                >
                                    {isSigningIn ? (
                                        <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
                                    ) : (
                                        <svg className="h-5 w-5" viewBox="0 0 24 24">
                                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                        </svg>
                                    )}
                                    {isSigningIn ? 'Conectando...' : 'Continuar con Google'}
                                </Button>
                                <p className="text-xs text-center text-slate-500">
                                    Inicia sesión para aceptar la invitación
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-700 text-center">
                                    Conectado como <span className="font-medium">{user?.email}</span>
                                </div>
                                <Button
                                    onClick={handleAcceptInvitation}
                                    disabled={isAccepting}
                                    className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-xl"
                                >
                                    {isAccepting ? (
                                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                    ) : (
                                        <ArrowRight className="w-5 h-5 mr-2" />
                                    )}
                                    Aceptar invitación
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    );
};

// Header component
const Header = () => (
    <header className="relative z-10">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/25 group-hover:shadow-orange-500/40 transition-shadow">
                    <Utensils className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-xl text-slate-800">optimaDELIVERY</span>
            </Link>
        </div>
    </header>
);

export default JoinTeam;
