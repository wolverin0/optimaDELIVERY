import { useState } from 'react';
import { ChefHat, Clock, CheckCircle, Truck, RefreshCw, List, XCircle } from 'lucide-react';
import { useOrders } from '@/context/OrderContext';
import { OrderCard } from '@/components/OrderCard';
import { Button } from '@/components/ui/button';

type FilterType = 'all' | 'pending' | 'preparing' | 'ready' | 'dispatched' | 'cancelled';

export const OrdersManager = () => {
    const { orders, refreshOrders } = useOrders();
    const [activeFilter, setActiveFilter] = useState<FilterType>('all');

    const activeOrders = orders.filter(o => o.status !== 'cancelled');
    const pendingOrders = orders.filter(o => o.status === 'pending');
    const preparingOrders = orders.filter(o => o.status === 'preparing');
    const readyOrders = orders.filter(o => o.status === 'ready');
    const dispatchedOrders = orders.filter(o => o.status === 'dispatched');
    const cancelledOrders = orders.filter(o => o.status === 'cancelled');

    const getFilteredOrders = () => {
        switch (activeFilter) {
            case 'pending': return pendingOrders;
            case 'preparing': return preparingOrders;
            case 'ready': return readyOrders;
            case 'dispatched': return dispatchedOrders;
            case 'cancelled': return cancelledOrders;
            default: return activeOrders;
        }
    };

    const getFilterLabel = () => {
        switch (activeFilter) {
            case 'pending': return 'Pendientes';
            case 'preparing': return 'En Cocina';
            case 'ready': return 'Listos';
            case 'dispatched': return 'Despachados';
            case 'cancelled': return 'Cancelados';
            default: return 'Todos los Activos';
        }
    };

    const filteredOrders = getFilteredOrders();

    const FilterCard = ({
        filter,
        icon: Icon,
        label,
        count,
        colorClass,
        bgClass,
    }: {
        filter: FilterType;
        icon: React.ElementType;
        label: string;
        count: number;
        colorClass: string;
        bgClass: string;
    }) => (
        <button
            onClick={() => setActiveFilter(filter)}
            className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all ${bgClass} ${
                activeFilter === filter
                    ? 'ring-2 ring-orange-500 ring-offset-2 ring-offset-white scale-105'
                    : 'hover:scale-102 hover:shadow-md'
            }`}
        >
            <Icon className={`h-5 w-5 ${colorClass} mb-1`} />
            <span className="text-2xl font-bold">{count}</span>
            <span className="text-xs text-slate-500">{label}</span>
        </button>
    );

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

            {/* Filter Cards - 2x3 Grid */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <FilterCard
                    filter="all"
                    icon={List}
                    label="Todos"
                    count={activeOrders.length}
                    colorClass="text-slate-600"
                    bgClass="bg-slate-100"
                />
                <FilterCard
                    filter="pending"
                    icon={Clock}
                    label="Pendientes"
                    count={pendingOrders.length}
                    colorClass="text-orange-600"
                    bgClass="bg-orange-100"
                />
                <FilterCard
                    filter="preparing"
                    icon={ChefHat}
                    label="En Cocina"
                    count={preparingOrders.length}
                    colorClass="text-yellow-600"
                    bgClass="bg-yellow-100"
                />
                <FilterCard
                    filter="ready"
                    icon={CheckCircle}
                    label="Listos"
                    count={readyOrders.length}
                    colorClass="text-green-600"
                    bgClass="bg-green-100"
                />
                <FilterCard
                    filter="dispatched"
                    icon={Truck}
                    label="Despachados"
                    count={dispatchedOrders.length}
                    colorClass="text-blue-600"
                    bgClass="bg-blue-100"
                />
                <FilterCard
                    filter="cancelled"
                    icon={XCircle}
                    label="Cancelados"
                    count={cancelledOrders.length}
                    colorClass="text-red-600"
                    bgClass="bg-red-100"
                />
            </div>

            {/* Orders List */}
            <div className="min-h-[400px]">
                {/* Current filter label */}
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-600">
                        {getFilterLabel()} ({filteredOrders.length})
                    </h3>
                    {activeFilter !== 'all' && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setActiveFilter('all')}
                            className="text-xs"
                        >
                            Ver todos
                        </Button>
                    )}
                </div>

                {filteredOrders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-muted-foreground border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                        <ChefHat className="h-12 w-12 mb-4 opacity-20" />
                        <h3 className="text-lg font-semibold text-slate-700">Sin pedidos</h3>
                        <p className="text-sm max-w-sm text-center mt-1">
                            {activeFilter === 'all'
                                ? 'Los nuevos pedidos aparecerán aquí automáticamente en tiempo real.'
                                : `No hay pedidos ${getFilterLabel().toLowerCase()}`}
                        </p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {filteredOrders.map(order => (
                            <OrderCard key={order.id} order={order} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
