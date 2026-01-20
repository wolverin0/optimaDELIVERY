import { Link } from "react-router-dom";
import { ArrowLeft, Utensils, Check, Sparkles, MessageCircle, Clock, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTenant } from "@/context/TenantContext";
import { useAuth } from "@/context/AuthContext";
import { getTrialStatus, getDaysRemaining, getStatusDescription } from "@/lib/trial";

const Upgrade = () => {
    const { tenant } = useTenant();
    const { profile } = useAuth();

    const trialStatus = getTrialStatus(tenant);
    const daysRemaining = getDaysRemaining(tenant);

    const PLANS = [
        {
            id: 'basic',
            name: 'Básico',
            price: '15.000',
            period: '/mes',
            description: 'Ideal para emprendedores y dark kitchens',
            features: [
                'Menú digital personalizado',
                'Hasta 50 productos',
                'Gestión de pedidos',
                'Panel de cocina',
                '3 plantillas de diseño',
                'Soporte por email'
            ],
            cta: 'Elegir Básico',
            popular: false
        },
        {
            id: 'pro',
            name: 'Profesional',
            price: '25.000',
            period: '/mes',
            description: 'Para negocios en crecimiento',
            features: [
                'Todo del plan Básico',
                'Productos ilimitados',
                'Múltiples usuarios',
                'Integración MercadoPago',
                '5 plantillas premium',
                'Estadísticas detalladas',
                'Soporte prioritario WhatsApp'
            ],
            cta: 'Elegir Profesional',
            popular: true
        }
    ];

    const handleContactWhatsApp = (planId: string) => {
        const plan = PLANS.find(p => p.id === planId);
        const phone = "56912345678"; // Replace with actual support number
        const message = encodeURIComponent(
            `Hola! Quiero activar el plan ${plan?.name || planId} para mi negocio "${tenant?.name || 'mi restaurante'}". Mi email es: ${profile?.email || 'N/A'}`
        );
        window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
            {/* Decorative background elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-orange-200/30 rounded-full blur-3xl" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-red-200/20 rounded-full blur-3xl" />
            </div>

            {/* Header */}
            <header className="relative z-10 border-b border-orange-100 bg-white/80 backdrop-blur-xl">
                <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            to="/dashboard"
                            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span className="hidden sm:inline">Volver al Dashboard</span>
                        </Link>
                    </div>
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/25">
                            <Utensils className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-bold text-xl text-slate-800 hidden sm:block">optimaDELIVERY</span>
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative z-10 container mx-auto px-6 py-12">
                {/* Current Status */}
                <div className="max-w-4xl mx-auto mb-12">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-3">
                            Elige tu plan
                        </h1>
                        <p className="text-slate-500 text-lg">
                            Desbloquea todas las funcionalidades para hacer crecer tu negocio
                        </p>
                    </div>

                    {/* Current plan status card */}
                    <div className="bg-white rounded-2xl p-6 border border-orange-100 shadow-lg mb-8">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                    trialStatus === 'active_subscription'
                                        ? 'bg-green-100 text-green-600'
                                        : trialStatus === 'trial_expiring'
                                            ? 'bg-amber-100 text-amber-600'
                                            : 'bg-slate-100 text-slate-600'
                                }`}>
                                    {trialStatus === 'active_subscription' ? (
                                        <Sparkles className="w-6 h-6" />
                                    ) : (
                                        <Clock className="w-6 h-6" />
                                    )}
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-800">
                                        {tenant?.name || 'Tu negocio'}
                                    </p>
                                    <p className="text-sm text-slate-500">
                                        {getStatusDescription(tenant)}
                                    </p>
                                </div>
                            </div>
                            {trialStatus === 'trial_active' && (
                                <div className="bg-slate-100 px-4 py-2 rounded-lg">
                                    <span className="text-sm font-medium text-slate-700">
                                        {daysRemaining} {daysRemaining === 1 ? 'día' : 'días'} restantes
                                    </span>
                                </div>
                            )}
                            {trialStatus === 'trial_expiring' && (
                                <div className="bg-amber-100 px-4 py-2 rounded-lg">
                                    <span className="text-sm font-medium text-amber-700">
                                        {daysRemaining === 1 ? '¡Último día!' : `${daysRemaining} días restantes`}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Plans */}
                <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6 mb-12">
                    {PLANS.map((plan) => (
                        <Card
                            key={plan.id}
                            className={`relative overflow-hidden border-2 transition-all hover:shadow-xl ${
                                plan.popular
                                    ? 'border-orange-500 shadow-lg shadow-orange-500/10'
                                    : 'border-slate-200 hover:border-orange-300'
                            }`}
                        >
                            {plan.popular && (
                                <div className="absolute top-0 right-0 bg-gradient-to-r from-orange-500 to-red-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                                    <Sparkles className="w-3 h-3 inline mr-1" />
                                    RECOMENDADO
                                </div>
                            )}
                            <CardHeader className="pb-2">
                                <CardTitle className="text-xl font-bold text-slate-800">{plan.name}</CardTitle>
                                <p className="text-sm text-slate-500">{plan.description}</p>
                            </CardHeader>
                            <CardContent>
                                <div className="mb-6">
                                    <span className="text-4xl font-black text-slate-800">${plan.price}</span>
                                    <span className="text-slate-500">{plan.period}</span>
                                </div>
                                <ul className="space-y-3 mb-6">
                                    {plan.features.map((feature) => (
                                        <li key={feature} className="flex items-start gap-2">
                                            <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                            <span className="text-slate-600 text-sm">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                                <Button
                                    className={`w-full h-12 rounded-xl font-semibold ${
                                        plan.popular
                                            ? 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white shadow-lg shadow-orange-500/25'
                                            : 'bg-slate-800 hover:bg-slate-900 text-white'
                                    }`}
                                    onClick={() => handleContactWhatsApp(plan.id)}
                                >
                                    <MessageCircle className="w-4 h-4 mr-2" />
                                    {plan.cta}
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* FAQ Section */}
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-2xl font-bold text-slate-800 text-center mb-8">
                        Preguntas frecuentes
                    </h2>
                    <div className="space-y-4">
                        {[
                            {
                                q: '¿Cómo funciona el pago?',
                                a: 'Aceptamos transferencia bancaria y MercadoPago. Una vez que elijas tu plan, te contactaremos para coordinar el pago y activar tu cuenta inmediatamente.'
                            },
                            {
                                q: '¿Puedo cambiar de plan después?',
                                a: 'Sí, puedes cambiar de plan en cualquier momento. Si subes de plan, solo pagas la diferencia prorrateada. Si bajas, el cambio aplica en tu próximo ciclo de facturación.'
                            },
                            {
                                q: '¿Hay compromiso de permanencia?',
                                a: 'No, puedes cancelar en cualquier momento. Si cancelas, mantienes acceso hasta el fin de tu período pagado.'
                            },
                            {
                                q: '¿Qué pasa con mis datos si cancelo?',
                                a: 'Tu menú seguirá visible para tus clientes. Tus datos se mantienen por 30 días después de cancelar, tiempo durante el cual puedes reactivar tu cuenta.'
                            }
                        ].map((faq, i) => (
                            <div key={i} className="bg-white rounded-xl p-5 border border-orange-100 shadow-sm">
                                <div className="flex items-start gap-3">
                                    <HelpCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h3 className="font-semibold text-slate-800 mb-1">{faq.q}</h3>
                                        <p className="text-sm text-slate-500">{faq.a}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Support CTA */}
                <div className="max-w-3xl mx-auto mt-12 text-center">
                    <p className="text-slate-500 mb-4">
                        ¿Tienes dudas? Estamos aquí para ayudarte
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <a
                            href="mailto:soporte@optimadelivery.cl"
                            className="text-orange-600 hover:text-orange-700 font-medium hover:underline"
                        >
                            soporte@optimadelivery.cl
                        </a>
                        <span className="text-slate-300">|</span>
                        <button
                            onClick={() => handleContactWhatsApp('consulta')}
                            className="text-orange-600 hover:text-orange-700 font-medium hover:underline"
                        >
                            WhatsApp de soporte
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Upgrade;
