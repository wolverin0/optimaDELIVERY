import { Minus, Plus, ShoppingCart, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { useOrders } from '@/context/OrderContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

export const CartDrawer = () => {
  const { cart, cartTotal, updateQuantity, removeFromCart, submitOrder, clearCart } = useOrders();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [customerData, setCustomerData] = useState({
    name: '',
    phone: '',
    address: '',
    notes: '',
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerData.name || !customerData.phone || !customerData.address) {
      toast({
        title: 'Datos incompletos',
        description: 'Por favor completa todos los campos requeridos',
        variant: 'destructive',
      });
      return;
    }
    submitOrder(customerData);
    setCustomerData({ name: '', phone: '', address: '', notes: '' });
    setShowCheckout(false);
    setIsOpen(false);
    toast({
      title: '¡Pedido enviado!',
      description: 'Tu pedido fue recibido y está siendo procesado',
    });
  };

  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button size="lg" className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-xl z-50">
          <ShoppingCart className="h-7 w-7" />
          {itemCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-7 w-7 flex items-center justify-center p-0 text-sm">
              {itemCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle className="text-2xl flex items-center gap-2">
            <ShoppingCart className="h-6 w-6" />
            {showCheckout ? 'Finalizar Pedido' : 'Tu Carrito'}
          </SheetTitle>
        </SheetHeader>

        {!showCheckout ? (
          <>
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                  <ShoppingCart className="h-16 w-16 mb-4 opacity-30" />
                  <p>Tu carrito está vacío</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="flex gap-3 p-3 bg-secondary/50 rounded-lg">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-md"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold">{item.name}</h4>
                      <p className="text-primary font-bold">{formatPrice(item.price)}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-9 w-9"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center font-bold">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-9 w-9"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 ml-auto text-destructive"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t pt-4 space-y-4">
                <div className="flex justify-between text-xl font-bold">
                  <span>Total</span>
                  <span className="text-primary">{formatPrice(cartTotal)}</span>
                </div>
                <Button
                  size="lg"
                  className="w-full h-14 text-lg"
                  onClick={() => setShowCheckout(true)}
                >
                  Continuar al Checkout
                </Button>
              </div>
            )}
          </>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-base">Nombre *</Label>
                <Input
                  id="name"
                  placeholder="Tu nombre completo"
                  className="h-12 text-base"
                  value={customerData.name}
                  onChange={e => setCustomerData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-base">Teléfono *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Tu número de teléfono"
                  className="h-12 text-base"
                  value={customerData.phone}
                  onChange={e => setCustomerData(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address" className="text-base">Dirección de entrega *</Label>
                <Textarea
                  id="address"
                  placeholder="Calle, número, piso, depto..."
                  className="min-h-24 text-base"
                  value={customerData.address}
                  onChange={e => setCustomerData(prev => ({ ...prev, address: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-base">Notas adicionales</Label>
                <Textarea
                  id="notes"
                  placeholder="Instrucciones especiales, alergias, etc."
                  className="min-h-20 text-base"
                  value={customerData.notes}
                  onChange={e => setCustomerData(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>
            </div>

            <div className="border-t pt-4 space-y-4">
              <div className="flex justify-between text-xl font-bold">
                <span>Total a Pagar</span>
                <span className="text-primary">{formatPrice(cartTotal)}</span>
              </div>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="flex-1 h-14"
                  onClick={() => setShowCheckout(false)}
                >
                  Volver
                </Button>
                <Button type="submit" size="lg" className="flex-1 h-14 text-lg">
                  Enviar Pedido
                </Button>
              </div>
            </div>
          </form>
        )}
      </SheetContent>
    </Sheet>
  );
};
