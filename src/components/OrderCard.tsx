import { Clock, ChefHat, CheckCircle, Truck, Phone, MapPin, User } from 'lucide-react';
import { Order, OrderStatus } from '@/types/order';
import { useOrders } from '@/context/OrderContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface OrderCardProps {
  order: Order;
}

const statusConfig: Record<OrderStatus, { label: string; icon: React.ReactNode; color: string }> = {
  pending: { label: 'Pendiente', icon: <Clock className="h-5 w-5" />, color: 'bg-muted text-muted-foreground' },
  preparing: { label: 'Preparando', icon: <ChefHat className="h-5 w-5" />, color: 'bg-status-preparing text-foreground' },
  ready: { label: 'Listo', icon: <CheckCircle className="h-5 w-5" />, color: 'bg-status-ready text-primary-foreground' },
  dispatched: { label: 'Despachado', icon: <Truck className="h-5 w-5" />, color: 'bg-status-dispatched text-primary-foreground' },
};

export const OrderCard = ({ order }: OrderCardProps) => {
  const { updateOrderStatus } = useOrders();

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
    }).format(date);
  };

  const status = statusConfig[order.status];

  return (
    <Card className="overflow-hidden">
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
          <span className="font-mono text-sm text-muted-foreground">
            #{order.id.slice(-4)}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Customer Info */}
        <div className="bg-secondary/50 rounded-lg p-4 space-y-2">
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
            <p className="text-sm text-muted-foreground italic pt-1 border-t border-border/50">
              {order.customer.notes}
            </p>
          )}
        </div>

        {/* Order Items */}
        <div className="space-y-2">
          {order.items.map(item => (
            <div key={item.id} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="font-bold text-primary">{item.quantity}x</span>
                <span>{item.name}</span>
              </div>
              <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
          <div className="border-t pt-2 flex justify-between font-bold text-lg">
            <span>Total</span>
            <span className="text-primary">{formatPrice(order.total)}</span>
          </div>
        </div>

        {/* Action Buttons */}
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
      </CardContent>
    </Card>
  );
};
