import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Loader2, Building2, Users, DollarSign, TrendingUp,
    LogOut, Eye, MoreVertical, Search, Palette, Bell, CheckCircle, Clock,
    Power, Calendar, ExternalLink, X, ShoppingBag, Download
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface TenantData {
    id: string;
    name: string;
    slug: string;
    is_active: boolean;
    created_at: string;
    business_phone: string | null;
    business_email: string | null;
    mercadopago_access_token: string | null;
    trial_ends_at: string | null;
    subscription_status: string | null;
    logo_url: string | null;
    theme: string | null;
    primary_color: string | null;
}

interface UserData {
    id: string;
    email: string;
    created_at: string;
    last_sign_in_at: string | null;
    tenant_id: string | null;
    tenant_name: string | null;
    role: string | null;
}

interface OrderData {
    id: string;
    tenant_id: string;
    total: number;
    status: string;
    payment_status: string;
    payment_method: string;
    created_at: string;
}

interface DesignRequest {
    id: string;
    tenant_id: string;
    tenant_name: string;
    tenant_slug: string;
    contact_email: string | null;
    contact_phone: string | null;
    price: number;
    status: 'pending' | 'contacted' | 'in_progress' | 'completed' | 'cancelled';
    notes: string | null;
    created_at: string;
}

interface DashboardMetrics {
    totalTenants: number;
    activeTenants: number;
    totalOrders: number;
    todayOrders: number;
    weekOrders: number;
    monthlyRevenue: number;
    todayRevenue: number;
    weekRevenue: number;
    pendingDesignRequests: number;
    totalUsers: number;
}

// Super admin emails from environment variable (comma-separated)
const SUPER_ADMIN_EMAILS = (import.meta.env.VITE_SUPER_ADMIN_EMAILS || '')
    .split(',')
    .map((email: string) => email.trim())
    .filter((email: string) => email.length > 0);

