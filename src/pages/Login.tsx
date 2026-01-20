import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Utensils, ChefHat, Clock, Star } from 'lucide-react';

const Login = () => {
    const { signInWithGoogle, isAuthenticated, isLoading } = useAuth();
    const [isSigningIn, setIsSigningIn] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated && !isLoading) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, isLoading, navigate]);

    if (isAuthenticated && !isLoading) {
        return null;
    }

    const handleGoogleSignIn = async () => {
        setIsSigningIn(true);
        setError(null);

        const { error } = await signInWithGoogle();

        if (error) {
            setError('Error al iniciar sesión. Intenta de nuevo.');
            setIsSigningIn(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 flex flex-col">
            {/* Decorative background elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-orange-200/30 rounded-full blur-3xl" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-red-200/20 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-100/40 rounded-full blur-3xl" />
            </div>

            {/* Header */}
            <header className="relative z-10">
                <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/25 group-hover:shadow-orange-500/40 transition-shadow">
                            <Utensils className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-bold text-xl text-slate-800">optimaDELIVERY</span>
                    </Link>
                    <Link to="/">
                        <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-800 hover:bg-white/50">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Volver
                        </Button>
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center px-6 py-12 relative z-10">
                <div className="w-full max-w-md">
                    {/* Login Card */}
                    <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl shadow-orange-900/5 border border-white/50 p-8 md:p-10">
                        {/* Icon */}
                        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
                            <ChefHat className="h-8 w-8 text-white" />
                        </div>

                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-slate-800 mb-2">Bienvenido de vuelta</h1>
                            <p className="text-slate-500">
                                Accede a tu panel de administración
                            </p>
                        </div>

                        <div className="space-y-4">
                            {error && (
                                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                                    {error}
                                </div>
                            )}

                            <Button
                                onClick={handleGoogleSignIn}
                                disabled={isSigningIn}
                                className="w-full h-14 text-base gap-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm hover:shadow transition-all rounded-xl"
                                variant="outline"
                            >
                                {isSigningIn ? (
                                    <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
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

                            <p className="text-center text-sm text-slate-500 pt-2">
                                ¿No tienes una cuenta?{' '}
                                <Link to="/register" className="text-orange-600 hover:text-orange-700 font-medium hover:underline">
                                    Registrar mi negocio
                                </Link>
                            </p>
                        </div>
                    </div>

                    {/* Features highlight */}
                    <div className="mt-8 grid grid-cols-3 gap-4">
                        {[
                            { icon: Clock, label: 'Rápido' },
                            { icon: Star, label: 'Simple' },
                            { icon: ChefHat, label: 'Efectivo' },
                        ].map((item) => (
                            <div key={item.label} className="text-center">
                                <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-white/60 backdrop-blur border border-white/50 flex items-center justify-center">
                                    <item.icon className="h-5 w-5 text-orange-500" />
                                </div>
                                <span className="text-xs text-slate-500 font-medium">{item.label}</span>
                            </div>
                        ))}
                    </div>

                    <p className="text-center text-xs text-slate-400 mt-8">
                        Al continuar, aceptas nuestros{' '}
                        <a href="#" className="text-slate-500 hover:text-orange-600 underline">Términos de Servicio</a>
                        {' '}y{' '}
                        <a href="#" className="text-slate-500 hover:text-orange-600 underline">Política de Privacidad</a>
                    </p>
                </div>
            </main>
        </div>
    );
};

export default Login;
