import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Loader2, Building2, Users, DollarSign, TrendingUp,
    LogOut, Eye, MoreVertical, Search, Palette, Bell, CheckCircle, Clock
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TenantData {
    id: string;
    name: string;
    slug: string;
    is_active: boolean;
    created_at: string;
    business_phone: string | null;
    business_email: string | null;
    mercadopago_access_token: string | null;
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
    monthlyRevenue: number;
    pendingDesignRequests: number;
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
    const [designRequests, setDesignRequests] = useState<DesignRequest[]>([]);
    const [metrics, setMetrics] = useState<DashboardMetrics>({
        totalTenants: 0,
        activeTenants: 0,
        totalOrders: 0,
        monthlyRevenue: 0,
        pendingDesignRequests: 0,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

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

            // Fetch tenants and design requests in parallel
            const [tenantsRes, designRes] = await Promise.all([
                fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/tenants?select=*&order=created_at.desc`, { headers }),
                fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/design_requests?select=*&order=created_at.desc`, { headers })
            ]);

            if (tenantsRes.ok) {
                const tenantsData = await tenantsRes.json();
                setTenants(tenantsData);

                let designData: DesignRequest[] = [];
                if (designRes.ok) {
                    designData = await designRes.json();
                    setDesignRequests(designData);
                }

                setMetrics({
                    totalTenants: tenantsData.length,
                    activeTenants: tenantsData.filter((t: TenantData) => t.is_active).length,
                    totalOrders: 0,
                    monthlyRevenue: 0,
                    pendingDesignRequests: designData.filter((r: DesignRequest) => r.status === 'pending').length,
                });
            }
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
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                    <MetricCard
                        icon={<Building2 className="w-5 h-5" />}
                        label="Total Negocios"
                        value={metrics.totalTenants}
                        color="blue"
                    />
                    <MetricCard
                        icon={<Users className="w-5 h-5" />}
                        label="Activos"
                        value={metrics.activeTenants}
                        color="green"
                    />
                    <MetricCard
                        icon={<TrendingUp className="w-5 h-5" />}
                        label="Pedidos (Mes)"
                        value={metrics.totalOrders}
                        color="purple"
                    />
                    <MetricCard
                        icon={<DollarSign className="w-5 h-5" />}
                        label="Revenue (Mes)"
                        value={`$${metrics.monthlyRevenue.toLocaleString()}`}
                        color="yellow"
                    />
                    <MetricCard
                        icon={<Palette className="w-5 h-5" />}
                        label="Diseños Pendientes"
                        value={metrics.pendingDesignRequests}
                        color="pink"
                    />
                </div>

                {/* Tabs for Tenants and Design Requests */}
                <Tabs defaultValue="tenants" className="space-y-6">
                    <TabsList className="bg-slate-800 border-slate-700">
                        <TabsTrigger value="tenants" className="data-[state=active]:bg-slate-700">
                            <Building2 className="w-4 h-4 mr-2" />
                            Negocios
                        </TabsTrigger>
                        <TabsTrigger value="design-requests" className="data-[state=active]:bg-slate-700">
                            <Palette className="w-4 h-4 mr-2" />
                            Solicitudes de Diseño
                            {metrics.pendingDesignRequests > 0 && (
                                <Badge className="ml-2 bg-pink-500">{metrics.pendingDesignRequests}</Badge>
                            )}
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="tenants">
                {/* Tenants Table */}
                <Card className="bg-slate-800 border-slate-700">
                    <CardHeader>
                        <div className="flex items-center justify-between">
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
                                        <th className="pb-3 font-medium">MercadoPago</th>
                                        <th className="pb-3 font-medium">Creado</th>
                                        <th className="pb-3 font-medium text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700">
                                    {filteredTenants.map((tenant) => (
                                        <tr key={tenant.id} className="text-sm">
                                            <td className="py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center text-xs font-bold">
                                                        {tenant.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-white">{tenant.name}</p>
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
                                                <Badge variant={tenant.is_active ? "default" : "secondary"}>
                                                    {tenant.is_active ? 'Activo' : 'Inactivo'}
                                                </Badge>
                                            </td>
                                            <td className="py-4">
                                                <Badge variant={tenant.mercadopago_access_token ? "default" : "outline"}
                                                    className={tenant.mercadopago_access_token ? 'bg-green-600' : 'text-slate-400'}>
                                                    {tenant.mercadopago_access_token ? 'Conectado' : 'Sin conectar'}
                                                </Badge>
                                            </td>
                                            <td className="py-4 text-slate-400">
                                                {new Date(tenant.created_at).toLocaleDateString('es-AR')}
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
                                                            onClick={() => handleGhostLogin(tenant)}
                                                        >
                                                            <Eye className="w-4 h-4 mr-2" />
                                                            Ver Menú
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredTenants.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="py-8 text-center text-slate-400">
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
        </div>
    );
};

const MetricCard = ({ icon, label, value, color }: { icon: any, label: string, value: string | number, color: string }) => {
    const colorClasses: Record<string, string> = {
        blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        green: 'bg-green-500/10 text-green-400 border-green-500/20',
        purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
        yellow: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
        pink: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
    };

    return (
        <div className={`rounded-xl border p-4 ${colorClasses[color]}`}>
            <div className="flex items-center gap-2 mb-2">
                {icon}
                <span className="text-sm opacity-80">{label}</span>
            </div>
            <p className="text-2xl font-bold text-white">{value}</p>
        </div>
    );
};

export default SuperAdmin;
