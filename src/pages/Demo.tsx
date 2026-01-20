import { useState, ReactNode } from 'react';
import { TenantContext } from '@/context/TenantContext';
// We import OrderContext to provide it with mock values
import { OrderContext } from '@/context/OrderContext';
import Menu from '@/pages/Menu';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    LayoutDashboard,
    ChefHat,
    Smartphone,
    Plus,
    Bell,
    TrendingUp,
    Users,
    DollarSign,
    ShoppingBag
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

// --- MOCK ORDER PROVIDER ---
const MockOrderProvider = ({ children, onNewOrder }: { children: ReactNode, onNewOrder: (order: MockOrder) => void }) => {
    const [cart, setCart] = useState<any[]>([]);

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

    const submitOrder = async (customer: any) => {
        const orderId = Math.floor(Math.random() * 9000 + 1000).toString();
        const newOrder: MockOrder = {
            id: orderId,
            customer: customer.name || 'Cliente Demo',
            total: cart.reduce((acc, item) => acc + (item.price * item.quantity), 0),
            status: 'pending',
            items: cart.map(i => `${i.quantity}x ${i.name}`),
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        onNewOrder(newOrder); // Update KDS
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

const KitchenView = ({ orders }: { orders: MockOrder[] }) => (
    <div className="p-8 bg-slate-100 min-h-full">
        <header className="mb-8 flex justify-between items-center">
            <h2 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                <ChefHat className="w-8 h-8 text-orange-500" />
                Monitor de Cocina (KDS)
            </h2>
            <div className="bg-white px-4 py-2 rounded-full shadow-sm font-mono text-sm">
                Promedio Prep: <span className="font-bold text-green-600">12m</span>
            </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {['pending', 'preparing', 'ready', 'delivered'].map((status) => {
                const label = status === 'pending' ? 'Pendiente' :
                    status === 'preparing' ? 'En Preparación' :
                        status === 'ready' ? 'Listo' : 'Entregado';

                return (
                    <div key={status} className="bg-slate-200/50 rounded-xl p-4 flex flex-col h-full">
                        <h3 className="uppercase text-xs font-bold text-slate-500 mb-4 tracking-wider flex justify-between">
                            {label}
                            <span className="bg-slate-300 px-2 rounded-full text-slate-700">{orders.filter(o => o.status === status).length}</span>
                        </h3>
                        <div className="space-y-3">
                            {orders.filter(o => o.status === status).map(order => (
                                <div key={order.id} className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-orange-500 animate-in fade-in slide-in-from-bottom-2">
                                    <div className="flex justify-between mb-2">
                                        <span className="font-bold text-lg">#{order.id}</span>
                                        <span className="text-xs text-slate-400 font-mono">{order.time}</span>
                                    </div>
                                    <p className="text-sm font-medium text-slate-700 mb-3">{order.customer}</p>
                                    <ul className="text-xs text-slate-500 space-y-1 mb-3 pt-2 border-t border-slate-100">
                                        {order.items.map((item, idx) => (
                                            <li key={idx} className="flex items-center gap-2">
                                                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    </div>
);

const AdminView = ({ orders, revenue }: { orders: MockOrder[], revenue: number }) => (
    <div className="p-8 bg-slate-50 min-h-full">
        <header className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                <LayoutDashboard className="w-8 h-8 text-blue-600" />
                Panel de Administración
            </h2>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-slate-500">Ingresos Totales</h3>
                    <DollarSign className="w-4 h-4 text-green-500" />
                </div>
                <p className="text-3xl font-bold text-slate-900">${revenue.toLocaleString()}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" /> +12.5% vs ayer
                </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-slate-500">Pedidos Activos</h3>
                    <ShoppingBag className="w-4 h-4 text-blue-500" />
                </div>
                <p className="text-3xl font-bold text-slate-900">{orders.filter(o => o.status !== 'delivered').length}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-slate-500">Clientes Nuevos</h3>
                    <Users className="w-4 h-4 text-purple-500" />
                </div>
                <p className="text-3xl font-bold text-slate-900">24</p>
            </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 font-semibold text-slate-700">Actividad Reciente</div>
            <div className="divide-y divide-slate-100">
                {orders.slice().reverse().map(order => (
                    <div key={order.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50">
                        <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${order.status === 'delivered' ? 'bg-green-500' : 'bg-orange-500'}`} />
                            <div>
                                <p className="font-medium text-sm text-slate-900">Pedido #{order.id}</p>
                                <p className="text-xs text-slate-500">{order.customer}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-medium text-sm text-slate-900">${order.total.toLocaleString()}</p>
                            <p className="text-xs text-slate-500">{order.time}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

// --- MAIN DEMO PAGE ---
const Demo = () => {
    const [viewMode, setViewMode] = useState<'consumer' | 'kitchen' | 'admin'>('consumer');
    // Default to the first theme
    const [currentTheme, setCurrentTheme] = useState(THEMES[0]);

    // Initial mock orders
    const [orders, setOrders] = useState<MockOrder[]>([
        { id: '101', customer: 'Juan Perez', total: 17000, status: 'preparing', items: ['Clásica con Queso', 'Papas Rústicas'], time: '12:30 PM' },
        { id: '102', customer: 'Maria Garcia', total: 3500, status: 'pending', items: ['Craft Cola'], time: '12:35 PM' },
    ]);
    const [lastNotification, setLastNotification] = useState<string | null>(null);

    // Apply selected theme to the mock tenant
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

    return (
        <div className="flex h-screen overflow-hidden bg-slate-950 text-white font-sans">
            {/* Sidebar Navigation */}
            <aside className="w-20 md:w-72 flex-shrink-0 border-r border-slate-900 flex flex-col bg-slate-950">
                <div className="p-6 flex items-center gap-3 border-b border-slate-900 h-20">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xl flex-shrink-0 shadow-lg shadow-blue-900/20">
                        O
                    </div>
                    <div className="hidden md:block">
                        <span className="font-bold text-lg tracking-tight">optima</span>
                        <span className="font-light text-slate-400">DELIVERY</span>
                    </div>
                </div>

                <ScrollArea className="flex-1">
                    <nav className="p-4 space-y-8">
                        {/* Section: Apps */}
                        <section>
                            <div className="text-xs font-bold text-slate-500 uppercase mb-3 px-2 hidden md:block tracking-wider">Módulos</div>
                            <div className="space-y-1">
                                <Button
                                    variant="ghost"
                                    className={`w-full justify-start h-12 ${viewMode === 'consumer' ? 'bg-blue-600/10 text-blue-400 border-l-2 border-blue-500' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                                    onClick={() => setViewMode('consumer')}
                                >
                                    <Smartphone className="w-5 h-5 mr-3" />
                                    <span className="hidden md:inline font-medium">App Clientes</span>
                                </Button>
                                <Button
                                    variant="ghost"
                                    className={`w-full justify-start h-12 ${viewMode === 'kitchen' ? 'bg-orange-600/10 text-orange-400 border-l-2 border-orange-500' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                                    onClick={() => setViewMode('kitchen')}
                                >
                                    <ChefHat className="w-5 h-5 mr-3" />
                                    <span className="hidden md:inline font-medium">Cocina (KDS)</span>
                                </Button>
                                <Button
                                    variant="ghost"
                                    className={`w-full justify-start h-12 ${viewMode === 'admin' ? 'bg-emerald-600/10 text-emerald-400 border-l-2 border-emerald-500' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                                    onClick={() => setViewMode('admin')}
                                >
                                    <LayoutDashboard className="w-5 h-5 mr-3" />
                                    <span className="hidden md:inline font-medium">Administración</span>
                                </Button>
                            </div>
                        </section>

                        {/* Section: Template Switcher (Config) */}
                        <section>
                            <div className="text-xs font-bold text-slate-500 uppercase mb-3 px-2 hidden md:block tracking-wider">Diseños</div>
                            <div className="space-y-1">
                                {THEMES.map(theme => (
                                    <Button
                                        key={theme.templateId}
                                        variant="ghost"
                                        size="sm"
                                        className={`w-full justify-start h-10 ${currentTheme.templateId === theme.templateId ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                                        onClick={() => {
                                            setCurrentTheme(theme);
                                            setViewMode('consumer'); // Switch to consumer to see changes
                                            toast.info(`Diseño cambiado a: ${theme.name}`, { position: 'bottom-center' });
                                        }}
                                    >
                                        <div className="w-3 h-3 rounded-full mr-3 border border-white/20" style={{ backgroundColor: theme.primaryColor }}></div>
                                        <span className="hidden md:inline capitalize text-sm">{theme.name}</span>
                                    </Button>
                                ))}
                            </div>
                        </section>

                    </nav>
                </ScrollArea>

                <div className="p-4 border-t border-slate-900">
                    <Button onClick={simulateOrder} variant="outline" className="w-full h-12 border-slate-800 bg-slate-900/50 hover:bg-slate-800 text-green-400 font-medium">
                        <Plus className="w-4 h-4 mr-2" />
                        <span className="hidden md:inline">Simular Pedido</span>
                    </Button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 relative overflow-hidden bg-white text-slate-900 shadow-2xl">
                {viewMode === 'consumer' && (
                    <div className="h-full overflow-y-auto w-full">
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
                )}

                {viewMode === 'kitchen' && (
                    <KitchenView orders={orders} />
                )}

                {viewMode === 'admin' && (
                    <AdminView orders={orders} revenue={orders.reduce((acc, curr) => acc + curr.total, 0)} />
                )}

                {/* Toast Notification Overlay */}
                {lastNotification && (
                    <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 z-50 pointer-events-none border border-slate-700">
                        <Bell className="w-5 h-5 text-yellow-500" />
                        <span className="font-semibold tracking-wide">{lastNotification}</span>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Demo;
