import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Utensils, Store, Rocket, Shield, BarChart3, CheckCircle2 } from 'lucide-react';

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
    };

    const features = [
        {
            icon: Store,
            title: 'Tu menú online',
            description: 'Tus clientes ven tu carta desde cualquier dispositivo',
        },
        {
            icon: Rocket,
            title: 'Pedidos en tiempo real',
            description: 'Recibe pedidos directamente en tu cocina',
        },
        {
            icon: Shield,
            title: 'Pagos seguros',
            description: 'Integración con MercadoPago',
        },
        {
            icon: BarChart3,
            title: 'Reportes y analytics',
            description: 'Conoce tus métricas de ventas',
        },
    ];

    const benefits = [
        'Sin comisiones por pedido',
        'Configura tu menú en minutos',
        'Soporte técnico incluido',
        'Actualizaciones gratuitas',
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
            {/* Decorative background elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-orange-200/30 rounded-full blur-3xl" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-red-200/20 rounded-full blur-3xl" />
                <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-amber-200/30 rounded-full blur-3xl" />
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

            <main className="container mx-auto px-6 py-8 md:py-12 relative z-10">
                <div className="max-w-5xl mx-auto">
                    {/* Hero */}
                    <div className="text-center mb-10 md:mb-12">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100/80 backdrop-blur rounded-full text-orange-700 text-sm font-medium mb-4">
                            <Rocket className="h-4 w-4" />
                            Comienza gratis hoy
                        </div>
                        <h1 className="text-3xl md:text-5xl font-bold text-slate-800 mb-4">
                            Lleva tu negocio al{' '}
                            <span className="bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
                                siguiente nivel
                            </span>
                        </h1>
                        <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">
                            Crea tu sistema de pedidos online en minutos. Sin comisiones ocultas,
                            sin complicaciones.
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
                        {/* Left: Features */}
                        <div className="space-y-6">
                            {/* Features Grid */}
                            <div className="grid sm:grid-cols-2 gap-4">
                                {features.map((feature) => (
                                    <div
                                        key={feature.title}
                                        className="p-5 bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 shadow-lg shadow-orange-900/5 hover:shadow-xl transition-shadow cursor-pointer group"
                                    >
                                        <div className="w-11 h-11 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center mb-3 shadow-lg shadow-orange-500/25 group-hover:shadow-orange-500/40 transition-shadow">
                                            <feature.icon className="h-5 w-5 text-white" />
                                        </div>
                                        <h3 className="font-semibold text-slate-800 mb-1">{feature.title}</h3>
                                        <p className="text-slate-500 text-sm">{feature.description}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Benefits List */}
                            <div className="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/50 p-5">
                                <h3 className="font-semibold text-slate-800 mb-4">Incluido en tu cuenta:</h3>
                                <ul className="space-y-3">
                                    {benefits.map((benefit) => (
                                        <li key={benefit} className="flex items-center gap-3 text-slate-600">
                                            <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                                            {benefit}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Right: CTA Box */}
                        <div className="lg:sticky lg:top-8">
                            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl shadow-orange-900/5 border border-white/50 p-8 md:p-10">
                                {/* Price Badge */}
                                <div className="text-center mb-6">
                                    <div className="inline-flex items-baseline gap-1 mb-2">
                                        <span className="text-4xl font-bold text-slate-800">$0</span>
                                        <span className="text-slate-500">/mes para empezar</span>
                                    </div>
                                    <p className="text-sm text-slate-500">Sin tarjeta de crédito requerida</p>
                                </div>

                                {error && (
                                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm mb-6 flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                                        {error}
                                    </div>
                                )}

                                <Button
                                    onClick={handleGoogleSignIn}
                                    disabled={isSigningIn || isAuthenticated}
                                    className="w-full h-14 text-base gap-3 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30 transition-all rounded-xl border-0"
                                >
                                    {isSigningIn ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <svg className="h-5 w-5" viewBox="0 0 24 24">
                                            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                        </svg>
                                    )}
                                    {isSigningIn ? 'Creando cuenta...' : 'Registrarme con Google'}
                                </Button>

                                <p className="text-center text-sm text-slate-500 mt-4">
                                    ¿Ya tienes una cuenta?{' '}
                                    <Link to="/login" className="text-orange-600 hover:text-orange-700 font-medium hover:underline">
                                        Iniciar sesión
                                    </Link>
                                </p>

                                <div className="mt-6 pt-6 border-t border-slate-100">
                                    <p className="text-xs text-slate-400 text-center">
                                        Al registrarte, aceptas nuestros{' '}
                                        <a href="#" className="text-slate-500 hover:text-orange-600 underline">Términos</a>
                                        {' '}y{' '}
                                        <a href="#" className="text-slate-500 hover:text-orange-600 underline">Privacidad</a>
                                    </p>
                                </div>
                            </div>

                            {/* Trust badges */}
                            <div className="mt-6 flex items-center justify-center gap-6 text-slate-400">
                                <div className="flex items-center gap-2 text-xs">
                                    <Shield className="h-4 w-4" />
                                    <span>SSL Seguro</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs">
                                    <CheckCircle2 className="h-4 w-4" />
                                    <span>Sin spam</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Register;
