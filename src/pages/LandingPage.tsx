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
    BarChart3,
    Eye
} from 'lucide-react';
import { useState, useEffect, ReactNode } from 'react';
import { TenantContext } from '@/context/TenantContext';
import { OrderContext } from '@/context/OrderContext';
import Menu from '@/pages/Menu';
import { THEMES } from '@/lib/themes';
import { Tenant, MenuItem, Category } from '@/lib/supabase';

// Mock data for the live preview
const PREVIEW_CATEGORIES: Category[] = [
    { id: 'c1', tenant_id: 'preview', name: 'Hamburguesas', slug: 'hamburguesas', sort_order: 1, is_active: true, created_at: '', updated_at: '', description: '', image_url: '' },
    { id: 'c2', tenant_id: 'preview', name: 'Acompañamientos', slug: 'acompanamientos', sort_order: 2, is_active: true, created_at: '', updated_at: '', description: '', image_url: '' },
    { id: 'c3', tenant_id: 'preview', name: 'Bebidas', slug: 'bebidas', sort_order: 3, is_active: true, created_at: '', updated_at: '', description: '', image_url: '' },
];

const PREVIEW_ITEMS: MenuItem[] = [
    { id: 'm1', tenant_id: 'preview', category_id: 'c1', name: 'Clásica con Queso', description: 'Doble carne smash, queso cheddar, cebolla caramelizada.', price: 8500, is_available: true, sort_order: 1, image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80', created_at: '', updated_at: '', sold_by_weight: false, weight_unit: 'un' },
    { id: 'm2', tenant_id: 'preview', category_id: 'c1', name: 'Bacon Royale', description: 'Panceta crocante, queso azul, rúcula fresca.', price: 9500, is_available: true, sort_order: 2, image_url: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=800&q=80', created_at: '', updated_at: '', sold_by_weight: false, weight_unit: 'un' },
    { id: 'm3', tenant_id: 'preview', category_id: 'c2', name: 'Papas Rústicas', description: 'Cortadas a mano con sal marina.', price: 3500, is_available: true, sort_order: 3, image_url: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=800&q=80', created_at: '', updated_at: '', sold_by_weight: false, weight_unit: 'un' },
    { id: 'm4', tenant_id: 'preview', category_id: 'c3', name: 'Limonada Casera', description: 'Refrescante limonada con menta.', price: 2500, is_available: true, sort_order: 4, image_url: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?auto=format&fit=crop&w=800&q=80', created_at: '', updated_at: '', sold_by_weight: false, weight_unit: 'un' },
];

const BASE_TENANT: Tenant = {
    id: 'preview-tenant',
    name: 'Mi Restaurante',
    slug: 'preview',
    logo_url: null,
    theme: THEMES[0],
    business_phone: '+1234567890',
    business_email: 'demo@restaurant.com',
    business_address: 'Av. Principal 123',
    is_active: true,
    created_at: '',
    updated_at: '',
    settings: {},
    mercadopago_access_token: null,
    mercadopago_public_key: null,
    mercadopago_refresh_token: null,
    mercadopago_user_id: null,
    mercadopago_connected_at: null,
    kitchen_pin: null,
    social_instagram: null,
    social_facebook: null,
    social_whatsapp: null,
    social_tiktok: null,
    social_twitter: null,
    email_verified: true,
    verification_token: null,
    verification_sent_at: null,
    verified_at: null,
    trial_ends_at: null,
    subscription_status: 'active',
    plan_type: 'pro',
    subscription_started_at: null,
    subscription_ends_at: null
};

// Mock Order Provider for the preview
const MockOrderProvider = ({ children }: { children: ReactNode }) => {
    const value = {
        cart: [],
        orders: [],
        isLoadingOrders: false,
        addToCart: () => {},
        removeFromCart: () => {},
        updateQuantity: () => {},
        updateWeight: () => {},
        clearCart: () => {},
        submitOrder: async () => ({ success: false, orderNumber: 0 }),
        updateOrderStatus: async () => {},
        cancelOrder: async () => {},
        refreshOrders: async () => {},
        cartTotal: 0
    };
    return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
};

const LandingPage = () => {
    const [activeFeature, setActiveFeature] = useState(0);
    const [currentThemeIndex, setCurrentThemeIndex] = useState(0);

    // Auto-rotate features every 4 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveFeature((prev) => (prev + 1) % 4);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    // Auto-rotate themes every 2 seconds for hero phone mockup
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentThemeIndex((prev) => (prev + 1) % THEMES.length);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    const previewTenant = {
        ...BASE_TENANT,
        theme: THEMES[currentThemeIndex]
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-orange-50 text-slate-900 font-sans selection:bg-orange-500/20">
            {/* Navbar - Floating */}
            <nav className="fixed top-4 left-2 right-2 sm:left-4 sm:right-4 z-50">
                <div className="max-w-6xl mx-auto bg-white/80 backdrop-blur-xl rounded-2xl border border-orange-100 shadow-lg shadow-orange-900/5 px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 sm:gap-3 cursor-pointer">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/30 flex-shrink-0">
                            <Utensils className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </div>
                        <span className="hidden min-[480px]:inline text-lg sm:text-xl font-bold tracking-tight bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                            optimaDELIVERY
                        </span>
                    </Link>
                    <div className="flex items-center gap-3 sm:gap-4">
                        <Link to="/demo" className="hidden sm:block text-sm font-medium text-slate-600 hover:text-orange-600 transition-colors cursor-pointer">
                            Ver Demo
                        </Link>
                        <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-orange-600 transition-colors cursor-pointer">
                            Ingresar
                        </Link>
                        <Link to="/register/setup">
                            <Button className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-xl px-3 sm:px-6 font-semibold shadow-lg shadow-orange-500/25 transition-all duration-200 cursor-pointer h-9 sm:h-10 text-sm">
                                Comenzar
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
                                        Comenzar Ahora
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
                                    <span>Setup en 5 minutos</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Check className="w-5 h-5 text-green-500" />
                                    <span>Sin comisiones ocultas</span>
                                </div>
                            </div>
                        </div>

                        {/* Right - Product Mockup - Hidden on mobile */}
                        <div className="relative lg:pl-8 hidden lg:block">
                            <div className="relative flex items-center justify-center">
                                {/* Phone mockup - matching RegisterSetup style with LIVE Menu */}
                                <div className="relative transform-gpu will-change-transform" style={{ transform: 'scale(0.7)' }}>
                                    <div className="w-[375px] h-[812px] bg-white rounded-[3rem] shadow-2xl border-[8px] border-slate-900 relative overflow-hidden ring-4 ring-slate-900/10 rotate-3 hover:rotate-0 transition-transform duration-500">
                                        {/* Notch */}
                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-slate-900 rounded-b-2xl z-30" />
                                        {/* Screen Content - LIVE Menu Component */}
                                        <div className="w-full h-full overflow-y-auto overflow-x-hidden bg-white scrollbar-hide pt-8">
                                            <TenantContext.Provider value={{
                                                tenant: previewTenant,
                                                categories: PREVIEW_CATEGORIES,
                                                menuItems: PREVIEW_ITEMS,
                                                isLoading: false,
                                                error: null,
                                                tenantSlug: 'preview',
                                                refreshTenant: async () => {},
                                                refreshMenu: async () => {}
                                            }}>
                                                <MockOrderProvider>
                                                    <Menu isPreview={true} />
                                                </MockOrderProvider>
                                            </TenantContext.Provider>
                                        </div>
                                    </div>

                                    {/* Theme Switcher Buttons - Below phone */}
                                    <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/90 backdrop-blur-xl px-4 py-2 rounded-full shadow-lg border border-orange-100">
                                        <span className="text-xs font-medium text-slate-500 mr-1">Diseños:</span>
                                        {THEMES.map((theme, idx) => (
                                            <button
                                                key={theme.templateId}
                                                onClick={() => setCurrentThemeIndex(idx)}
                                                className={`w-7 h-7 rounded-full border-2 transition-all duration-200 ${
                                                    currentThemeIndex === idx
                                                        ? 'border-slate-900 scale-110 shadow-lg'
                                                        : 'border-white shadow hover:scale-105'
                                                }`}
                                                style={{ backgroundColor: theme.primaryColor }}
                                                title={theme.name}
                                            />
                                        ))}
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

                                <div className="absolute bottom-24 -right-4 bg-white rounded-2xl p-4 shadow-xl shadow-slate-200/50 animate-float-delayed z-10">
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

            {/* Mobile Phone Preview - Shown once between hero and social proof (mobile only) */}
            <section className="py-12 lg:hidden bg-gradient-to-b from-amber-50/50 to-white">
                <div className="max-w-sm mx-auto px-6">
                    <p className="text-center text-sm font-semibold text-slate-500 mb-6">
                        Así se verá tu menú
                    </p>
                    <div className="relative flex flex-col items-center">
                        {/* Phone mockup - larger for mobile view */}
                        <div className="w-[220px] h-[476px] bg-white rounded-[2rem] shadow-2xl border-[5px] border-slate-900 overflow-hidden transform-gpu">
                            {/* Notch */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-4 bg-slate-900 rounded-b-xl z-30" />
                            {/* Screen Content - Scaled Menu */}
                            <div className="w-full h-full overflow-hidden bg-white pt-5">
                                <div className="transform-gpu origin-top-left" style={{ transform: 'scale(0.587)', width: '375px', height: '812px' }}>
                                    <TenantContext.Provider value={{
                                        tenant: previewTenant,
                                        categories: PREVIEW_CATEGORIES,
                                        menuItems: PREVIEW_ITEMS,
                                        isLoading: false,
                                        error: null,
                                        tenantSlug: 'preview',
                                        refreshTenant: async () => {},
                                        refreshMenu: async () => {}
                                    }}>
                                        <MockOrderProvider>
                                            <Menu isPreview={true} />
                                        </MockOrderProvider>
                                    </TenantContext.Provider>
                                </div>
                            </div>
                        </div>
                        {/* Theme switcher dots */}
                        <div className="mt-6 flex items-center gap-2 bg-white/90 backdrop-blur-xl px-4 py-2 rounded-full shadow-lg border border-orange-100">
                            <span className="text-xs font-medium text-slate-500 mr-1">Diseños:</span>
                            {THEMES.map((theme, idx) => (
                                <button
                                    key={theme.templateId}
                                    onClick={() => setCurrentThemeIndex(idx)}
                                    className={`w-6 h-6 rounded-full border-2 transition-all duration-200 ${
                                        currentThemeIndex === idx
                                            ? 'border-slate-900 scale-110 shadow-lg'
                                            : 'border-white shadow hover:scale-105'
                                    }`}
                                    style={{ backgroundColor: theme.primaryColor }}
                                    title={theme.name}
                                />
                            ))}
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

                        {/* Feature visual - Live Phone Mockup */}
                        <div className="relative flex items-center justify-center">
                            <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-3xl p-6 md:p-8 border border-orange-500/20">
                                {/* Phone mockup with live Menu cycling themes */}
                                <div className="relative transform-gpu will-change-transform mx-auto" style={{ transform: 'scale(0.65)' }}>
                                    <div className="w-[280px] h-[607px] bg-white rounded-[2.5rem] shadow-2xl border-[6px] border-slate-800 overflow-hidden ring-4 ring-orange-500/20">
                                        {/* Notch */}
                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-5 bg-slate-800 rounded-b-xl z-30" />
                                        {/* Screen Content - LIVE Menu synced with activeFeature */}
                                        <div className="w-full h-full overflow-hidden bg-white pt-6">
                                            <TenantContext.Provider value={{
                                                tenant: {
                                                    ...BASE_TENANT,
                                                    theme: THEMES[activeFeature % THEMES.length]
                                                },
                                                categories: PREVIEW_CATEGORIES,
                                                menuItems: PREVIEW_ITEMS,
                                                isLoading: false,
                                                error: null,
                                                tenantSlug: 'preview',
                                                refreshTenant: async () => {},
                                                refreshMenu: async () => {}
                                            }}>
                                                <MockOrderProvider>
                                                    <Menu isPreview={true} />
                                                </MockOrderProvider>
                                            </TenantContext.Provider>
                                        </div>
                                    </div>
                                </div>
                                {/* Current theme badge */}
                                <div className="text-center mt-4">
                                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 text-white text-sm rounded-full border border-orange-500/30">
                                        <Eye className="w-4 h-4 text-orange-400" />
                                        Diseño: {THEMES[activeFeature % THEMES.length].name}
                                    </span>
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
                            Un plan. Dos formas de pago.
                        </h2>
                        <p className="text-xl text-slate-600">
                            Todas las funcionalidades incluidas. Elegí cómo querés pagar.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Plan Mensual */}
                        <div className="bg-white rounded-3xl p-8 border-2 border-slate-200 shadow-xl hover:shadow-2xl transition-all cursor-pointer hover:border-slate-300">
                            <h3 className="text-2xl font-bold mb-3 text-slate-900">Pago Mensual</h3>
                            <div className="flex items-baseline gap-1 mb-2">
                                <span className="text-5xl font-bold text-slate-900">$25.000</span>
                                <span className="text-slate-500 text-lg">/mes</span>
                            </div>
                            <p className="text-sm text-slate-500 mb-6">Sin compromiso. Cancelá cuando quieras.</p>
                            <Link to="/register/setup?plan=monthly">
                                <Button className="w-full h-14 rounded-xl text-lg font-bold bg-slate-800 hover:bg-slate-900 text-white shadow-lg mb-6">
                                    Comenzar Ahora
                                    <ArrowRight className="ml-2 w-5 h-5" />
                                </Button>
                            </Link>
                            <div className="pt-6 border-t border-slate-100">
                                <p className="text-xs text-slate-400 mb-4 uppercase tracking-wide font-semibold">Incluye todo:</p>
                                <ul className="space-y-3">
                                    {[
                                        'Menú Digital QR Ilimitado',
                                        'Pedidos por WhatsApp',
                                        'Cobros con MercadoPago',
                                        'Panel de Cocina',
                                        '5 Plantillas Premium',
                                        'Soporte por WhatsApp'
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-center gap-3 text-slate-700 text-sm">
                                            <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Plan Anual */}
                        <div className="relative bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl p-8 text-white shadow-2xl shadow-orange-500/30 border-2 border-orange-400">
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-sm font-bold px-4 py-1 rounded-full shadow-lg">
                                AHORRÁ $60.000/AÑO
                            </div>
                            <h3 className="text-2xl font-bold mb-3">Pago Anual</h3>
                            <div className="flex items-baseline gap-1 mb-2">
                                <span className="text-5xl font-bold">$20.000</span>
                                <span className="text-white/70 text-lg">/mes</span>
                            </div>
                            <p className="text-sm text-white/80 mb-6">
                                <span className="font-semibold">$240.000</span> cobrado una vez al año
                            </p>
                            <Link to="/register/setup?plan=annual">
                                <Button className="w-full h-14 rounded-xl text-lg font-bold bg-white text-orange-600 hover:bg-orange-50 shadow-xl mb-6">
                                    Comenzar Ahora
                                    <ArrowRight className="ml-2 w-5 h-5" />
                                </Button>
                            </Link>
                            <div className="pt-6 border-t border-white/20">
                                <p className="text-xs text-white/60 mb-4 uppercase tracking-wide font-semibold">Todo lo del plan mensual +</p>
                                <ul className="space-y-3">
                                    {[
                                        '20% de descuento permanente',
                                        'Recordatorio 30 días antes de renovar',
                                        'Estadísticas avanzadas',
                                        'Soporte premium prioritario'
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-center gap-3 text-sm">
                                            <Check className="w-4 h-4 flex-shrink-0" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    <p className="text-center text-slate-500 mt-8 text-sm">
                        Todas las funcionalidades. Sin sorpresas. Sin comisiones ocultas.
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
                            Comenzar Ahora
                            <ArrowRight className="ml-3 w-6 h-6" />
                        </Button>
                    </Link>
                    <p className="mt-6 text-slate-500 text-sm">
                        Setup en 5 minutos • Sin comisiones ocultas • Cancelá cuando quieras
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
                        <div className="flex flex-wrap justify-center gap-6 sm:gap-8 text-sm text-slate-400">
                            <Link to="/terminos" className="hover:text-white transition-colors cursor-pointer">Términos y Condiciones</Link>
                            <Link to="/privacidad" className="hover:text-white transition-colors cursor-pointer">Políticas de Privacidad</Link>
                            <a
                                href="https://wa.me/5492477509998?text=Hola!%20Me%20interesa%20OptimaDelivery."
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-white transition-colors cursor-pointer"
                            >
                                Contacto
                            </a>
                        </div>
                        <p className="text-sm text-slate-500">
                            © 2026 optimaDELIVERY. Hecho en Argentina.
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
