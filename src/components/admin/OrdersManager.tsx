import { ChefHat, Clock, CheckCircle, Truck, RefreshCw } from 'lucide-react';
import { useOrders } from '@/context/OrderContext';
import { OrderCard } from '@/components/OrderCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const OrdersManager = () => {
    const { orders, refreshOrders } = useOrders();

    const activeOrders = orders.filter(o => o.status !== 'cancelled');
    const pendingOrders = orders.filter(o => o.status === 'pending');
    const preparingOrders = orders.filter(o => o.status === 'preparing');
    const readyOrders = orders.filter(o => o.status === 'ready');
    const dispatchedOrders = orders.filter(o => o.status === 'dispatched');
    const cancelledOrders = orders.filter(o => o.status === 'cancelled');

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Gestión de Pedidos</h2>
                    <p className="text-muted-foreground">Monitor de cocina y seguimiento de estado.</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => refreshOrders()}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Actualizar
                </Button>
            </div>

            {/* Stats Bar - Responsive Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center gap-3 p-4 bg-white border border-slate-100 rounded-xl shadow-sm">
                    <div className="p-2 bg-slate-100 rounded-lg">
                        <Clock className="h-5 w-5 text-slate-600" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 font-medium uppercase">Pendientes</p>
                        <p className="text-2xl font-bold text-slate-900">{pendingOrders.length}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-white border border-slate-100 rounded-xl shadow-sm">
                    <div className="p-2 bg-yellow-50 rounded-lg">
                        <ChefHat className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 font-medium uppercase">En Cocina</p>
                        <p className="text-2xl font-bold text-slate-900">{preparingOrders.length}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-white border border-slate-100 rounded-xl shadow-sm">
                    <div className="p-2 bg-green-50 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 font-medium uppercase">Listos</p>
                        <p className="text-2xl font-bold text-slate-900">{readyOrders.length}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-white border border-slate-100 rounded-xl shadow-sm">
                    <div className="p-2 bg-blue-50 rounded-lg">
                        <Truck className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 font-medium uppercase">Despachados</p>
                        <p className="text-2xl font-bold text-slate-900">{dispatchedOrders.length}</p>
                    </div>
                </div>
            </div>

            {/* Orders List */}
            <div className="min-h-[400px]">
                {orders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-muted-foreground border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                        <ChefHat className="h-12 w-12 mb-4 opacity-20" />
                        <h3 className="text-lg font-semibold text-slate-700">Sin pedidos activos</h3>
                        <p className="text-sm max-w-sm text-center mt-1">
                            Los nuevos pedidos aparecerán aquí automáticamente en tiempo real.
                        </p>
                    </div>
                ) : (
                    <Tabs defaultValue="all" className="w-full">
                        <TabsList className="w-full justify-start overflow-x-auto h-auto p-1 bg-slate-100 mb-6">
                            <TabsTrigger value="all" className="px-4 py-2">Todos</TabsTrigger>
                            <TabsTrigger value="pending" className="px-4 py-2">Pendientes <span className="ml-2 bg-slate-200 px-1.5 py-0.5 rounded-full text-xs">{pendingOrders.length}</span></TabsTrigger>
                            <TabsTrigger value="preparing" className="px-4 py-2">En Preparación <span className="ml-2 bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full text-xs">{preparingOrders.length}</span></TabsTrigger>
                            <TabsTrigger value="ready" className="px-4 py-2">Listos <span className="ml-2 bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full text-xs">{readyOrders.length}</span></TabsTrigger>
                            {cancelledOrders.length > 0 && (
                                <TabsTrigger value="cancelled" className="px-4 py-2 text-destructive data-[state=active]:text-destructive">Cancelados</TabsTrigger>
                            )}
                        </TabsList>

                        <TabsContent value="all" className="mt-0">
                            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {activeOrders.map(order => (
                                    <OrderCard key={order.id} order={order} />
                                ))}
                            </div>
                        </TabsContent>

                        <TabsContent value="pending" className="mt-0">
                            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {pendingOrders.length === 0 && <EmptyState message="No hay pedidos pendientes" />}
                                {pendingOrders.map(order => (
                                    <OrderCard key={order.id} order={order} />
                                ))}
                            </div>
                        </TabsContent>

                        <TabsContent value="preparing" className="mt-0">
                            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {preparingOrders.length === 0 && <EmptyState message="No hay pedidos en preparación" />}
                                {preparingOrders.map(order => (
                                    <OrderCard key={order.id} order={order} />
                                ))}
                            </div>
                        </TabsContent>

                        <TabsContent value="ready" className="mt-0">
                            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {readyOrders.length === 0 && <EmptyState message="No hay pedidos listos para entrega" />}
                                {readyOrders.map(order => (
                                    <OrderCard key={order.id} order={order} />
                                ))}
                            </div>
                        </TabsContent>

                        <TabsContent value="cancelled" className="mt-0">
                            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {cancelledOrders.map(order => (
                                    <OrderCard key={order.id} order={order} />
                                ))}
                            </div>
                        </TabsContent>
                    </Tabs>
                )}
            </div>
        </div>
    );
};

const EmptyState = ({ message }: { message: string }) => (
    <div className="col-span-full flex flex-col items-center justify-center p-12 text-center text-slate-400">
        <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-3">
            <CheckCircle className="w-6 h-6 opacity-20" />
        </div>
        <p>{message}</p>
    </div>
);
