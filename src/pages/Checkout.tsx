import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useTenant } from '@/context/TenantContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Check, Loader2, ArrowLeft, Sparkles, CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Checkout = () => {
    const { profile } = useAuth();
    const { tenant } = useTenant();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [searchParams] = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('monthly');

    const paymentStatus = searchParams.get('payment');

    useEffect(() => {
        if (paymentStatus === 'success') {
            toast({
                title: '¡Pago exitoso!',
                description: 'Tu suscripción ha sido activada. Redirigiendo...',
            });
            setTimeout(() => navigate('/dashboard'), 2000);
        } else if (paymentStatus === 'failure') {
            toast({
                title: 'Pago rechazado',
                description: 'Hubo un problema con el pago. Intenta nuevamente.',
                variant: 'destructive',
            });
        }
    }, [paymentStatus, navigate, toast]);

    const handlePayment = async (planType: 'monthly' | 'annual') => {
        if (!tenant || !profile) {
            toast({
                title: 'Error',
                description: 'No se pudo obtener la información del negocio.',
                variant: 'destructive',
            });
            return;
        }

        setIsLoading(true);
        try {
            // Get fresh auth token - refreshSession ensures we have a valid token
            const { supabase } = await import('@/lib/supabase');

            // First try to refresh the session to ensure token is valid
            const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();

            // If refresh fails, try getting existing session
            let session = refreshData?.session;
            if (!session) {
                const { data: { session: existingSession } } = await supabase.auth.getSession();
                session = existingSession;
            }

            if (!session?.access_token) {
                // Session expired, redirect to login
                navigate('/login?redirect=/checkout');
                throw new Error('Sesión expirada. Por favor inicia sesión nuevamente.');
            }

            const response = await fetch(
                `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-subscription-payment`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${session.access_token}`,
                    },
                    body: JSON.stringify({
                        tenantId: tenant.id,
                        planType,
                        email: profile.email,
                        name: tenant.name,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || 'Error al crear el pago');
            }

            // Redirect to MercadoPago checkout
            window.location.href = data.checkoutUrl;

        } catch (err) {
            if (import.meta.env.DEV) console.error('Payment error:', err);
            toast({
                title: 'Error al procesar el pago',
                description: err instanceof Error ? err.message : 'Intenta nuevamente',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const plans = [
        {
            id: 'monthly' as const,
            name: 'Pago Mensual',
            price: '25.000',
            period: '/mes',
            total: '$25.000 ARS',
            description: 'Sin compromiso. Cancelá cuando quieras.',
            features: [
                'Menú Digital QR Ilimitado',
                'Pedidos por WhatsApp',
                'Cobros con MercadoPago',
                'Panel de Cocina',
                '5 Plantillas Premium',
                'Soporte por WhatsApp',
            ],
        },
        {
            id: 'annual' as const,
            name: 'Pago Anual',
            price: '20.000',
            period: '/mes',
            total: '$240.000 ARS (pago único)',
            description: 'Ahorrá $60.000 al año',
            badge: 'AHORRÁ 20%',
            features: [
                'Todo del plan Mensual',
                '20% de descuento permanente',
                'Recordatorio 30 días antes de renovar',
                'Estadísticas avanzadas',
                'Soporte premium prioritario',
            ],
            recommended: true,
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
            {/* Decorative background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-orange-200/30 rounded-full blur-3xl" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-red-200/20 rounded-full blur-3xl" />
            </div>

            {/* Header */}
            <header className="relative z-10 border-b border-orange-100 bg-white/80 backdrop-blur-xl">
                <div className="container mx-auto px-6 py-4">
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/dashboard')}
                        className="gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Volver al Dashboard
                    </Button>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative z-10 container mx-auto px-6 py-12 max-w-5xl">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
                        Elegí tu forma de pago
                    </h1>
                    <p className="text-xl text-slate-600">
                        Todas las funcionalidades incluidas. Solo elegí cómo querés pagar.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {plans.map((plan) => (
                        <Card
                            key={plan.id}
                            className={`relative transition-all cursor-pointer ${
                                selectedPlan === plan.id
                                    ? 'ring-2 ring-orange-500 shadow-xl'
                                    : 'hover:shadow-lg'
                            } ${
                                plan.recommended
                                    ? 'bg-gradient-to-br from-orange-500 to-red-600 text-white border-orange-400'
                                    : 'bg-white border-slate-200'
                            }`}
                            onClick={() => setSelectedPlan(plan.id)}
                        >
                            {plan.badge && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-xs font-bold px-4 py-1 rounded-full shadow-lg">
                                    {plan.badge}
                                </div>
                            )}
                            <CardHeader className="pb-4">
                                <CardTitle className={`text-2xl ${plan.recommended ? 'text-white' : 'text-slate-900'}`}>
                                    {plan.name}
                                </CardTitle>
                                <CardDescription className={plan.recommended ? 'text-white/80' : 'text-slate-500'}>
                                    {plan.description}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="mb-6">
                                    <div className="flex items-baseline gap-1 mb-2">
                                        <span className={`text-5xl font-bold ${plan.recommended ? 'text-white' : 'text-slate-900'}`}>
                                            ${plan.price}
                                        </span>
                                        <span className={plan.recommended ? 'text-white/70' : 'text-slate-500'}>
                                            {plan.period}
                                        </span>
                                    </div>
                                    <p className={`text-sm font-semibold ${plan.recommended ? 'text-white/90' : 'text-slate-600'}`}>
                                        {plan.total}
                                    </p>
                                </div>

                                <ul className="space-y-3 mb-6">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <Check className={`w-5 h-5 flex-shrink-0 ${
                                                plan.recommended ? 'text-white' : 'text-green-600'
                                            }`} />
                                            <span className={`text-sm ${
                                                plan.recommended ? 'text-white' : 'text-slate-700'
                                            }`}>
                                                {feature}
                                            </span>
                                        </li>
                                    ))}
                                </ul>

                                <Button
                                    className={`w-full h-14 rounded-xl text-lg font-bold ${
                                        plan.recommended
                                            ? 'bg-white text-orange-600 hover:bg-orange-50 shadow-xl'
                                            : 'bg-slate-800 hover:bg-slate-900 text-white shadow-lg'
                                    }`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handlePayment(plan.id);
                                    }}
                                    disabled={isLoading}
                                >
                                    {isLoading && selectedPlan === plan.id ? (
                                        <>
                                            <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                                            Procesando...
                                        </>
                                    ) : (
                                        <>
                                            <CreditCard className="mr-2 w-5 h-5" />
                                            Pagar ${plan.price}
                                        </>
                                    )}
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <p className="text-center text-slate-500 mt-8 text-sm">
                    Pago seguro procesado por MercadoPago. Tus datos están protegidos.
                </p>
            </main>
        </div>
    );
};

export default Checkout;