const SuperAdmin = () => {
    const navigate = useNavigate();
    const { user, signOut, isLoading: authLoading } = useAuth();
    const [tenants, setTenants] = useState<TenantData[]>([]);
    const [users, setUsers] = useState<UserData[]>([]);
    const [orders, setOrders] = useState<OrderData[]>([]);
    const [designRequests, setDesignRequests] = useState<DesignRequest[]>([]);
    const [metrics, setMetrics] = useState<DashboardMetrics>({
        totalTenants: 0,
        activeTenants: 0,
        totalOrders: 0,
        todayOrders: 0,
        weekOrders: 0,
        monthlyRevenue: 0,
        todayRevenue: 0,
        weekRevenue: 0,
        pendingDesignRequests: 0,
        totalUsers: 0,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [userSearchQuery, setUserSearchQuery] = useState('');
    const [selectedTenant, setSelectedTenant] = useState<TenantData | null>(null);
    const [showTenantDetail, setShowTenantDetail] = useState(false);

    // Check if user is super admin
    const isSuperAdmin = user?.email && SUPER_ADMIN_EMAILS.includes(user.email);

    useEffect(() => {
        if (authLoading) return;

        if (!user || !isSuperAdmin) {
            navigate('/login');
            return;
        }

        fetchData();
    }, [user, authLoading, isSuperAdmin, navigate]);

    const fetchData = async () => {
        try {
            const { data: { session } } = await (await import('@/lib/supabase')).supabase.auth.getSession();
            if (!session) return;

            const headers = {
                'Authorization': `Bearer ${session.access_token}`,
                'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
            };

            // Calculate date ranges
            const now = new Date();
            const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
            const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

            // Fetch all data in parallel
            const [tenantsRes, designRes, ordersRes, usersRes] = await Promise.all([
                fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/tenants?select=*&order=created_at.desc`, { headers }),
                fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/design_requests?select=*&order=created_at.desc`, { headers }),
                fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/orders?select=id,tenant_id,total,status,payment_status,payment_method,created_at&order=created_at.desc&limit=1000`, { headers }),
                fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/tenant_users?select=id,user_id,tenant_id,role,created_at,tenants(name)&order=created_at.desc`, { headers })
            ]);

            let tenantsData: TenantData[] = [];
            let designData: DesignRequest[] = [];
            let ordersData: OrderData[] = [];
            let usersData: UserData[] = [];

            if (tenantsRes.ok) {
                tenantsData = await tenantsRes.json();
                setTenants(tenantsData);
            }

            if (designRes.ok) {
                designData = await designRes.json();
                setDesignRequests(designData);
            }

            if (ordersRes.ok) {
                ordersData = await ordersRes.json();
                setOrders(ordersData);
            }

            if (usersRes.ok) {
                const tenantUsersData = await usersRes.json();
                // Map tenant_users to UserData format
                usersData = tenantUsersData.map((tu: any) => ({
                    id: tu.user_id,
                    email: '', // Will need separate auth.users query for emails
                    created_at: tu.created_at,
                    last_sign_in_at: null,
                    tenant_id: tu.tenant_id,
                    tenant_name: tu.tenants?.name || null,
                    role: tu.role
                }));
                setUsers(usersData);
            }

            // Calculate metrics
            const paidOrders = ordersData.filter((o: OrderData) =>
                (o.payment_method === 'mercadopago' && o.payment_status === 'paid') ||
                (o.payment_method === 'cash' && o.status === 'dispatched')
            );

            const todayOrders = paidOrders.filter((o: OrderData) => new Date(o.created_at) >= new Date(todayStart));
            const weekOrders = paidOrders.filter((o: OrderData) => new Date(o.created_at) >= new Date(weekStart));
            const monthOrders = paidOrders.filter((o: OrderData) => new Date(o.created_at) >= new Date(monthStart));

            setMetrics({
                totalTenants: tenantsData.length,
                activeTenants: tenantsData.filter((t: TenantData) => t.is_active).length,
                totalOrders: ordersData.length,
                todayOrders: todayOrders.length,
                weekOrders: weekOrders.length,
                monthlyRevenue: monthOrders.reduce((sum, o) => sum + (o.total || 0), 0),
                todayRevenue: todayOrders.reduce((sum, o) => sum + (o.total || 0), 0),
                weekRevenue: weekOrders.reduce((sum, o) => sum + (o.total || 0), 0),
                pendingDesignRequests: designData.filter((r: DesignRequest) => r.status === 'pending').length,
                totalUsers: usersData.length,
            });
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const updateDesignRequestStatus = async (requestId: string, newStatus: DesignRequest['status']) => {
        try {
            const { data: { session } } = await (await import('@/lib/supabase')).supabase.auth.getSession();
            if (!session) return;

            const res = await fetch(
                `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/design_requests?id=eq.${requestId}`,
                {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${session.access_token}`,
                        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ status: newStatus, updated_at: new Date().toISOString() })
                }
            );

            if (res.ok) {
                setDesignRequests(prev => prev.map(r =>
                    r.id === requestId ? { ...r, status: newStatus } : r
                ));
                setMetrics(prev => ({
                    ...prev,
                    pendingDesignRequests: designRequests.filter(r => r.id !== requestId ? r.status === 'pending' : newStatus === 'pending').length
                }));
            }
        } catch (err) {
            console.error('Error updating design request:', err);
        }
    };

    const handleGhostLogin = (tenant: TenantData) => {
        // Open tenant's menu in new tab
        window.open(`/t/${tenant.slug}`, '_blank');
    };

    const toggleTenantActive = async (tenant: TenantData) => {
        try {
            const { data: { session } } = await (await import('@/lib/supabase')).supabase.auth.getSession();
            if (!session) return;

            const newStatus = !tenant.is_active;
            const res = await fetch(
                `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/tenants?id=eq.${tenant.id}`,
                {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${session.access_token}`,
                        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=minimal'
                    },
                    body: JSON.stringify({ is_active: newStatus })
                }
            );

            if (res.ok) {
                setTenants(prev => prev.map(t =>
                    t.id === tenant.id ? { ...t, is_active: newStatus } : t
                ));
                setMetrics(prev => ({
                    ...prev,
                    activeTenants: prev.activeTenants + (newStatus ? 1 : -1)
                }));
            }
        } catch (err) {
            console.error('Error toggling tenant status:', err);
        }
    };

    const extendTrial = async (tenant: TenantData, days: number) => {
        try {
            const { data: { session } } = await (await import('@/lib/supabase')).supabase.auth.getSession();
            if (!session) return;

            const currentEnd = tenant.trial_ends_at ? new Date(tenant.trial_ends_at) : new Date();
            const newEnd = new Date(Math.max(currentEnd.getTime(), Date.now()) + days * 24 * 60 * 60 * 1000);

            const res = await fetch(
                `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/tenants?id=eq.${tenant.id}`,
                {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${session.access_token}`,
                        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=minimal'
                    },
                    body: JSON.stringify({ trial_ends_at: newEnd.toISOString() })
                }
            );

            if (res.ok) {
                setTenants(prev => prev.map(t =>
                    t.id === tenant.id ? { ...t, trial_ends_at: newEnd.toISOString() } : t
                ));
                if (selectedTenant?.id === tenant.id) {
                    setSelectedTenant({ ...selectedTenant, trial_ends_at: newEnd.toISOString() });
                }
            }
        } catch (err) {
            console.error('Error extending trial:', err);
        }
    };

    const exportTenantsCSV = () => {
        const headers = ['Nombre', 'Slug', 'Email', 'Teléfono', 'Estado', 'MercadoPago', 'Creado'];
        const rows = tenants.map(t => [
            t.name,
            t.slug,
            t.business_email || '',
            t.business_phone || '',
            t.is_active ? 'Activo' : 'Inactivo',
            t.mercadopago_access_token ? 'Conectado' : 'No',
            new Date(t.created_at).toLocaleDateString('es-AR')
        ]);

        const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `tenants_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    const getTenantOrderStats = (tenantId: string) => {
        const tenantOrders = orders.filter(o => o.tenant_id === tenantId);
        const paidOrders = tenantOrders.filter(o =>
            (o.payment_method === 'mercadopago' && o.payment_status === 'paid') ||
            (o.payment_method === 'cash' && o.status === 'dispatched')
        );
        return {
            total: tenantOrders.length,
            revenue: paidOrders.reduce((sum, o) => sum + (o.total || 0), 0)
        };
    };

    const getTrialDaysRemaining = (tenant: TenantData) => {
        if (!tenant.trial_ends_at) return null;
        const diff = new Date(tenant.trial_ends_at).getTime() - Date.now();
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    };

    const filteredTenants = tenants.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.slug.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (authLoading || isLoading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-slate-900">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    if (!isSuperAdmin) {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-900 text-white gap-4">
                <p className="text-red-400 font-medium">Acceso denegado</p>
                <Button variant="outline" onClick={() => navigate('/login')}>
                    Volver al Login
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900 text-white">
            {/* Header */}
            <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center font-bold">
                            OD
                        </div>
                        <div>
                            <h1 className="font-bold text-lg">Super Admin</h1>
                            <p className="text-xs text-slate-400">optimaDELIVERY</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-slate-400">{user?.email}</span>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-slate-400 hover:text-white"
                            onClick={signOut}
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Salir
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                    <MetricCard
                        icon={<Building2 className="w-5 h-5" />}
                        label="Total Negocios"
                        value={metrics.totalTenants}
                        subtext={`${metrics.activeTenants} activos`}
                        color="blue"
                    />
                    <MetricCard
                        icon={<Users className="w-5 h-5" />}
                        label="Usuarios"
                        value={metrics.totalUsers}
                        color="green"
                    />
                    <MetricCard
                        icon={<ShoppingBag className="w-5 h-5" />}
                        label="Pedidos Hoy"
                        value={metrics.todayOrders}
                        subtext={`${metrics.weekOrders} esta semana`}
                        color="purple"
                    />
                    <MetricCard
                        icon={<DollarSign className="w-5 h-5" />}
                        label="Ventas Hoy"
                        value={`$${metrics.todayRevenue.toLocaleString()}`}
                        subtext={`$${metrics.weekRevenue.toLocaleString()} semana`}
                        color="yellow"
                    />
                    <MetricCard
                        icon={<TrendingUp className="w-5 h-5" />}
                        label="Revenue Mes"
                        value={`$${metrics.monthlyRevenue.toLocaleString()}`}
                        subtext={`${metrics.totalOrders} pedidos totales`}
                        color="orange"
                    />
                    <MetricCard
                        icon={<Palette className="w-5 h-5" />}
                        label="Diseños Pendientes"
                        value={metrics.pendingDesignRequests}
                        color="pink"
                    />
                </div>

                {/* Tabs for Tenants, Users, and Design Requests */}
                <Tabs defaultValue="tenants" className="space-y-6">
                    <TabsList className="bg-slate-800 border-slate-700">
                        <TabsTrigger value="tenants" className="data-[state=active]:bg-slate-700">
                            <Building2 className="w-4 h-4 mr-2" />
                            Negocios
                        </TabsTrigger>
                        <TabsTrigger value="users" className="data-[state=active]:bg-slate-700">
                            <Users className="w-4 h-4 mr-2" />
                            Usuarios
                            <Badge className="ml-2 bg-slate-600">{metrics.totalUsers}</Badge>
                        </TabsTrigger>
                        <TabsTrigger value="design-requests" className="data-[state=active]:bg-slate-700">
                            <Palette className="w-4 h-4 mr-2" />
                            Diseños
                            {metrics.pendingDesignRequests > 0 && (
                                <Badge className="ml-2 bg-pink-500">{metrics.pendingDesignRequests}</Badge>
                            )}
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="tenants">
                {/* Tenants Table */}
                <Card className="bg-slate-800 border-slate-700">
                    <CardHeader>
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div>
                                <CardTitle className="text-white">Negocios Registrados</CardTitle>
                                <CardDescription className="text-slate-400">
                                    Gestiona todos los tenants de la plataforma
                                </CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <Input
                                        placeholder="Buscar..."
                                        className="pl-9 bg-slate-700 border-slate-600 text-white w-64"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                                    onClick={exportTenantsCSV}
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    Exportar
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-700 text-left text-sm text-slate-400">
                                        <th className="pb-3 font-medium">Negocio</th>
                                        <th className="pb-3 font-medium">URL</th>
                                        <th className="pb-3 font-medium">Estado</th>
                                        <th className="pb-3 font-medium">Trial</th>
                                        <th className="pb-3 font-medium">MercadoPago</th>
                                        <th className="pb-3 font-medium">Pedidos</th>
                                        <th className="pb-3 font-medium text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700">
                                    {filteredTenants.map((tenant) => {
                                        const stats = getTenantOrderStats(tenant.id);
                                        const trialDays = getTrialDaysRemaining(tenant);
                                        return (
                                        <tr key={tenant.id} className="text-sm hover:bg-slate-700/30 transition-colors">
                                            <td className="py-4">
                                                <div className="flex items-center gap-3">
                                                    {tenant.logo_url ? (
                                                        <img
                                                            src={tenant.logo_url}
                                                            alt={tenant.name}
                                                            className="w-8 h-8 rounded-lg object-cover"
                                                        />
                                                    ) : (
                                                        <div
                                                            className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                                                            style={{ backgroundColor: tenant.primary_color || '#475569' }}
                                                        >
                                                            {tenant.name.charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <button
                                                            className="font-medium text-white hover:text-blue-400 text-left"
                                                            onClick={() => {
                                                                setSelectedTenant(tenant);
                                                                setShowTenantDetail(true);
                                                            }}
                                                        >
                                                            {tenant.name}
                                                        </button>
                                                        <p className="text-xs text-slate-400">{tenant.business_email || 'Sin email'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4">
                                                <code className="text-xs bg-slate-700 px-2 py-1 rounded">
                                                    /t/{tenant.slug}
                                                </code>
                                            </td>
                                            <td className="py-4">
                                                <Badge
                                                    variant={tenant.is_active ? "default" : "secondary"}
                                                    className={tenant.is_active ? 'bg-green-600 cursor-pointer' : 'bg-red-600 cursor-pointer'}
                                                    onClick={() => toggleTenantActive(tenant)}
                                                >
                                                    {tenant.is_active ? 'Activo' : 'Inactivo'}
                                                </Badge>
                                            </td>
                                            <td className="py-4">
                                                {trialDays !== null ? (
                                                    <Badge
                                                        className={
                                                            trialDays > 3 ? 'bg-blue-600' :
                                                            trialDays > 0 ? 'bg-amber-600' :
                                                            'bg-red-600'
                                                        }
                                                    >
                                                        {trialDays > 0 ? `${trialDays}d` : 'Expirado'}
                                                    </Badge>
                                                ) : (
                                                    <span className="text-slate-500 text-xs">—</span>
                                                )}
                                            </td>
                                            <td className="py-4">
                                                <Badge variant={tenant.mercadopago_access_token ? "default" : "outline"}
                                                    className={tenant.mercadopago_access_token ? 'bg-green-600' : 'text-slate-400'}>
                                                    {tenant.mercadopago_access_token ? 'Conectado' : 'No'}
                                                </Badge>
                                            </td>
                                            <td className="py-4">
                                                <div className="text-xs">
                                                    <span className="text-white font-medium">{stats.total}</span>
                                                    <span className="text-slate-400 ml-1">pedidos</span>
                                                    <br />
                                                    <span className="text-green-400">${stats.revenue.toLocaleString()}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                                                            <MoreVertical className="w-4 h-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                                                        <DropdownMenuItem
                                                            className="text-white hover:bg-slate-700 cursor-pointer"
                                                            onClick={() => {
                                                                setSelectedTenant(tenant);
                                                                setShowTenantDetail(true);
                                                            }}
                                                        >
                                                            <Eye className="w-4 h-4 mr-2" />
                                                            Ver Detalles
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="text-white hover:bg-slate-700 cursor-pointer"
                                                            onClick={() => handleGhostLogin(tenant)}
                                                        >
                                                            <ExternalLink className="w-4 h-4 mr-2" />
                                                            Ver Menú
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator className="bg-slate-700" />
                                                        <DropdownMenuItem
                                                            className="text-white hover:bg-slate-700 cursor-pointer"
                                                            onClick={() => toggleTenantActive(tenant)}
                                                        >
                                                            <Power className="w-4 h-4 mr-2" />
                                                            {tenant.is_active ? 'Desactivar' : 'Activar'}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="text-white hover:bg-slate-700 cursor-pointer"
                                                            onClick={() => extendTrial(tenant, 7)}
                                                        >
                                                            <Calendar className="w-4 h-4 mr-2" />
                                                            +7 Días Trial
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="text-white hover:bg-slate-700 cursor-pointer"
                                                            onClick={() => extendTrial(tenant, 30)}
                                                        >
                                                            <Calendar className="w-4 h-4 mr-2" />
                                                            +30 Días Trial
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                        </tr>
                                        );
                                    })}
                                    {filteredTenants.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="py-8 text-center text-slate-400">
                                                No se encontraron negocios
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
                    </TabsContent>

                    {/* Users Tab */}
                    <TabsContent value="users">
                        <Card className="bg-slate-800 border-slate-700">
                            <CardHeader>
                                <div className="flex items-center justify-between flex-wrap gap-4">
                                    <div>
                                        <CardTitle className="text-white">Usuarios del Sistema</CardTitle>
                                        <CardDescription className="text-slate-400">
                                            Todos los usuarios registrados en la plataforma
                                        </CardDescription>
                                    </div>
                                    <div className="relative">
                                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <Input
                                            placeholder="Buscar usuario..."
                                            className="pl-9 bg-slate-700 border-slate-600 text-white w-64"
                                            value={userSearchQuery}
                                            onChange={(e) => setUserSearchQuery(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {users.length === 0 ? (
                                    <div className="py-12 text-center text-slate-400">
                                        <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                        <p>No hay usuarios registrados</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-slate-700 text-left text-sm text-slate-400">
                                                    <th className="pb-3 font-medium">Usuario</th>
                                                    <th className="pb-3 font-medium">Negocio</th>
                                                    <th className="pb-3 font-medium">Rol</th>
                                                    <th className="pb-3 font-medium">Registrado</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-700">
                                                {users
                                                    .filter(u =>
                                                        u.tenant_name?.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
                                                        u.role?.toLowerCase().includes(userSearchQuery.toLowerCase())
                                                    )
                                                    .map((user) => (
                                                    <tr key={user.id} className="text-sm">
                                                        <td className="py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold">
                                                                    <Users className="w-4 h-4 text-slate-400" />
                                                                </div>
                                                                <div>
                                                                    <p className="font-medium text-white">{user.id.slice(0, 8)}...</p>
                                                                    <p className="text-xs text-slate-400">{user.email || 'ID: ' + user.id.slice(0, 12)}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="py-4 text-slate-300">
                                                            {user.tenant_name || <span className="text-slate-500">—</span>}
                                                        </td>
                                                        <td className="py-4">
                                                            <Badge
                                                                className={
                                                                    user.role === 'owner' ? 'bg-purple-600' :
                                                                    user.role === 'admin' ? 'bg-blue-600' :
                                                                    user.role === 'kitchen' ? 'bg-orange-600' :
                                                                    'bg-slate-600'
                                                                }
                                                            >
                                                                {user.role || 'Sin rol'}
                                                            </Badge>
                                                        </td>
                                                        <td className="py-4 text-slate-400">
                                                            {new Date(user.created_at).toLocaleDateString('es-AR')}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="design-requests">
                        <Card className="bg-slate-800 border-slate-700">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center gap-2">
                                    <Palette className="w-5 h-5" />
                                    Solicitudes de Diseño Premium
                                </CardTitle>
                                <CardDescription className="text-slate-400">
                                    Gestiona las solicitudes de diseño personalizado de los tenants
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {designRequests.length === 0 ? (
                                    <div className="py-12 text-center text-slate-400">
                                        <Palette className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                        <p>No hay solicitudes de diseño</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {designRequests.map((request) => (
                                            <div
                                                key={request.id}
                                                className={`p-4 rounded-lg border ${
                                                    request.status === 'pending'
                                                        ? 'bg-pink-500/10 border-pink-500/30'
                                                        : request.status === 'in_progress'
                                                        ? 'bg-yellow-500/10 border-yellow-500/30'
                                                        : request.status === 'completed'
                                                        ? 'bg-green-500/10 border-green-500/30'
                                                        : 'bg-slate-700 border-slate-600'
                                                }`}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="font-semibold text-white">{request.tenant_name}</h4>
                                                            <Badge
                                                                className={
                                                                    request.status === 'pending' ? 'bg-pink-500' :
                                                                    request.status === 'contacted' ? 'bg-blue-500' :
                                                                    request.status === 'in_progress' ? 'bg-yellow-500' :
                                                                    request.status === 'completed' ? 'bg-green-500' :
                                                                    'bg-slate-500'
                                                                }
                                                            >
                                                                {request.status === 'pending' && 'Pendiente'}
                                                                {request.status === 'contacted' && 'Contactado'}
                                                                {request.status === 'in_progress' && 'En Progreso'}
                                                                {request.status === 'completed' && 'Completado'}
                                                                {request.status === 'cancelled' && 'Cancelado'}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-sm text-slate-400">
                                                            <code className="bg-slate-700 px-1.5 py-0.5 rounded text-xs">/t/{request.tenant_slug}</code>
                                                        </p>
                                                        <div className="flex gap-4 text-sm text-slate-400 mt-2">
                                                            {request.contact_email && (
                                                                <span>📧 {request.contact_email}</span>
                                                            )}
                                                            {request.contact_phone && (
                                                                <span>📱 {request.contact_phone}</span>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-slate-500 mt-1">
                                                            {new Date(request.created_at).toLocaleString('es-AR')}
                                                        </p>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-2">
                                                        <span className="text-lg font-bold text-green-400">
                                                            ${request.price.toLocaleString()}
                                                        </span>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                                                                    <MoreVertical className="w-4 h-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                                                                <DropdownMenuItem
                                                                    className="text-white hover:bg-slate-700 cursor-pointer"
                                                                    onClick={() => updateDesignRequestStatus(request.id, 'contacted')}
                                                                >
                                                                    <Bell className="w-4 h-4 mr-2" />
                                                                    Marcar Contactado
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    className="text-white hover:bg-slate-700 cursor-pointer"
                                                                    onClick={() => updateDesignRequestStatus(request.id, 'in_progress')}
                                                                >
                                                                    <Clock className="w-4 h-4 mr-2" />
                                                                    En Progreso
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    className="text-white hover:bg-slate-700 cursor-pointer"
                                                                    onClick={() => updateDesignRequestStatus(request.id, 'completed')}
                                                                >
                                                                    <CheckCircle className="w-4 h-4 mr-2" />
                                                                    Completado
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    className="text-white hover:bg-slate-700 cursor-pointer"
                                                                    onClick={() => window.open(`/t/${request.tenant_slug}`, '_blank')}
                                                                >
                                                                    <Eye className="w-4 h-4 mr-2" />
                                                                    Ver Menú
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </main>

            {/* Tenant Detail Dialog */}
            <Dialog open={showTenantDetail} onOpenChange={setShowTenantDetail}>
                <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-3">
                            {selectedTenant?.logo_url ? (
                                <img
                                    src={selectedTenant.logo_url}
                                    alt={selectedTenant.name}
                                    className="w-12 h-12 rounded-lg object-cover"
                                />
                            ) : (
                                <div
                                    className="w-12 h-12 rounded-lg flex items-center justify-center text-lg font-bold text-white"
                                    style={{ backgroundColor: selectedTenant?.primary_color || '#475569' }}
                                >
                                    {selectedTenant?.name.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div>
                                <span className="text-xl">{selectedTenant?.name}</span>
                                <p className="text-sm text-slate-400 font-normal">/t/{selectedTenant?.slug}</p>
                            </div>
                        </DialogTitle>
                        <DialogDescription className="text-slate-400">
                            Información detallada del negocio
                        </DialogDescription>
                    </DialogHeader>

                    {selectedTenant && (
                        <div className="space-y-6 mt-4">
                            {/* Contact Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs text-slate-400">Email</label>
                                    <p className="text-white">{selectedTenant.business_email || '—'}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-slate-400">Teléfono</label>
                                    <p className="text-white">{selectedTenant.business_phone || '—'}</p>
                                </div>
                            </div>

                            {/* Status Cards */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-slate-700/50 rounded-lg p-3">
                                    <p className="text-xs text-slate-400 mb-1">Estado</p>
                                    <Badge className={selectedTenant.is_active ? 'bg-green-600' : 'bg-red-600'}>
                                        {selectedTenant.is_active ? 'Activo' : 'Inactivo'}
                                    </Badge>
                                </div>
                                <div className="bg-slate-700/50 rounded-lg p-3">
                                    <p className="text-xs text-slate-400 mb-1">MercadoPago</p>
                                    <Badge className={selectedTenant.mercadopago_access_token ? 'bg-green-600' : 'bg-slate-600'}>
                                        {selectedTenant.mercadopago_access_token ? 'Conectado' : 'No'}
                                    </Badge>
                                </div>
                                <div className="bg-slate-700/50 rounded-lg p-3">
                                    <p className="text-xs text-slate-400 mb-1">Trial</p>
                                    {(() => {
                                        const days = getTrialDaysRemaining(selectedTenant);
                                        return days !== null ? (
                                            <Badge className={days > 3 ? 'bg-blue-600' : days > 0 ? 'bg-amber-600' : 'bg-red-600'}>
                                                {days > 0 ? `${days} días` : 'Expirado'}
                                            </Badge>
                                        ) : (
                                            <span className="text-slate-500">—</span>
                                        );
                                    })()}
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-700/50 rounded-lg p-4">
                                    <p className="text-xs text-slate-400 mb-2">Pedidos Totales</p>
                                    <p className="text-2xl font-bold">{getTenantOrderStats(selectedTenant.id).total}</p>
                                </div>
                                <div className="bg-slate-700/50 rounded-lg p-4">
                                    <p className="text-xs text-slate-400 mb-2">Revenue Total</p>
                                    <p className="text-2xl font-bold text-green-400">
                                        ${getTenantOrderStats(selectedTenant.id).revenue.toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            {/* Dates */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-slate-400">Creado: </span>
                                    <span>{new Date(selectedTenant.created_at).toLocaleDateString('es-AR')}</span>
                                </div>
                                {selectedTenant.trial_ends_at && (
                                    <div>
                                        <span className="text-slate-400">Trial hasta: </span>
                                        <span>{new Date(selectedTenant.trial_ends_at).toLocaleDateString('es-AR')}</span>
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 pt-4 border-t border-slate-700">
                                <Button
                                    variant="outline"
                                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                                    onClick={() => handleGhostLogin(selectedTenant)}
                                >
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    Ver Menú
                                </Button>
                                <Button
                                    variant="outline"
                                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                                    onClick={() => toggleTenantActive(selectedTenant)}
                                >
                                    <Power className="w-4 h-4 mr-2" />
                                    {selectedTenant.is_active ? 'Desactivar' : 'Activar'}
                                </Button>
                                <Button
                                    variant="outline"
                                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                                    onClick={() => extendTrial(selectedTenant, 7)}
                                >
                                    <Calendar className="w-4 h-4 mr-2" />
                                    +7 Días
                                </Button>
                                <Button
                                    variant="outline"
                                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                                    onClick={() => extendTrial(selectedTenant, 30)}
                                >
                                    <Calendar className="w-4 h-4 mr-2" />
                                    +30 Días
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

const MetricCard = ({ icon, label, value, subtext, color }: { icon: any, label: string, value: string | number, subtext?: string, color: string }) => {
    const colorClasses: Record<string, string> = {
        blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        green: 'bg-green-500/10 text-green-400 border-green-500/20',
        purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
        yellow: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
        orange: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
        pink: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
    };

    return (
        <div className={`rounded-xl border p-4 ${colorClasses[color]}`}>
            <div className="flex items-center gap-2 mb-2">
                {icon}
                <span className="text-sm opacity-80">{label}</span>
            </div>
            <p className="text-2xl font-bold text-white">{value}</p>
            {subtext && <p className="text-xs opacity-60 mt-1">{subtext}</p>}
        </div>
    );
};

export default SuperAdmin;
