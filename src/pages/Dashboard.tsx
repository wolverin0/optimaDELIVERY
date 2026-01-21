import { useState, useMemo, useEffect, useCallback } from 'react';
import { useTenant } from '@/context/TenantContext';
import { useAuth } from '@/context/AuthContext';
import { useOrders } from '@/context/OrderContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Store, CreditCard, LayoutDashboard, UtensilsCrossed, Settings, LogOut, ExternalLink, CheckCircle, Palette, Edit, Utensils } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { MenuManager } from '@/components/admin/MenuManager';
import { OrdersManager } from '@/components/admin/OrdersManager';
import { ThemeSettings } from '@/components/admin/ThemeSettings';
import { TeamManager } from '@/components/admin/TeamManager';
import { KDSManager } from '@/components/admin/KDSManager';
import { KitchenPinSettings } from '@/components/admin/KitchenPinSettings';
import { SocialNetworksSettings } from '@/components/admin/SocialNetworksSettings';
import { ChefHat, Share2 } from 'lucide-react';

// Environment variables for MercadoPago
const MP_CLIENT_ID = import.meta.env.VITE_MP_CLIENT_ID || 'YOUR_MP_CLIENT_ID';
const MP_REDIRECT_URI = import.meta.env.VITE_MP_REDIRECT_URI || 'YOUR_EDGE_FUNCTION_URL';

// Role type definition
type UserRole = 'owner' | 'admin' | 'kitchen' | 'staff';

// Navigation item configuration with role-based visibility
interface NavItemConfig {
    id: string;
    icon: React.ReactNode;
    label: string;
    allowedRoles: UserRole[];
}

// Helper function to check if user has permission for a specific set of roles
const hasPermission = (userRole: UserRole | undefined, allowedRoles: UserRole[]): boolean => {
    if (!userRole) return false;
    return allowedRoles.includes(userRole);
};

// Check if user can edit (owner or admin only)
const canEdit = (userRole: UserRole | undefined): boolean => {
    return hasPermission(userRole, ['owner', 'admin']);
};

// Check if user can access billing/subscription settings (owner only)
const canAccessBilling = (userRole: UserRole | undefined): boolean => {
    return hasPermission(userRole, ['owner']);
};

