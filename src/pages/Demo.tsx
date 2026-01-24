import { useState, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { TenantContext } from '@/context/TenantContext';
import { OrderContext } from '@/context/OrderContext';
import Menu from '@/pages/Menu';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    LayoutDashboard,
    ChefHat,
    Smartphone,
    Plus,
    Bell,
    TrendingUp,
    Users,
    DollarSign,
    ShoppingBag,
    Utensils,
    ArrowLeft,
    Sparkles,
    Clock,
    CheckCircle,
    Truck,
    Settings,
    Palette,
    UtensilsCrossed,
    CreditCard,
    Play,
    Pause
} from 'lucide-react';
import { Tenant, MenuItem, Category } from '@/lib/supabase';
import { THEMES } from '@/lib/themes';
import { toast } from 'sonner';

// --- MOCK DATA ---
const DEMO_CATEGORIES: Category[] = [
    { id: 'c1', tenant_id: 'demo', name: 'Hamburguesas', slug: 'hamburguesas', sort_order: 1, is_active: true, created_at: '', updated_at: '', description: '', image_url: '' },
    { id: 'c2', tenant_id: 'demo', name: 'Papas & Acompañamientos', slug: 'papas', sort_order: 2, is_active: true, created_at: '', updated_at: '', description: '', image_url: '' },
    { id: 'c3', tenant_id: 'demo', name: 'Bebidas', slug: 'bebidas', sort_order: 3, is_active: true, created_at: '', updated_at: '', description: '', image_url: '' },
];

