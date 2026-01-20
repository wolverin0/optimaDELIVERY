import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useKitchenPin } from '@/context/KitchenPinContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ChefHat, LogOut, Clock, CheckCircle, Truck, AlertCircle } from 'lucide-react';
import { Order, OrderStatus } from '@/types/order';
import { OrderCard } from '@/components/OrderCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// PIN Entry Component
const PinEntry = ({ slug }: { slug: string }) => {
    const { validatePin, isValidating, error } = useKitchenPin();
    const [pin, setPin] = useState('');
    const [localError, setLocalError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!pin || pin.length < 4) {
            setLocalError('Ingresa el PIN de 4 dígitos');
            return;
        }
        setLocalError(null);
        await validatePin(slug, pin);
    };

    const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 6);
        setPin(value);
        setLocalError(null);
    };

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
            <Card className="w-full max-w-sm">
                <CardHeader className="text-center">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ChefHat className="w-8 h-8 text-orange-600" />
                    </div>
                    <CardTitle className="text-2xl">Acceso Cocina</CardTitle>
                    <CardDescription>
                        Ingresa el PIN para ver los pedidos
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                value={pin}
                                onChange={handlePinChange}
                                placeholder="----"
                                className="text-4xl tracking-[0.75em] font-mono text-center h-16"
                                maxLength={6}
                                autoFocus
                                autoComplete="off"
                            />
                        </div>

                        {(error || localError) && (
                            <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                {error || localError}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full h-12 text-lg bg-orange-600 hover:bg-orange-700"
                            disabled={isValidating || pin.length < 4}
                        >
                            {isValidating ? (
                                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                            ) : (
                                <ChefHat className="w-5 h-5 mr-2" />
                            )}
                            Entrar
                        </Button>
                    </form>

                    <p className="text-xs text-slate-500 text-center mt-6">
                        Pide el PIN al dueño del negocio
                    </p>
                </CardContent>
            </Card>
        </div>
    );
};

