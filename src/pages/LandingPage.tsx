import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Check, LayoutTemplate, Smartphone, TrendingUp, ShieldCheck, CreditCard, Zap } from 'lucide-react';

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-blue-500/30">
            {/* Navbar */}
            <nav className="border-b border-white/5 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
                <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                            <span className="font-bold text-white text-lg">O</span>
                        </div>
                        <span className="text-xl font-bold tracking-tight">optimaDELIVERY</span>
                    </div>
                    <div className="flex items-center gap-6">
                        <Link to="/demo" className="hidden md:block text-sm font-medium text-slate-400 hover:text-white transition-colors">
                            Demo
                        </Link>
                        <Link to="/login" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
                            Ingresar
                        </Link>
                        <Link to="/register">
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 font-medium">
                                Probar Gratis
                            </Button>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-blue-500/20 rounded-full blur-[120px] -z-10" />

                <div className="container mx-auto px-6 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-8 animate-fade-in-up">
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                        Nuevo: Integración con MercadoPago
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent max-w-4xl mx-auto leading-tight">
                        Tu Menú Digital<br />Listo en Minutos
                    </h1>

                    <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                        La plataforma todo en uno para restaurantes en Argentina.
                        Diseños premium, pedidos por WhatsApp y cobros online sin comisiones.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link to="/register/setup">
                            <Button size="lg" className="h-14 px-8 text-lg rounded-full bg-blue-600 hover:bg-blue-700 w-full sm:w-auto font-semibold shadow-lg shadow-blue-900/20">
                                Crear mi Menú
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                        </Link>
                        <Link to="/demo">
                            <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white w-full sm:w-auto">
                                <LayoutTemplate className="mr-2 w-5 h-5" />
                                Ver Demo
                            </Button>
                        </Link>
                    </div>

                    {/* Social Proof */}
                    <div className="mt-20 pt-10 border-t border-white/5">
                        <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-8">Elegido por los mejores gastronómicos</p>
                        <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
                            <div className="text-xl font-serif font-bold text-white">El Nuevo Braserito</div>
                            <div className="text-xl font-sans font-black text-white">BURGER KINGDOM</div>
                            <div className="text-xl font-mono font-bold text-white">SUSHI ZEN</div>
                            <div className="text-xl font-serif italic text-white">La Pasta Bella</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-24 bg-slate-900/50 border-y border-white/5">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">Todo lo que necesitas para vender más</h2>
                        <p className="text-slate-400">Herramientas potentes diseñadas para la gastronomía moderna.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<LayoutTemplate className="w-8 h-8 text-blue-500" />}
                            title="Diseños Premium"
                            description="Elige entre 5 plantillas profesionales. Clásico, Moderno, Dark Mode y más. Cambia de estilo con un clic."
                        />
                        <FeatureCard
                            icon={<Smartphone className="w-8 h-8 text-purple-500" />}
                            title="100% Móvil"
                            description="Tu carta se ve perfecta en cualquier celular. Sin apps que descargar, acceso instantáneo por QR."
                        />
                        <FeatureCard
                            icon={<CreditCard className="w-8 h-8 text-green-500" />}
                            title="Cobros Integrados"
                            description="Conecta tu cuenta de MercadoPago y recibe el dinero de tus ventas al instante. Sin intermediarios."
                        />
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section className="py-24 relative overflow-hidden">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6">Planes Flexibles</h2>
                        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                            Comienza con una prueba gratuita de 7 días. Cancela cuando quieras.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {/* Plan Emprendedor */}
                        <div className="rounded-3xl p-8 border border-slate-800 bg-slate-900/50 hover:border-slate-700 transition-colors">
                            <h3 className="text-xl font-semibold mb-2 text-slate-300">Emprendedor</h3>
                            <div className="flex items-baseline gap-1 mb-6">
                                <span className="text-4xl font-bold">$15.000</span>
                                <span className="text-slate-400">/mes</span>
                            </div>
                            <p className="text-slate-400 text-sm mb-6 pb-6 border-b border-slate-800">Ideal para dark kitchens y locales pequeños.</p>
                            <ul className="space-y-4 text-left mb-8">
                                <PricingItem text="Menú Digital QR Ilimitado" />
                                <PricingItem text="Pedidos por WhatsApp" />
                                <PricingItem text="Diseños Básicos" />
                                <PricingItem text="Soporte por Email" />
                            </ul>
                            <Link to="/register?plan=basic">
                                <Button variant="outline" className="w-full h-12 rounded-xl border-slate-700 hover:bg-slate-800 hover:text-white">
                                    Comenzar Prueba Gratis
                                </Button>
                            </Link>
                        </div>

                        {/* Plan PRO */}
                        <div className="rounded-3xl p-8 border border-blue-500/30 bg-blue-900/10 hover:border-blue-500/50 transition-colors relative overflow-hidden group shadow-2xl shadow-blue-900/20">
                            <div className="absolute top-0 right-0 bg-blue-600 text-xs font-bold px-3 py-1 rounded-bl-xl text-white">MÁS POPULAR</div>
                            <h3 className="text-xl font-semibold mb-2 text-white">Profesional</h3>
                            <div className="flex items-baseline gap-1 mb-6">
                                <span className="text-4xl font-bold text-blue-400">$25.000</span>
                                <span className="text-slate-300">/mes</span>
                            </div>
                            <p className="text-slate-400 text-sm mb-6 pb-6 border-b border-blue-500/20">Para restaurantes que buscan automatizar todo.</p>
                            <ul className="space-y-4 text-left mb-8">
                                <PricingItem text="Todo lo del plan Emprendedor" highlighted />
                                <PricingItem text="Cobros con MercadoPago" highlighted />
                                <PricingItem text="Gestión de Delivery y Takeaway" />
                                <PricingItem text="Panel de Administración Completo" />
                                <PricingItem text="Soporte Prioritario WhatsApp" />
                            </ul>
                            <Link to="/register?plan=pro">
                                <Button className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold shadow-lg shadow-blue-500/25">
                                    Suscribirse Ahora
                                </Button>
                            </Link>
                        </div>
                    </div>

                    <div className="mt-12 text-center">
                        <div className="inline-flex items-center gap-2 text-slate-500 text-sm bg-slate-900/80 px-4 py-2 rounded-full border border-slate-800">
                            <ShieldCheck className="w-4 h-4 text-green-500" />
                            Garantía de satisfacción de 30 días o te devolvemos tu dinero.
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Final */}
            <section className="py-20 border-t border-white/5 bg-gradient-to-b from-slate-950 to-blue-950/20">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-3xl font-bold mb-6">¿Listo para modernizar tu restaurante?</h2>
                    <Link to="/register">
                        <Button size="lg" className="h-14 px-10 text-lg rounded-full bg-white text-slate-950 hover:bg-slate-200 font-bold">
                            Crear Cuenta Gratis
                        </Button>
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-white/5 bg-slate-950">
                <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-slate-500">
                    <div>© 2024 optimaDELIVERY. Hecho con ❤️ en Argentina.</div>
                    <div className="flex gap-6">
                        <a href="#" className="hover:text-white transition-colors">Privacidad</a>
                        <a href="#" className="hover:text-white transition-colors">Términos</a>
                        <a href="#" className="hover:text-white transition-colors">Contacto</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
    <div className="p-8 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors">
        <div className="mb-5 p-3 bg-slate-900 rounded-xl inline-block">{icon}</div>
        <h3 className="text-xl font-bold mb-3">{title}</h3>
        <p className="text-slate-400 leading-relaxed">{description}</p>
    </div>
);

const PricingItem = ({ text, highlighted = false }: { text: string, highlighted?: boolean }) => (
    <li className={`flex items-center gap-3 ${highlighted ? 'text-white font-medium' : 'text-slate-300'}`}>
        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${highlighted ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
            <Check className="w-3 h-3" />
        </div>
        {text}
    </li>
);

export default LandingPage;