const Dashboard = () => {
    const { tenant, isLoading, error, refreshTenant } = useTenant();
    const { signOut, profile } = useAuth();
    const { orders } = useOrders();
    const [searchParams, setSearchParams] = useSearchParams();
    const { toast } = useToast();

    const userRole = profile?.role as UserRole | undefined;

    // Calculate today's sales from paid orders or delivered cash orders
    const todayStats = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayOrders = orders.filter(order => {
            const orderDate = new Date(order.createdAt);
            orderDate.setHours(0, 0, 0, 0);
            return orderDate.getTime() === today.getTime();
        });

        // Count sales: paid MP orders OR delivered cash orders
        const paidOrders = todayOrders.filter(order => {
            // MercadoPago orders that are paid
            if (order.payment_method === 'mercadopago' && order.payment_status === 'paid') {
                return true;
            }
            // Cash orders that are dispatched (delivered)
            if (order.payment_method === 'cash' && order.status === 'dispatched') {
                return true;
            }
            return false;
        });

        const totalSales = paidOrders.reduce((sum, order) => sum + order.total, 0);
        const activeOrders = todayOrders.filter(o =>
            o.status !== 'cancelled' && o.status !== 'dispatched'
        ).length;

        return {
            sales: totalSales,
            activeOrders,
            totalOrders: todayOrders.length
        };
    }, [orders]);

    // Handle MercadoPago connection result
    useEffect(() => {
        const mpSuccess = searchParams.get('mp_success');
        const mpError = searchParams.get('mp_error');

        if (mpSuccess === 'true') {
            // Refresh tenant to get updated MP credentials
            refreshTenant();
            toast({
                title: 'MercadoPago conectado',
                description: 'Tu cuenta de MercadoPago se ha vinculado correctamente.',
            });
            // Clean URL
            searchParams.delete('mp_success');
            setSearchParams(searchParams, { replace: true });
        }

        if (mpError) {
            toast({
                title: 'Error al conectar MercadoPago',
                description: `No se pudo vincular tu cuenta: ${mpError}`,
                variant: 'destructive',
            });
            // Clean URL
            searchParams.delete('mp_error');
            setSearchParams(searchParams, { replace: true });
        }
    }, [searchParams, refreshTenant, toast, setSearchParams]);

    const navItems: NavItemConfig[] = useMemo(() => [
        { id: 'overview', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Resumen', allowedRoles: ['owner', 'admin', 'staff'] },
        { id: 'menu', icon: <UtensilsCrossed className="w-5 h-5" />, label: 'Menu', allowedRoles: ['owner', 'admin'] },
        { id: 'kitchen', icon: <ChefHat className="w-5 h-5" />, label: 'Cocina', allowedRoles: ['owner', 'admin', 'kitchen'] },
        { id: 'orders', icon: <CreditCard className="w-5 h-5" />, label: 'Pedidos', allowedRoles: ['owner', 'admin', 'staff'] },
        { id: 'design', icon: <Palette className="w-5 h-5" />, label: 'Diseño', allowedRoles: ['owner', 'admin'] },
        { id: 'settings', icon: <Settings className="w-5 h-5" />, label: 'Config', allowedRoles: ['owner', 'admin'] },
    ], []);

    const visibleNavItems = useMemo(() => {
        return navItems.filter(item => hasPermission(userRole, item.allowedRoles));
    }, [navItems, userRole]);

    const getDefaultTab = useMemo(() => {
        if (userRole === 'kitchen') return 'kitchen';
        if (userRole === 'staff') return 'overview';
        return 'overview';
    }, [userRole]);

    const [activeTab, setActiveTab] = useState(getDefaultTab);

    useEffect(() => {
        const isCurrentTabAllowed = visibleNavItems.some(item => item.id === activeTab);
        if (!isCurrentTabAllowed && visibleNavItems.length > 0) {
            setActiveTab(visibleNavItems[0].id);
        }
    }, [activeTab, visibleNavItems]);

    if (isLoading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/30 animate-pulse">
                        <Utensils className="w-6 h-6 text-white" />
                    </div>
                    <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
                </div>
            </div>
        );
    }

    if (error || !tenant) {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 gap-6 px-4">
                <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center">
                    <Store className="w-8 h-8 text-red-500" />
                </div>
                <div className="text-center">
                    <p className="text-red-600 font-medium text-lg mb-2">Error al cargar</p>
                    <p className="text-slate-500 text-sm">No se pudo cargar la información del negocio.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={() => window.location.reload()} className="rounded-xl">
                        Reintentar
                    </Button>
                    <Button variant="destructive" onClick={signOut} className="rounded-xl">
                        Cerrar Sesión
                    </Button>
                </div>
            </div>
        );
    }

    const isMpConnected = !!tenant.mercadopago_access_token;
    const mpAuthUrl = `https://auth.mercadopago.com.ar/authorization?client_id=${MP_CLIENT_ID}&response_type=code&platform_id=mp&redirect_uri=${encodeURIComponent(MP_REDIRECT_URI)}&state=${tenant.id}`;

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white/70 backdrop-blur-xl border-r border-orange-100/50 hidden md:flex flex-col">
                <div className="p-6 border-b border-orange-100/50">
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/25 group-hover:shadow-orange-500/40 transition-shadow">
                            <Utensils className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <span className="font-bold text-lg text-slate-800">optima</span>
                            <span className="font-light text-orange-600">DELIVERY</span>
                        </div>
                    </Link>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {visibleNavItems.map((item) => (
                        <NavItem
                            key={item.id}
                            icon={item.icon}
                            label={item.label}
                            isActive={activeTab === item.id}
                            onClick={() => setActiveTab(item.id)}
                        />
                    ))}
                </nav>

                <div className="p-4 border-t border-orange-100/50">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center text-sm font-bold text-orange-600">
                            {profile?.full_name?.charAt(0)?.toUpperCase() || profile?.email?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div className="overflow-hidden flex-1">
                            <p className="text-sm font-medium text-slate-800 truncate">{profile?.full_name || profile?.email || 'Usuario'}</p>
                            <RoleBadge role={userRole} />
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl"
                        onClick={signOut}
                    >
                        <LogOut className="w-4 h-4 mr-2" />
                        Cerrar Sesión
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                {/* Mobile Header */}
                <header className="md:hidden bg-white/80 backdrop-blur-xl border-b border-orange-100/50 sticky top-0 z-10">
                    <div className="h-14 flex items-center px-4 justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                                <Utensils className="h-4 w-4 text-white" />
                            </div>
                            <span className="font-bold text-slate-800">optimaDELIVERY</span>
                        </div>
                        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={signOut}>
                            <LogOut className="w-4 h-4" />
                        </Button>
                    </div>
                    {/* Mobile Navigation Tabs - 2 rows grid */}
                    <div className="grid grid-cols-3 gap-1 px-2 pb-2">
                        {visibleNavItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`flex flex-col items-center justify-center gap-1 py-2 rounded-lg text-xs font-medium transition-all ${
                                    activeTab === item.id
                                        ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg shadow-orange-500/25'
                                        : 'text-slate-600 bg-white/50 hover:bg-orange-50'
                                }`}
                            >
                                {item.icon}
                                <span className="text-[10px]">{item.label}</span>
                            </button>
                        ))}
                    </div>
                </header>

                <div className="p-6 md:p-8 max-w-7xl mx-auto">
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
                                    Hola, {tenant.name.split(' ')[0]}
                                </h1>
                                <p className="text-slate-500 mt-1">Aquí está el resumen de tu negocio</p>
                            </div>

                            <div className="grid md:grid-cols-3 gap-4 md:gap-6">
                                <StatCard
                                    title="Ventas Hoy"
                                    value={`$${todayStats.sales.toLocaleString()}`}
                                    subtitle={`${todayStats.totalOrders} pedido${todayStats.totalOrders !== 1 ? 's' : ''} hoy`}
                                />
                                <StatCard
                                    title="Pedidos Activos"
                                    value={todayStats.activeOrders.toString()}
                                />
                                <StatCard title="Visitas al Menú" value="0" />
                            </div>

                            <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl p-6 md:p-8 text-white shadow-xl shadow-orange-500/20">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                        <h2 className="text-xl font-bold mb-2">Tu menú está online</h2>
                                        <p className="text-white/80 mb-4">Comparte el link con tus clientes para empezar a vender.</p>
                                        <div className="flex items-center gap-2 bg-black/20 backdrop-blur px-3 py-2 rounded-xl text-xs sm:text-sm font-mono max-w-full overflow-hidden">
                                            <span className="truncate min-w-0">optimadelivery.vercel.app/t/{tenant.slug}</span>
                                            <ExternalLink
                                                className="w-4 h-4 opacity-70 cursor-pointer hover:opacity-100 transition-opacity flex-shrink-0"
                                                onClick={() => window.open(`/t/${tenant.slug}`, '_blank')}
                                            />
                                        </div>
                                    </div>
                                    <Button
                                        className="bg-white hover:bg-white/90 text-orange-600 font-semibold shadow-lg rounded-xl h-12 px-6"
                                        onClick={() => window.open(`/t/${tenant.slug}`, '_blank')}
                                    >
                                        Ver mi Menú
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'settings' && canEdit(userRole) && (
                        <div className="space-y-6">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-800 mb-1">Configuración</h1>
                                <p className="text-slate-500">Administra los ajustes de tu negocio</p>
                            </div>

                            <Tabs defaultValue="general" className="w-full">
                                <TabsList className="mb-6 bg-white/60 backdrop-blur rounded-xl p-1">
                                    <TabsTrigger value="general" className="rounded-lg">General</TabsTrigger>
                                    {canAccessBilling(userRole) && (
                                        <TabsTrigger value="payments" className="rounded-lg">Pagos</TabsTrigger>
                                    )}
                                    <TabsTrigger value="kitchen" className="rounded-lg">Cocina</TabsTrigger>
                                    <TabsTrigger value="social" className="rounded-lg">Redes</TabsTrigger>
                                    <TabsTrigger value="team" className="rounded-lg">Equipo</TabsTrigger>
                                </TabsList>

                                {canAccessBilling(userRole) && (
                                    <TabsContent value="payments" className="space-y-6">
                                        <Card className="bg-white/70 backdrop-blur-xl border-white/50 shadow-lg shadow-orange-900/5 rounded-2xl">
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2 text-slate-800">
                                                    <CreditCard className="w-5 h-5 text-orange-500" />
                                                    Métodos de Cobro
                                                </CardTitle>
                                                <CardDescription>
                                                    Configura cómo reciben el dinero tus clientes.
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent className="space-y-6">
                                                {/* MercadoPago Connect */}
                                                <div className="flex items-start justify-between p-4 border border-orange-100 rounded-xl hover:border-orange-200 transition-colors bg-white/50">
                                                    <div className="flex gap-4">
                                                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center p-2">
                                                            <img src="https://logotipoz.com/wp-content/uploads/2021/10/version-horizontal-large-logo-mercado-pago.webp" alt="MP" className="w-full h-full object-contain" />
                                                        </div>
                                                        <div>
                                                            <h3 className="font-medium text-slate-800">Mercado Pago</h3>
                                                            <p className="text-sm text-slate-500 max-w-sm mt-1">
                                                                Conecta tu cuenta para recibir pagos directamente con QR y links de pago.
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {isMpConnected ? (
                                                            <Badge className="bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1 flex gap-1 rounded-full">
                                                                <CheckCircle className="w-3 h-3" />
                                                                Conectado
                                                            </Badge>
                                                        ) : (
                                                            <Button asChild className="bg-[#009EE3] hover:bg-[#008ED0] text-white rounded-xl">
                                                                <a href={mpAuthUrl}>Conectar Cuenta</a>
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Cash / Efectivo */}
                                                <div className="flex items-center justify-between p-4 border border-slate-100 rounded-xl bg-white/30 opacity-60">
                                                    <div className="flex gap-4 items-center">
                                                        <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                                                            <span className="text-xl text-slate-600">$</span>
                                                        </div>
                                                        <div>
                                                            <h3 className="font-medium text-slate-700">Efectivo / Transferencia</h3>
                                                            <p className="text-sm text-slate-500">Habilitado por defecto.</p>
                                                        </div>
                                                    </div>
                                                    <Button variant="outline" size="sm" disabled className="rounded-lg">Configurar</Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </TabsContent>
                                )}

                                <TabsContent value="general" className="space-y-6">
                                    <Card className="bg-white/70 backdrop-blur-xl border-white/50 shadow-lg shadow-orange-900/5 rounded-2xl">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2 text-slate-800">
                                                <Store className="w-5 h-5 text-orange-500" />
                                                Información del Negocio
                                            </CardTitle>
                                            <CardDescription>
                                                Datos básicos de tu negocio que aparecen en tu menú.
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid md:grid-cols-2 gap-4">
                                                <InfoField label="Nombre del Negocio" value={tenant.name} />
                                                <InfoField label="URL del Menú" value={`optimadelivery.vercel.app/t/${tenant.slug}`} mono />
                                                <InfoField label="Teléfono" value={tenant.business_phone || 'No configurado'} />
                                                <InfoField label="Email de Contacto" value={tenant.business_email || 'No configurado'} />
                                                <div className="md:col-span-2">
                                                    <InfoField label="Dirección" value={tenant.business_address || 'No configurada'} />
                                                </div>
                                            </div>
                                        </CardContent>
                                        <CardFooter>
                                            <Button variant="outline" disabled className="rounded-xl">
                                                <Edit className="w-4 h-4 mr-2" />
                                                Editar Información (Próximamente)
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="kitchen" className="space-y-6">
                                    <KitchenPinSettings />
                                </TabsContent>

                                <TabsContent value="social" className="space-y-6">
                                    <SocialNetworksSettings />
                                </TabsContent>

                                <TabsContent value="team" className="space-y-6">
                                    <TeamManager />
                                </TabsContent>
                            </Tabs>
                        </div>
                    )}

                    {activeTab === 'menu' && canEdit(userRole) && <MenuManager />}
                    {activeTab === 'kitchen' && hasPermission(userRole, ['owner', 'admin', 'kitchen']) && <KDSManager />}
                    {activeTab === 'orders' && hasPermission(userRole, ['owner', 'admin', 'staff']) && <OrdersManager />}
                    {activeTab === 'design' && canEdit(userRole) && <ThemeSettings />}
                </div>
            </main>
        </div>
    );
};

