import { ChefHat, ArrowLeft, Clock, CheckCircle, Truck } from 'lucide-react';
import { useOrders } from '@/context/OrderContext';
import { OrderCard } from '@/components/OrderCard';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Kitchen = () => {
  const { orders } = useOrders();

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const preparingOrders = orders.filter(o => o.status === 'preparing');
  const readyOrders = orders.filter(o => o.status === 'ready');
  const dispatchedOrders = orders.filter(o => o.status === 'dispatched');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded-lg">
              <ChefHat className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-xl">Panel de Cocina</h1>
              <p className="text-xs text-muted-foreground">Gestión de pedidos</p>
            </div>
          </div>
          <Link to="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Ver Menú
            </Button>
          </Link>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="bg-secondary/50 border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex gap-4 overflow-x-auto">
            <div className="flex items-center gap-2 px-4 py-2 bg-background rounded-lg">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <span className="font-semibold">{pendingOrders.length}</span>
              <span className="text-sm text-muted-foreground">Pendientes</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-status-preparing/20 rounded-lg">
              <ChefHat className="h-5 w-5 text-status-preparing" />
              <span className="font-semibold">{preparingOrders.length}</span>
              <span className="text-sm text-muted-foreground">Preparando</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-status-ready/20 rounded-lg">
              <CheckCircle className="h-5 w-5 text-status-ready" />
              <span className="font-semibold">{readyOrders.length}</span>
              <span className="text-sm text-muted-foreground">Listos</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-status-dispatched/20 rounded-lg">
              <Truck className="h-5 w-5 text-status-dispatched" />
              <span className="font-semibold">{dispatchedOrders.length}</span>
              <span className="text-sm text-muted-foreground">Despachados</span>
            </div>
          </div>
        </div>
      </div>

      {/* Orders */}
      <main className="container mx-auto px-4 py-6">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[50vh] text-muted-foreground">
            <ChefHat className="h-20 w-20 mb-4 opacity-20" />
            <h2 className="text-xl font-semibold mb-2">Sin pedidos aún</h2>
            <p className="text-center max-w-sm">
              Los pedidos de los clientes aparecerán aquí automáticamente
            </p>
          </div>
        ) : (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="w-full justify-start mb-6 h-12">
              <TabsTrigger value="all" className="px-6">
                Todos ({orders.length})
              </TabsTrigger>
              <TabsTrigger value="pending" className="px-6">
                Pendientes ({pendingOrders.length})
              </TabsTrigger>
              <TabsTrigger value="preparing" className="px-6">
                Preparando ({preparingOrders.length})
              </TabsTrigger>
              <TabsTrigger value="ready" className="px-6">
                Listos ({readyOrders.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-0">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {orders.map(order => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="pending" className="mt-0">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingOrders.map(order => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="preparing" className="mt-0">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {preparingOrders.map(order => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="ready" className="mt-0">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {readyOrders.map(order => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
};

export default Kitchen;
