import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Chrome, Store, Rocket, Shield, BarChart3 } from 'lucide-react';

const Register = () => {
    const { signInWithGoogle, isAuthenticated, isLoading } = useAuth();
    const [isSigningIn, setIsSigningIn] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGoogleSignIn = async () => {
        setIsSigningIn(true);
        setError(null);

        const { error } = await signInWithGoogle();

        if (error) {
            setError('Error al registrarse. Intenta de nuevo.');
            setIsSigningIn(false);
        }
        // On success, user will be redirected to /auth/callback
    };

    const features = [
        {
            icon: Store,
            title: 'Tu menú online',
            description: 'Tus clientes pueden ver tu carta desde cualquier dispositivo',
        },
        {
            icon: Rocket,
            title: 'Pedidos en tiempo real',
            description: 'Recibe pedidos directamente en tu cocina al instante',
        },
        {
            icon: Shield,
            title: 'Pagos seguros',
            description: 'Integración con MercadoPago para cobrar online',
        },
        {
            icon: BarChart3,
            title: 'Reportes y analytics',
            description: 'Conoce tus métricas de ventas y productos más vendidos',
        },
    ];

    return (
        <div className="min-h-screen bg-background">
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

            <main className="container mx-auto px-6 py-12">
                <div className="max-w-4xl mx-auto">
                    {/* Hero */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            Lleva tu negocio al siguiente nivel
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Crea tu sistema de pedidos online en minutos. Sin comisiones ocultas,
                            sin complicaciones.
                        </p>
                    </div>

                    {/* Features Grid */}
                    <div className="grid md:grid-cols-2 gap-6 mb-12">
                        {features.map((feature) => (
                            <div
                                key={feature.title}
                                className="p-6 bg-card rounded-xl border border-border flex gap-4"
                            >
                                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                                    <feature.icon className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg mb-1">{feature.title}</h3>
                                    <p className="text-muted-foreground text-sm">{feature.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* CTA Box */}
                    <div className="bg-card rounded-2xl border border-border p-8 md:p-12 text-center">
                        <h2 className="text-2xl font-bold mb-2">Comienza gratis</h2>
                        <p className="text-muted-foreground mb-8">
                            Regístrate con Google para crear tu menú online
                        </p>

                        {error && (
                            <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm mb-6 max-w-md mx-auto">
                                {error}
                            </div>
                        )}

                        <Button
                            onClick={handleGoogleSignIn}
                            disabled={isSigningIn || isLoading || isAuthenticated}
                            size="lg"
                            className="h-14 px-8 text-lg gap-3"
                        >
                            {isSigningIn ? (
                                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <Chrome className="h-5 w-5" />
                            )}
                            {isSigningIn ? 'Conectando...' : 'Registrarme con Google'}
                        </Button>

                        <p className="text-sm text-muted-foreground mt-6">
                            ¿Ya tienes una cuenta?{' '}
                            <Link to="/login" className="text-primary hover:underline">
                                Iniciar sesión
                            </Link>
                        </p>
                    </div>

                    <p className="text-center text-xs text-muted-foreground mt-8">
                        Al registrarte, aceptas nuestros{' '}
                        <a href="#" className="underline">Términos de Servicio</a>
                        {' '}y{' '}
                        <a href="#" className="underline">Política de Privacidad</a>
                    </p>
                </div>
            </main>
        </div>
    );
};

export default Register;