// Kitchen Display Component (for PIN-authenticated users)
const KitchenDisplay = () => {
    const { session, logout } = useKitchenPin();
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const mapDbOrderToOrder = (dbOrder: any): Order => ({
        id: dbOrder.id,
        customer: {
            name: dbOrder.customer_name,
            phone: dbOrder.customer_phone,
            address: dbOrder.delivery_address || '',
            notes: dbOrder.notes || undefined,
            deliveryType: dbOrder.delivery_type,
            paymentMethod: dbOrder.payment_method || 'cash',
        },
        items: (dbOrder.order_items || []).map((item: any) => ({
            id: item.menu_item_id || item.id,
            name: item.name,
            description: item.description || '',
            price: item.price,
            image: '',
            category: 'comida',
            quantity: item.quantity,
            soldByWeight: !!item.weight,
            weight: item.weight || undefined,
            weightUnit: item.weight_unit || undefined,
        })),
        total: dbOrder.total,
        status: dbOrder.status as OrderStatus,
        createdAt: new Date(dbOrder.created_at),
        statusChangedAt: new Date(dbOrder.status_changed_at || dbOrder.created_at),
        snoozedUntil: dbOrder.snoozed_until ? new Date(dbOrder.snoozed_until) : undefined,
    });

    const fetchOrders = useCallback(async () => {
        if (!session?.tenantId) return;

        try {
            const res = await fetch(
                `${SUPABASE_URL}/rest/v1/orders?tenant_id=eq.${session.tenantId}&select=*,order_items(*)&order=created_at.desc&limit=50`,
                {
                    headers: {
                        'apikey': SUPABASE_ANON_KEY,
                    },
                }
            );

            if (res.ok) {
                const data = await res.json();
                setOrders(data.map(mapDbOrderToOrder));
            }
        } catch (err) {
            console.error('Error fetching orders:', err);
        } finally {
            setIsLoading(false);
        }
    }, [session?.tenantId]);

    const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
        try {
            const res = await fetch(
                `${SUPABASE_URL}/rest/v1/orders?id=eq.${orderId}`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'apikey': SUPABASE_ANON_KEY,
                    },
                    body: JSON.stringify({
                        status,
                        status_changed_at: new Date().toISOString(),
                    }),
                }
            );

            if (res.ok) {
                fetchOrders();
            }
        } catch (err) {
            console.error('Error updating order:', err);
        }
    };

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 15000); // Poll every 15s for kitchen
        return () => clearInterval(interval);
    }, [fetchOrders]);

    const activeOrders = orders.filter(o => o.status !== 'cancelled' && o.status !== 'dispatched');
    const pendingOrders = orders.filter(o => o.status === 'pending');
    const preparingOrders = orders.filter(o => o.status === 'preparing');
    const readyOrders = orders.filter(o => o.status === 'ready');

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-slate-800 border-b border-slate-700">
                <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                            <ChefHat className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-white">Cocina</h1>
                            <p className="text-xs text-slate-400">{session?.tenantName}</p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={logout}
                        className="text-slate-400 hover:text-white hover:bg-slate-700"
                    >
                        <LogOut className="w-4 h-4 mr-2" />
                        Salir
                    </Button>
                </div>
            </header>

            {/* Stats Bar */}
            <div className="bg-slate-800/50 border-b border-slate-700">
                <div className="container mx-auto px-4 py-3">
                    <div className="grid grid-cols-3 gap-3">
                        <div className="flex items-center gap-2 px-3 py-2 bg-yellow-500/20 rounded-lg">
                            <Clock className="h-5 w-5 text-yellow-500" />
                            <span className="font-bold text-white">{pendingOrders.length}</span>
                            <span className="text-sm text-slate-300 hidden sm:inline">Pendientes</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-2 bg-orange-500/20 rounded-lg">
                            <ChefHat className="h-5 w-5 text-orange-500" />
                            <span className="font-bold text-white">{preparingOrders.length}</span>
                            <span className="text-sm text-slate-300 hidden sm:inline">Preparando</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-2 bg-green-500/20 rounded-lg">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            <span className="font-bold text-white">{readyOrders.length}</span>
                            <span className="text-sm text-slate-300 hidden sm:inline">Listos</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Orders Grid */}
            <main className="container mx-auto px-4 py-6">
                {activeOrders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[50vh] text-slate-500">
                        <ChefHat className="h-20 w-20 mb-4 opacity-30" />
                        <h2 className="text-xl font-semibold mb-2 text-slate-300">Sin pedidos</h2>
                        <p className="text-center text-slate-500">
                            Los pedidos aparecerán aquí automáticamente
                        </p>
                    </div>
                ) : (
                    <Tabs defaultValue="all" className="w-full">
                        <TabsList className="grid grid-cols-4 w-full mb-6 bg-slate-800 p-1">
                            <TabsTrigger value="all" className="text-xs sm:text-sm data-[state=active]:bg-slate-700">
                                Todos ({activeOrders.length})
                            </TabsTrigger>
                            <TabsTrigger value="pending" className="text-xs sm:text-sm data-[state=active]:bg-yellow-600">
                                Nuevos ({pendingOrders.length})
                            </TabsTrigger>
                            <TabsTrigger value="preparing" className="text-xs sm:text-sm data-[state=active]:bg-orange-600">
                                Prep ({preparingOrders.length})
                            </TabsTrigger>
                            <TabsTrigger value="ready" className="text-xs sm:text-sm data-[state=active]:bg-green-600">
                                Listos ({readyOrders.length})
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="all" className="mt-0">
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {activeOrders.map(order => (
                                    <KitchenOrderCard
                                        key={order.id}
                                        order={order}
                                        onStatusChange={updateOrderStatus}
                                    />
                                ))}
                            </div>
                        </TabsContent>

                        <TabsContent value="pending" className="mt-0">
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {pendingOrders.map(order => (
                                    <KitchenOrderCard
                                        key={order.id}
                                        order={order}
                                        onStatusChange={updateOrderStatus}
                                    />
                                ))}
                            </div>
                        </TabsContent>

                        <TabsContent value="preparing" className="mt-0">
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {preparingOrders.map(order => (
                                    <KitchenOrderCard
                                        key={order.id}
                                        order={order}
                                        onStatusChange={updateOrderStatus}
                                    />
                                ))}
                            </div>
                        </TabsContent>

                        <TabsContent value="ready" className="mt-0">
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {readyOrders.map(order => (
                                    <KitchenOrderCard
                                        key={order.id}
                                        order={order}
                                        onStatusChange={updateOrderStatus}
                                    />
                                ))}
                            </div>
                        </TabsContent>
                    </Tabs>
                )}
            </main>
        </div>
    );
};

