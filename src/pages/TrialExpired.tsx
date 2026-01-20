import { Link } from "react-router-dom";
import { Clock, Utensils, Check, Sparkles, MessageCircle, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTenant } from "@/context/TenantContext";
import { useAuth } from "@/context/AuthContext";
import { formatTrialEndDate } from "@/lib/trial";

const TrialExpired = () => {
    const { tenant } = useTenant();
    const { signOut, profile } = useAuth();

    const PLANS = [
        {
            name: 'Básico',
            price: '15.000',
            period: '/mes',
            description: 'Ideal para emprendedores',
            features: [
                'Menú digital personalizado',
                'Hasta 50 productos',
                'Gestión de pedidos',
                'Panel de cocina',
                'Soporte por email'
            ],
            cta: 'Elegir Básico',
            popular: false
        },
        {
            name: 'Pro',
            price: '25.000',
            period: '/mes',
            description: 'Para negocios en crecimiento',
            features: [
                'Todo del plan Básico',
                'Productos ilimitados',
                'Múltiples usuarios',
                'Integración MercadoPago',
                'Reportes avanzados',
                'Soporte prioritario'
            ],
            cta: 'Elegir Pro',
            popular: true
        }
    ];

    const handleContactWhatsApp = (plan: string) => {
        const phone = "56912345678"; // Replace with actual support number
        const message = encodeURIComponent(
            `Hola! Quiero activar el plan ${plan} para mi negocio "${tenant?.name || 'mi restaurante'}". Mi email es: ${profile?.email || 'N/A'}`
        );
        window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
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
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <Link to="/" className="flex items-center gap-3 group w-fit">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/25 group-hover:shadow-orange-500/40 transition-shadow">
                            <Utensils className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-bold text-xl text-slate-800">optimaDELIVERY</span>
                    </Link>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={signOut}
                        className="text-slate-500 hover:text-slate-700"
                    >
                        <LogOut className="w-4 h-4 mr-2" />
                        Cerrar sesión
                    </Button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center px-6 py-12 relative z-10">
                <div className="max-w-4xl w-full">
                    {/* Trial Expired Message */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 shadow-2xl shadow-orange-500/40 mb-6">
                            <Clock className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-3">
                            Tu período de prueba ha terminado
                        </h1>
                        <p className="text-slate-500 text-lg max-w-md mx-auto">
                            {tenant?.name && (
                                <span className="block text-slate-700 font-medium mb-1">{tenant.name}</span>
                            )}
                            Tu prueba gratuita terminó el {formatTrialEndDate(tenant) || 'recientemente'}.
                            <br />
                            Elige un plan para seguir usando optimaDELIVERY.
                        </p>
                    </div>

                    {/* Plans */}
                    <div className="grid md:grid-cols-2 gap-6 mb-10">
                        {PLANS.map((plan) => (
                            <Card
                                key={plan.name}
                                className={`relative overflow-hidden border-2 transition-all hover:shadow-xl ${
                                    plan.popular
                                        ? 'border-orange-500 shadow-lg shadow-orange-500/10'
                                        : 'border-slate-200 hover:border-orange-300'
                                }`}
                            >
                                {plan.popular && (
                                    <div className="absolute top-0 right-0 bg-gradient-to-r from-orange-500 to-red-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                                        <Sparkles className="w-3 h-3 inline mr-1" />
                                        POPULAR
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
                                        onClick={() => handleContactWhatsApp(plan.name)}
                                    >
                                        <MessageCircle className="w-4 h-4 mr-2" />
                                        {plan.cta}
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* What you're missing */}
                    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-orange-100 text-center">
                        <h3 className="font-semibold text-slate-800 mb-3">
                            Mientras tanto, tu menú sigue visible para tus clientes
                        </h3>
                        <p className="text-sm text-slate-500 mb-4">
                            Tu menú digital en <span className="font-mono text-orange-600">/{tenant?.slug}</span> continúa funcionando,
                            pero no podrás gestionar pedidos ni hacer cambios hasta que actives un plan.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4 text-sm">
                            <Link
                                to={`/t/${tenant?.slug}`}
                                className="text-orange-600 hover:text-orange-700 font-medium hover:underline"
                                target="_blank"
                            >
                                Ver mi menú
                            </Link>
                            <span className="text-slate-300">|</span>
                            <a
                                href="mailto:soporte@optimadelivery.cl"
                                className="text-orange-600 hover:text-orange-700 font-medium hover:underline"
                            >
                                Contactar soporte
                            </a>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default TrialExpired;
