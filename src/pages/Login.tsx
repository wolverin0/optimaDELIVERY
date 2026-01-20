import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Chrome } from 'lucide-react';

const Login = () => {
    const { signInWithGoogle, isAuthenticated, isLoading } = useAuth();
    const [isSigningIn, setIsSigningIn] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    // Redirect if already authenticated
    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated && !isLoading) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, isLoading, navigate]);

    if (isAuthenticated && !isLoading) {
        return null; // Don't render anything while redirecting
    }

    const handleGoogleSignIn = async () => {
        setIsSigningIn(true);
        setError(null);

        const { error } = await signInWithGoogle();

        if (error) {
            setError('Error al iniciar sesión. Intenta de nuevo.');
            setIsSigningIn(false);
        }
        // On success, user will be redirected to /auth/callback
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Header */}
            <header className="border-b border-border">
                <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                            <span className="font-bold text-white text-lg">O</span>
                        </div>
                        <span className="font-semibold text-lg">optimaDELIVERY</span>
                    </Link>
                    <Link to="/">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Volver
                        </Button>
                    </Link>
                </div>
            </header>

            {/* Login Form */}
            <main className="flex-1 flex items-center justify-center px-6">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold mb-2">Ingresar</h1>
                        <p className="text-muted-foreground">
                            Accede a tu panel de administración
                        </p>
                    </div>

                    <div className="space-y-4">
                        {error && (
                            <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm">
                                {error}
                            </div>
                        )}

                        <Button
                            onClick={handleGoogleSignIn}
                            disabled={isSigningIn || isLoading}
                            className="w-full h-14 text-lg gap-3"
                            variant="outline"
                        >
                            {isSigningIn ? (
                                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <Chrome className="h-5 w-5" />
                            )}
                            {isSigningIn ? 'Conectando...' : 'Continuar con Google'}
                        </Button>

                        <p className="text-center text-sm text-muted-foreground">
                            ¿No tienes una cuenta?{' '}
                            <Link to="/register" className="text-primary hover:underline">
                                Registrar mi negocio
                            </Link>
                        </p>
                    </div>

                    <p className="text-center text-xs text-muted-foreground mt-8">
                        Al continuar, aceptas nuestros{' '}
                        <a href="#" className="underline">Términos de Servicio</a>
                        {' '}y{' '}
                        <a href="#" className="underline">Política de Privacidad</a>
                    </p>
                </div>
            </main>
        </div>
    );
};

export default Login;
