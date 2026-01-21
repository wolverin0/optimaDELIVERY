import { useState } from 'react';
import { ChefHat, ArrowLeft, Clock, CheckCircle, Truck, XCircle, Settings, List, CreditCard } from 'lucide-react';
import { useOrders } from '@/context/OrderContext';
import { useTenant } from '@/context/TenantContext';
import { OrderCard } from '@/components/OrderCard';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Order } from '@/types/order';

type FilterType = 'all' | 'pending' | 'preparing' | 'ready' | 'dispatched' | 'cancelled' | 'awaiting_payment';

// Check if order is ready to be cooked (payment confirmed or cash)
const isReadyToCook = (order: Order): boolean => {
  // Cash orders are always ready
  if (order.payment_method === 'cash' || !order.payment_method) {
    return true;
  }
  // MercadoPago orders need payment_status = 'paid'
  if (order.payment_method === 'mercadopago') {
    return order.payment_status === 'paid';
  }
  return true;
};

const Kitchen = () => {
  const { orders } = useOrders();
  const { tenant } = useTenant();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  // Orders awaiting payment (MercadoPago not yet paid)
  const awaitingPaymentOrders = orders.filter(o =>
    o.payment_method === 'mercadopago' &&
    o.payment_status !== 'paid' &&
    o.status !== 'cancelled'
  );

  // Filter out orders awaiting payment from active orders
  const paidOrCashOrders = orders.filter(o => isReadyToCook(o));

  const activeOrders = paidOrCashOrders.filter(o => o.status !== 'cancelled');
  const pendingOrders = paidOrCashOrders.filter(o => o.status === 'pending');
  const preparingOrders = paidOrCashOrders.filter(o => o.status === 'preparing');
  const readyOrders = paidOrCashOrders.filter(o => o.status === 'ready');
  const dispatchedOrders = paidOrCashOrders.filter(o => o.status === 'dispatched');
  const cancelledOrders = orders.filter(o => o.status === 'cancelled');

  const getFilteredOrders = () => {
    switch (activeFilter) {
      case 'pending': return pendingOrders;
      case 'preparing': return preparingOrders;
      case 'ready': return readyOrders;
      case 'dispatched': return dispatchedOrders;
      case 'cancelled': return cancelledOrders;
      case 'awaiting_payment': return awaitingPaymentOrders;
      default: return activeOrders;
    }
  };

  const getFilterLabel = () => {
    switch (activeFilter) {
      case 'pending': return 'Pendientes';
      case 'preparing': return 'En Preparación';
      case 'ready': return 'Listos';
      case 'dispatched': return 'Despachados';
      case 'cancelled': return 'Cancelados';
      case 'awaiting_payment': return 'Esperando Pago';
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
          ? 'ring-2 ring-primary ring-offset-2 ring-offset-background scale-105'
          : 'hover:scale-102 hover:shadow-md'
      }`}
    >
      <Icon className={`h-5 w-5 ${colorClass} mb-1`} />
      <span className="text-2xl font-bold">{count}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {tenant?.logo_url ? (
              <img
                src={tenant.logo_url}
                alt={tenant.name}
                className="w-10 h-10 rounded-full object-cover shadow-gold"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white text-lg font-bold shadow-gold">
                {tenant?.name?.charAt(0) || 'K'}
              </div>
            )}
            <h1 className="text-xl font-semibold tracking-wide">Pedidos</h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link to="/admin">
              <Button variant="outline" size="sm" className="border-primary/30 text-primary hover:bg-primary hover:text-white">
                <Settings className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Filter Cards - 3x2 Grid */}
      <div className="bg-secondary/30 border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <FilterCard
              filter="all"
              icon={List}
              label="Todos"
              count={activeOrders.length}
              colorClass="text-slate-600"
              bgClass="bg-slate-100 dark:bg-slate-800"
            />
            <FilterCard
              filter="pending"
              icon={Clock}
              label="Pendientes"
              count={pendingOrders.length}
              colorClass="text-orange-600"
              bgClass="bg-orange-100 dark:bg-orange-900/30"
            />
            <FilterCard
              filter="preparing"
              icon={ChefHat}
              label="Preparando"
              count={preparingOrders.length}
              colorClass="text-yellow-600"
              bgClass="bg-yellow-100 dark:bg-yellow-900/30"
            />
            <FilterCard
              filter="ready"
              icon={CheckCircle}
              label="Listos"
              count={readyOrders.length}
              colorClass="text-green-600"
              bgClass="bg-green-100 dark:bg-green-900/30"
            />
            <FilterCard
              filter="dispatched"
              icon={Truck}
              label="Despachados"
              count={dispatchedOrders.length}
              colorClass="text-blue-600"
              bgClass="bg-blue-100 dark:bg-blue-900/30"
            />
            <FilterCard
              filter="cancelled"
              icon={XCircle}
              label="Cancelados"
              count={cancelledOrders.length}
              colorClass="text-red-600"
              bgClass="bg-red-100 dark:bg-red-900/30"
            />
            {/* Show awaiting payment filter only if there are orders waiting */}
            {awaitingPaymentOrders.length > 0 && (
              <FilterCard
                filter="awaiting_payment"
                icon={CreditCard}
                label="Esperando Pago"
                count={awaitingPaymentOrders.length}
                colorClass="text-purple-600"
                bgClass="bg-purple-100 dark:bg-purple-900/30"
              />
            )}
          </div>
        </div>
      </div>

      {/* Orders */}
      <main className="container mx-auto px-4 py-4">
        {/* Current filter label */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-muted-foreground">
            {getFilterLabel()} ({filteredOrders.length})
          </h2>
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
          <div className="flex flex-col items-center justify-center h-[40vh] text-muted-foreground">
            <ChefHat className="h-16 w-16 mb-4 opacity-20 text-primary" />
            <h2 className="text-lg font-semibold mb-1">Sin pedidos</h2>
            <p className="text-sm text-center max-w-sm">
              {activeFilter === 'all'
                ? 'Los pedidos apareceran aqui automaticamente'
                : `No hay pedidos ${getFilterLabel().toLowerCase()}`}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOrders.map(order => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Kitchen;
