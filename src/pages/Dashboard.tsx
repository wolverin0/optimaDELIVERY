import { useState, useMemo, useEffect } from 'react';
import { useTenant } from '@/context/TenantContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Store, CreditCard, LayoutDashboard, UtensilsCrossed, Settings, LogOut, ExternalLink, CheckCircle, Palette, Edit } from 'lucide-react';
import { Link } from 'react-router-dom';
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

// Helper to convert hex to rgba with alpha
const hexToRgba = (hex: string, alpha: number): string => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

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
    const { tenant, isLoading, error } = useTenant();
    const { signOut, profile } = useAuth();

    const userRole = profile?.role as UserRole | undefined;

    // Define navigation items with role-based access
    // - owner: Full access to everything
    // - admin: Full access except billing/subscription settings
    // - kitchen: Only sees Kitchen/KDS view
    // - staff: Can view orders and overview, no editing
    const navItems: NavItemConfig[] = useMemo(() => [
        { id: 'overview', icon: <LayoutDashboard />, label: 'Resumen', allowedRoles: ['owner', 'admin', 'staff'] },
        { id: 'menu', icon: <UtensilsCrossed />, label: 'Menu', allowedRoles: ['owner', 'admin'] },
        { id: 'kitchen', icon: <ChefHat />, label: 'Cocina', allowedRoles: ['owner', 'admin', 'kitchen'] },
        { id: 'orders', icon: <CreditCard />, label: 'Pedidos', allowedRoles: ['owner', 'admin', 'staff'] },
        { id: 'design', icon: <Palette />, label: 'Diseno', allowedRoles: ['owner', 'admin'] },
        { id: 'settings', icon: <Settings />, label: 'Configuracion', allowedRoles: ['owner', 'admin'] },
    ], []);

    // Filter nav items based on user role
    const visibleNavItems = useMemo(() => {
        return navItems.filter(item => hasPermission(userRole, item.allowedRoles));
    }, [navItems, userRole]);

    // Get default tab based on role
    const getDefaultTab = useMemo(() => {
        if (userRole === 'kitchen') return 'kitchen';
        if (userRole === 'staff') return 'overview';
        return 'overview';
    }, [userRole]);

    const [activeTab, setActiveTab] = useState(getDefaultTab);

    // Update active tab if current tab is not allowed for the user's role
    useEffect(() => {
        const isCurrentTabAllowed = visibleNavItems.some(item => item.id === activeTab);
        if (!isCurrentTabAllowed && visibleNavItems.length > 0) {
            setActiveTab(visibleNavItems[0].id);
        }
    }, [activeTab, visibleNavItems]);

    // Get primary color from tenant theme, fallback to blue
    const primaryColor = tenant?.theme?.primaryColor || '#3B82F6';

    if (isLoading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-slate-50">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        );
    }

    if (error || !tenant) {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 gap-4">
                <p className="text-destructive font-medium">No se pudo cargar la información del negocio.</p>
                <div className="flex gap-4">
                    <Button variant="outline" onClick={() => window.location.reload()}>Reintentar</Button>
                    <Button variant="destructive" onClick={signOut}>Cerrar Sesión</Button>
                </div>
            </div>
        );
    }

    const isMpConnected = !!tenant.mercadopago_access_token;
    const mpAuthUrl = `https://auth.mercadopago.com.ar/authorization?client_id=${MP_CLIENT_ID}&response_type=code&platform_id=mp&redirect_uri=${MP_REDIRECT_URI}&state=${tenant.id}`;

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col">
                <div className="p-6 border-b border-slate-100">
                    <div className="flex items-center gap-2 font-bold text-xl" style={{ color: primaryColor }}>
                        <div
                            className="w-8 h-8 text-white rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: primaryColor }}
                        >
                            O
                        </div>
                        optima
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {visibleNavItems.map((item) => (
                        <NavItem
                            key={item.id}
                            icon={item.icon}
                            label={item.label}
                            isActive={activeTab === item.id}
                            onClick={() => setActiveTab(item.id)}
                            primaryColor={primaryColor}
                        />
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-100">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-medium text-slate-600">
                            {profile?.full_name?.charAt(0)?.toUpperCase() || profile?.email?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div className="overflow-hidden flex-1">
                            <p className="text-sm font-medium truncate">{profile?.full_name || profile?.email || 'Usuario'}</p>
                            <div className="flex items-center gap-2">
                                <RoleBadge role={userRole} />
                            </div>
                        </div>
                    </div>
                    <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50" onClick={signOut}>
                        <LogOut className="w-4 h-4 mr-2" />
                        Cerrar Sesion
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                {/* Mobile Header */}
                <header className="md:hidden h-16 bg-white border-b border-slate-200 flex items-center px-4 justify-between">
                    <span className="font-bold text-lg">optimaDELIVERY</span>
                    <Button size="icon" variant="ghost"><Settings /></Button>
                </header>

                <div className="p-8 max-w-7xl mx-auto">
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            <h1 className="text-3xl font-bold text-slate-900">Hola, {tenant.name.split(' ')[0]} 👋</h1>

                            <div className="grid md:grid-cols-3 gap-6">
                                <StatCard title="Ventas Hoy" value="$0" trend="+0%" />
                                <StatCard title="Pedidos Activos" value="0" />
                                <StatCard title="Visitas al Menú" value="0" />
                            </div>

                            <div
                                className="rounded-2xl p-8 text-white flex items-center justify-between"
                                style={{ backgroundColor: primaryColor }}
                            >
                                <div>
                                    <h2 className="text-xl font-bold mb-2">Tu menu esta online</h2>
                                    <p className="mb-4" style={{ color: hexToRgba('#ffffff', 0.8) }}>Comparte el link con tus clientes para empezar a vender.</p>
                                    <div
                                        className="flex items-center gap-2 p-2 rounded-lg text-sm font-mono"
                                        style={{ backgroundColor: hexToRgba('#000000', 0.2) }}
                                    >
                                        optimadelivery.com/t/{tenant.slug}
                                        <ExternalLink
                                            className="w-4 h-4 ml-2 opacity-50 cursor-pointer hover:opacity-100"
                                            onClick={() => window.open(`/t/${tenant.slug}`, '_blank')}
                                        />
                                    </div>
                                </div>
                                <Button
                                    className="bg-white hover:bg-white/90"
                                    style={{ color: primaryColor }}
                                    onClick={() => window.open(`/t/${tenant.slug}`, '_blank')}
                                >
                                    Ver mi Menu
                                </Button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'settings' && canEdit(userRole) && (
                        <div className="space-y-6">
                            <h1 className="text-2xl font-bold mb-6">Configuracion</h1>

                            <Tabs defaultValue={canAccessBilling(userRole) ? "payments" : "general"} className="w-full">
                                <TabsList className="mb-6">
                                    <TabsTrigger value="general">General</TabsTrigger>
                                    {/* Payments/Billing tab - owner only */}
                                    {canAccessBilling(userRole) && (
                                        <TabsTrigger value="payments">Pagos</TabsTrigger>
                                    )}
                                    <TabsTrigger value="kitchen">Cocina</TabsTrigger>
                                    <TabsTrigger value="social">Redes</TabsTrigger>
                                    <TabsTrigger value="team">Equipo</TabsTrigger>
                                </TabsList>

                                {/* Payments/Billing content - owner only */}
                                {canAccessBilling(userRole) && (
                                    <TabsContent value="payments" className="space-y-6">
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2">
                                                    <CreditCard className="w-5 h-5" />
                                                    Metodos de Cobro
                                                </CardTitle>
                                                <CardDescription>
                                                    Configura como reciben el dinero tus clientes.
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent className="space-y-6">
                                                {/* MercadoPago Connect */}
                                                <div className="flex items-start justify-between p-4 border rounded-xl hover:border-blue-200 transition-colors bg-slate-50/50">
                                                    <div className="flex gap-4">
                                                        <div className="w-12 h-12 bg-white rounded-lg shadow-sm flex items-center justify-center p-2">
                                                            <img src="https://logotipoz.com/wp-content/uploads/2021/10/version-horizontal-large-logo-mercado-pago.webp" alt="MP" className="w-full h-full object-contain" />
                                                        </div>
                                                        <div>
                                                            <h3 className="font-medium text-slate-900">Mercado Pago</h3>
                                                            <p className="text-sm text-slate-500 max-w-sm mt-1">
                                                                Conecta tu cuenta para recibir pagos directamente con QR y links de pago.
                                                                El dinero va directo a tu cuenta - comisiones transparentes.
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        {isMpConnected ? (
                                                            <Badge className="bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1 flex gap-1">
                                                                <CheckCircle className="w-3 h-3" />
                                                                Conectado
                                                            </Badge>
                                                        ) : (
                                                            <Button asChild className="bg-[#009EE3] hover:bg-[#008ED0] text-white">
                                                                <a href={mpAuthUrl}>
                                                                    Conectar Cuenta
                                                                </a>
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Cash / Efectivo */}
                                                <div className="flex items-center justify-between p-4 border rounded-xl bg-white opacity-60">
                                                    <div className="flex gap-4 items-center">
                                                        <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                                                            <span className="text-xl">$</span>
                                                        </div>
                                                        <div>
                                                            <h3 className="font-medium">Efectivo / Transferencia</h3>
                                                            <p className="text-sm text-slate-500">Habilitado por defecto.</p>
                                                        </div>
                                                    </div>
                                                    <Button variant="outline" size="sm" disabled>Configurar</Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </TabsContent>
                                )}

                                <TabsContent value="general" className="space-y-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Store className="w-5 h-5" />
                                                Informacion del Negocio
                                            </CardTitle>
                                            <CardDescription>
                                                Datos basicos de tu negocio que aparecen en tu menu.
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-sm font-medium text-slate-700">Nombre del Negocio</label>
                                                    <p className="mt-1 text-slate-900 font-medium">{tenant.name}</p>
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-slate-700">URL del Menu</label>
                                                    <p className="mt-1 text-slate-500 font-mono text-sm">optimadelivery.com/t/{tenant.slug}</p>
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-slate-700">Telefono</label>
                                                    <p className="mt-1 text-slate-900">{tenant.business_phone || 'No configurado'}</p>
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-slate-700">Email de Contacto</label>
                                                    <p className="mt-1 text-slate-900">{tenant.business_email || 'No configurado'}</p>
                                                </div>
                                                <div className="md:col-span-2">
                                                    <label className="text-sm font-medium text-slate-700">Direccion</label>
                                                    <p className="mt-1 text-slate-900">{tenant.business_address || 'No configurada'}</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                        <CardFooter>
                                            <Button variant="outline" disabled>
                                                <Edit className="w-4 h-4 mr-2" />
                                                Editar Informacion (Proximamente)
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

                    {/* Menu - owner and admin only */}
                    {activeTab === 'menu' && canEdit(userRole) && <MenuManager />}

                    {/* Kitchen/KDS - owner, admin, and kitchen staff */}
                    {activeTab === 'kitchen' && hasPermission(userRole, ['owner', 'admin', 'kitchen']) && <KDSManager />}

                    {/* Orders - owner, admin, and staff (view only for staff) */}
                    {activeTab === 'orders' && hasPermission(userRole, ['owner', 'admin', 'staff']) && <OrdersManager />}

                    {/* Design/Theme - owner and admin only */}
                    {activeTab === 'design' && canEdit(userRole) && <ThemeSettings />}
                </div>
            </main>
        </div>
    );
};

const NavItem = ({ icon, label, isActive, onClick, primaryColor }: { icon: any, label: string, isActive: boolean, onClick: () => void, primaryColor: string }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
            ? ''
            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
        style={isActive ? {
            backgroundColor: hexToRgba(primaryColor, 0.1),
            color: primaryColor
        } : undefined}
    >
        {icon}
        {label}
    </button>
);

const StatCard = ({ title, value, trend }: { title: string, value: string, trend?: string }) => (
    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
        <h3 className="text-sm font-medium text-slate-500 mb-2">{title}</h3>
        <div className="flex items-end justify-between">
            <span className="text-2xl font-bold text-slate-900">{value}</span>
            {trend && <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">{trend}</span>}
        </div>
    </div>
);

// Role badge component for displaying user role
const RoleBadge = ({ role }: { role: UserRole | undefined }) => {
    const roleConfig: Record<UserRole, { label: string; className: string }> = {
        owner: { label: 'Propietario', className: 'bg-purple-100 text-purple-700' },
        admin: { label: 'Admin', className: 'bg-blue-100 text-blue-700' },
        kitchen: { label: 'Cocina', className: 'bg-orange-100 text-orange-700' },
        staff: { label: 'Staff', className: 'bg-slate-100 text-slate-700' },
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
