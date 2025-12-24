import { ChefHat, ArrowLeft, Clock, CheckCircle, Truck, XCircle, Settings } from 'lucide-react';
import { useOrders } from '@/context/OrderContext';
import { OrderCard } from '@/components/OrderCard';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Kitchen = () => {
  const { orders } = useOrders();

  const activeOrders = orders.filter(o => o.status !== 'cancelled');
  const pendingOrders = orders.filter(o => o.status === 'pending');
  const preparingOrders = orders.filter(o => o.status === 'preparing');
  const readyOrders = orders.filter(o => o.status === 'ready');
  const dispatchedOrders = orders.filter(o => o.status === 'dispatched');
  const cancelledOrders = orders.filter(o => o.status === 'cancelled');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur border-b border-border">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img
              src="/braseritologo.jpeg"
              alt="El Nuevo Braserito"
              className="w-[52px] h-[52px] rounded-full object-cover shadow-gold"
            />
            <h1 className="text-2xl font-semibold tracking-wide">Cocina</h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link to="/admin" className="hidden sm:block">
              <Button variant="outline" size="sm" className="border-primary/30 text-primary hover:bg-primary hover:text-white">
                <Settings className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Admin</span>
              </Button>
            </Link>
            <Link to="/">
              <Button variant="outline" size="sm" className="border-primary/30 text-primary hover:bg-primary hover:text-white">
                <ArrowLeft className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Menu</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Stats Bar - Responsive Grid */}
      <div className="bg-secondary/50 border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
            <div className="flex items-center gap-2 px-3 py-2 bg-card rounded-lg">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground shrink-0" />
              <span className="font-semibold">{pendingOrders.length}</span>
              <span className="text-xs sm:text-sm text-muted-foreground truncate">Pendientes</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-yellow-500/20 rounded-lg">
              <ChefHat className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600 shrink-0" />
              <span className="font-semibold">{preparingOrders.length}</span>
              <span className="text-xs sm:text-sm text-muted-foreground truncate">Preparando</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-green-500/20 rounded-lg">
              <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 shrink-0" />
              <span className="font-semibold">{readyOrders.length}</span>
              <span className="text-xs sm:text-sm text-muted-foreground truncate">Listos</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-blue-500/20 rounded-lg">
              <Truck className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 shrink-0" />
              <span className="font-semibold">{dispatchedOrders.length}</span>
              <span className="text-xs sm:text-sm text-muted-foreground truncate">Despachados</span>
            </div>
          </div>
        </div>
      </div>

      {/* Orders */}
      <main className="container mx-auto px-4 py-6">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[50vh] text-muted-foreground">
            <ChefHat className="h-20 w-20 mb-4 opacity-20 text-primary" />
            <h2 className="text-xl font-semibold mb-2">Sin pedidos aun</h2>
            <p className="text-center max-w-sm">
              Los pedidos de los clientes apareceran aqui automaticamente
            </p>
          </div>
        ) : (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid grid-cols-2 sm:grid-cols-4 lg:flex lg:justify-start w-full mb-6 h-auto gap-1 bg-secondary/50 p-1">
              <TabsTrigger value="all" className="px-3 py-2 text-xs sm:text-sm">
                Activos ({activeOrders.length})
              </TabsTrigger>
              <TabsTrigger value="pending" className="px-3 py-2 text-xs sm:text-sm">
                Pendientes ({pendingOrders.length})
              </TabsTrigger>
              <TabsTrigger value="preparing" className="px-3 py-2 text-xs sm:text-sm">
                Preparando ({preparingOrders.length})
              </TabsTrigger>
              <TabsTrigger value="ready" className="px-3 py-2 text-xs sm:text-sm">
                Listos ({readyOrders.length})
              </TabsTrigger>
              {cancelledOrders.length > 0 && (
                <TabsTrigger value="cancelled" className="px-3 py-2 text-xs sm:text-sm col-span-2 sm:col-span-1">
                  Cancelados ({cancelledOrders.length})
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="all" className="mt-0">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeOrders.map(order => (
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

            <TabsContent value="cancelled" className="mt-0">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cancelledOrders.map(order => (
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
