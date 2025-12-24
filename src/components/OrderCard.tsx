import { useState, useEffect } from 'react';
import { Clock, ChefHat, CheckCircle, Truck, Phone, MapPin, User, XCircle, AlertTriangle, Scale, Bell, BellOff, Timer, Store, CreditCard, Banknote } from 'lucide-react';
import { Order, OrderStatus } from '@/types/order';
import { useOrders } from '@/context/OrderContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface OrderCardProps {
  order: Order;
}

const ALERT_TIME_SECONDS = 180; // 3 minutes

const statusConfig: Record<OrderStatus, { label: string; icon: React.ReactNode; color: string; breatheClass: string; alertClass: string }> = {
  pending: {
    label: 'Pendiente',
    icon: <Clock className="h-5 w-5" />,
    color: 'bg-muted text-muted-foreground',
    breatheClass: 'animate-breathe-pending',
    alertClass: 'animate-breathe-pending-alert',
  },
  preparing: {
    label: 'Preparando',
    icon: <ChefHat className="h-5 w-5" />,
    color: 'bg-status-preparing text-foreground',
    breatheClass: 'animate-breathe-preparing',
    alertClass: 'animate-breathe-preparing-alert',
  },
  ready: {
    label: 'Listo',
    icon: <CheckCircle className="h-5 w-5" />,
    color: 'bg-status-ready text-primary-foreground',
    breatheClass: 'animate-breathe-ready',
    alertClass: 'animate-breathe-ready-alert',
  },
  dispatched: {
    label: 'Despachado',
    icon: <Truck className="h-5 w-5" />,
    color: 'bg-status-dispatched text-primary-foreground',
    breatheClass: '',
    alertClass: '',
  },
  cancelled: {
    label: 'Cancelado',
    icon: <XCircle className="h-5 w-5" />,
    color: 'bg-destructive text-destructive-foreground',
    breatheClass: '',
    alertClass: '',
  },
};