// Simplified Order Card for Kitchen
const KitchenOrderCard = ({
    order,
    onStatusChange
}: {
    order: Order;
    onStatusChange: (id: string, status: OrderStatus) => void;
}) => {
    const statusColors = {
        pending: 'border-yellow-500 bg-yellow-500/10',
        preparing: 'border-orange-500 bg-orange-500/10',
        ready: 'border-green-500 bg-green-500/10',
        dispatched: 'border-blue-500 bg-blue-500/10',
        cancelled: 'border-red-500 bg-red-500/10',
    };

    const nextStatus: Record<string, OrderStatus> = {
        pending: 'preparing',
        preparing: 'ready',
        ready: 'dispatched',
    };

    const statusLabels = {
        pending: 'Preparar',
        preparing: 'Listo',
        ready: 'Entregar',
    };

    const timeAgo = (date: Date) => {
        const mins = Math.floor((Date.now() - date.getTime()) / 60000);
        if (mins < 1) return 'Ahora';
        if (mins < 60) return `${mins}m`;
        return `${Math.floor(mins / 60)}h ${mins % 60}m`;
    };

    return (
        <div className={`rounded-xl border-2 ${statusColors[order.status]} p-4 text-white`}>
            {/* Header */}
            <div className="flex justify-between items-start mb-3">
                <div>
                    <span className="text-2xl font-bold">#{order.id.slice(-4).toUpperCase()}</span>
                    <p className="text-sm text-slate-400">{order.customer.name}</p>
                </div>
                <div className="text-right">
                    <span className="text-xs text-slate-400">{timeAgo(order.createdAt)}</span>
                    <p className="text-xs text-slate-500 flex items-center justify-end gap-1 mt-1">
                        {order.customer.deliveryType === 'delivery' ? (
                            <><Truck className="w-3 h-3" /> Delivery</>
                        ) : (
                            'Retiro'
                        )}
                    </p>
                </div>
            </div>

            {/* Items */}
            <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
                {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                        <span className="text-slate-200">
                            <span className="font-bold text-white">{item.quantity}x</span> {item.name}
                        </span>
                    </div>
                ))}
            </div>

            {/* Notes */}
            {order.customer.notes && (
                <div className="bg-slate-800/50 p-2 rounded-lg mb-4 text-sm text-slate-300">
                    <strong>Nota:</strong> {order.customer.notes}
                </div>
            )}

            {/* Action Button */}
            {order.status !== 'dispatched' && order.status !== 'cancelled' && (
                <Button
                    className={`w-full ${
                        order.status === 'pending' ? 'bg-yellow-600 hover:bg-yellow-700' :
                        order.status === 'preparing' ? 'bg-orange-600 hover:bg-orange-700' :
                        'bg-green-600 hover:bg-green-700'
                    }`}
                    onClick={() => onStatusChange(order.id, nextStatus[order.status])}
                >
                    {statusLabels[order.status as keyof typeof statusLabels]}
                </Button>
            )}
        </div>
    );
};

// Main Page Component
const KitchenPin = () => {
    const { slug } = useParams<{ slug: string }>();
    const { session } = useKitchenPin();
    const navigate = useNavigate();

    // If no slug provided, redirect to home
    useEffect(() => {
        if (!slug) {
            navigate('/');
        }
    }, [slug, navigate]);

    if (!slug) {
        return null;
    }

    // If session exists and matches the slug, show kitchen display
    if (session && session.tenantSlug === slug) {
        return <KitchenDisplay />;
    }

    // Otherwise, show PIN entry
    return <PinEntry slug={slug} />;
};

export default KitchenPin;