const DEMO_ITEMS: MenuItem[] = [
    { id: 'm1', tenant_id: 'demo', category_id: 'c1', name: 'Clásica con Queso', description: 'Doble carne smash, queso americano, salsa de la casa.', price: 12500, is_available: true, sort_order: 1, image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80', created_at: '', updated_at: '', sold_by_weight: false, weight_unit: 'un' },
    { id: 'm2', tenant_id: 'demo', category_id: 'c1', name: 'Bacon Royale', description: 'Panceta crujiente, aros de cebolla, salsa barbacoa.', price: 14500, is_available: true, sort_order: 2, image_url: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=800&q=80', created_at: '', updated_at: '', sold_by_weight: false, weight_unit: 'un' },
    { id: 'm3', tenant_id: 'demo', category_id: 'c2', name: 'Papas Rústicas', description: 'Cortadas a mano, doble fritura.', price: 4500, is_available: true, sort_order: 3, image_url: '/rustic_fries.png', created_at: '', updated_at: '', sold_by_weight: false, weight_unit: 'un' },
    { id: 'm4', tenant_id: 'demo', category_id: 'c3', name: 'Craft Cola', description: 'Gaseosa artesanal patagónica.', price: 3500, is_available: true, sort_order: 4, image_url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80', created_at: '', updated_at: '', sold_by_weight: false, weight_unit: 'un' },
];

const BASE_TENANT: Tenant = {
    id: 'demo-tenant',
    name: 'Burger & Co. Demo',
    slug: 'demo-burger',
    logo_url: '/burger_logo.png',
    theme: THEMES[0],
    business_phone: '+1234567890',
    business_email: 'demo@burgerco.com',
    business_address: 'Av. Libertador 1234',
    is_active: true,
    created_at: '',
    updated_at: '',
    settings: {},
    mercadopago_access_token: null,
    mercadopago_public_key: null
};

interface MockOrder {
    id: string;
    customer: string;
    total: number;
    status: 'pending' | 'preparing' | 'ready' | 'delivered';
    items: string[];
    time: string;
}

// Cart item for demo purposes
interface DemoCartItem extends MenuItem {
    quantity: number;
    weight?: number;
}

// Customer data for demo
interface DemoCustomerData {
    name?: string;
    phone?: string;
    email?: string;
    address?: string;
    notes?: string;
    deliveryType?: 'pickup' | 'delivery';
    paymentMethod?: 'cash' | 'mercadopago';
}

// --- MOCK ORDER PROVIDER ---
const MockOrderProvider = ({ children, onNewOrder }: { children: ReactNode, onNewOrder: (order: MockOrder) => void }) => {
    const [cart, setCart] = useState<DemoCartItem[]>([]);

    const addToCart = (item: MenuItem, weight?: number) => {
        setCart(prev => {
            const existing = prev.find(i => i.id === item.id);
            if (existing) {
                return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { ...item, quantity: 1, weight }];
        });
        toast.success(`Agregado: ${item.name}`, { position: 'top-center' });
    };

    const removeFromCart = (itemId: string) => {
        setCart(prev => prev.filter(i => i.id !== itemId));
    };

    const updateQuantity = (itemId: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(itemId);
            return;
        }
        setCart(prev => prev.map(i => i.id === itemId ? { ...i, quantity } : i));
    };

    const updateWeight = (itemId: string, weight: number) => {
        setCart(prev => prev.map(i => i.id === itemId ? { ...i, weight } : i));
    };

    const clearCart = () => setCart([]);

    const submitOrder = async (customer: DemoCustomerData) => {
        const orderId = Math.floor(Math.random() * 9000 + 1000).toString();
        const newOrder: MockOrder = {
            id: orderId,
            customer: customer.name || 'Cliente Demo',
            total: cart.reduce((acc, item) => acc + (item.price * item.quantity), 0),
            status: 'pending',
            items: cart.map(i => `${i.quantity}x ${i.name}`),
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        onNewOrder(newOrder);
        clearCart();
        toast.success("¡Pedido enviado a cocina!", { position: 'top-center', duration: 3000 });
        return { success: true, orderNumber: parseInt(orderId), isDemo: true };
    };

    const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    const value = {
        cart,
        orders: [],
        isLoadingOrders: false,
        addToCart,
        removeFromCart,
        updateQuantity,
        updateWeight,
        clearCart,
        submitOrder,
        updateOrderStatus: async () => { },
        cancelOrder: async () => { },
        refreshOrders: async () => { },
        cartTotal
    };

    return (
        <OrderContext.Provider value={value}>
            {children}
        </OrderContext.Provider>
    );
};

// --- VIEW COMPONENTS ---

// Demo Order Card Component (simplified version matching real OrderCard)
const DemoOrderCard = ({ order, onStatusChange }: { order: MockOrder, onStatusChange: (id: string, status: MockOrder['status']) => void }) => {
    const statusColors = {
        pending: 'bg-slate-100 text-slate-700',
        preparing: 'bg-yellow-100 text-yellow-700',
        ready: 'bg-green-100 text-green-700',
        delivered: 'bg-blue-100 text-blue-700'
    };

    const statusLabels = {
        pending: 'Pendiente',
        preparing: 'Preparando',
        ready: 'Listo',
        delivered: 'Despachado'
    };

    const nextStatus: Record<MockOrder['status'], MockOrder['status'] | null> = {
        pending: 'preparing',
        preparing: 'ready',
        ready: 'delivered',
        delivered: null
    };

    const nextAction = nextStatus[order.status];

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden hover:shadow-xl transition-shadow">
            {/* Header */}
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-slate-800">#{order.id}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                        {statusLabels[order.status]}
                    </span>
                </div>
                <span className="text-xs text-slate-400 font-mono">{order.time}</span>
            </div>

            {/* Content */}
            <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {order.customer.charAt(0)}
                    </div>
                    <span className="font-medium text-slate-700">{order.customer}</span>
                </div>

                <ul className="space-y-1.5 mb-4">
                    {order.items.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-slate-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                            {item}
                        </li>
                    ))}
                </ul>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <span className="font-bold text-lg text-slate-800">${order.total.toLocaleString()}</span>
                    {nextAction && (
                        <Button
                            size="sm"
                            onClick={() => onStatusChange(order.id, nextAction)}
                            className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-lg text-xs"
                        >
                            {nextAction === 'preparing' && 'Preparar'}
                            {nextAction === 'ready' && 'Marcar Listo'}
                            {nextAction === 'delivered' && 'Despachar'}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

const KitchenView = ({ orders, onStatusChange }: { orders: MockOrder[], onStatusChange: (id: string, status: MockOrder['status']) => void }) => {
    const pendingOrders = orders.filter(o => o.status === 'pending');
    const preparingOrders = orders.filter(o => o.status === 'preparing');
    const readyOrders = orders.filter(o => o.status === 'ready');
    const deliveredOrders = orders.filter(o => o.status === 'delivered');
    const activeOrders = orders.filter(o => o.status !== 'delivered');

    return (
        <div className="min-h-full bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
            {/* Header - Matching Kitchen.tsx style */}
            <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-orange-100">
                <div className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-orange-500/25">
                            B
                        </div>
                        <h1 className="text-2xl font-semibold tracking-wide text-slate-800">Cocina</h1>
                    </div>
                    <Button variant="outline" size="sm" className="border-orange-200 text-orange-600 hover:bg-orange-50">
                        <Settings className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">Admin</span>
                    </Button>
                </div>
            </header>

            {/* Stats Bar - Matching Kitchen.tsx */}
            <div className="bg-white/50 border-b border-orange-100">
                <div className="px-4 py-3">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
                        <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-sm">
                            <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400 shrink-0" />
                            <span className="font-semibold">{pendingOrders.length}</span>
                            <span className="text-xs sm:text-sm text-slate-500 truncate">Pendientes</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-2 bg-yellow-50 rounded-lg">
                            <ChefHat className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600 shrink-0" />
                            <span className="font-semibold">{preparingOrders.length}</span>
                            <span className="text-xs sm:text-sm text-slate-500 truncate">Preparando</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg">
                            <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 shrink-0" />
                            <span className="font-semibold">{readyOrders.length}</span>
                            <span className="text-xs sm:text-sm text-slate-500 truncate">Listos</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg">
                            <Truck className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 shrink-0" />
                            <span className="font-semibold">{deliveredOrders.length}</span>
                            <span className="text-xs sm:text-sm text-slate-500 truncate">Despachados</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Orders with Tabs - Matching Kitchen.tsx */}
            <main className="px-4 py-6">
                {orders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[50vh] text-slate-400">
                        <ChefHat className="h-20 w-20 mb-4 opacity-20 text-orange-500" />
                        <h2 className="text-xl font-semibold mb-2">Sin pedidos aun</h2>
                        <p className="text-center max-w-sm text-sm">
                            Los pedidos apareceran aqui automaticamente
                        </p>
                    </div>
                ) : (
                    <Tabs defaultValue="all" className="w-full">
                        <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full mb-6 h-auto gap-1 bg-white/50 p-1 rounded-xl">
                            <TabsTrigger value="all" className="px-3 py-2 text-xs sm:text-sm rounded-lg data-[state=active]:bg-white data-[state=active]:shadow">
                                Activos ({activeOrders.length})
                            </TabsTrigger>
                            <TabsTrigger value="pending" className="px-3 py-2 text-xs sm:text-sm rounded-lg data-[state=active]:bg-white data-[state=active]:shadow">
                                Pendientes ({pendingOrders.length})
                            </TabsTrigger>
                            <TabsTrigger value="preparing" className="px-3 py-2 text-xs sm:text-sm rounded-lg data-[state=active]:bg-white data-[state=active]:shadow">
                                Preparando ({preparingOrders.length})
                            </TabsTrigger>
                            <TabsTrigger value="ready" className="px-3 py-2 text-xs sm:text-sm rounded-lg data-[state=active]:bg-white data-[state=active]:shadow">
                                Listos ({readyOrders.length})
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="all" className="mt-0">
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {activeOrders.map(order => (
                                    <DemoOrderCard key={order.id} order={order} onStatusChange={onStatusChange} />
                                ))}
                            </div>
                        </TabsContent>

                        <TabsContent value="pending" className="mt-0">
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {pendingOrders.map(order => (
                                    <DemoOrderCard key={order.id} order={order} onStatusChange={onStatusChange} />
                                ))}
                            </div>
                        </TabsContent>

                        <TabsContent value="preparing" className="mt-0">
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {preparingOrders.map(order => (
                                    <DemoOrderCard key={order.id} order={order} onStatusChange={onStatusChange} />
                                ))}
                            </div>
                        </TabsContent>

                        <TabsContent value="ready" className="mt-0">
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {readyOrders.map(order => (
                                    <DemoOrderCard key={order.id} order={order} onStatusChange={onStatusChange} />
                                ))}
                            </div>
                        </TabsContent>
                    </Tabs>
                )}
            </main>
        </div>
    );
};

const AdminView = ({ orders, revenue }: { orders: MockOrder[], revenue: number }) => {
    const [activeAdminTab, setActiveAdminTab] = useState('overview');

    const navItems = [
        { id: 'overview', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Resumen' },
        { id: 'menu', icon: <UtensilsCrossed className="w-5 h-5" />, label: 'Menu' },
        { id: 'orders', icon: <CreditCard className="w-5 h-5" />, label: 'Pedidos' },
        { id: 'design', icon: <Palette className="w-5 h-5" />, label: 'Diseño' },
        { id: 'settings', icon: <Settings className="w-5 h-5" />, label: 'Config' },
    ];

    return (
        <div className="min-h-full bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
            {/* Top Navigation Bar for Admin Tabs */}
            <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-orange-100">
                <div className="px-4 md:px-6 py-3">
                    <div className="flex items-center justify-between mb-3">
                        <h1 className="text-xl font-semibold text-slate-800">Panel de Administración</h1>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                A
                            </div>
                            <span className="hidden sm:inline text-sm text-slate-600">Admin Demo</span>
                        </div>
                    </div>
                    <nav className="flex gap-1">
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveAdminTab(item.id)}
                                className={`flex items-center justify-center gap-1.5 px-2 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all flex-1 sm:flex-none ${
                                    activeAdminTab === item.id
                                        ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg shadow-orange-500/25'
                                        : 'text-slate-600 hover:bg-orange-50 hover:text-slate-800'
                                }`}
                            >
                                {item.icon}
                                <span className="hidden sm:inline">{item.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>
            </header>

            {/* Main Content */}
            <main className="p-4 md:p-6 overflow-auto">
                {activeAdminTab === 'overview' && (
                    <div className="space-y-6">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-white/80 backdrop-blur-xl p-5 rounded-2xl shadow-lg shadow-orange-900/5 border border-white/50">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-sm font-medium text-slate-500">Ingresos Hoy</h3>
                                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                        <DollarSign className="w-4 h-4 text-green-600" />
                                    </div>
                                </div>
                                <p className="text-2xl font-bold text-slate-800">${revenue.toLocaleString()}</p>
                                <p className="text-xs text-green-600 flex items-center mt-2 font-medium">
                                    <TrendingUp className="w-3 h-3 mr-1" /> +12.5% vs ayer
                                </p>
                            </div>
                            <div className="bg-white/80 backdrop-blur-xl p-5 rounded-2xl shadow-lg shadow-orange-900/5 border border-white/50">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-sm font-medium text-slate-500">Pedidos Activos</h3>
                                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                                        <ShoppingBag className="w-4 h-4 text-orange-600" />
                                    </div>
                                </div>
                                <p className="text-2xl font-bold text-slate-800">{orders.filter(o => o.status !== 'delivered').length}</p>
                            </div>
                            <div className="bg-white/80 backdrop-blur-xl p-5 rounded-2xl shadow-lg shadow-orange-900/5 border border-white/50">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-sm font-medium text-slate-500">Clientes Nuevos</h3>
                                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                        <Users className="w-4 h-4 text-purple-600" />
                                    </div>
                                </div>
                                <p className="text-2xl font-bold text-slate-800">24</p>
                            </div>
                            <div className="bg-white/80 backdrop-blur-xl p-5 rounded-2xl shadow-lg shadow-orange-900/5 border border-white/50">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-sm font-medium text-slate-500">Tiempo Promedio</h3>
                                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <Clock className="w-4 h-4 text-blue-600" />
                                    </div>
                                </div>
                                <p className="text-2xl font-bold text-slate-800">12min</p>
                            </div>
                        </div>

                        {/* Menu Online Banner */}
                        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-4 sm:p-6 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                                    <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-bold text-base sm:text-lg">Tu menú está online</h3>
                                    <p className="text-white/80 text-xs sm:text-sm truncate">demo-burger.optimadelivery.com</p>
                                </div>
                            </div>
                            <Button variant="secondary" size="sm" className="bg-white text-green-600 hover:bg-green-50 shrink-0 w-full sm:w-auto">
                                Ver Menú
                            </Button>
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg shadow-orange-900/5 border border-white/50 overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 font-semibold text-slate-800">Actividad Reciente</div>
                            <div className="divide-y divide-slate-100">
                                {orders.slice().reverse().slice(0, 5).map(order => (
                                    <div key={order.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2.5 h-2.5 rounded-full ${order.status === 'delivered' ? 'bg-green-500' : 'bg-orange-500'}`} />
                                            <div>
                                                <p className="font-medium text-sm text-slate-800">Pedido #{order.id}</p>
                                                <p className="text-xs text-slate-500">{order.customer}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium text-sm text-slate-800">${order.total.toLocaleString()}</p>
                                            <p className="text-xs text-slate-500">{order.time}</p>
                                        </div>
                                    </div>
                                ))}
                                {orders.length === 0 && (
                                    <div className="px-6 py-12 text-center text-slate-400">
                                        No hay actividad reciente
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeAdminTab === 'menu' && (
                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-lg border border-white/50 text-center">
                        <UtensilsCrossed className="w-16 h-16 mx-auto mb-4 text-orange-300" />
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Gestión de Menú</h3>
                        <p className="text-slate-500">Aquí podrás agregar, editar y organizar tus productos y categorías.</p>
                    </div>
                )}

                {activeAdminTab === 'orders' && (
                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-lg border border-white/50 text-center">
                        <CreditCard className="w-16 h-16 mx-auto mb-4 text-orange-300" />
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Historial de Pedidos</h3>
                        <p className="text-slate-500">Revisa y gestiona todos los pedidos de tu negocio.</p>
                    </div>
                )}

                {activeAdminTab === 'design' && (
                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-lg border border-white/50 text-center">
                        <Palette className="w-16 h-16 mx-auto mb-4 text-orange-300" />
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Personalización</h3>
                        <p className="text-slate-500">Personaliza colores, fuentes y el aspecto de tu menú digital.</p>
                    </div>
                )}

                {activeAdminTab === 'settings' && (
                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-lg border border-white/50 text-center">
                        <Settings className="w-16 h-16 mx-auto mb-4 text-orange-300" />
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Configuración</h3>
                        <p className="text-slate-500">Configura pagos, horarios, equipo y más opciones de tu negocio.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

// --- MAIN DEMO PAGE ---
const Demo = () => {
    const [viewMode, setViewMode] = useState<'consumer' | 'kitchen' | 'admin'>('consumer');
    const [currentTheme, setCurrentTheme] = useState(THEMES[0]);

    const [orders, setOrders] = useState<MockOrder[]>([
        { id: '101', customer: 'Juan Perez', total: 17000, status: 'preparing', items: ['Clásica con Queso', 'Papas Rústicas'], time: '12:30 PM' },
        { id: '102', customer: 'Maria Garcia', total: 3500, status: 'pending', items: ['Craft Cola'], time: '12:35 PM' },
    ]);
    const [lastNotification, setLastNotification] = useState<string | null>(null);

    const dynamicTenant = {
        ...BASE_TENANT,
        theme: currentTheme
    };

    const handleNewOrder = (order: MockOrder) => {
        setOrders(prev => [...prev, order]);
        setLastNotification(`¡Nuevo Pedido #${order.id} recibido!`);
        setTimeout(() => setLastNotification(null), 3000);
    };

    const simulateOrder = () => {
        const id = Math.floor(Math.random() * 900 + 100).toString();
        const newOrder: MockOrder = {
            id,
            customer: `Cliente Simulado`,
            total: Math.floor(Math.random() * 20000 + 5000),
            status: 'pending',
            items: ['Bacon Royale', 'Papas Rústicas'],
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        handleNewOrder(newOrder);
    };

    const handleStatusChange = (orderId: string, newStatus: MockOrder['status']) => {
        setOrders(prev => prev.map(order =>
            order.id === orderId ? { ...order, status: newStatus } : order
        ));
        toast.success(`Pedido #${orderId} actualizado`, { position: 'top-center' });
    };

    return (
        <div className="flex h-screen overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 font-sans">
            {/* Sidebar Navigation */}
            <aside className="w-20 md:w-72 flex-shrink-0 border-r border-orange-100/50 flex flex-col bg-white/70 backdrop-blur-xl">
                <div className="p-4 md:p-6 flex items-center gap-3 border-b border-orange-100/50 h-20">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/25 flex-shrink-0">
                        <Utensils className="h-5 w-5 text-white" />
                    </div>
                    <div className="hidden md:block">
                        <span className="font-bold text-lg text-slate-800">optima</span>
                        <span className="font-light text-orange-600">DELIVERY</span>
                    </div>
                </div>

                <ScrollArea className="flex-1">
                    <nav className="p-4 space-y-6">
                        {/* Section: Apps */}
                        <section>
                            <div className="text-xs font-bold text-slate-400 uppercase mb-3 px-2 hidden md:block tracking-wider">Módulos</div>
                            <div className="space-y-1">
                                <Button
                                    variant="ghost"
                                    className={`w-full justify-start h-12 rounded-xl transition-all ${viewMode === 'consumer'
                                        ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg shadow-orange-500/25'
                                        : 'text-slate-600 hover:text-slate-800 hover:bg-orange-50'}`}
                                    onClick={() => setViewMode('consumer')}
                                >
                                    <Smartphone className="w-5 h-5 mr-3" />
                                    <span className="hidden md:inline font-medium">App Clientes</span>
                                </Button>
                                <Button
                                    variant="ghost"
                                    className={`w-full justify-start h-12 rounded-xl transition-all ${viewMode === 'kitchen'
                                        ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg shadow-orange-500/25'
                                        : 'text-slate-600 hover:text-slate-800 hover:bg-orange-50'}`}
                                    onClick={() => setViewMode('kitchen')}
                                >
                                    <ChefHat className="w-5 h-5 mr-3" />
                                    <span className="hidden md:inline font-medium">Cocina (KDS)</span>
                                </Button>
                                <Button
                                    variant="ghost"
                                    className={`w-full justify-start h-12 rounded-xl transition-all ${viewMode === 'admin'
                                        ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg shadow-orange-500/25'
                                        : 'text-slate-600 hover:text-slate-800 hover:bg-orange-50'}`}
                                    onClick={() => setViewMode('admin')}
                                >
                                    <LayoutDashboard className="w-5 h-5 mr-3" />
                                    <span className="hidden md:inline font-medium">Administración</span>
                                </Button>
                            </div>
                        </section>

                        {/* Section: Template Switcher */}
                        <section>
                            <div className="text-xs font-bold text-slate-400 uppercase mb-3 px-2 hidden md:block tracking-wider">Diseños</div>
                            <div className="space-y-1">
                                {THEMES.map(theme => (
                                    <Button
                                        key={theme.templateId}
                                        variant="ghost"
                                        size="sm"
                                        className={`w-full justify-start h-10 rounded-lg transition-all ${currentTheme.templateId === theme.templateId
                                            ? 'bg-orange-100 text-orange-700'
                                            : 'text-slate-500 hover:text-slate-700 hover:bg-orange-50'}`}
                                        onClick={() => {
                                            setCurrentTheme(theme);
                                            setViewMode('consumer');
                                            toast.info(`Diseño cambiado a: ${theme.name}`, { position: 'bottom-center' });
                                        }}
                                    >
                                        <div
                                            className="w-4 h-4 rounded-full mr-3 border-2 border-white shadow-sm"
                                            style={{ backgroundColor: theme.primaryColor }}
                                        />
                                        <span className="hidden md:inline capitalize text-sm">{theme.name}</span>
                                    </Button>
                                ))}
                            </div>
                        </section>
                    </nav>
                </ScrollArea>

                <div className="p-4 space-y-3 border-t border-orange-100/50">
                    <Button
                        onClick={simulateOrder}
                        className="w-full h-12 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium shadow-lg shadow-green-500/25 rounded-xl"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        <span className="hidden md:inline">Simular Pedido</span>
                    </Button>
                    <Link to="/">
                        <Button variant="ghost" className="w-full h-10 text-slate-500 hover:text-slate-700 hover:bg-orange-50 rounded-lg">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            <span className="hidden md:inline">Volver al inicio</span>
                        </Button>
                    </Link>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 relative overflow-hidden bg-white shadow-2xl">
                {viewMode === 'consumer' && (
                    <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 p-4 overflow-hidden">
                        {/* Phone Mockup Frame - Matching RegisterSetup style */}
                        <div className="relative scale-[0.85] sm:scale-90 md:scale-95 lg:scale-100 origin-center">
                            <div className="w-[375px] h-[812px] bg-white rounded-[3rem] shadow-2xl border-[8px] border-slate-900 relative overflow-hidden ring-4 ring-slate-900/10">
                                {/* Notch */}
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-slate-900 rounded-b-2xl z-30" />
                                {/* Screen Content */}
                                <div className="w-full h-full overflow-y-auto overflow-x-hidden bg-white scrollbar-hide pt-8">
                                    <TenantContext.Provider value={{
                                        tenant: dynamicTenant,
                                        categories: DEMO_CATEGORIES,
                                        menuItems: DEMO_ITEMS,
                                        isLoading: false,
                                        error: null,
                                        tenantSlug: 'demo',
                                        refreshTenant: async () => { },
                                        refreshMenu: async () => { }
                                    }}>
                                        <MockOrderProvider onNewOrder={handleNewOrder}>
                                            <Menu />
                                        </MockOrderProvider>
                                    </TenantContext.Provider>
                                </div>
                            </div>
                        </div>
                        {/* Phone label */}
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white px-4 py-2 rounded-full shadow-xl flex items-center gap-2 text-sm font-medium backdrop-blur z-10">
                            <Smartphone className="w-4 h-4" />
                            Vista del Cliente
                        </div>
                    </div>
                )}

                {viewMode === 'kitchen' && (
                    <div className="h-full overflow-auto">
                        <KitchenView orders={orders} onStatusChange={handleStatusChange} />
                    </div>
                )}

                {viewMode === 'admin' && (
                    <AdminView orders={orders} revenue={orders.reduce((acc, curr) => acc + curr.total, 0)} />
                )}

                {/* Toast Notification Overlay */}
                {lastNotification && (
                    <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-3 rounded-full shadow-2xl shadow-orange-500/30 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 z-50 pointer-events-none">
                        <Bell className="w-5 h-5" />
                        <span className="font-semibold tracking-wide">{lastNotification}</span>
                    </div>
                )}

                {/* Demo Badge */}
                <div className="absolute bottom-6 right-6 z-40">
                    <div className="bg-white/90 backdrop-blur-xl px-4 py-2 rounded-full shadow-lg border border-orange-100 flex items-center gap-2 text-sm font-medium text-slate-600">
                        <Sparkles className="w-4 h-4 text-orange-500" />
                        Modo Demo
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Demo;