const NavItem = ({ icon, label, isActive, onClick }: { icon: any, label: string, isActive: boolean, onClick: () => void }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${isActive
            ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg shadow-orange-500/25'
            : 'text-slate-600 hover:bg-orange-50 hover:text-slate-800'
            }`}
    >
        {icon}
        {label}
    </button>
);

const StatCard = ({ title, value, trend, subtitle }: { title: string, value: string, trend?: string, subtitle?: string }) => (
    <div className="bg-white/70 backdrop-blur-xl p-6 rounded-2xl border border-white/50 shadow-lg shadow-orange-900/5">
        <h3 className="text-sm font-medium text-slate-500 mb-2">{title}</h3>
        <div className="flex items-end justify-between">
            <div>
                <span className="text-2xl font-bold text-slate-800">{value}</span>
                {subtitle && (
                    <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
                )}
            </div>
            {trend && (
                <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    {trend}
                </span>
            )}
        </div>
    </div>
);

const InfoField = ({ label, value, mono }: { label: string, value: string, mono?: boolean }) => (
    <div>
        <label className="text-sm font-medium text-slate-500">{label}</label>
        <p className={`mt-1 text-slate-800 ${mono ? 'font-mono text-sm' : ''}`}>{value}</p>
    </div>
);

const RoleBadge = ({ role }: { role: UserRole | undefined }) => {
    const roleConfig: Record<UserRole, { label: string; className: string }> = {
        owner: { label: 'Propietario', className: 'bg-gradient-to-r from-purple-100 to-purple-50 text-purple-700' },
        admin: { label: 'Admin', className: 'bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700' },
        kitchen: { label: 'Cocina', className: 'bg-gradient-to-r from-orange-100 to-orange-50 text-orange-700' },
        staff: { label: 'Staff', className: 'bg-gradient-to-r from-slate-100 to-slate-50 text-slate-700' },
    };

    if (!role) return null;

    const config = roleConfig[role];
    return (
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${config.className}`}>
            {config.label}
        </span>
    );
};

export default Dashboard;