export const OrderCard = ({ order }: OrderCardProps) => {
  const { updateOrderStatus, cancelOrder, snoozeOrder } = useOrders();
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Calculate elapsed time since status changed
  useEffect(() => {
    const calculateElapsed = () => {
      const statusTime = new Date(order.statusChangedAt).getTime();
      const now = Date.now();
      return Math.floor((now - statusTime) / 1000);
    };

    setElapsedSeconds(calculateElapsed());

    const interval = setInterval(() => {
      setElapsedSeconds(calculateElapsed());
    }, 1000);

    return () => clearInterval(interval);
  }, [order.statusChangedAt]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const formatElapsed = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const status = statusConfig[order.status];
  const isCancelled = order.status === 'cancelled';
  const isDispatched = order.status === 'dispatched';
  const isActiveStatus = !isCancelled && !isDispatched;

  // Check if snoozed
  const isSnoozed = order.snoozedUntil && new Date(order.snoozedUntil).getTime() > Date.now();

  // Check if alert should show (3+ minutes and not snoozed)
  const isAlert = isActiveStatus && elapsedSeconds >= ALERT_TIME_SECONDS && !isSnoozed;

  // Determine animation class
  const getAnimationClass = () => {
    if (!isActiveStatus) return '';
    if (isAlert) return status.alertClass;
    return status.breatheClass;
  };

  return (
    <Card className={`overflow-hidden relative ${getAnimationClass()} ${isCancelled ? 'opacity-60' : ''}`}>
      {/* Alert Overlay */}
      {isAlert && (
        <div className="absolute inset-0 z-10 bg-black/60 flex flex-col items-center justify-center gap-4 rounded-lg">
          <div className="flex items-center gap-2 text-white animate-pulse">
            <Bell className="h-8 w-8 text-red-400" />
            <span className="text-2xl font-bold">¡ALERTA!</span>
          </div>
          <p className="text-white/90 text-center px-4">
            Este pedido lleva <span className="font-bold text-red-400">{formatElapsed(elapsedSeconds)}</span> en estado "{status.label}"
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              onClick={() => snoozeOrder(order.id, 3)}
            >
              <BellOff className="h-4 w-4 mr-2" />
              Snooze 3min
            </Button>
            <Button
              variant="outline"
              className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              onClick={() => snoozeOrder(order.id, 5)}
            >
              <BellOff className="h-4 w-4 mr-2" />
              Snooze 5min
            </Button>
          </div>
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge className={`${status.color} flex items-center gap-1 text-sm px-3 py-1`}>
              {status.icon}
              {status.label}
            </Badge>
            <span className="text-muted-foreground text-sm">
              {formatTime(order.createdAt)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {isActiveStatus && (
              <div className={`flex items-center gap-1 text-xs font-mono px-2 py-1 rounded ${
                elapsedSeconds >= ALERT_TIME_SECONDS ? 'bg-red-500/20 text-red-500' : 'bg-muted text-muted-foreground'
              }`}>
                <Timer className="h-3 w-3" />
                {formatElapsed(elapsedSeconds)}
              </div>
            )}
            <span className="font-mono text-sm text-muted-foreground">
              #{order.id.slice(-4)}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Customer Info */}
        <div className="bg-secondary/50 rounded-lg p-4 space-y-2">
          {/* Delivery & Payment Badges */}
          <div className="flex flex-wrap gap-2 pb-2 mb-2 border-b border-border/50">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
              order.customer.deliveryType === 'pickup'
                ? 'bg-green-500/15 text-green-600 border border-green-500/30'
                : 'bg-blue-500/15 text-blue-600 border border-blue-500/30'
            }`}>
              {order.customer.deliveryType === 'pickup' ? <Store className="h-3 w-3" /> : <Truck className="h-3 w-3" />}
              {order.customer.deliveryType === 'pickup' ? 'Retira' : 'Envío'}
            </span>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
              order.customer.paymentMethod === 'cash'
                ? 'bg-amber-500/15 text-amber-600 border border-amber-500/30'
                : 'bg-[#009ee3]/15 text-[#009ee3] border border-[#009ee3]/30'
            }`}>
              {order.customer.paymentMethod === 'cash' ? <Banknote className="h-3 w-3" /> : <CreditCard className="h-3 w-3" />}
              {order.customer.paymentMethod === 'cash' ? 'Efectivo' : 'MercadoPago'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-semibold">{order.customer.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>{order.customer.phone}</span>
          </div>
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
            <span className="text-sm">{order.customer.address}</span>
          </div>
          {order.customer.notes && (
            <div className="pt-2 border-t border-border/50">
              <div className="flex items-start gap-2 bg-primary/10 rounded-md p-3 border-l-4 border-primary">
                <AlertTriangle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm font-medium text-foreground">
                  {order.customer.notes}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Order Items */}
        <div className="space-y-2">
          {order.items.map(item => (
            <div key={item.id} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                {item.soldByWeight && item.weight ? (
                  <>
                    <Scale className="h-3 w-3 text-muted-foreground" />
                    <span className="font-bold text-primary">{item.weight}{item.weightUnit}</span>
                  </>
                ) : (
                  <span className="font-bold text-primary">{item.quantity}x</span>
                )}
                <span>{item.name}</span>
              </div>
              <span className="font-medium">
                {formatPrice(item.soldByWeight && item.weight ? item.price * item.weight : item.price * item.quantity)}
              </span>
            </div>
          ))}
          <div className="border-t pt-2 flex justify-between font-bold text-lg">
            <span>Total</span>
            <span className="text-primary">{formatPrice(order.total)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        {!isCancelled && (
          <div className="grid grid-cols-3 gap-2 pt-2">
            <Button
              variant={order.status === 'preparing' ? 'default' : 'outline'}
              className={`h-14 flex flex-col gap-1 ${order.status === 'preparing' ? 'bg-status-preparing hover:bg-status-preparing/90' : ''}`}
              onClick={() => updateOrderStatus(order.id, 'preparing')}
            >
              <ChefHat className="h-5 w-5" />
              <span className="text-xs">Preparando</span>
            </Button>
            <Button
              variant={order.status === 'ready' ? 'default' : 'outline'}
              className={`h-14 flex flex-col gap-1 ${order.status === 'ready' ? 'bg-status-ready hover:bg-status-ready/90' : ''}`}
              onClick={() => updateOrderStatus(order.id, 'ready')}
            >
              <CheckCircle className="h-5 w-5" />
              <span className="text-xs">Listo</span>
            </Button>
            <Button
              variant={order.status === 'dispatched' ? 'default' : 'outline'}
              className={`h-14 flex flex-col gap-1 ${order.status === 'dispatched' ? 'bg-status-dispatched hover:bg-status-dispatched/90' : ''}`}
              onClick={() => updateOrderStatus(order.id, 'dispatched')}
            >
              <Truck className="h-5 w-5" />
              <span className="text-xs">Despachado</span>
            </Button>
          </div>
        )}

        {/* Cancel Button */}
        {!isCancelled && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" className="w-full text-destructive hover:text-destructive hover:bg-destructive/10">
                <XCircle className="h-4 w-4 mr-2" />
                Cancelar Pedido
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Cancelar este pedido?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción marcará el pedido como cancelado. No se puede deshacer.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Volver</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() => cancelOrder(order.id)}
                >
                  Sí, Cancelar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </CardContent>
    </Card>
  );
};
