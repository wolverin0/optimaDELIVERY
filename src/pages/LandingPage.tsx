import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
    ArrowRight,
    Check,
    Smartphone,
    QrCode,
    CreditCard,
    ChefHat,
    Clock,
    TrendingUp,
    Star,
    Play,
    Utensils,
    Bell,
    BarChart3
} from 'lucide-react';
import { useState, useEffect } from 'react';

const LandingPage = () => {
    const [activeFeature, setActiveFeature] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveFeature((prev) => (prev + 1) % 4);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-orange-50 text-slate-900 font-sans selection:bg-orange-500/20">
            {/* Navbar - Floating */}
            <nav className="fixed top-4 left-4 right-4 z-50">
                <div className="max-w-6xl mx-auto bg-white/80 backdrop-blur-xl rounded-2xl border border-orange-100 shadow-lg shadow-orange-900/5 px-6 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-3 cursor-pointer">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
                            <Utensils className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                            optimaDELIVERY
                        </span>
                    </Link>
                    <div className="flex items-center gap-2 sm:gap-4">
                        <Link to="/demo" className="hidden sm:block text-sm font-medium text-slate-600 hover:text-orange-600 transition-colors cursor-pointer">
                            Ver Demo
                        </Link>
                        <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-orange-600 transition-colors cursor-pointer">
                            Ingresar
                        </Link>
                        <Link to="/register/setup">
                            <Button className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-xl px-3 sm:px-6 font-semibold shadow-lg shadow-orange-500/25 transition-all duration-200 cursor-pointer">
                                <span className="hidden sm:inline">Empezar Gratis</span>
                                <span className="sm:hidden">Empezar</span>
                            </Button>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 overflow-hidden">
                {/* Background decorations */}
                <div className="absolute top-20 right-0 w-96 h-96 bg-orange-200/40 rounded-full blur-3xl -z-10" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-red-200/30 rounded-full blur-3xl -z-10" />

                <div className="max-w-6xl mx-auto px-6">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Left - Copy */}
                        <div className="text-center lg:text-left">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 border border-green-200 text-green-700 text-sm font-semibold mb-6">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                +500 restaurantes ya confian en nosotros
                            </div>

                            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.1]">
                                <span className="text-slate-900">Tu carta digital</span>
                                <br />
                                <span className="bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 bg-clip-text text-transparent">
                                    lista en 5 minutos
                                </span>
                            </h1>

                            <p className="text-lg sm:text-xl text-slate-600 mb-8 leading-relaxed max-w-lg mx-auto lg:mx-0">
                                Crea tu menú QR profesional, recibe pedidos por WhatsApp y cobra online.
                                <span className="font-semibold text-slate-900"> Sin comisiones ocultas.</span>
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 mb-10 justify-center lg:justify-start">
                                <Link to="/register/setup">
                                    <Button size="lg" className="h-14 px-8 text-lg rounded-xl bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold shadow-xl shadow-orange-500/30 w-full sm:w-auto transition-all duration-200 cursor-pointer">
                                        Crear mi Menú Gratis
                                        <ArrowRight className="ml-2 w-5 h-5" />
                                    </Button>
                                </Link>
                                <Link to="/demo">
                                    <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-xl border-2 border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 w-full sm:w-auto font-semibold transition-all duration-200 cursor-pointer">
                                        <Play className="mr-2 w-5 h-5 fill-current" />
                                        Ver Demo
                                    </Button>
                                </Link>
                            </div>

                            {/* Trust badges */}
                            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 text-sm text-slate-500 justify-center lg:justify-start">
                                <div className="flex items-center gap-2">
                                    <Check className="w-5 h-5 text-green-500" />
                                    <span>Sin tarjeta requerida</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Check className="w-5 h-5 text-green-500" />
                                    <span>Setup en minutos</span>
                                </div>
                            </div>
                        </div>

                        {/* Right - Product Mockup - Hidden on mobile */}
                        <div className="relative lg:pl-8 hidden lg:block">
                            <div className="relative flex items-center justify-center">
                                {/* Phone mockup - matching RegisterSetup style */}
                                <div className="relative scale-[0.7] xl:scale-[0.75] origin-center">
                                    <div className="w-[375px] h-[812px] bg-white rounded-[3rem] shadow-2xl border-[8px] border-slate-900 relative overflow-hidden ring-4 ring-slate-900/10 rotate-3 hover:rotate-0 transition-transform duration-500">
                                        {/* Notch */}
                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-slate-900 rounded-b-2xl z-30" />
                                        {/* Screen Content */}
                                        <div className="w-full h-full overflow-hidden bg-white">
                                            {/* Mock menu content */}
                                            <div className="bg-gradient-to-br from-orange-500 to-red-600 p-6 pt-10 text-white">
                                                <h3 className="font-bold text-xl">El Nuevo Braserito</h3>
                                                <p className="text-white/80 text-sm mt-1">Hamburguesas Artesanales</p>
                                            </div>
                                            <div className="p-4 space-y-3">
                                                {['Clásica con Queso', 'Bacon Royale', 'La Braserita', 'Veggie Deluxe'].map((item, i) => (
                                                    <div key={i} className="flex items-center gap-4 p-4 bg-orange-50 rounded-2xl">
                                                        <div className="w-16 h-16 bg-gradient-to-br from-orange-200 to-orange-300 rounded-xl shrink-0" />
                                                        <div className="flex-1">
                                                            <p className="font-semibold text-slate-900">{item}</p>
                                                            <p className="text-orange-600 font-bold">${(4500 + i * 2000).toLocaleString()}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Floating elements */}
                                <div className="absolute top-8 -left-8 bg-white rounded-2xl p-4 shadow-xl shadow-slate-200/50 animate-float z-10">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                            <Bell className="w-5 h-5 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-900 text-sm">Nuevo Pedido!</p>
                                            <p className="text-slate-500 text-xs">#1234 - $8.500</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="absolute bottom-16 -right-4 bg-white rounded-2xl p-4 shadow-xl shadow-slate-200/50 animate-float-delayed z-10">
                                    <div className="flex items-center gap-2">
                                        <QrCode className="w-8 h-8 text-orange-500" />
                                        <div>
                                            <p className="font-bold text-slate-900 text-sm">QR Listo</p>
                                            <p className="text-slate-500 text-xs">Escanear para ver</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Social Proof - Logos */}
            <section className="py-12 border-y border-orange-100 bg-white/50">
                <div className="max-w-6xl mx-auto px-6">
                    <p className="text-center text-sm font-semibold text-slate-400 uppercase tracking-widest mb-8">
                        Restaurantes que ya venden con optimaDELIVERY
                    </p>
                    <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
                        {['El Nuevo Braserito', 'Burger Kingdom', 'Sushi Zen', 'La Pasta Bella', 'Taco Loco'].map((name, i) => (
                            <div key={i} className="text-xl font-bold text-slate-300 hover:text-orange-500 transition-colors cursor-pointer">
                                {name}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How it Works - Redesigned */}
            <section className="py-24 relative overflow-hidden">
                {/* Subtle background pattern */}
                <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(249 115 22) 1px, transparent 0)', backgroundSize: '40px 40px'}} />

                <div className="max-w-6xl mx-auto px-6 relative">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 border border-orange-200 text-orange-700 text-sm font-semibold mb-6">
                            <Clock className="w-4 h-4" />
                            Configuración rápida
                        </div>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-slate-900">
                            Así de fácil funciona
                        </h2>
                        <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto">
                            En solo 3 pasos tu restaurante estará vendiendo online
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
                        {[
                            {
                                step: '01',
                                icon: <Utensils className="w-7 h-7" />,
                                title: 'Crea tu menú',
                                description: 'Agrega tus productos, precios y fotos. Elige entre 5 diseños profesionales.',
                                gradient: 'from-orange-500 to-amber-500',
                                bgGradient: 'from-orange-50 to-amber-50',
                                shadowColor: 'shadow-orange-500/20',
                                borderColor: 'border-orange-200',
                                iconBg: 'bg-gradient-to-br from-orange-100 to-amber-100',
                                iconHover: 'group-hover:from-orange-500 group-hover:to-amber-500'
                            },
                            {
                                step: '02',
                                icon: <QrCode className="w-7 h-7" />,
                                title: 'Comparte tu QR',
                                description: 'Genera tu código QR único. Imprímelo para mesas o comparte el link.',
                                gradient: 'from-red-500 to-rose-500',
                                bgGradient: 'from-red-50 to-rose-50',
                                shadowColor: 'shadow-red-500/20',
                                borderColor: 'border-red-200',
                                iconBg: 'bg-gradient-to-br from-red-100 to-rose-100',
                                iconHover: 'group-hover:from-red-500 group-hover:to-rose-500'
                            },
                            {
                                step: '03',
                                icon: <CreditCard className="w-7 h-7" />,
                                title: 'Recibe pedidos',
                                description: 'Los pedidos llegan a WhatsApp y al panel. Cobra online con MercadoPago.',
                                gradient: 'from-emerald-500 to-green-500',
                                bgGradient: 'from-emerald-50 to-green-50',
                                shadowColor: 'shadow-emerald-500/20',
                                borderColor: 'border-emerald-200',
                                iconBg: 'bg-gradient-to-br from-emerald-100 to-green-100',
                                iconHover: 'group-hover:from-emerald-500 group-hover:to-green-500'
                            }
                        ].map((item, i) => (
                            <div
                                key={i}
                                className={`relative bg-gradient-to-br ${item.bgGradient} rounded-3xl p-8 border ${item.borderColor} shadow-xl ${item.shadowColor} hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer group overflow-hidden`}
                            >
                                {/* Decorative corner accent */}
                                <div className={`absolute -top-12 -right-12 w-24 h-24 bg-gradient-to-br ${item.gradient} rounded-full opacity-20 group-hover:scale-150 transition-transform duration-500`} />
                                <div className={`absolute -bottom-8 -left-8 w-16 h-16 bg-gradient-to-br ${item.gradient} rounded-full opacity-10 group-hover:scale-125 transition-transform duration-700`} />

                                {/* Step badge with rotation on hover */}
                                <span className={`absolute -top-3 -left-3 w-14 h-14 bg-gradient-to-br ${item.gradient} rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg ${item.shadowColor} group-hover:rotate-6 transition-transform duration-300 z-10`}>
                                    {item.step}
                                </span>

                                {/* Icon with gradient border effect */}
                                <div className={`relative w-16 h-16 ${item.iconBg} ${item.iconHover} rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 group-hover:text-white`}>
                                    <div className="text-current group-hover:scale-110 transition-transform duration-300">
                                        {item.icon}
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold mb-3 text-slate-900 relative z-10">{item.title}</h3>
                                <p className="text-slate-600 leading-relaxed relative z-10">{item.description}</p>

                                {/* Connecting line (hidden on mobile, shown between cards on desktop) */}
                                {i < 2 && (
                                    <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-slate-200 to-transparent z-0" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Showcase */}
            <section className="py-24 bg-gradient-to-b from-slate-900 to-slate-950 text-white overflow-hidden">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">
                            Todo lo que necesitas
                        </h2>
                        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                            Herramientas potentes para hacer crecer tu negocio gastronómico
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Feature tabs */}
                        <div className="space-y-4">
                            {[
                                {
                                    icon: <Smartphone className="w-6 h-6" />,
                                    title: 'Menú 100% Mobile',
                                    description: 'Tu carta se ve perfecta en cualquier celular. Sin apps que descargar, acceso instantáneo.'
                                },
                                {
                                    icon: <ChefHat className="w-6 h-6" />,
                                    title: 'Cocina en Tiempo Real',
                                    description: 'Panel de cocina con estados de pedidos. Actualiza el progreso y notifica a tus clientes.'
                                },
                                {
                                    icon: <BarChart3 className="w-6 h-6" />,
                                    title: 'Estadísticas Detalladas',
                                    description: 'Visualiza tus ventas, productos más vendidos y horarios pico de tu negocio.'
                                },
                                {
                                    icon: <CreditCard className="w-6 h-6" />,
                                    title: 'Pagos Integrados',
                                    description: 'Conecta MercadoPago y recibe el dinero de tus ventas al instante. Sin intermediarios.'
                                }
                            ].map((feature, i) => (
                                <div
                                    key={i}
                                    onClick={() => setActiveFeature(i)}
                                    className={`p-6 rounded-2xl cursor-pointer transition-all duration-300 ${
                                        activeFeature === i
                                            ? 'bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30'
                                            : 'hover:bg-white/5 border border-transparent'
                                    }`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-300 ${
                                            activeFeature === i
                                                ? 'bg-gradient-to-br from-orange-500 to-red-600 text-white'
                                                : 'bg-slate-800 text-slate-400'
                                        }`}>
                                            {feature.icon}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold mb-1">{feature.title}</h3>
                                            <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Feature visual */}
                        <div className="relative">
                            <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-3xl p-8 border border-orange-500/20">
                                <div className="bg-slate-800 rounded-2xl p-6 shadow-2xl">
                                    {activeFeature === 0 && (
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between mb-4">
                                                <span className="text-orange-500 font-bold">Vista Mobile</span>
                                                <Smartphone className="w-5 h-5 text-slate-500" />
                                            </div>
                                            {[1,2,3].map(i => (
                                                <div key={i} className="flex items-center gap-4 p-3 bg-slate-700/50 rounded-xl">
                                                    <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl" />
                                                    <div className="flex-1">
                                                        <div className="h-3 bg-slate-600 rounded w-24 mb-2" />
                                                        <div className="h-2 bg-slate-700 rounded w-16" />
                                                    </div>
                                                    <span className="text-orange-500 font-bold">$4.500</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {activeFeature === 1 && (
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between mb-4">
                                                <span className="text-orange-500 font-bold">Panel Cocina</span>
                                                <ChefHat className="w-5 h-5 text-slate-500" />
                                            </div>
                                            <div className="grid grid-cols-3 gap-3">
                                                {['Pendiente', 'Preparando', 'Listo'].map((status, i) => (
                                                    <div key={i} className="text-center">
                                                        <div className={`text-2xl font-bold ${i === 0 ? 'text-yellow-500' : i === 1 ? 'text-orange-500' : 'text-green-500'}`}>
                                                            {3 - i}
                                                        </div>
                                                        <div className="text-xs text-slate-500">{status}</div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-xl">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-bold text-yellow-500">#1234</span>
                                                    <span className="text-sm text-slate-400">Hace 2 min</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {activeFeature === 2 && (
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between mb-4">
                                                <span className="text-orange-500 font-bold">Estadísticas</span>
                                                <BarChart3 className="w-5 h-5 text-slate-500" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-slate-700/50 p-4 rounded-xl">
                                                    <div className="text-2xl font-bold text-white">$125.400</div>
                                                    <div className="text-xs text-green-500 flex items-center gap-1">
                                                        <TrendingUp className="w-3 h-3" /> +12% vs ayer
                                                    </div>
                                                </div>
                                                <div className="bg-slate-700/50 p-4 rounded-xl">
                                                    <div className="text-2xl font-bold text-white">47</div>
                                                    <div className="text-xs text-slate-500">Pedidos hoy</div>
                                                </div>
                                            </div>
                                            <div className="flex gap-1 items-end h-20">
                                                {[40, 65, 45, 80, 60, 90, 75].map((h, i) => (
                                                    <div key={i} className="flex-1 bg-gradient-to-t from-orange-500 to-red-500 rounded-t" style={{height: `${h}%`}} />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {activeFeature === 3 && (
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between mb-4">
                                                <span className="text-orange-500 font-bold">MercadoPago</span>
                                                <CreditCard className="w-5 h-5 text-slate-500" />
                                            </div>
                                            <div className="bg-gradient-to-r from-blue-600 to-blue-400 p-4 rounded-xl text-white">
                                                <div className="text-sm opacity-80 mb-1">Balance disponible</div>
                                                <div className="text-3xl font-bold">$248.650</div>
                                            </div>
                                            <div className="space-y-2">
                                                {['Pago recibido #1234', 'Pago recibido #1233'].map((tx, i) => (
                                                    <div key={i} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                                                        <span className="text-sm text-slate-400">{tx}</span>
                                                        <span className="text-green-500 font-bold">+$8.500</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-24">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900">
                            Lo que dicen nuestros clientes
                        </h2>
                        <p className="text-xl text-slate-600">
                            Miles de restaurantes ya venden mas con optimaDELIVERY
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                quote: 'Duplicamos nuestros pedidos de delivery en el primer mes. La integración con WhatsApp es increíble.',
                                name: 'María González',
                                role: 'Dueña de Pasta Bella',
                                rating: 5
                            },
                            {
                                quote: 'El panel de cocina nos cambió la vida. Ya no perdemos pedidos y nuestros tiempos mejoraron un 40%.',
                                name: 'Carlos Rodríguez',
                                role: 'Chef de Burger Kingdom',
                                rating: 5
                            },
                            {
                                quote: 'Súper fácil de configurar. En 10 minutos teníamos el menú funcionando con pagos online.',
                                name: 'Ana Martínez',
                                role: 'Gerente de Sushi Zen',
                                rating: 5
                            }
                        ].map((testimonial, i) => (
                            <div
                                key={i}
                                className="bg-white rounded-3xl p-8 border border-orange-100 shadow-xl shadow-orange-900/5 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                            >
                                <div className="flex gap-1 mb-4">
                                    {[...Array(testimonial.rating)].map((_, j) => (
                                        <Star key={j} className="w-5 h-5 fill-orange-400 text-orange-400" />
                                    ))}
                                </div>
                                <p className="text-slate-700 mb-6 leading-relaxed italic">
                                    "{testimonial.quote}"
                                </p>
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold">
                                        {testimonial.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900">{testimonial.name}</p>
                                        <p className="text-sm text-slate-500">{testimonial.role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing */}
            <section className="py-24 bg-gradient-to-b from-orange-50 to-white">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900">
                            Planes simples y transparentes
                        </h2>
                        <p className="text-xl text-slate-600">
                            Sin sorpresas. Sin comisiones ocultas. Cancela cuando quieras.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Plan Emprendedor */}
                        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl hover:shadow-2xl transition-shadow cursor-pointer">
                            <h3 className="text-xl font-bold mb-2 text-slate-900">Emprendedor</h3>
                            <div className="flex items-baseline gap-1 mb-4">
                                <span className="text-5xl font-bold text-slate-900">$15.000</span>
                                <span className="text-slate-500">/mes</span>
                            </div>
                            <p className="text-slate-500 mb-8 pb-6 border-b border-slate-100">
                                Ideal para dark kitchens y locales pequeños
                            </p>
                            <ul className="space-y-4 mb-8">
                                {[
                                    'Menú Digital QR Ilimitado',
                                    'Pedidos por WhatsApp',
                                    '3 Plantillas de Diseño',
                                    'Soporte por Email'
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-slate-700">
                                        <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                                            <Check className="w-3 h-3 text-green-600" />
                                        </div>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                            <Link to="/register?plan=basic">
                                <Button variant="outline" className="w-full h-14 rounded-xl text-lg font-semibold border-2 border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer">
                                    Empezar Prueba Gratis
                                </Button>
                            </Link>
                        </div>

                        {/* Plan PRO */}
                        <div className="relative bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl p-8 text-white shadow-2xl shadow-orange-500/30 cursor-pointer">
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-sm font-bold px-4 py-1 rounded-full shadow-lg">
                                MAS POPULAR
                            </div>
                            <h3 className="text-xl font-bold mb-2">Profesional</h3>
                            <div className="flex items-baseline gap-1 mb-4">
                                <span className="text-5xl font-bold">$25.000</span>
                                <span className="text-white/70">/mes</span>
                            </div>
                            <p className="text-white/80 mb-8 pb-6 border-b border-white/20">
                                Para restaurantes que buscan automatizar todo
                            </p>
                            <ul className="space-y-4 mb-8">
                                {[
                                    'Todo lo del plan Emprendedor',
                                    'Cobros con MercadoPago',
                                    'Panel de Cocina en Tiempo Real',
                                    'Estadísticas Detalladas',
                                    '5 Plantillas Premium',
                                    'Soporte Prioritario WhatsApp'
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3">
                                        <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                                            <Check className="w-3 h-3" />
                                        </div>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                            <Link to="/register?plan=pro">
                                <Button className="w-full h-14 rounded-xl text-lg font-bold bg-white text-orange-600 hover:bg-orange-50 shadow-lg transition-all cursor-pointer">
                                    Suscribirse Ahora
                                </Button>
                            </Link>
                        </div>
                    </div>

                    <p className="text-center text-slate-500 mt-8 text-sm">
                        7 días de prueba gratis en ambos planes. Sin tarjeta de crédito.
                    </p>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-red-500/10" />
                <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-red-500/20 rounded-full blur-3xl" />

                <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                    <h2 className="text-4xl md:text-6xl font-bold mb-6">
                        ¿Listo para vender más?
                    </h2>
                    <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
                        Únete a los +500 restaurantes que ya confían en optimaDELIVERY para hacer crecer su negocio.
                    </p>
                    <Link to="/register/setup">
                        <Button size="lg" className="h-16 px-12 text-xl rounded-xl bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 font-bold shadow-2xl shadow-orange-500/40 transition-all duration-200 cursor-pointer">
                            Crear mi Menú Gratis
                            <ArrowRight className="ml-3 w-6 h-6" />
                        </Button>
                    </Link>
                    <p className="mt-6 text-slate-500 text-sm">
                        Setup en 5 minutos • Sin tarjeta requerida • Cancela cuando quieras
                    </p>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 bg-slate-950 text-white">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                                <Utensils className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-lg font-bold">optimaDELIVERY</span>
                        </div>
                        <div className="flex gap-8 text-sm text-slate-400">
                            <a href="#" className="hover:text-white transition-colors cursor-pointer">Privacidad</a>
                            <a href="#" className="hover:text-white transition-colors cursor-pointer">Términos</a>
                            <a href="#" className="hover:text-white transition-colors cursor-pointer">Contacto</a>
                        </div>
                        <p className="text-sm text-slate-500">
                            © 2024 optimaDELIVERY. Hecho en Argentina.
                        </p>
                    </div>
                </div>
            </footer>

            {/* Custom animations */}
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                }
                @keyframes float-delayed {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-8px); }
                }
                .animate-float {
                    animation: float 3s ease-in-out infinite;
                }
                .animate-float-delayed {
                    animation: float-delayed 3s ease-in-out infinite;
                    animation-delay: 1.5s;
                }
            `}</style>
        </div>
    );
};

export default LandingPage;
